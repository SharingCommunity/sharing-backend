import express from 'express';
import User, { IUser, IUserDocument } from '../models/user.model';
import { store } from '../server';

const router = express.Router();

router.get('/:id', async (req, res) => {
  await User.findById(req.params.id)
    .populate('Posts')
    .populate('Connections')
    .then(u => {
      if (u) {
        res
          .status(200)
          .send(
            JSON.stringify({ error: false, message: 'Single User', result: u })
          );
      } else {
        res
          .status(404)
          .send(
            JSON.stringify({
              error: true,
              message: 'User not found :(',
              results: [],
            })
          );
      }
    })
    .catch(e => {
      res
        .status(400)
        .send(
          JSON.stringify({
            error: true,
            message: 'Error in fetching User',
            errorMessage: e,
          })
        );
    });
  res.end();
});

router.get('/:id/events', async (req, res) => {
  await User.findById(req.params.id)
    .select('Events')
    .then(events => {
      if (events) {
        res
          .status(200)
          .send(
            JSON.stringify({
              error: false,
              message: 'User events found successfully :)',
              results: events.Events,
            })
          );
      } else {
        res
          .status(404)
          .send(
            JSON.stringify({
              error: true,
              message: 'User not found :(',
              results: [],
            })
          );
      }
    })
    .catch(err => {
      throw err;
    });
});

export { router };
