import { useState } from "react";

export default function Sidebar({ chats, activeChatId, onSelectChat }) {
   
  const [searchText, setSearchText] = useState("");

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
      // <div className="w-1/3 max-w-sm border-r bg-white">
      //   <div className="p-4 border-b">
      //     <input className="w-full p-2 border rounded" placeholder="Search chats" />
      //   </div>
      //   <div>
      //     {chats.map(chat => (
      //       <div
      //         key={chat.id}
      //         onClick={() => onSelectChat(chat.id)}
      //         className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${
      //           chat.id === activeChatId ? 'bg-gray-100 border-l-4 border-green-500' : ''
      //         }`}
      //       >
      //         <img src={chat.avatar} className="w-10 h-10 rounded-full mr-3" alt="" />
      //         <div>
      //           <div className="font-semibold">{chat.name}</div>
      //           <div className="text-sm text-gray-500">
      //             {chat.messages[chat.messages.length - 1]?.text}
      //           </div>
      //         </div>
      //       </div>
      //     ))}
      //   </div>
      // </div>


<div className="w-1/3 max-w-sm border-r bg-white">
      <div className="p-4 border-b">
        <input
          className="w-full p-2 border rounded"
          placeholder="Search chats"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div>
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${
              chat.id === activeChatId ? 'bg-gray-100 border-l-4 border-green-500' : ''
            }`}
          >
            <img src={chat.avatar} className="w-10 h-10 rounded-full mr-3" alt="" />
            <div>
              <div className="font-semibold">{chat.name}</div>
              <div className="text-sm text-gray-500">
                {chat.messages[chat.messages.length - 1]?.text}
              </div>
            </div>
          </div>
        ))}

        {filteredChats.length === 0 && (
          <div className="text-center text-sm text-gray-500 p-4">No chats found</div>
        )}
      </div>
    </div>
    );
  }
  
  
  
  
  
  
  
  








  

  
  
  