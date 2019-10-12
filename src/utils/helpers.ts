import User from '../models/user.model';
import { store } from '../server';

/**
 * Returns the current socketID of the user...
 *
 * @param id the user _id of the reciepient
 */
const getUserSocketID = function(id: string) {
  return User.findById(id);
};

export { getUserSocketID };
