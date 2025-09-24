import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

export interface Friend {
  _id: string;
  name: string;

}



interface FriendState {
  friends: Friend[];
  
  setFriends: (friends: Friend[]) => void;
 
  addFriend: (friend: Friend) => void;

  removeFriend: (friendId: string) => void;

  getFriends: () => Friend[];

}

type MyPersist = (
  config: (set: any, get: any, api: any) => FriendState,
  options: PersistOptions<FriendState>
) => (set: any, get: any, api: any) => FriendState;

export const useFriendStore = create<FriendState>(
  (persist as MyPersist)(
    (set, get) => ({
      friends: [],
      
      setFriends: (friends) => set({ friends }),
  
      addFriend: (friend) => set((state: FriendState) => ({ friends: [...state.friends, friend] })),
   
      removeFriend: (friendId) => set((state: FriendState) => ({ friends: state.friends.filter(f => f._id !== friendId) })),
  
      getFriends: () => get().friends,

    }),
    {
      name: 'friend-room-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
