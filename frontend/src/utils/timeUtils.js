export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return '';

  const now = new Date();
  const last = new Date(lastSeen);
  const diffMs = now - last;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Last seen just now';
  if (diffMins < 60) return `Last seen ${diffMins} min ago`;
  if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Last seen yesterday';
  return `Last seen ${diffDays} days ago`;
};
