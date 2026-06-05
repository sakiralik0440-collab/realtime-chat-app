import { useState } from 'react';
import api from '../utils/api';
import SearchUser from './SearchUser';

const Sidebar = ({ contacts, groups, activeRoom, onRoomSelect, onNewChat, onCreateGroup }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const gradients = [
    'linear-gradient(135deg, #4F46E5, #7C3AED)',
    'linear-gradient(135deg, #0EA5E9, #6366F1)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #10B981, #3B82F6)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
  ];

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/rooms/create-group', {
        name: groupName,
        members: []
      });
      onCreateGroup(res.data.room);
      setGroupName('');
      setShowGroupForm(false);
    } catch (err) {
      console.log('Error creating group:', err);
    } finally {
      setCreating(false);
    }
  };

  const renderList = (list) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">Nothing here yet</p>
        </div>
      );
    }
    return list.map((item, index) => (
      <div
        key={item._id}
        onClick={() => onRoomSelect(item)}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
          activeRoom?._id === item._id
            ? 'bg-purple-50 border-r-2 border-purple-600'
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="relative">
          <div
            style={{background: gradients[index % gradients.length]}}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
          >
            {item.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col items-end gap-1">
  {item.isOnline ? (
    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
  ) : (
    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
  )}
</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
          <p className="text-xs text-gray-400 truncate">
            {item.phone || (item.isGroup ? `${item.members?.length} members` : '')}
          </p>
        </div>
      </div>
    ));
  };

  return (
    <div className="w-72 flex flex-col bg-white border-r border-gray-100 h-full">

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {['chats', 'groups', 'new'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-medium capitalize transition ${
              activeTab === tab
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'new' ? '+ New' : tab}
          </button>
        ))}
      </div>

      {/* Chats tab */}
      {activeTab === 'chats' && (
        <div className="flex-1 overflow-y-auto">
          {renderList(contacts)}
        </div>
      )}

      {/* Groups tab */}
      {activeTab === 'groups' && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => setShowGroupForm(!showGroupForm)}
              style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
              className="w-full text-white text-sm py-2 rounded-xl"
            >
              {showGroupForm ? 'Cancel' : '+ Create Group'}
            </button>
            {showGroupForm && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                  placeholder="Group name..."
                  className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm outline-none"
                />
                <button
                  onClick={handleCreateGroup}
                  disabled={creating}
                  style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                  className="px-3 py-1.5 rounded-full text-white text-xs disabled:opacity-50"
                >
                  {creating ? '...' : 'Add'}
                </button>
              </div>
            )}
          </div>
          {renderList(groups)}
        </div>
      )}

      {/* New chat tab */}
      {activeTab === 'new' && (
        <div className="flex-1 overflow-y-auto">
          <SearchUser onStartChat={(room) => {
            onNewChat(room);
            setActiveTab('chats');
          }} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;