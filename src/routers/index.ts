import express from 'express';
import User, { IUser, IUserDocument } from '../models/user.model';
import { store } from '../server';
// import bcrypt from 'bcryptjs';

const router = express.Router();

// TODO: Rewrite these you may not need them at all...

router.get('/logout', (req, res) => {
  if (req.sessionID) {
    // store.destroy(req.sessionID, err => {
    //   if (!err) {
    //     res.status(200).send(
    //       JSON.stringify({
    //         error: false,
    //         message: 'User logged out successfully',
    //       })
    //     );
    //   }
    // });

    // req.se
    req.session!.destroy(err => {
      if (!err) {
        res.status(200).clearCookie('sharing.sid');
      }
    });
  } else {
    res.status(404).send('User not found!');
  }
});

// Check cookie bro

// First check if the user sent something a cookie,
// If client has no cookie check for the user, if user exists find it and
// create a new session using the current data, then update user document...
// send the new user object to the client so they can update their localStorage...
// If the client does... just send back their old object

router.post('/check-cookie', (req, res) => {
  // If Session is there!

  console.log('Body => ', req.body);

  // const payload = JSON.parse(req.body);

  // If the session exists do this =>

  if (req.session!.socketID) {
    const sessionID = req.sessionID as string;
    console.log('Session =>', req.session);

    // TODO: Find a way to track user
    // events and notifications.

    store.get(sessionID, (err: any, session: any) => {
      if (!err) {
        if (session) {
          res.status(200).send(
            JSON.stringify({
              erorr: false,
              message: 'Client is authenticated',
              sessionExists: true,
              user: { userID: req.session!.userID, sessionID },
            })
          );
        } else {
          console.log('The session is expired tho!');
          res.status(404).send(
            JSON.stringify({
              error: false,
              message: 'Session is expired!',
              sessionExists: false,
            })
          );
        }
      } else {
        console.log("There's an error tho");
        res
          .status(400)
          .send(
            JSON.stringify({ error: true, message: 'Error!', error_obect: err })
          );
      }
    });
  } else if (req.body.userID) {
    console.log('Session =>', req.session);
    console.log('Null session');
    const sessionID = req.body.session;
    const userID = req.body.userID;

    User.findById(userID)
      .then(user => {
        if (user!.Session) {
          user!.findSession(sessionID, function(err: any, sess: any) {
            if (sess) {
              // If you find the session it means it's an old one so do this...
              // set a new one, create a new cookie and send session data to client
              store.set(sessionID, sess, (err: any) => {
                if (err) {
                  console.log('Error in setting session =>', err);
                  res.status(400).send(
                    JSON.stringify({
                      error: true,
                      message: 'Error in setting session :(',
                    })
                  );
                } else {
                  console.log('Session set o', sess);

                  store.createSession(req, sess);

                  console.log('Created Session object =>', sess);

                  user!.Session = sess._id;

                  user!.save();

                  res.status(200).send(
                    JSON.stringify({
                      erorr: false,
                      message: 'Client is authenticated',
                      sessionExists: true,
                      user: { userID: user!._id, sessionID: sess._id },
                    })
                  );
                }
              });
            } else {
              // SESSION DOES NOT EXIST!
              console.log('Session does not exist!');

              // So make new session for user...
            }
          });
        }
      })
      .catch(err => {
        console.log('User does not exist tho!');

        res.status(404).send(
          JSON.stringify({
            error: true,
            message: 'User does not exist',
          })
        );

        // So save new user...
      });

    // Find the user
    // store.get(sessionID, (err: any, sess: any) => {
    //   if (sess) {
    //     console.log('Session found! and set => ', sessionID);
    //     store.set(id, sess, (err: any) => {
    //       if (err) {
    //         console.log('Error in setting session =>', err);
    //         res.status(400).send(
    //           JSON.stringify({
    //             error: true,
    //             message: 'Error in setting session :(',
    //           })
    //         );
    //       } else {
    //         console.log('Session set o');

    //         store.createSession(req, sess);

    //         res.status(200).send(
    //           JSON.stringify({
    //             error: false,
    //             session: req.body.session,
    //             sessionExists: true,
    //           })
    //         );
    //       }
    //     });
    //   } else {
    //     console.log('Session not found :( =>', id);
    //     req.session!.popo = 'No.';

    //     req.session!.save(err => {
    //       // Create new session
    //       if (err) {
    //         res.status(400).send(
    //           JSON.stringify({
    //             error: true,
    //             message: 'Error in authenticating user',
    //             errorMessage: err,
    //           })
    //         );
    //         throw err;
    //       } else {
    //         res.status(200).send(
    //           JSON.stringify({
    //             erorr: false,
    //             message: 'Cookie is cool :)',
    //             session: req.sessionID,
    //             sessionExists: true,
    //           })
    //         );
    //       }
    //     });
    //   }
    // });
    // store.set(req.body.session, session, (err: any) => {
    //   throw err;
    // });
  } else {
    // Here the user is most likely a new one or a new device so
    // create a new User document!

    // tslint:disable-next-line: no-shadowed-variable

    const USER = new User();

    // USER.Session = req.sessionID as string;
    console.log('Saved Session => ', req.sessionID);

    USER.save()
      .then(u => {
        req.session!.popo = 'No.';
        req.session!.userID = u._id;

        req.session!.save(err => {
          if (err) {
            res.status(400).send(
              JSON.stringify({
                error: true,
                message: 'Error in authenticating user',
                errorMessage: err,
              })
            );
            throw err;
          } else {
            // User has been crreated

            console.log('Created session => ', req.sessionID);

            u.Session = req.sessionID as string;
            u.save();

            res.status(200).send(
              JSON.stringify({
                erorr: false,
                message: 'Client is authenticated',
                sessionExists: true,
                user: { userID: u._id, sessionID: req.sessionID },
              })
            );
          }
        });
      })
      .catch(err => {
        // Here there is an error is saving the user
        console.log('Error in creating user', err);
      });
  }
});

// TODO: Turn this to middleware please?

export default router;
