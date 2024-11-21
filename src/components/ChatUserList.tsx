import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface ChatUserListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

export default function ChatUserList({
  users,
  selectedUser,
  onSelectUser,
}: ChatUserListProps) {
  const navigate = useNavigate();
  const { signout } = useAuth()!;

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="w-80 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Chats</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        {users.map((user) => (
          <div
            key={user.id}
            className={cn(
              'p-4 cursor-pointer hover:bg-gray-800 transition-colors',
              selectedUser?.id === user.id ? 'bg-gray-800' : ''
            )}
            onClick={() => onSelectUser(user)}
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {user.displayName?.[0] || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">
                  {user.displayName || user.email}
                </p>
                {user.displayName && (
                  <p className="text-xs text-gray-400">{user.email}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}