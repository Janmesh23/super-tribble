import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { sendMessage, markChatRead, editMessage, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', auth, sendMessage);
router.put('/read/:chatId', auth, markChatRead);
router.put('/:messageId', auth, editMessage);
router.delete('/:messageId', auth, deleteMessage);

export default router;



