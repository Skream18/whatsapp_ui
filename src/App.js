import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatWindow from "./components/ChatWindow";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

export default function App() {
  const [activeChatId, setActiveChatId] = useState(1);
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([
    {
      id: 1,
      type: "private",
      name: "Alice",
      avatar: "https://i.pravatar.cc/150?img=1",
      messages: [
        { text: "Hey there!", sender: "Alice", time: "10:00 AM" },
        { text: "How are you?", sender: "Me", time: "10:01 AM" },
      ],
    },
    {
      id: 2,
      type: "private",
      name: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
      messages: [{ text: "Meeting at 3?", sender: "Bob", time: "10:02 AM" }],
    },
    {
      id: 3,
      type: "group",
      name: "Team Project",
      avatar: "https://i.pravatar.cc/150?img=5",
      participants: ["Me", "Alice", "Bob", "Eve"],
      messages: [
        { text: "Let’s start the call!", sender: "Alice", time: "09:00 AM" },
        { text: "Joining in 5 mins", sender: "Eve", time: "09:01 AM" },
        { text: "I’m here!", sender: "Me", time: "09:02 AM" },
      ],
    },
  ]);

  // if (!user) return <LoginPage onLogin={setUser} />;

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleSendMessage = (chatId, text) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  text,
                  sender: "Me",
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ],
            }
          : chat
      )
    );
  };

  // return (
  //   <div className="flex h-screen">
  //     <Sidebar
  //       chats={chats}
  //       activeChatId={activeChatId}
  //       onSelectChat={setActiveChatId}
  //     />
  //     <ChatWindow
  //       chat={activeChat}
  //       onSendMessage={(text) => handleSendMessage(activeChatId, text)}
  //     />
  //   </div>
  // );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={setUser} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route
          path="/chat"
          element={
            user ? (
              <div className="flex h-screen">
                <Sidebar
                  chats={chats}
                  activeChatId={activeChatId}
                  onSelectChat={setActiveChatId}
                />
                <ChatWindow
                  chat={activeChat}
                  onSendMessage={(text) =>
                    handleSendMessage(activeChatId, text)
                  }
                />
              </div>
            ) : (
              <LoginPage onLogin={setUser} />
            )
          }
        />
      </Routes>
    </Router>
  );
}
