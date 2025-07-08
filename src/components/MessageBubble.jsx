export default function MessageBubble({ text, time, isSender, sender, isGroup }) {
  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[16rem] px-4 py-2 rounded-lg text-sm ${isSender ? 'bg-green-100 text-right' : 'bg-white border'}`}>
        {isGroup && !isSender && (
          <div className="text-xs font-semibold text-blue-600 mb-1">{sender}</div>
        )}
        <div>{text}</div>
        <div className="text-xs text-gray-400 mt-1">{time}</div>
      </div>
    </div>
  );
}






  
  