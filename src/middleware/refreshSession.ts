import { store } from '../server';
import { findUserById } from '../services/users.service';
import { RequestHandler, Response, NextFunction, Request } from 'express';
import { RequestWithSession } from '../utils/interfaces';
import { ParamsDictionary } from 'express-serve-static-core';

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
export const refreshSession = async (
  req: RequestWithSession,
  res: Response,
  next: NextFunction
) => {
  if (req.body) {
    const { userID, sessionID } = req.body;

    console.log('Req, body =>', req.body);

    findUserById(userID)
      .then(user => {
        if (user!.Session) {
          user!.findSession(user!.Session, function(
            err: any,
            sess: Express.SessionData
          ) {
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

              req.session!.save((err: any) => {
                if (err) {
                  return res.status(400).send(
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

                  return res.status(200).send(
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

          return req.session!.save((err: any) => {
            if (err) {
              return res.status(400).send(
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

              return res.status(200).send(
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
