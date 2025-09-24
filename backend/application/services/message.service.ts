import Message from '../../domain/models/message.entity';

export const MessageService = {
  async addMessage(message: any) {
    const existingRoom = await Message.findOne({ roomId: message.roomId });
    if (existingRoom) {
      existingRoom.message.push({
        senderName: message.senderName,
        senderId: message.senderId,
        content: message.content,
        timestamp: new Date(),
      });
      await existingRoom.save();
      return existingRoom.message;
    } else {
      const newMessage = new Message({
        roomId: message.roomId,
        message: [{
          senderName: message.senderName,
          senderId: message.senderId,
          content: message.content,
          timestamp: new Date(),
        }],
      });
      await newMessage.save();
      return newMessage.message;
    }
  },

  async readMessage(roomId: string) {
    const messages = await Message.findOne({ roomId }).exec();
    return messages?.message ?? [];
  },

  async deleteMessage(roomId: string, messageId: string) {
    const messageDoc = await Message.findOne({ roomId });
    if (!messageDoc) return { ok: false, error: 'Room not found' } as const;
    const idx = messageDoc.message.findIndex((msg) => (msg._id as any)?.toString() === messageId);
    if (idx === -1) return { ok: false, error: 'Message not found' } as const;
    messageDoc.message.splice(idx, 1);
    await messageDoc.save();
    return { ok: true } as const;
  },
};


