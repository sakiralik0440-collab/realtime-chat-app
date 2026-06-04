import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ message }) => {
  const { user } = useAuth();

  const isMyMessage = message.sender._id === user?.id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>

        {/* Sender name */}
        {!isMyMessage && (
          <span className="text-xs text-gray-400 mb-1 ml-2">
            {message.sender.username}
          </span>
        )}

        {/* Bubble */}
        <div
          style={isMyMessage ? {background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'} : {}}
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
            isMyMessage
              ? 'text-white rounded-br-sm shadow-md'
              : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
          }`}
        >
          {message.content}
        </div>

        {/* Time */}
        <span className="text-xs text-gray-400 mt-1 mx-2">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;