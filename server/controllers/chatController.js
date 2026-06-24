const Message = require('../models/Message');
const User = require('../models/User');

const getChatHistory = async (req, res) => {
  try {
    const otherUser = req.params.userId;
    const me = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: otherUser },
        { senderId: otherUser, receiverId: me },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const me = req.user._id;
    const sent = await Message.distinct('receiverId', { senderId: me });
    const received = await Message.distinct('senderId', { receiverId: me });
    const userIds = [...new Set([...sent, ...received])];

    const users = await User.find({ _id: { $in: userIds } }).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessageAPI = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const me = req.user._id;

    const newMessage = await Message.create({
      senderId: me,
      receiverId,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatHistory, getConversations, sendMessageAPI };
