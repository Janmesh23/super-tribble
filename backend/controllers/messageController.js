import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content, receiverId } = req.body;
    if (!chatId || !content) return res.status(400).json({ message: 'chatId and content are required' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const message = await Message.create({ chatId, senderId: req.user._id, receiverId, content });
    chat.lastMessageAt = new Date();
    await chat.save();
    res.json(message);
  } catch (e) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const markChatRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const result = await Message.updateMany(
      { chatId, readBy: { $nin: [userId] } },
      { $addToSet: { readBy: userId } }
    );
    res.json({ updated: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'content is required' });
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (String(message.senderId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }
    message.content = content.trim();
    message.edited = true;
    await message.save();
    res.json({ _id: message._id, content: message.content, edited: message.edited });
  } catch (e) {
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (String(message.senderId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    message.deleted = true;
    message.content = '';
    await message.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
};
