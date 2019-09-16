import express from 'express';

const auth: express.RequestHandler = (
  req: express.Request,
  res: express.Response,
  next
) => {
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
    // End the request :)
    res.end();
  }
};

export { auth };
