import MessageBubble from './MessageBubble';

export default function MessageList({ messages, isGroup }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          text={msg.text}
          time={msg.time}
          isSender={msg.sender === 'Me'}
          sender={msg.sender}
          isGroup={isGroup}
        />
      ))}
    </div>
  );
}








