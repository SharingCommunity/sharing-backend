import { Router, Response, NextFunction } from 'express';
import { checkSession, refreshSession, createNewUser } from '../middleware';
import { Request, RequestHandler } from 'express-serve-static-core';
// import bcrypt from 'bcryptjs';

const router = Router();

// TODO: Rewrite these you may not need them at all...

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
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
    req.session!.destroy((err: any) => {
      if (!err) {
        res.status(200).clearCookie('sharing.sid');
      }
    });
  } else {
    res.status(404).send('User not found!');
  }
});

router.post('/check-cookie', checkSession, refreshSession as RequestHandler, createNewUser);

// Check cookie bro

// First check if the user sent something a cookie,
// If client has no cookie check for the user, if user exists find it and
// create a new session using the current data, then update user document...
// send the new user object to the client so they can update their localStorage...
// If the client does... just send back their old object

// TODO: Turn this to middleware please?

export default router;
