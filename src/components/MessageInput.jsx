import { Smile, Send } from 'lucide-react';
import { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');

  // const sendMessage = () => {
  //   if (text.trim()) {
  //     console.log('Message sent:', text);
  //     onSend(text);
  //     setText('');
  //   }
  // };

  const sendMessage = async () => {
    if (text.trim()) {
      console.log('Message sent:', text);
      onSend(text);
  
      try {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: text }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
  
        const data = await response.json();
        console.log('Server response:', data);
      } catch (error) {
        console.error('Error sending message:', error);
      }
  
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







  
  


  