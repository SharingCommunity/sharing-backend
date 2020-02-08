import User from '../models/user.model';
import { newEvent } from './events.service';
import { IEvent } from '../models/event.model';

/**
 * Create new User object
 * @param data
 */
export const newUser = (data?: any) => {
  return new User(data);
};

/**
 * findUserById
 * - Returns a User document Promise
 * @param id
 */
export const findUserById = (id: string) => {
  return User.findById(id);
};

/**
 * findUserAndUpdate
 *
 * @param id User id
 * @param update update object
 * @param options Update query options
 */
export const findUserAndUpdate = (id: string, update: any, options?: any) => {
  return User.findByIdAndUpdate(id, update, options);
};

/**
 * Add User Event
 * @param id
 * @param event
 */
export const addUserEvent = (id: string, event: IEvent) => {

  return newEvent(event)
  .then((ev) => {
    const update = {
      $push: { Events: ev._id },
    };
  
    return findUserAndUpdate(id, update);
  })
  .catch((err) => {
    console.log('An Error! occurred while adding user event =>', err)
  })
};
