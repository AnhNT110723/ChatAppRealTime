import React from "react";

const CreateGroupModal = ({
  username,
  users,
  groupName,
  setGroupName,
  groupMembers,
  toggleGroupMember,
  createGroup,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Tạo nhóm mới</h2>
        <input
          type="text"
          placeholder="Tên nhóm"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />
        <h3 className="font-semibold mb-2">Chọn thành viên</h3>
        <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto border p-2 rounded">
          {users
            .filter((u) => u.username !== username)
            .map((user) => (
              <li key={user.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={groupMembers.includes(user.username)}
                  onChange={() => toggleGroupMember(user.username)}
                  className="mr-2"
                />
                {user.username}
              </li>
            ))}
        </ul>
        <div className="flex gap-2">
          <button
            onClick={createGroup}
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold"
          >
            Tạo
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400 font-semibold"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
