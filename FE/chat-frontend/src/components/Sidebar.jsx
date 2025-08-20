
import React from 'react';

const Sidebar = ({ 
  username, 
  users, 
  groups, 
  selectChat, 
  selectedRecipient, 
  isGroupChat, 
  logout, 
  setShowCreateGroup, 
  getInitials,
  setShowGroupOptions,
  setGroupOptionsData,
  unreadCounts // Thêm prop để nhận số lượng tin nhắn chưa đọc
}) => {
  
  const handleGroupOptionsClick = (e, group) => {
    e.stopPropagation();
    setGroupOptionsData({
      id: group.id,
      name: group.name,
      members: group.members,
      creator: group.creator
    });
    setShowGroupOptions(true);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.73-.35-3.89-.98L7 19.5l.5-1.11C6.85 17.73 6.5 16.4 6.5 15c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5S15.04 20 12 20z"/>
              <circle cx="9" cy="15" r="1"/>
              <circle cx="12" cy="15" r="1"/>
              <circle cx="15" cy="15" r="1"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">ChatApp</h1>
            <p className="text-sm text-gray-500">Realtime Chat</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className="text-gray-500 text-sm font-semibold p-2">Bạn bè online</h3>
          {users
            .filter((u) => u.username !== username)
            .map((user) => {
              const roomId = [username, user.username].sort().join("-");
              const unreadCount = unreadCounts[roomId] || 0;
              return (
                <div 
                  key={user.id} 
                  onClick={() => selectChat(user.username, false)}
                  className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    selectedRecipient === user.username && !isGroupChat ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(user.username)}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white online-indicator"></div>
                    {/* Thêm huy hiệu thông báo cho tin nhắn chưa đọc */}
                    {unreadCount > 0 && (
                      <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-semibold text-gray-800">{user.username}</h3>
                    <p className="text-sm text-green-600">Đang hoạt động</p>
                  </div>
                </div>
              );
            })}
          
          <h3 className="text-gray-500 text-sm font-semibold p-2 mt-4">Nhóm</h3>
          {groups.map((group) => {
            const unreadCount = unreadCounts[group.id] || 0;
            return (
              <div
                key={group.id}
                onClick={() => selectChat(group.id, true)}
                className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedRecipient === group.id && isGroupChat ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 17.06 7H16c-.8 0-1.54.37-2.01.99l-2.54 7.63H14v6h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6l-2.54-7.63A2.996 2.996 0 0 0 .56 6H0v2h.56L2 14v8h6z"/>
                    </svg>
                  </div>
                  {/* Thêm huy hiệu thông báo cho tin nhắn chưa đọc */}
                  {unreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                      {unreadCount}
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.members.length} thành viên</p>
                  </div>
                  <button
                    onClick={(e) => handleGroupOptionsClick(e, group)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
                    title="Tùy chọn nhóm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center space-x-3">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getInitials(username)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 ml-3">
              <h3 className="font-semibold text-gray-800">{username}</h3>
              <p className="text-sm text-green-600">Đang hoạt động</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tạo nhóm mới"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11h-3V8c0-.55-.45-1-1-1s-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;