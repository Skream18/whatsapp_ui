from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class MessageType(Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"

class User:
    def __init__(self, user_id: str, username: str, avatar: Optional[str] = None):
        self.user_id = user_id
        self.username = username
        self.avatar = avatar or f"https://i.pravatar.cc/150?u={user_id}"
        self.is_online = False
        self.last_seen = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "avatar": self.avatar,
            "is_online": self.is_online,
            "last_seen": self.last_seen.isoformat()
        }

class Message:
    def __init__(
        self, 
        message_id: str, 
        chat_id: str, 
        sender_id: str, 
        text: str, 
        message_type: MessageType = MessageType.TEXT,
        timestamp: Optional[datetime] = None
    ):
        self.message_id = message_id
        self.chat_id = chat_id
        self.sender_id = sender_id
        self.text = text
        self.message_type = message_type
        self.timestamp = timestamp or datetime.now()
        self.is_read = False
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "message_id": self.message_id,
            "chat_id": self.chat_id,
            "sender_id": self.sender_id,
            "text": self.text,
            "message_type": self.message_type.value,
            "timestamp": self.timestamp.isoformat(),
            "time": self.timestamp.strftime("%I:%M %p"),  # For frontend compatibility
            "sender": self.sender_id,  # For frontend compatibility
            "is_read": self.is_read
        }

class Chat:
    def __init__(
        self, 
        chat_id: str, 
        name: str, 
        chat_type: str = "private",  # "private" or "group"
        participants: Optional[List[str]] = None,
        avatar: Optional[str] = None
    ):
        self.chat_id = chat_id
        self.name = name
        self.chat_type = chat_type
        self.participants = participants or []
        self.avatar = avatar or f"https://i.pravatar.cc/150?u={chat_id}"
        self.created_at = datetime.now()
        self.last_message_at = datetime.now()
        self.messages: List[Message] = []
    
    def add_message(self, message: Message):
        """Add a message to this chat"""
        self.messages.append(message)
        self.last_message_at = message.timestamp
    
    def get_last_message(self) -> Optional[Message]:
        """Get the last message in this chat"""
        return self.messages[-1] if self.messages else None
    
    def to_dict(self) -> Dict[str, Any]:
        last_message = self.get_last_message()
        return {
            "id": self.chat_id,
            "chat_id": self.chat_id,
            "name": self.name,
            "type": self.chat_type,
            "participants": self.participants,
            "avatar": self.avatar,
            "created_at": self.created_at.isoformat(),
            "last_message_at": self.last_message_at.isoformat(),
            "messages": [msg.to_dict() for msg in self.messages],
            "last_message": last_message.to_dict() if last_message else None
        }

class ChatRoom:
    """Represents an active chat room with real-time participants"""
    def __init__(self, chat_id: str):
        self.chat_id = chat_id
        self.active_participants: List[str] = []
        self.typing_users: List[str] = []
    
    def add_participant(self, user_id: str):
        if user_id not in self.active_participants:
            self.active_participants.append(user_id)
    
    def remove_participant(self, user_id: str):
        if user_id in self.active_participants:
            self.active_participants.remove(user_id)
        if user_id in self.typing_users:
            self.typing_users.remove(user_id)
    
    def set_typing(self, user_id: str, is_typing: bool):
        if is_typing and user_id not in self.typing_users:
            self.typing_users.append(user_id)
        elif not is_typing and user_id in self.typing_users:
            self.typing_users.remove(user_id)