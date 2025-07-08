import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatWindow({ chat, onSendMessage }) {
  if (!chat) return <div className="flex-1 bg-gray-50" />;
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <ChatHeader name={chat.name} avatar={chat.avatar} isGroup={chat.type === 'group'} />
      <MessageList messages={chat.messages} isGroup={chat.type === 'group'} />
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}






















