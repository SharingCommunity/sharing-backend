import { RequestHandler } from 'express';

const auth: RequestHandler = (req, res, next) => {
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
