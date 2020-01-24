import { store } from '../server';
import { RequestHandler, Response, NextFunction } from 'express';
import { RequestWithSession } from '../utils/interfaces';
import { Request } from 'express-serve-static-core';

/**
 * checkSession
 *
 * Check if session exists...
 *
 * @param req
 * @param res
 * @param next
 */
export const checkSession: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session!.socketID) {
    const sessionID = req.sessionID as string;

    store.get(sessionID, (err: any, session: any) => {
      if (session) {
        return res.status(200).send(
          JSON.stringify({
            erorr: false,
            message: 'Client is authenticated',
            sessionExists: true,
            user: { userID: req.session!.userID, sessionID },
          })
        );
      } else {
        //  if session is expired or something, go to the next middleware...
        //  the next one checks if the client sent any session object

        return next();
      }
    });
  } else {
    //   If the request does not have any session object attached move to next middleware...
    return next();
  }
};
