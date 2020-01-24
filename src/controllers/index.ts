import { Router } from 'express';
import { router as postRouter } from './posts';
import { router as chatsRouter } from './chats';
import { router as userRouter } from './users';

const router = Router();

router.use('/posts', postRouter);
router.use('/chats', chatsRouter);
router.use('/user', userRouter);

export default router;
