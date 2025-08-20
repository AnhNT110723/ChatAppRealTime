import React from 'react';

const ChatHeader = ({ selectedRecipient, isGroupChat, groups, getInitials }) => {
  const getRecipientName = () => {
    if (!selectedRecipient) return "Chọn một cuộc trò chuyện";
    if (isGroupChat) {
      const group = groups.find((g) => g.id === selectedRecipient);
      return group ? group.name : "Nhóm không tồn tại";
    }
    return selectedRecipient;
  };

  const recipientName = getRecipientName();
  const membersCount = isGroupChat ? groups.find(g => g.id === selectedRecipient)?.members.length : null;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{getInitials(recipientName)}</span>
          </div>
          {!isGroupChat && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white online-indicator"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{recipientName}</h2>
          {selectedRecipient && (
            <p className="text-sm text-green-600">
              {isGroupChat ? `Nhóm gồm ${membersCount} thành viên` : "Đang hoạt động"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
