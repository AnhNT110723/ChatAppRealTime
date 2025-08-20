import React, { useState } from "react";
// Đã sửa đường dẫn import để đảm bảo các component được tìm thấy
import Sidebar from "./Sidebar.jsx";
import ChatHeader from "./ChatHeader.jsx";
import MessageList from "./MessageList.jsx";
import ChatInput from "./ChatInput.jsx";
import CreateGroupModal from "./CreateGroupModal.jsx";
import GroupOptionsModal from "./GroupOptionsModal.jsx";

const ChatInterface = ({
  username,
  users,
  groups,
  messages,
  sendMessage,
  logout,
  selectChat,
  selectedRecipient,
  isGroupChat,
  getInitials,
  createGroup,
  deleteGroup,
  addMemberToGroup,
  kickMemberFromGroup,
  unreadCounts
}) => {
  const [message, setMessage] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [groupOptionsData, setGroupOptionsData] = useState(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message, selectedRecipient, isGroupChat);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleGroupMember = (member) => {
    setGroupMembers((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && groupMembers.length > 0) {
      createGroup(groupName, groupMembers);
      setShowCreateGroup(false);
      setGroupName("");
      setGroupMembers([]);
    }
  };

  return (
    <div className="flex h-full w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl">
      <Sidebar
        username={username}
        users={users}
        groups={groups}
        selectChat={selectChat}
        selectedRecipient={selectedRecipient}
        isGroupChat={isGroupChat}
        logout={logout}
        setShowCreateGroup={setShowCreateGroup}
        getInitials={getInitials}
        setShowGroupOptions={setShowGroupOptions}
        setGroupOptionsData={setGroupOptionsData}
        unreadCounts={unreadCounts}
      />

      <div className="flex-1 flex flex-col chat-container">
        <ChatHeader
          selectedRecipient={selectedRecipient}
          isGroupChat={isGroupChat}
          groups={groups}
          getInitials={getInitials}
        />
        <MessageList messages={messages} username={username} getInitials={getInitials} />
        <ChatInput
          message={message}
          setMessage={setMessage}
          sendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          selectedRecipient={selectedRecipient}
        />
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          username={username}
          users={users}
          groupName={groupName}
          setGroupName={setGroupName}
          groupMembers={groupMembers}
          toggleGroupMember={toggleGroupMember}
          createGroup={handleCreateGroup}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
      
      {showGroupOptions && groupOptionsData && (
        <GroupOptionsModal
            group={groupOptionsData}
            onClose={() => setShowGroupOptions(false)}
            users={users}
            username={username}
            addMemberToGroup={addMemberToGroup}
            kickMemberFromGroup={kickMemberFromGroup}
            deleteGroup={deleteGroup}
        />
      )}
    </div>
  );
};

export default ChatInterface;
