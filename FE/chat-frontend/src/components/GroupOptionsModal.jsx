import React, { useState } from "react";

const GroupOptionsModal = ({ 
  group, 
  onClose, 
  users, 
  username, 
  addMemberToGroup, 
  kickMemberFromGroup, 
  deleteGroup 
}) => {
    const [newMember, setNewMember] = useState('');
    const [selectedMemberToKick, setSelectedMemberToKick] = useState('');
    const isCreator = group.creator === username; 
    
    const handleAddMember = () => {
        if (newMember) {
            addMemberToGroup(group.id, newMember);
            setNewMember('');
        }
    };

    const handleKickMember = () => {
        if (selectedMemberToKick) {
            kickMemberFromGroup(group.id, selectedMemberToKick);
            setSelectedMemberToKick('');
        }
    };
    
    const handleDeleteGroup = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhóm này không?")) {
            deleteGroup(group.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Quản lý nhóm: {group.name}</h2>
                <p className="text-sm text-gray-500 mb-4">Chủ nhóm: {group.creator}</p>
                
                <div className="mb-4">
                        <h3 className="font-semibold mb-2">Thêm thành viên</h3>
                        <div className="flex space-x-2">
                            <select
                                value={newMember}
                                onChange={(e) => setNewMember(e.target.value)}
                                className="flex-1 p-2 border rounded-lg"
                            >
                                <option value="">Chọn người dùng...</option>
                                {users
                                    .filter(u => !group.members.includes(u.username))
                                    .map(user => (
                                        <option key={user.id} value={user.username}>{user.username}</option>
                                    ))}
                            </select>
                            <button
                                onClick={handleAddMember}
                                className="bg-green-600 text-white p-2 rounded-lg"
                            >
                                Thêm
                            </button>
                        </div>
                </div>
                
                {/* hiện phần kick thành viên nếu là chủ nhóm */}
                {isCreator && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Kick thành viên</h3>
                        <div className="flex space-x-2">
                            <select
                                value={selectedMemberToKick}
                                onChange={(e) => setSelectedMemberToKick(e.target.value)}
                                className="flex-1 p-2 border rounded-lg"
                            >
                                <option value="">Chọn người dùng...</option>
                                {group.members
                                    .filter(member => member !== username) // Không thể tự kick bản thân
                                    .map(member => (
                                        <option key={member} value={member}>{member}</option>
                                    ))}
                            </select>
                            <button
                                onClick={handleKickMember}
                                className="bg-yellow-600 text-white p-2 rounded-lg"
                            >
                                Kick
                            </button>
                        </div>
                    </div>
                )}
                
                {/*Chỉ hiện nút xóa nhóm nếu là chủ nhóm */}
                {isCreator && (
                    <button
                        onClick={handleDeleteGroup}
                        className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 mt-4"
                    >
                        Xóa nhóm
                    </button>
                )}

                <button
                    onClick={onClose}
                    className="w-full bg-gray-300 p-2 rounded-lg hover:bg-gray-400 mt-2"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default GroupOptionsModal;
