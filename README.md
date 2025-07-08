# Simple Chat Application

A real-time chat application built with React frontend and FastAPI backend using WebSockets.

## Features

- ✅ Real-time messaging
- ✅ Multiple chat rooms (private and group)
- ✅ User authentication (simple username-based)
- ✅ Online user status
- ✅ Message history
- ✅ Search functionality
- ✅ Responsive design

## Quick Start

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend

```bash
npm install
npm start
```

### 3. Open the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## How to Test

1. Open http://localhost:3000 in your browser
2. Enter any username and click "Join Chat"
3. You'll see pre-loaded chats with Alice, Bob, and Team Project
4. Click on any chat to start messaging
5. Open multiple browser tabs with different usernames to test real-time messaging

## Default Test Users

The app comes with sample data:
- **alice** - Has access to all chats
- **bob** - Has access to private chats and group
- **charlie** - Part of the Team Project group
- **diana** - Part of the Team Project group

## Architecture

### Backend (FastAPI + WebSocket)
- `main.py` - Main FastAPI application with WebSocket endpoints
- Real-time message broadcasting
- In-memory data storage
- CORS enabled for React frontend

### Frontend (React)
- `App.js` - Main React component with chat logic
- `App.css` - Complete styling for the chat interface
- WebSocket connection for real-time updates
- Responsive design

## API Endpoints

### WebSocket
- `ws://localhost:8000/ws/{user_id}` - Main chat WebSocket

### Message Types
- `send_message` - Send a new message
- `initial_data` - Receive chat history on connection
- `new_message` - Receive new messages in real-time

## Customization

### Adding New Chats
Edit the `chats` dictionary in `backend/main.py`:

```python
chats["new_chat_id"] = {
    "id": "new_chat_id",
    "name": "New Chat",
    "type": "private",  # or "group"
    "avatar": "https://i.pravatar.cc/150?img=6",
    "participants": ["user1", "user2"],
    "messages": []
}
```

### Styling
Modify `src/App.css` to change the appearance. The design uses:
- Clean, modern interface
- Gradient login screen
- WhatsApp-inspired chat bubbles
- Responsive layout

## Production Deployment

### Backend
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
npm run build
# Serve the build folder with any static file server
```

## Troubleshooting

1. **WebSocket connection failed**: Make sure backend is running on port 8000
2. **CORS errors**: Backend is configured for localhost:3000
3. **Messages not appearing**: Check browser console for WebSocket errors
4. **Port conflicts**: Change ports in both frontend and backend if needed

The application is designed to work out of the box with no additional configuration required.