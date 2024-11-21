import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import EmailVerification from '@/components/EmailVerification';
import ChatMessage from '@/components/ChatMessage';
import ChatUserList from '@/components/ChatUserList';
import ChatInput from '@/components/ChatInput';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
}

export default function Chat() {
  const { currentUser } = useAuth()!;
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!currentUser?.emailVerified) return;

    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '!=', currentUser?.email));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersList);
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUser || !currentUser?.emailVerified) return;

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUser?.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          (data.senderId === currentUser?.uid && data.receiverId === selectedUser.id) ||
          (data.senderId === selectedUser.id && data.receiverId === currentUser?.uid)
        ) {
          messages.push({ id: doc.id, ...data } as Message);
        }
      });
      setMessages(messages);
    });

    return unsubscribe;
  }, [selectedUser, currentUser]);

  const sendMessage = async (text: string) => {
    if (!selectedUser || !currentUser?.emailVerified) return;

    await addDoc(collection(db, 'messages'), {
      text,
      senderId: currentUser?.uid,
      receiverId: selectedUser.id,
      timestamp: serverTimestamp(),
      participants: [currentUser?.uid, selectedUser.id],
    });
  };

  if (!currentUser?.emailVerified) {
    return <EmailVerification />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <ChatUserList
        users={users}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {selectedUser.displayName?.[0] ||
                      selectedUser.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedUser.displayName || selectedUser.email}
                  </h2>
                  {selectedUser.displayName && (
                    <p className="text-sm text-gray-400">{selectedUser.email}</p>
                  )}
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isCurrentUser={message.senderId === currentUser?.uid}
                  />
                ))}
              </div>
            </ScrollArea>
            <ChatInput onSendMessage={sendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}