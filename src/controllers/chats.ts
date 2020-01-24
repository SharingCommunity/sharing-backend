import { Router } from 'express';
import { Socket } from 'socket.io';
import { findUserById } from '../services/users.service';
import { store, io } from '../server';
import { newChat } from '../services/chats.service';
const router = Router();

const listener = function(socket: Socket) {
  // console.log("Connection from chat?"+socket.id);
  socket.on('chat', function(chat: any) {
    // TODO: inform particpants of new chat
    // Send a notification to other participant when there's a new chat
    // message

    // Use io.emit('message' , 'message text') to send to all clients including sender

    console.log('Chat!', chat);

    const CHAT = newChat(chat);

    // Save...
    CHAT.save((err: any, c: any) => {
      if (err) {
        console.log('Error saving chat => ', err);
        socket.emit('ERROR', { error: true, message: 'Error Saving Chat' });
      } else {
        console.log('New Chat => ', c);

        // Send the chat back to the Client after saving in the DB
        // socket.emit('chat', c);

        // Only send 'new chat' message to all participants.

        // 1. Find the user,
        // 2. Get the associated Session,
        // 3. Get the associated SocketID,
        // 4. Send message to that client...
        // 5. repeat for the other participant(s).
        // 6. END

        CHAT.participants.forEach((u: any) => {
          findUserById(u)
            .then(u => {
              if (u) {
                store.get(u.Session, (err: any, sess: any) => {
                  if (sess) {
                    // socket.broadcast
                    //   .to(sess.socketID)
                    //   .emit('post_updated', doc);
                    io.to(sess.socketID).emit('chat', c);
                  }
                });
              }
              // socket.broadcast.to(socketID).emit('post_updated', doc);
            })
            .catch(err => {
              throw err;
            });
        });

        // To send the participant(s) a notification just...
        // filter the sender's user id and then just send the message straight...

        // findUserById(CHAT.to).then(socketID => {
        //   socket.broadcast.to(socketID).emit('new_message', c);
        // });
      }
    });
  });
};

export { listener, router };
