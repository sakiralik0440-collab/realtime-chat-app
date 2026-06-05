import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GroupInfo = ({ room, onClose, onDeleteGroup, onMemberRemoved }) => {
  const { user } = useAuth();
  const isCreator = room.createdBy?.[0] === user?.id ||
                    room.createdBy === user?.id;

  const gradients = [
    'linear-gradient(135deg, #4F46E5, #7C3AED)',
    'linear-gradient(135deg, #0EA5E9, #6366F1)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #10B981, #3B82F6)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
  ];

  const handleRemoveMember = async (memberId, memberName) => {
    const confirm = window.confirm(`Remove ${memberName} from group?`);
    if (!confirm) return;
    try {
      const res = await api.post('/rooms/remove-member', {
        roomId: room._id,
        userId: memberId
      });
      onMemberRemoved(res.data.room);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove member');
    }
  };

  const handleDeleteGroup = async () => {
    const confirm = window.confirm(`Delete "${room.name}"? This cannot be undone!`);
    if (!confirm) return;
    try {
      await api.delete(`/rooms/${room._id}`);
      onDeleteGroup(room._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete group');
    }
  };

  return (
    <div className="w-72 bg-white border-l border-gray-100 flex flex-col h-full">

      {/* Header */}
      <div
        style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
        className="px-4 py-4 flex items-center justify-between"
      >
        <h3 className="text-white font-medium">Group Info</h3>
        <button
          onClick={onClose}
          className="text-white text-xl font-light"
        >
          ×
        </button>
      </div>

      {/* Group name + avatar */}
      <div className="flex flex-col items-center py-6 border-b border-gray-100">
        <div
          style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-medium mb-3"
        >
          {room.name?.charAt(0).toUpperCase()}
        </div>
        <p className="font-medium text-gray-800">{room.name}</p>
        <p className="text-xs text-gray-400 mt-1">{room.members?.length} members</p>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
          Members
        </p>
        {room.members?.map((member, index) => (
          <div
            key={member._id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <div
              style={{background: gradients[index % gradients.length]}}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
            >
              {member.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {member.username}
                {member._id === user?.id && (
                  <span className="text-xs text-purple-500 ml-1">(You)</span>
                )}
              </p>
              <p className="text-xs text-gray-400">{member.phone || ''}</p>
            </div>

            {/* Online dot */}
            {member.isOnline && (
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            )}

            {/* Remove button — only creator can see */}
            {isCreator && member._id !== user?.id && (
              <button
                onClick={() => handleRemoveMember(member._id, member.username)}
                className="text-red-400 text-xs hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Delete group button — only creator */}
      {isCreator && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleDeleteGroup}
            className="w-full py-2 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition"
          >
            🗑 Delete Group
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupInfo;