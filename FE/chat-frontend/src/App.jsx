import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionAttempts: 5,
});

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const joinRoom = () => {
    if (username.trim()) {
      socket.emit('joinRoom', username);
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('chatMessage', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isJoined) {
        joinRoom();
      } else {
        sendMessage();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Chat Thời Gian Thực</h1>
        {!isJoined ? (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nhập tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <button
              onClick={joinRoom}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Tham gia Chat
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
              {messages.map((msg, index) => (
                <div key={index} className="mb-3 flex flex-col">
                  <span className="font-semibold text-gray-800">
                    {msg.user === 'Hệ thống' ? (
                      <span className="text-gray-500 italic">{msg.text}</span>
                    ) : (
                      <>
                        <span className="text-blue-700">{msg.user}</span>: {msg.text}
                      </>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nhập tin nhắn"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;