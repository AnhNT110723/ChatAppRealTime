import React from 'react';

const ChatInput = ({ message, setMessage, sendMessage, handleKeyPress, selectedRecipient }) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {selectedRecipient ? (
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">
          Vui lòng chọn một người dùng hoặc nhóm để bắt đầu trò chuyện.
        </p>
      )}
    </div>
  );
};

export default ChatInput;
