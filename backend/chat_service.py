from typing import Dict, List, Optional
import json
import os
from datetime import datetime
import uuid
from models import User, Chat, Message, MessageType, ChatRoom

class ChatService:
    def __init__(self, data_file: str = "chat_data.json"):
        self.data_file = data_file
        self.chats: Dict[str, Chat] = {}
        self.users: Dict[str, User] = {}
        self.chat_rooms: Dict[str, ChatRoom] = {}
        self.load_data()
        self._initialize_default_data()
    
    def _initialize_default_data(self):
        """Initialize with some default chats and users if none exist"""
        if not self.chats:
            # Create default users
            default_users = [
                ("alice", "Alice", "https://i.pravatar.cc/150?img=1"),
                ("bob", "Bob", "https://i.pravatar.cc/150?img=2"),
                ("charlie", "Charlie", "https://i.pravatar.cc/150?img=3"),
                ("diana", "Diana", "https://i.pravatar.cc/150?img=4"),
            ]
            
            for user_id, username, avatar in default_users:
                self.users[user_id] = User(user_id, username, avatar)
            
            # Create default chats
            self._create_default_chats()
    
    def _create_default_chats(self):
        """Create some default chats for demonstration"""
        # Private chat between alice and bob
        chat1 = Chat(
            chat_id="chat_1",
            name="Alice",
            chat_type="private",
            participants=["alice", "bob"],
            avatar="https://i.pravatar.cc/150?img=1"
        )
        
        # Add some initial messages
        msg1 = Message(
            message_id=str(uuid.uuid4()),
            chat_id="chat_1",
            sender_id="alice",
            text="Hey there!",
            timestamp=datetime.now()
        )
        msg2 = Message(
            message_id=str(uuid.uuid4()),
            chat_id="chat_1",
            sender_id="bob",
            text="How are you?",
            timestamp=datetime.now()
        )
        
        chat1.add_message(msg1)
        chat1.add_message(msg2)
        self.chats["chat_1"] = chat1
        
        # Group chat
        chat2 = Chat(
            chat_id="chat_2",
            name="Team Project",
            chat_type="group",
            participants=["alice", "bob", "charlie", "diana"],
            avatar="https://i.pravatar.cc/150?img=5"
        )
        
        # Add group messages
        msg3 = Message(
            message_id=str(uuid.uuid4()),
            chat_id="chat_2",
            sender_id="alice",
            text="Let's start the call!",
            timestamp=datetime.now()
        )
        msg4 = Message(
            message_id=str(uuid.uuid4()),
            chat_id="chat_2",
            sender_id="charlie",
            text="Joining in 5 mins",
            timestamp=datetime.now()
        )
        
        chat2.add_message(msg3)
        chat2.add_message(msg4)
        self.chats["chat_2"] = chat2
        
        # Another private chat
        chat3 = Chat(
            chat_id="chat_3",
            name="Bob",
            chat_type="private",
            participants=["alice", "bob"],
            avatar="https://i.pravatar.cc/150?img=2"
        )
        
        msg5 = Message(
            message_id=str(uuid.uuid4()),
            chat_id="chat_3",
            sender_id="bob",
            text="Meeting at 3?",
            timestamp=datetime.now()
        )
        
        chat3.add_message(msg5)
        self.chats["chat_3"] = chat3
    
    def load_data(self):
        """Load chat data from JSON file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    
                # Load users
                for user_data in data.get('users', []):
                    user = User(
                        user_data['user_id'],
                        user_data['username'],
                        user_data.get('avatar')
                    )
                    self.users[user.user_id] = user
                
                # Load chats
                for chat_data in data.get('chats', []):
                    chat = Chat(
                        chat_data['chat_id'],
                        chat_data['name'],
                        chat_data['chat_type'],
                        chat_data['participants'],
                        chat_data.get('avatar')
                    )
                    
                    # Load messages
                    for msg_data in chat_data.get('messages', []):
                        message = Message(
                            msg_data['message_id'],
                            msg_data['chat_id'],
                            msg_data['sender_id'],
                            msg_data['text'],
                            MessageType(msg_data.get('message_type', 'text')),
                            datetime.fromisoformat(msg_data['timestamp'])
                        )
                        chat.add_message(message)
                    
                    self.chats[chat.chat_id] = chat
                    
            except Exception as e:
                print(f"Error loading data: {e}")
    
    def save_data(self):
        """Save chat data to JSON file"""
        try:
            data = {
                'users': [user.to_dict() for user in self.users.values()],
                'chats': []
            }
            
            for chat in self.chats.values():
                chat_data = chat.to_dict()
                data['chats'].append(chat_data)
            
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2, default=str)
                
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def create_chat(self, name: str, chat_type: str, participants: List[str]) -> Optional[Chat]:
        """Create a new chat"""
        chat_id = str(uuid.uuid4())
        
        chat = Chat(
            chat_id=chat_id,
            name=name,
            chat_type=chat_type,
            participants=participants
        )
        
        self.chats[chat_id] = chat
        self.chat_rooms[chat_id] = ChatRoom(chat_id)
        self.save_data()
        
        return chat
    
    def get_chat(self, chat_id: str) -> Optional[Chat]:
        """Get a chat by ID"""
        return self.chats.get(chat_id)
    
    def get_user_chats(self, user_id: str) -> List[Chat]:
        """Get all chats that a user is part of"""
        user_chats = []
        for chat in self.chats.values():
            if user_id in chat.participants:
                user_chats.append(chat)
        
        # Sort by last message time
        user_chats.sort(key=lambda x: x.last_message_at, reverse=True)
        return user_chats
    
    def add_message(self, chat_id: str, sender_id: str, text: str) -> Optional[Message]:
        """Add a message to a chat"""
        chat = self.get_chat(chat_id)
        if not chat:
            return None
        
        message = Message(
            message_id=str(uuid.uuid4()),
            chat_id=chat_id,
            sender_id=sender_id,
            text=text
        )
        
        chat.add_message(message)
        self.save_data()
        
        return message
    
    def get_chat_messages(self, chat_id: str, limit: int = 50) -> List[Message]:
        """Get messages for a chat"""
        chat = self.get_chat(chat_id)
        if not chat:
            return []
        
        # Return last 'limit' messages
        return chat.messages[-limit:] if len(chat.messages) > limit else chat.messages
    
    def add_user_to_chat(self, chat_id: str, user_id: str) -> bool:
        """Add a user to a chat"""
        chat = self.get_chat(chat_id)
        if not chat:
            return False
        
        if user_id not in chat.participants:
            chat.participants.append(user_id)
            self.save_data()
        
        # Add to active chat room
        if chat_id not in self.chat_rooms:
            self.chat_rooms[chat_id] = ChatRoom(chat_id)
        
        self.chat_rooms[chat_id].add_participant(user_id)
        return True
    
    def remove_user_from_chat(self, chat_id: str, user_id: str) -> bool:
        """Remove a user from a chat"""
        chat = self.get_chat(chat_id)
        if not chat:
            return False
        
        if user_id in chat.participants:
            chat.participants.remove(user_id)
            self.save_data()
        
        # Remove from active chat room
        if chat_id in self.chat_rooms:
            self.chat_rooms[chat_id].remove_participant(user_id)
        
        return True
    
    def get_or_create_user(self, user_id: str, username: str = None) -> User:
        """Get existing user or create new one"""
        if user_id not in self.users:
            self.users[user_id] = User(
                user_id=user_id,
                username=username or user_id,
                avatar=f"https://i.pravatar.cc/150?u={user_id}"
            )
            self.save_data()
        
        return self.users[user_id]