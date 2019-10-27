import { RequestHandler } from 'express';
import { newUser } from '@/services/users.service';

/**
 * createNewUser
 *
 * - Create a new user if the client is not recognized
 * @param req
 * @param res
 */
export const createNewUser: RequestHandler = async (req, res) => {
  // Here the user is most likely a new one or a new device so
  // create a new User document!

  const USER = newUser();

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

      res.status(400).send(
        JSON.stringify({
          error: true,
          message: 'Error in authenticating user',
          errorMessage: err,
        })
      );
    });
};
