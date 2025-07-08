from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import asyncio
from datetime import datetime
import uuid

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.users: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.users[user_id] = {
            "id": user_id,
            "name": user_id,
            "avatar": f"https://i.pravatar.cc/150?u={user_id}",
            "online": True
        }

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.users:
            self.users[user_id]["online"] = False

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
            except:
                self.disconnect(user_id)

    async def broadcast(self, message: str):
        disconnected = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except:
                disconnected.append(user_id)
        
        for user_id in disconnected:
            self.disconnect(user_id)

manager = ConnectionManager()

# Simple in-memory storage
chats = {
    "1": {
        "id": "1",
        "name": "Alice",
        "type": "private",
        "avatar": "https://i.pravatar.cc/150?img=1",
        "participants": ["alice", "bob"],
        "messages": [
            {
                "id": str(uuid.uuid4()),
                "text": "Hey there!",
                "sender": "alice",
                "senderName": "Alice",
                "time": "10:00 AM",
                "timestamp": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "text": "How are you doing?",
                "sender": "bob",
                "senderName": "Bob",
                "time": "10:01 AM",
                "timestamp": datetime.now().isoformat()
            }
        ]
    },
    "2": {
        "id": "2",
        "name": "Bob",
        "type": "private",
        "avatar": "https://i.pravatar.cc/150?img=2",
        "participants": ["alice", "bob"],
        "messages": [
            {
                "id": str(uuid.uuid4()),
                "text": "Meeting at 3?",
                "sender": "bob",
                "senderName": "Bob",
                "time": "10:02 AM",
                "timestamp": datetime.now().isoformat()
            }
        ]
    },
    "3": {
        "id": "3",
        "name": "Team Project",
        "type": "group",
        "avatar": "https://i.pravatar.cc/150?img=5",
        "participants": ["alice", "bob", "charlie", "diana"],
        "messages": [
            {
                "id": str(uuid.uuid4()),
                "text": "Let's start the call!",
                "sender": "alice",
                "senderName": "Alice",
                "time": "09:00 AM",
                "timestamp": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "text": "Joining in 5 mins",
                "sender": "charlie",
                "senderName": "Charlie",
                "time": "09:01 AM",
                "timestamp": datetime.now().isoformat()
            }
        ]
    }
}

@app.get("/")
async def root():
    return {"message": "Chat Backend Running"}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    
    try:
        # Send initial data
        user_chats = []
        for chat_id, chat in chats.items():
            if user_id in chat["participants"]:
                user_chats.append(chat)
        
        await websocket.send_text(json.dumps({
            "type": "initial_data",
            "chats": user_chats,
            "user": manager.users[user_id]
        }))
        
        # Broadcast user online status
        await manager.broadcast(json.dumps({
            "type": "user_online",
            "user": manager.users[user_id]
        }))
        
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data["type"] == "send_message":
                chat_id = message_data["chat_id"]
                text = message_data["text"]
                
                if chat_id in chats:
                    # Create new message
                    new_message = {
                        "id": str(uuid.uuid4()),
                        "text": text,
                        "sender": user_id,
                        "senderName": manager.users[user_id]["name"],
                        "time": datetime.now().strftime("%I:%M %p"),
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    # Add to chat
                    chats[chat_id]["messages"].append(new_message)
                    
                    # Broadcast to all participants
                    for participant in chats[chat_id]["participants"]:
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "new_message",
                                "chat_id": chat_id,
                                "message": new_message
                            }),
                            participant
                        )
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        await manager.broadcast(json.dumps({
            "type": "user_offline",
            "user_id": user_id
        }))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)