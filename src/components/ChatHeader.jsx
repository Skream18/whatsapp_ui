import { Video, Phone, MoreVertical } from 'lucide-react';

export default function ChatHeader({ name, avatar, isGroup }) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center">
        <img src={avatar} className="w-10 h-10 rounded-full mr-3" alt="" />
        <div>
          <div className="font-semibold">
            {name}
            {isGroup && <span className="ml-2 text-sm text-gray-400">(Group)</span>}
          </div>
          <div className="text-xs text-green-600">Online</div>
        </div>
      </div>
      <div className="flex gap-3 text-gray-500">
        <Video className="w-5 h-5" />
        <Phone className="w-5 h-5" />
        <MoreVertical className="w-5 h-5" />
      </div>
    </div>
  );
}






  
  
  
  
  
  