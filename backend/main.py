from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import json
import asyncio
from datetime import datetime
import uuid
from models import User, Chat, Message, MessageType
from connection_manager import ConnectionManager
from chat_service import ChatService

app = FastAPI(title="WhatsApp Clone Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
connection_manager = ConnectionManager()
chat_service = ChatService()

@app.get("/")
async def root():
    return {"message": "WhatsApp Clone Backend is running!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """Main WebSocket endpoint for real-time chat communication"""
    await connection_manager.connect(websocket, user_id)
    
    try:
        # Send initial data to the connected user
        await send_initial_data(websocket, user_id)
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            await handle_message(user_id, message_data)
            
    except WebSocketDisconnect:
        connection_manager.disconnect(user_id)
        await broadcast_user_status_update()
    except Exception as e:
        print(f"Error in websocket connection for user {user_id}: {e}")
        connection_manager.disconnect(user_id)

async def send_initial_data(websocket: WebSocket, user_id: str):
    """Send initial chat data and online users to newly connected client"""
    # Get user's chats
    user_chats = chat_service.get_user_chats(user_id)
    
    # Get online users
    online_users = connection_manager.get_online_users()
    
    initial_data = {
        "type": "initial_data",
        "chats": [chat.to_dict() for chat in user_chats],
        "online_users": online_users,
        "user_id": user_id
    }
    
    await websocket.send_text(json.dumps(initial_data))
    
    # Broadcast that this user is now online
    await broadcast_user_status_update()

async def handle_message(sender_id: str, message_data: dict):
    """Handle incoming messages from clients"""
    message_type = message_data.get("type")
    
    if message_type == "send_message":
        await handle_send_message(sender_id, message_data)
    elif message_type == "join_chat":
        await handle_join_chat(sender_id, message_data)
    elif message_type == "create_chat":
        await handle_create_chat(sender_id, message_data)
    elif message_type == "typing":
        await handle_typing(sender_id, message_data)

async def handle_send_message(sender_id: str, message_data: dict):
    """Handle sending a message to a chat"""
    chat_id = message_data.get("chat_id")
    text = message_data.get("text")
    
    if not chat_id or not text:
        return
    
    # Create and save message
    message = chat_service.add_message(chat_id, sender_id, text)
    if not message:
        return
    
    # Get chat participants
    chat = chat_service.get_chat(chat_id)
    if not chat:
        return
    
    # Prepare message for broadcast
    message_payload = {
        "type": "new_message",
        "chat_id": chat_id,
        "message": message.to_dict()
    }
    
    # Send to all participants in the chat
    for participant_id in chat.participants:
        await connection_manager.send_personal_message(
            json.dumps(message_payload), 
            participant_id
        )

async def handle_join_chat(sender_id: str, message_data: dict):
    """Handle user joining a chat"""
    chat_id = message_data.get("chat_id")
    
    if not chat_id:
        return
    
    # Add user to chat
    success = chat_service.add_user_to_chat(chat_id, sender_id)
    
    if success:
        # Notify all participants
        chat = chat_service.get_chat(chat_id)
        join_payload = {
            "type": "user_joined",
            "chat_id": chat_id,
            "user_id": sender_id,
            "chat": chat.to_dict() if chat else None
        }
        
        for participant_id in chat.participants:
            await connection_manager.send_personal_message(
                json.dumps(join_payload), 
                participant_id
            )

async def handle_create_chat(sender_id: str, message_data: dict):
    """Handle creating a new chat"""
    chat_name = message_data.get("name")
    chat_type = message_data.get("chat_type", "private")  # private or group
    participants = message_data.get("participants", [])
    
    if not chat_name:
        return
    
    # Add sender to participants
    if sender_id not in participants:
        participants.append(sender_id)
    
    # Create new chat
    new_chat = chat_service.create_chat(chat_name, chat_type, participants)
    
    if new_chat:
        # Notify all participants about the new chat
        chat_payload = {
            "type": "new_chat",
            "chat": new_chat.to_dict()
        }
        
        for participant_id in participants:
            await connection_manager.send_personal_message(
                json.dumps(chat_payload), 
                participant_id
            )

async def handle_typing(sender_id: str, message_data: dict):
    """Handle typing indicators"""
    chat_id = message_data.get("chat_id")
    is_typing = message_data.get("is_typing", False)
    
    if not chat_id:
        return
    
    chat = chat_service.get_chat(chat_id)
    if not chat:
        return
    
    # Broadcast typing status to other participants
    typing_payload = {
        "type": "typing",
        "chat_id": chat_id,
        "user_id": sender_id,
        "is_typing": is_typing
    }
    
    for participant_id in chat.participants:
        if participant_id != sender_id:  # Don't send to sender
            await connection_manager.send_personal_message(
                json.dumps(typing_payload), 
                participant_id
            )

async def broadcast_user_status_update():
    """Broadcast online users update to all connected clients"""
    online_users = connection_manager.get_online_users()
    
    status_payload = {
        "type": "online_users_update",
        "online_users": online_users
    }
    
    await connection_manager.broadcast(json.dumps(status_payload))

# REST API endpoints for additional functionality
@app.get("/api/users/online")
async def get_online_users():
    """Get list of currently online users"""
    return {"online_users": connection_manager.get_online_users()}

@app.get("/api/chats/{user_id}")
async def get_user_chats(user_id: str):
    """Get all chats for a specific user"""
    chats = chat_service.get_user_chats(user_id)
    return {"chats": [chat.to_dict() for chat in chats]}

@app.get("/api/chats/{chat_id}/messages")
async def get_chat_messages(chat_id: str, limit: int = 50):
    """Get messages for a specific chat"""
    messages = chat_service.get_chat_messages(chat_id, limit)
    return {"messages": [msg.to_dict() for msg in messages]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)