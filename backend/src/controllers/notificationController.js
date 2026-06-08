import NotificationHelper from '../models/Notification.js';

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    // Retrieve notifications that are either for all, or match user role, or specifically target user ID
    let query = {};
    if (role === 'admin') {
      query = { $or: [{ target: 'all' }, { target: 'admin' }] };
    } else {
      query = {
        $or: [
          { target: 'all' },
          { target: 'student' },
          { targetUser: userId }
        ]
      };
    }

    // In local JSON db mode, simple fallback filtering is handled by model helper.
    // In Mongoose it runs MongoDB query. Let's execute.
    let list = await NotificationHelper.find();

    // Memory filter to handle OR constraints cleanly in both MongoDB & Fallback JSON databases
    let filtered = list.filter(item => {
      if (item.target === 'all') return true;
      if (role === 'admin' && item.target === 'admin') return true;
      if (role === 'student' && item.target === 'student') return true;
      if (item.targetUser && (item.targetUser === userId || item.targetUser._id === userId)) return true;
      return false;
    });

    // Sort by createdAt desc
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(filtered);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Server error retrieving notifications list', error: error.message });
  }
};

// @desc    Create announcement or alert (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin only)
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, target, targetUser } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Please enter title and message' });
    }

    const notification = await NotificationHelper.create({
      title,
      message,
      type: type || 'announcement',
      target: target || 'all',
      targetUser: targetUser || null,
      readBy: []
    });

    res.status(201).json({ message: 'Notification bulletin published successfully', notification });
  } catch (error) {
    console.error('Publish notification error:', error);
    res.status(500).json({ message: 'Server error dispatching notification bulletin', error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notification = await NotificationHelper.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Append userId to readBy if not already present
    const readBy = notification.readBy || [];
    const userIdStr = userId.toString();
    const alreadyRead = readBy.some(id => id.toString() === userIdStr);

    if (!alreadyRead) {
      await NotificationHelper.findByIdAndUpdate(req.params.id, {
        $push: { readBy: userId }
      });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Read notification error:', error);
    res.status(500).json({ message: 'Server error updating read receipt status', error: error.message });
  }
};
