import Event, { IEvent } from '../models/event.model';
import { findUserById } from './users.service';
import { Server } from 'socket.io';
/**
 * create new Event
 * @param data
 */
export const newEvent = (data: IEvent) => {
  return new Event(data).save();
};

// TODO: Handle errors and bad bad things...
export function sendEventToUser(userID: string, eventType: string, payload: any, store: any, io: Server, shouldSendEvent: boolean = true, event?: IEvent): void {
  findUserById(userID)
  .then(u => {
    if (u) {
      store.get(u.Session, (err: any, sess: any) => {
        if (sess) {

          io.to(sess.socketID).emit(eventType, payload);

          if(shouldSendEvent){
            io.to(sess.socketID).emit('new_event', event);
          }
        }
      });
    }
  })
  .catch(err => {
    throw err;
  });
};