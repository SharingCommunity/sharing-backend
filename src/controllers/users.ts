import express from 'express';
import User, { IUser, IUserDocument } from '../models/user.model';
import { store } from '../server';

const router = express.Router();

router.post('/join', async (req, res) => {
  // Destructuring user data...
  const { FirstName, LastName, Password, Email, PhoneNumber } = req.body.data;

  const USER = new User({
    FirstName,
    LastName,
    Password,
    Email,
    PhoneNumber,
  });

  await USER.save()
    .then(u => {
      req.session!.username = u.Username;
      req.session!.id = u._id;

      req.session!.save(err => {
        if (err) {
          throw err;
        }
      });
      res
        .status(200)
        .send({ error: false, message: `${u.Username} created successfully!` });
    })
    .catch(err => {
      res.status(400).send({
        error: true,
        message: 'Error creating user',
        errorObject: err,
      });
    });
});

router.post('/login', (req, res) => {
  const credentials = req.body.data;

  User.findOne({ Username: credentials.Username }, (err, u) => {
    if (err) {
      res.send(err);
    }

    if (!u) {
      res.status(404).send({ error: false, message: 'User does not exist' });
    } else {
      u.comparePasswords(credentials.Password, function(
        error: any,
        isMatch: boolean
      ) {
        if (error) {
          res.status(400).send({ error: true, message: error });
        }

        if (isMatch) {
          req.session!.username = u.Username;
          req.session!.UserID = u._id;

          req.session!.save(err => {
            if (err) {
              throw err;
            }
          });

          res.status(200).send({
            error: false,
            message: 'User authenticated successfully',
            result: u,
          });
        } else {
          res
            .status(400)
            .send({ error: false, message: 'Password is incorrect' });
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
    //     res.status(200).send('User logged out successfully!');
    //   }
    // });

    // req.se
    req.session!.destroy(err => {
      if (!err) {
        res.status(200).send('User logged out successfully!');
      }
    });
  } else {
    res.status(404).send('User not found!');
  }
});

export { router };
