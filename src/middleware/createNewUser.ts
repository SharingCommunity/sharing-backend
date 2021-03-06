import { RequestHandler, Response } from 'express';
import { newUser } from '../services/users.service';
import { RequestWithSession } from '../utils/interfaces';
import { Request } from 'express-serve-static-core';

/**
 * createNewUser
 *
 * - Create a new user if the client is not recognized
 * @param req
 * @param res
 */
export const createNewUser = async (req: Request, res: Response) => {
  // Here the user is most likely a new one or a new device so
  // create a new User document!

  const USER = newUser();

  // USER.Session = req.sessionID as string;

  USER.save()
    .then(u => {
      // req.session!.popo = 'No.';
      req.session!.userID = u._id;

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
          // User has been crreated

          console.log('Created saved session => ', req.sessionID);

          u.Session = req.sessionID as string;
          u.save();

          return res.status(200).send(
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

      return res.status(400).send(
        JSON.stringify({
          error: true,
          message: 'Error in authenticating user',
          errorMessage: err,
        })
      );
    });
};
