import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Login handler
  const handleLogin = (username) => {
    if (username.trim()) {
      const userData = { 
        id: username.toLowerCase(), 
        name: username 
      };
      setUser(userData);
      connectWebSocket(userData.id);
    }
  };

  // WebSocket connection
  const connectWebSocket = (userId) => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${userId}`);
    
    wsRef.current.onopen = () => {
      console.log(`Connected to WebSocket as ${userId}`);
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      
      switch(data.type) {
        case 'initial_data':
          console.log('Setting initial chats:', data.chats);
          setChats(data.chats || []);
          setOnlineUsers(data.online_users || []);
          
          // Set first available chat as active
          if (data.chats && data.chats.length > 0) {
            setActiveChat(data.chats[0]);
          }
          break;
          
        case 'new_message':
          console.log('New message received:', data.message);
          
          // Update chats list
          setChats(prevChats => 
            prevChats.map(chat => {
              if (chat.id === data.chat_id) {
                const updatedMessages = [...chat.messages, data.message];
                return { ...chat, messages: updatedMessages };
              }
              return chat;
            })
          );
          
          // Update active chat if it matches
          setActiveChat(prevActive => {
            if (prevActive && prevActive.id === data.chat_id) {
              const updatedMessages = [...prevActive.messages, data.message];
              return { ...prevActive, messages: updatedMessages };
            }
            return prevActive;
          });
          break;
          
        case 'user_online':
          console.log('User came online:', data.user);
          setOnlineUsers(prev => {
            const exists = prev.find(u => u.id === data.user.id);
            if (!exists) {
              return [...prev, data.user];
            }
            return prev;
          });
          break;
          
        case 'user_offline':
          console.log('User went offline:', data.user_id);
          setOnlineUsers(prev => prev.filter(u => u.id !== data.user_id));
          break;
          
        case 'online_users_update':
          console.log('Online users update:', data.online_users);
          setOnlineUsers(data.online_users || []);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
          break;
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (user) {
          console.log('Attempting to reconnect...');
          connectWebSocket(user.id);
        }
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  // Send message
  const sendMessage = () => {
    if (message.trim() && activeChat && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message, 'to chat:', activeChat.id);
      
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        chat_id: activeChat.id,
        text: message.trim()
      }));
      
      setMessage('');
    } else {
      console.log('Cannot send message:', {
        hasMessage: !!message.trim(),
        hasActiveChat: !!activeChat,
        wsReady: wsRef.current?.readyState === WebSocket.OPEN
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Login screen
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome to Chat</h2>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Try usernames: alice, bob, charlie, diana
          </p>
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
          
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
            <p>💡 Open multiple tabs with different usernames to test real-time chat</p>
          </div>
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
            <div style={{ fontSize: '0.7rem', color: '#4caf50' }}>
              Online ({onlineUsers.length} users)
            </div>
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
        
        {/* Online Users Section */}
        {onlineUsers.length > 0 && (
          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
              Online Now ({onlineUsers.length})
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {onlineUsers.map(onlineUser => (
                <div key={onlineUser.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '0.7rem',
                  background: '#e8f5e8',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    background: '#4caf50', 
                    borderRadius: '50%', 
                    marginRight: '4px' 
                  }}></div>
                  {onlineUser.name || onlineUser.id}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="chat-list">
          {filteredChats.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#666' }}>
              <p>No chats available</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Make sure the backend is running
              </p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => {
                  console.log('Selecting chat:', chat);
                  setActiveChat(chat);
                }}
              >
                <img src={chat.avatar} alt={chat.name} className="avatar" />
                <div className="chat-info">
                  <div className="chat-name">
                    {chat.name}
                    {chat.type === 'group' && <span className="group-badge">Group</span>}
                    }
                  </div>
                  <div className="last-message">
                    {chat.messages && chat.messages.length > 0 
                      ? chat.messages[chat.messages.length - 1].text
                      : 'No messages yet'
                    }
                  </div>
                </div>
              </div>
            ))
          )}
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
                  {activeChat.type === 'group' 
                    ? `${activeChat.participants?.length || 0} members` 
                    : 'Online'
                  }
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {activeChat.messages && activeChat.messages.length > 0 ? (
                activeChat.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}
                  >
                    {activeChat.type === 'group' && msg.sender !== user.id && (
                      <div className="sender-name">{msg.senderName || msg.sender}</div>
                    )}
                    <div className="message-content">
                      <span className="message-text">{msg.text}</span>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%', 
                  color: '#666' 
                }}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={sendMessage} disabled={!message.trim()}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat">
            <h3>Select a chat to start messaging</h3>
            <p style={{ marginTop: '1rem', color: '#888' }}>
              {chats.length === 0 
                ? 'Loading chats...' 
                : 'Choose a conversation from the sidebar'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;