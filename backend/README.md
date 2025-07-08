# WhatsApp Clone Backend

A FastAPI-based backend with WebSocket support for real-time chat communication.

## Features

- ✅ Real-time messaging with WebSockets
- ✅ Private and group chat support
- ✅ User online/offline status
- ✅ Message history persistence
- ✅ Typing indicators
- ✅ Connection management
- ✅ CORS support for React frontend

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python main.py
```

### 3. Server will be running at:
- **HTTP API**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws/{user_id}
- **API Docs**: http://localhost:8000/docs

## API Endpoints

### WebSocket Connection
```
ws://localhost:8000/ws/{user_id}
```

### REST Endpoints
- `GET /` - Health check
- `GET /api/health` - Detailed health status
- `GET /api/users/online` - Get online users
- `GET /api/chats/{user_id}` - Get user's chats
- `GET /api/chats/{chat_id}/messages` - Get chat messages

## WebSocket Message Types

### Client to Server:

#### Send Message
```json
{
  "type": "send_message",
  "chat_id": "chat_1",
  "text": "Hello world!"
}
```

#### Create Chat
```json
{
  "type": "create_chat",
  "name": "New Chat",
  "chat_type": "private",
  "participants": ["user1", "user2"]
}
```

#### Join Chat
```json
{
  "type": "join_chat",
  "chat_id": "chat_1"
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "chat_id": "chat_1",
  "is_typing": true
}
```

### Server to Client:

#### Initial Data
```json
{
  "type": "initial_data",
  "chats": [...],
  "online_users": [...],
  "user_id": "user1"
}
```

#### New Message
```json
{
  "type": "new_message",
  "chat_id": "chat_1",
  "message": {...}
}
```

#### Online Users Update
```json
{
  "type": "online_users_update",
  "online_users": [...]
}
```

## Data Storage

- **Format**: JSON file (`chat_data.json`)
- **Location**: Backend root directory
- **Auto-save**: On every message/chat modification
- **Backup**: Manual backup recommended for production

## Frontend Integration

### Update your React frontend WebSocket connection:

```javascript
// In your React component
const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'initial_data':
      // Set initial chats and online users
      break;
    case 'new_message':
      // Add new message to chat
      break;
    case 'online_users_update':
      // Update online users list
      break;
  }
};

// Send message
const sendMessage = (chatId, text) => {
  ws.send(JSON.stringify({
    type: 'send_message',
    chat_id: chatId,
    text: text
  }));
};
```

## Production Deployment

### Using Gunicorn + Uvicorn
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Environment Variables

```bash
# Optional environment variables
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
DATA_FILE=chat_data.json
LOG_LEVEL=info
```

## Testing

### Test WebSocket Connection
```bash
# Install wscat for testing
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8000/ws/testuser

# Send test message
{"type": "send_message", "chat_id": "chat_1", "text": "Hello!"}
```

### Test REST API
```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/users/online
```

## Troubleshooting

1. **CORS Issues**: Make sure React dev server is running on port 3000
2. **WebSocket Connection Failed**: Check if backend is running on port 8000
3. **Messages Not Saving**: Check file permissions for `chat_data.json`
4. **High Memory Usage**: Consider implementing database storage for production

## Architecture

```
backend/
├── main.py              # FastAPI app and WebSocket routes
├── models.py            # Data models (User, Chat, Message)
├── connection_manager.py # WebSocket connection management
├── chat_service.py      # Chat business logic and data persistence
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

The backend is designed to be:
- **Scalable**: Easy to add database support
- **Maintainable**: Clear separation of concerns
- **Production-ready**: Proper error handling and logging
- **Type-safe**: Full typing support with Pydantic models