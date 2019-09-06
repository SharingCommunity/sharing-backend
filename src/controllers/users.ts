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
          res
            .status(400)
            .send(
              JSON.stringify({
                error: true,
                message: 'Error in authenticating user',
                errorMessage: err,
              })
            );
          throw err;
        }
      });
      res
        .status(200)
        .send(
          JSON.stringify({
            error: false,
            message: `${u.Username} created successfully!`,
          })
        );
    })
    .catch(err => {
      res.status(400).send(
        JSON.stringify({
          error: true,
          message: 'Error creating user',
          errorMessage: err,
        })
      );
    });
});

router.post('/login', (req, res) => {
  const credentials = req.body.data;

  User.findOne({ Email: credentials.Email }, (err, u) => {
    if (err) {
      res.send(err);
    }

    if (!u) {
      res
        .status(404)
        .send(
          JSON.stringify({
            error: true,
            message: 'User does not exist',
            errorMessage: '',
          })
        );
    } else {
      u.comparePasswords(credentials.Password, function(
        error: any,
        isMatch: boolean
      ) {
        if (error) {
          res
            .status(400)
            .send(
              JSON.stringify({
                error: true,
                message: 'Error in authenticating user',
                errorMessage: err,
              })
            );
        }

        if (isMatch) {
          req.session!.email = u.Email;
          req.session!.UserID = u._id;

          // tslint:disable-next-line: no-shadowed-variable
          req.session!.save(err => {
            if (err) {
              res
                .status(400)
                .send(
                  JSON.stringify({
                    error: true,
                    message: 'Error in authenticating user',
                    errorMessage: err,
                  })
                );
              throw err;
            }
          });

          res.status(200).send(
            JSON.stringify({
              error: false,
              message: `Welcome back, ${u.Username}`,
              result: { SessionID: req.sessionID, UserID: u._id },
            })
          );
        } else {
          res
            .status(400)
            .send(
              JSON.stringify({
                error: true,
                message: 'Password is incorrect',
                errorMessage: '',
              })
            );
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
