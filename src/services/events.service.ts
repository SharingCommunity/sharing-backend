import Event, { IEvent } from '../models/event.model';

/**
 * create new Event
 * @param data
 */
export const newEvent = (data: IEvent) => {
  return new Event(data).save();
};
