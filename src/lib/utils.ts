export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'todo': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'testing': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'closed': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    case 'open': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'active': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    case 'away': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'Connected': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'Install': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'low': return 'bg-green-500/10 text-green-400 border-green-500/30';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'text-red-400';
    case 'high': return 'text-orange-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-gray-400';
  }
}

export function getPriorityBg(priority: string): string {
  switch (priority) {
    case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'low': return 'bg-green-500/10 text-green-400 border-green-500/30';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
