import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: {
    text: string;
    timestamp: Date;
    senderId: string;
  };
  isCurrentUser: boolean;
}

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  return (
    <div className={cn('flex', isCurrentUser ? 'justify-end' : 'justify-start')}>
      <Card
        className={cn(
          'max-w-[70%] p-3 shadow-md transition-all',
          isCurrentUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-white'
        )}
      >
        <p className="break-words">{message.text}</p>
        <p className={cn(
          'text-xs mt-1',
          isCurrentUser ? 'text-blue-100' : 'text-gray-400'
        )}>
          {format(message.timestamp, 'HH:mm')}
        </p>
      </Card>
    </div>
  );
}