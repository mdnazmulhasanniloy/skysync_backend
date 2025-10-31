import { tryCatch } from 'bullmq';
import callbackFn from '../../utils/callbackFn';
import { IUser } from '../../modules/user/user.interface';
import Message from '../../modules/messages/messages.models';
import { Types } from 'mongoose';
import Chat from '../../modules/chat/chat.models';
import { IChat } from '../../modules/chat/chat.interface';
import getChatList from './chatList.handlers';
import { deflate } from 'zlib';
import { pubClient } from '../../redis';

const SeenMessageHandlers = async (
  io: any,
  chatId: string,
  user: any,
  callback: any,
) => {
  if (!chatId) {
    return callbackFn(callback, {
      success: false,
      message: 'chatId id is required',
    });
  }

  try {
    const chat: IChat | null = await Chat.findById(chatId);
    if (!chat) {
      return callbackFn(callback, {
        success: false,
        message: 'chat not found',
      });
    }

    await Message.updateMany(
      {
        chat: new Types.ObjectId(chatId),
        receiver: new Types.ObjectId(user?.userId),
        seen: false,
      },
      { seen: true },
    );
    try {
      // single dnd cache delete
      await pubClient.del('chat_list:' + user?.userId?.toString());

      // dnd list cache clear
      const keys = await pubClient.keys('chat_list:*');
      if (keys.length > 0) {
        await pubClient.del(keys);
      }
    } catch (err) {
      console.error('Redis seen message chat list:', err);
    }

    const user1 = chat.participants[0]?.toString();
    const user2 = chat.participants[1]?.toString();
    getChatList(io, { userId: user1 }, callback);
    getChatList(io, { userId: user2 }, callback);
  } catch (error: any) { 

    return callbackFn(callback, {
      success: false,
      message: error?.message || 'seen message failed',
    });
  }
};

export default SeenMessageHandlers;
