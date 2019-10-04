import express from 'express';
import User, { IUser, IUserDocument } from '../models/user.model';
import { store } from '../server';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/join', (req, res) => {
  // Destructuring user data...
  const { FirstName, LastName, Password, Email } = req.body.data;

  const USER = new User({
    FirstName,
    LastName,
    Password,
    Email,
  });

  USER.save()
    .then(u => {
      req.session!.username = u.Username;
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
        }
      });
      res.status(200).send(
        JSON.stringify({
          error: false,
          user: u.Username,
          message: `${u.Username} created successfully!`,
          result: { SessionID: req.sessionID, userID: u._id },
        })
      );
    })
    .catch(err => {
      res.status(400).send(
        JSON.stringify({
          error: true,
          message: 'Error creating user',
          errorMessage: err,
        })
      );
      console.log('Error creating user => ', err);
    });
});

router.post('/login', (req, res) => {
  const credentials = req.body.data;

  User.findOne({ Email: credentials.Email }, (err, u) => {
    if (err) {
      res.send(err);
    }

    if (!u) {
      res.status(404).send(
        JSON.stringify({
          error: true,
          message: 'User does not exist',
          errorMessage: '',
        })
      );
    } else {
      u.comparePasswords(credentials.Password, function(
        error: any,
        isMatch: boolean
      ) {
        if (error) {
          res.status(400).send(
            JSON.stringify({
              error: true,
              message: 'Error in authenticating user',
              errorMessage: err,
            })
          );
        }

        if (isMatch) {
          req.session!.username = u.Username;
          req.session!.userID = u._id;

          // tslint:disable-next-line: no-shadowed-variable
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
            }
          });

          const { Username, Posts, Connections, Email, PhoneNumber } = u;

          res.status(200).send(
            JSON.stringify({
              error: false,
              message: `Welcome back, ${u.Username}`,
              user: { Username, Posts, Connections, Email, PhoneNumber },
              result: { SessionID: req.sessionID, userID: u._id },
            })
          );
        } else {
          res.status(400).send(
            JSON.stringify({
              error: true,
              message: 'Password is incorrect',
              errorMessage: '',
            })
          );
        }
      });
    }
  });
});

// Logout...

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
router.post('/check-cookie', (req, res) => {
  // If Session is there!

  console.log('Body => ', req.body);

  // If the session exists do this =>

  if (req.session!.socketID) {
    const sessionID = req.sessionID as string;
    console.log('Session =>', req.session);

    store.get(sessionID, (err: any, session: any) => {
      if (!err) {
        if (session) {
          res.status(200).send(
            JSON.stringify({
              error: false,
              session: sessionID,
              sessionExists: true,
            })
          );
        } else {
          res.status(404).send(
            JSON.stringify({
              error: false,
              message: 'Session is expired!',
              sessionExists: false,
            })
          );
        }
      } else {
        res
          .status(400)
          .send(
            JSON.stringify({ error: true, message: 'Error!', error_obect: err })
          );
      }
    });
  } else if (req.body.session) {
    console.log('Session =>', req.session);
    const id = req.body.session;
    store.get(id, (err: any, sess: any) => {
      if (sess) {
        store.set(id, sess, (err: any) => {
          if (err) {
            res.status(400).send(
              JSON.stringify({
                error: true,
                message: 'Error in setting session :(',
              })
            );
          }
        });
        res.status(200).send(
          JSON.stringify({
            error: false,
            session: req.body.session,
            sessionExists: true,
          })
        );
      } else {
        req.session!.popo = 'No.';

        req.session!.save(err => {
          // Create new session
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
            res.status(200).send(
              JSON.stringify({
                erorr: false,
                message: 'Cookie is cool :)',
                session: req.sessionID,
                sessionExists: true,
              })
            );
          }
        });
      }
    });
    // store.set(req.body.session, session, (err: any) => {
    //   throw err;
    // });
  } else {
    // tslint:disable-next-line: no-shadowed-variable
    req.session!.popo = 'No.';

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
        res.status(200).send(
          JSON.stringify({
            erorr: false,
            message: 'Cookie is cool :)',
            session: req.sessionID,
            sessionExists: true,
          })
        );
      }
    });
  }
});

// TODO: Turn this to middleware please!!!

export default router;
