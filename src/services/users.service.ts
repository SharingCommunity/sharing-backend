import User from '../models/user.model';

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
export const addUserEvent = (id: string, event: any) => {
  const update = {
    $push: { Events: event },
  };
  return findUserAndUpdate(id, update);
};
