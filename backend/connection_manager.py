from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # Store active WebSocket connections: user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Store user information
        self.connected_users: Dict[str, dict] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.connected_users[user_id] = {
            "user_id": user_id,
            "username": user_id,  # Using user_id as username for simplicity
            "connected_at": asyncio.get_event_loop().time()
        }
        print(f"User {user_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.connected_users:
            del self.connected_users[user_id]
        print(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, user_id: str):
        """Send a message to a specific user"""
        if user_id in self.active_connections:
            try:
                websocket = self.active_connections[user_id]
                await websocket.send_text(message)
            except Exception as e:
                print(f"Error sending message to {user_id}: {e}")
                # Remove broken connection
                self.disconnect(user_id)
    
    async def broadcast(self, message: str, exclude_user: str = None):
        """Broadcast a message to all connected users"""
        disconnected_users = []
        
        for user_id, websocket in self.active_connections.items():
            if exclude_user and user_id == exclude_user:
                continue
            
            try:
                await websocket.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to {user_id}: {e}")
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)
    
    async def broadcast_to_users(self, message: str, user_ids: List[str]):
        """Broadcast a message to specific users"""
        disconnected_users = []
        
        for user_id in user_ids:
            if user_id in self.active_connections:
                try:
                    websocket = self.active_connections[user_id]
                    await websocket.send_text(message)
                except Exception as e:
                    print(f"Error sending to {user_id}: {e}")
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)
    
    def get_online_users(self) -> List[dict]:
        """Get list of all online users"""
        return list(self.connected_users.values())
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if a user is currently online"""
        return user_id in self.active_connections
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)