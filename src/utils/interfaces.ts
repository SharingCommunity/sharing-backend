import { Request } from 'express-serve-static-core';

export interface RequestWithSession extends Request {
  session: any;
  sessionID: string;
  userID: any;
}
