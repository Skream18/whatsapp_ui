import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const wsRef = useRef(null);

  // Login handler
  const handleLogin = (username) => {
    if (username.trim()) {
      setUser({ id: username, name: username });
      connectWebSocket(username);
    }
  };

  // WebSocket connection
  const connectWebSocket = (userId) => {
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${userId}`);
    
    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'initial_data':
          setChats(data.chats);
          if (data.chats.length > 0) {
            setActiveChat(data.chats[0]);
          }
          break;
          
        case 'new_message':
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === data.chat_id 
                ? { ...chat, messages: [...chat.messages, data.message] }
                : chat
            )
          );
          
          // Update active chat if it's the same
          setActiveChat(prevActive => 
            prevActive && prevActive.id === data.chat_id
              ? { ...prevActive, messages: [...prevActive.messages, data.message] }
              : prevActive
          );
          break;
          
        default:
          break;
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  // Send message
  const sendMessage = () => {
    if (message.trim() && activeChat && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        chat_id: activeChat.id,
        text: message
      }));
      setMessage('');
    }
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Login screen
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome to Chat</h2>
          <input
            type="text"
            placeholder="Enter your username"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogin(e.target.value);
              }
            }}
          />
          <button onClick={(e) => {
            const input = e.target.previousElementSibling;
            handleLogin(input.value);
          }}>
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Chats</h3>
          <div className="user-info">
            <span>{user.name}</span>
          </div>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        <div className="chat-list">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}
            >
              <img src={chat.avatar} alt={chat.name} className="avatar" />
              <div className="chat-info">
                <div className="chat-name">
                  {chat.name}
                  {chat.type === 'group' && <span className="group-badge">Group</span>}
                </div>
                <div className="last-message">
                  {chat.messages.length > 0 
                    ? chat.messages[chat.messages.length - 1].text
                    : 'No messages yet'
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <img src={activeChat.avatar} alt={activeChat.name} className="avatar" />
              <div className="chat-info">
                <h3>{activeChat.name}</h3>
                <span className="status">
                  {activeChat.type === 'group' ? `${activeChat.participants.length} members` : 'Online'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {activeChat.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}
                >
                  {activeChat.type === 'group' && msg.sender !== user.id && (
                    <div className="sender-name">{msg.senderName}</div>
                  )}
                  <div className="message-content">
                    <span className="message-text">{msg.text}</span>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;