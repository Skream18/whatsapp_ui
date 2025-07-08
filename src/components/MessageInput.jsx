import { Smile, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  const wsRef = useRef(null);
  const userIdRef = useRef('alice'); // Default user for demo

  useEffect(() => {
    // Initialize WebSocket connection
    const userId = userIdRef.current;
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${userId}`);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      
      // Handle different message types
      switch(data.type) {
        case 'initial_data':
          console.log('Initial data received:', data);
          break;
        case 'new_message':
          console.log('New message:', data.message);
          break;
        case 'online_users_update':
          console.log('Online users:', data.online_users);
          break;
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (text.trim()) {
      console.log('Message sent:', text);
      
      // Send via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          chat_id: 'chat_1', // Default chat for demo
          text: text
        }));
      }
      
      // Also call the original onSend for UI update
      onSend(text);
      setText('');
    }
  };
  
  return (
    <div className="p-4 border-t bg-white flex items-center gap-2">
      <Smile className="w-5 h-5 text-gray-400" />
      <input
        className="flex-1 border rounded-full px-4 py-2"
        placeholder="Type a message"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>
        <Send className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}







  
  


  