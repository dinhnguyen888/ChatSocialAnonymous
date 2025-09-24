import socket from './socket';
import { useRoomStore, Room } from '../stores/roomStore';
import { useFriendStore, Friend } from '../stores/friendStore';
import { useMessage } from '../stores/messageStore';

// Register global socket listeners that update stores.
// This file should be imported once at app startup (e.g., in index.tsx)

let initialized = false;

export function initSocketListeners() {
  if (initialized) return;
  initialized = true;

  const roomStore = useRoomStore.getState();
  const friendStore = useFriendStore.getState();
  const messageStore = useMessage.getState();

  // Rooms
  socket.on('roomCreated', (room: { _id: string; roomName: string }) => {
    roomStore.addChatRoom({ id: room._id, name: room.roomName, avatar: '/default-avatar.jpg' });
  });

  socket.on('roomDeleted', (room: { _id: string; roomName: string }) => {
    roomStore.removeChatRoom(room._id);
  });

  socket.on('roomNameChanged', (room: { _id: string; roomName: string }) => {
    const currentRooms: Room[] = (roomStore as any).chatRooms || [];
    const updated = currentRooms.map((r: Room) => r.id === room._id ? { ...r, name: room.roomName } : r);
    roomStore.setChatRooms(updated);
  });

  // Friends
  socket.on('friendAdded', ({ owner, friend }: { owner: { _id: string; name: string }, friend: { _id: string; name: string } }) => {
    // Add both sides safely if not present
    const current = friendStore.getFriends();
    const toAdd = [owner, friend].filter(Boolean).map(u => ({ _id: u._id, name: u.name }));
    toAdd.forEach(f => {
      if (!current.find((x: Friend) => x._id === f._id)) {
        friendStore.addFriend(f);
      }
    });
  });

  socket.on('friendDeleted', ({ owner, friend }: { owner: { _id: string; name: string }, friend: { _id: string; name: string } }) => {
    if (owner?._id) friendStore.removeFriend(owner._id);
    if (friend?._id) friendStore.removeFriend(friend._id);
  });

  // Messages (these also handled in components, but safe to keep listeners idempotent)
  socket.on('receiveMessage', (messages: any[]) => {
    messageStore.setMessage(messages);
  });

  socket.on('deletedMessage', (messageId: string) => {
    messageStore.deleteMessage(messageId);
  });
}

// Auto-init if imported directly
initSocketListeners();
