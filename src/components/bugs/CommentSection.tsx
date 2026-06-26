import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Trash2, AtSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatTimeAgo } from '../../lib/utils';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface CommentSectionProps {
  bugId: string;
}

const mentionableUsers = ['Alex C.', 'Sarah K.', 'Marcus J.', 'Emily R.', 'David W.', 'Lisa P.'];

export function CommentSection({ bugId }: CommentSectionProps) {
  const { comments, addComment, deleteComment } = useData();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const bugComments = comments.filter(c => c.bugId === bugId);

  const handleInputChange = (value: string) => {
    setContent(value);
    const lastAt = value.lastIndexOf('@');
    if (lastAt !== -1) {
      const search = value.slice(lastAt + 1).split(' ')[0];
      setMentionSearch(search);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const lastAt = content.lastIndexOf('@');
    const before = content.slice(0, lastAt);
    const after = content.slice(lastAt).split(' ').slice(1).join(' ');
    setContent(`${before}@${name} ${after}`);
    setShowMentions(false);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    const mentions = mentionableUsers.filter(u => content.includes(`@${u}`));
    addComment(bugId, user?.name || 'You', content.trim(), mentions);
    setContent('');
  };

  const filteredMentions = mentionableUsers.filter(u =>
    u.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
        <MessageSquare className="h-4 w-4" /> Comments ({bugComments.length})
      </h3>

      <div className="space-y-3">
        {bugComments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold">
                  {comment.author.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">{comment.author}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{formatTimeAgo(comment.createdAt)}</span>
              </div>
              <button
                onClick={() => deleteComment(comment.id)}
                className="p-1 rounded hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {renderContent(comment.content, comment.mentions)}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              value={content}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Write a comment... Use @ to mention someone"
              rows={2}
              className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            />
            <button
              onClick={() => setShowMentions(!showMentions)}
              className="absolute right-2 bottom-2 p-1 rounded hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-blue-400 transition-colors"
            >
              <AtSign className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" onClick={handleSubmit} disabled={!content.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <AnimatePresence>
          {showMentions && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-full left-0 mb-1 w-48 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-xl z-10 py-1"
            >
              {filteredMentions.map(name => (
                <button
                  key={name}
                  onClick={() => insertMention(name)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D] transition-colors"
                >
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[7px] font-bold">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function renderContent(content: string, mentions: string[]) {
  const parts = content.split(/(@\w+[\s\w.]*)/g);
  return parts.map((part, i) => {
    const matched = mentions.find(m => part.includes(`@${m}`));
    if (matched) {
      return <span key={i} className="text-blue-400 font-medium">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}
