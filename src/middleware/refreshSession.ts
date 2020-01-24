import { store } from '../server';
import { findUserById } from '../services/users.service';
import { RequestHandler } from 'express';

/**
 * refreshSession
 *
 * - Check if client sent a session object along :)
 * if so, just refresh the session with the same data
 * if not move to the next middleware :)
 *
 * @param req
 * @param res
 * @param next
 */
export const refreshSession: RequestHandler = async (req, res, next) => {
  if (req.body.session) {
    const { userID, session: sessionID } = req.body;

    findUserById(userID)
      .then(user => {
        if (user!.Session) {
          user!.findSession(sessionID, function(err: any, sess: any) {
            if (sess) {
              // If you find the session it means it's an old one so do this...
              // set a new one, create a new cookie and send session data to client
              store.set(sessionID, sess, (err: any) => {
                if (err) {
                  console.log('Error in setting session =>', err);
                  //   Maybe here tell user to refresh and try again later...
                  return res.status(400).send(
                    JSON.stringify({
                      error: true,
                      message: 'Error in setting session :(',
                    })
                  );
                } else {
                  store.createSession(req, sess);

                  user!.Session = sess._id;

                  user!.save();

                  return res.status(200).send(
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
              // User exists but does not have any associated sessions...
              req.session!.popo = 'No.';
              req.session!.userID = user!._id;

              req.session!.save(err => {
                if (err) {
                  res.status(400).send(
                    JSON.stringify({
                      error: true,
                      message: 'Error in authenticating user',
                      errorMessage: err,
                    })
                  );
                } else {
                  console.log('Created session => ', req.sessionID);

                  user!.Session = req.sessionID as string;
                  user!.save();

                  res.status(200).send(
                    JSON.stringify({
                      erorr: false,
                      message: 'Client is authenticated',
                      sessionExists: true,
                      user: { userID: user!._id, sessionID: req.sessionID },
                    })
                  );
                }
              });
            }
          });
        } else {
          // User exists but does not have any associated sessions...
          req.session!.popo = 'No.';
          req.session!.userID = user!._id;

          req.session!.save(err => {
            if (err) {
              res.status(400).send(
                JSON.stringify({
                  error: true,
                  message: 'Error in authenticating user',
                  errorMessage: err,
                })
              );
            } else {
              console.log('Created session => ', req.sessionID);

              user!.Session = req.sessionID as string;
              user!.save();

              res.status(200).send(
                JSON.stringify({
                  erorr: false,
                  message: 'Client is authenticated',
                  sessionExists: true,
                  user: { userID: user!._id, sessionID: req.sessionID },
                })
              );
            }
          });
        }
      })
      .catch(err => {
        return next();
        // So save new user...
      });
  } else {
    return next();
  }
};
