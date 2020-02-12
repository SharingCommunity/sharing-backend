import { Router } from 'express';
import { Socket } from 'socket.io';
import { findUserById, addUserEvent } from '../services/users.service';
import { store, io } from '../server';
import { newChat } from '../services/chats.service';
import logger from '../utils/logger';
import { IEvent } from '../models/event.model';
import { sendEventToUser } from '../services/events.service';
const router = Router();

const listener = function(socket: Socket) {
  socket.on('chat', function(chat: any) {
    const CHAT = newChat(chat);

    CHAT.save((err: any, c: any) => {
      if (err) {
        console.log('Error saving chat => ', err);
        socket.emit('error', { error: true, message: 'Error Saving Chat' });
      } else {

        // Send new chat back to sender...
                // Send an chat message to the participants
        CHAT.participants.forEach((u: string) => {
            sendEventToUser(u, 'new_chat', c, store, io, false);
        });

        // Send this new message event to the reciepient!
        const toWho = CHAT.participants.find((u: string) => {
            u == c!.from
        });

          const event: IEvent = {
            error: false,
            type: 'message',
            prompt: 'New Message',
            post: c!.post,
            user: toWho,
            time: new Date(),
            message: 'You have a new message!',
            seen: false,
          };

          addUserEvent(toWho, event)
            .then(() => {
              logger.info('Event added successfully!');

              try {
                sendEventToUser(toWho, 'new_event', event, store, io, false);
                logger.info('Event sent successfully!');
              } catch (error) {
                console.log('Error sending event!');
              }
            })
            .catch((err: any) => {
              logger.error('Error in adding event ' + err);
              throw err;
            });
      }
    });
  });
};

export { listener, router };
