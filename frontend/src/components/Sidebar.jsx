import React, { useState } from 'react'

const Sidebar = () => {
   const [newRoomName , setNewRoomName] = useState('');
   const [creating, setCreating] = useState(false);
   const [showInput, setShowInput] = useState(false);

   const handleCreateRoom = async () =>{
    if (!newRoomName.trim()) return;
    setCreating(true);
    try{
        const res = await api.post('/rooms/create',{
            name: newRoomName,
            members:[],
            isGroup:true
        });
        onRoomCreate(res.data.room);
        setNewRoomName('');
        setShowInput(false);

    }catch (err){
        console.log('Error creating room',err);
    }finally{
        setCreating(false);
    }
   };

   const getInitial = (name) => name?.charAt(0).toUpperCase();

   const gradients = [
    'linear-gradient(135deg, #4F46E5, #7C3AED)',
    'linear-gradient(135deg, #0EA5E9, #6366F1)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #10B981, #3B82F6)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
   ];

  return (
  <div className="w-72 flex flex-col bg-white border-r border-gray-100 h-full">

      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Chats
          </p>
          <button
            onClick={() => setShowInput(!showInput)}
            style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-light"
          >
            {showInput ? '×' : '+'}
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search rooms..."
            className="bg-transparent text-sm text-gray-700 outline-none w-full"
          />
        </div>

        {/* Create room input */}
        {showInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              placeholder="Room name..."
              className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              onClick={handleCreateRoom}
              disabled={creating}
              style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
              className="px-3 py-1.5 rounded-full text-white text-xs font-medium disabled:opacity-50"
            >
              {creating ? '...' : 'Add'}
            </button>
          </div>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto py-2">
        {rooms.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No rooms yet</p>
            <p className="text-gray-300 text-xs mt-1">Create one above!</p>
          </div>
        ) : (
          rooms.map((room, index) => (
            <div
              key={room._id}
              onClick={() => onRoomSelect(room)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                activeRoom?._id === room._id
                  ? 'bg-purple-50 border-r-2 border-purple-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Room avatar */}
              <div
                style={{background: gradients[index % gradients.length]}}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
              >
                {getInitial(room.name)}
              </div>

              {/* Room info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {room.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {room.lastMessage ? 'Last message sent' : 'No messages yet'}
                </p>
              </div>

              {/* Online dot */}
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar