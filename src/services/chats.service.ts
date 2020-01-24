import Chat from '../models/chat.model';

/**
 * create new Chat object
 * @param data
 */
export const newChat = (data: any) => {
  return new Chat(data);
};
