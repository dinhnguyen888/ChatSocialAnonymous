import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

export interface Member {
  name: string;
  _id: string;
}





export interface Room {
  id: string;
  name: string;
  avatar: string;

}


interface RoomState {
  friendRooms: Room[];
  chatRooms: Room[];
  members: Member[];
  setMembers: (members: Member[] | ((prevMembers: Member[]) => Member[])) => void;

  setChatRooms: (chatRooms: Room[]) => void;
  setFriendRooms: (friendRooms: Room[]) => void;
  addChatRoom: (chatRoom: Room) => void;
  addFriendRoom: (friendRoom: Room) => void;
  removeChatRoom: (roomId: string) => void;
  removeFriendRoom: (roomId: string) => void;
  getChatRooms: () => Room;
  getFriendRooms: () => Room;
}

type MyPersist = (
  config: (set: any, get: any, api: any) => RoomState,
  options: PersistOptions<RoomState>
) => (set: any, get: any, api: any) => RoomState;

export const useRoomStore = create<RoomState>(
  (persist as MyPersist)(
    (set, get) => ({
      friendRooms: [],
      chatRooms: [],
      members: [],
      setMembers: (members) => set((state: RoomState) => ({
        members: typeof members === 'function' ? members(state.members) : members
      })),
      
      setChatRooms: (chatRooms) => set({ chatRooms }),
      setFriendRooms: (friendRooms) => set({ friendRooms }),
      addChatRoom: (chatRoom) => set((state: RoomState) => ({ chatRooms: [...state.chatRooms, chatRoom] })),
      addFriendRoom: (friendRoom) => set((state: RoomState) => ({ friendRooms: [...state.friendRooms, friendRoom] })),
      removeChatRoom: (roomId) => set((state: RoomState) => ({ chatRooms: state.chatRooms.filter(r => r.id !== roomId) })),
      removeFriendRoom: (roomId) => set((state: RoomState) => ({ friendRooms: state.friendRooms.filter(r => r.id !== roomId) })),
      getChatRooms: () => get().chatRooms,
      getFriendRooms: () => get().friendRooms,
    }),
    {
      name: 'room-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
