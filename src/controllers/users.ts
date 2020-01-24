import { Router } from 'express';
import { findUserById } from '../services/users.service';

const router = Router();

/**
 * Endpoint to get specific User
 */
router.get('/:id', async (req, res) => {
  await findUserById(req.params.id)
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
        res.status(404).send(
          JSON.stringify({
            error: true,
            message: 'User not found :(',
            results: [],
          })
        );
      }
    })
    .catch(e => {
      res.status(400).send(
        JSON.stringify({
          error: true,
          message: 'Error in fetching User',
          errorMessage: e,
        })
      );
    });
});

/**
 * Endpoint to get User's events
 */
router.get('/:id/events', async (req, res) => {
  await findUserById(req.params.id)
    .select('Events')
    .then(doc => {
      if (doc) {
        res.status(200).send(
          JSON.stringify({
            error: false,
            message: 'User events found successfully :)',
            results: doc.Events,
          })
        );
      } else {
        res.status(404).send(
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
