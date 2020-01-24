import { RequestHandler, Response, NextFunction } from 'express';
import { RequestWithSession } from './interfaces';

const auth = (req: RequestWithSession, res: Response, next: NextFunction) => {
  if (req.session!.userID) {
    console.log('User authenticated!', req.sessionID);
    next();
  } else {
    console.log('User not authorized!');
    res.status(401).send(
      JSON.stringify({
        error: true,
        message: 'Authentication required!',
        errorMessage: '',
      })
    );
    // next();
  }
};

export { auth };
