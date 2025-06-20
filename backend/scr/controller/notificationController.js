const notifyModel = require('../model/notifyModel');
const userModel = require('../model/userModel');
const FamilyMember = require('../model/familyMemberModel'); // ✅ Fixed: Add missing import

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const query = { toUser: userId };
    if (type && type !== 'all') {
      query.type = type;
    }

    const notifications = await notifyModel
      .find(query)
      .populate('fromUser', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await notifyModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    // ✅ Step 1: update original record (userA's document)
    if (notification?.type === 'family_member_added' && notification.relatedMemberId) {
      await FamilyMember.findByIdAndUpdate(notification.relatedMemberId, {
        status: 'active',
      });
    }

    // ✅ Step 2: update reverse record (userB's document)
    const userEmail = req.user.email; // logged-in user (userB)
    const fromUser = await userModel.findById(notification.fromUser); // userA

    if (fromUser && userEmail) {
      await FamilyMember.findOneAndUpdate(
        {
          user: req.user.id, // userB
          memberEmail: fromUser.email,
        },
        {
          status: 'active',
          registered: true,
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};




module.exports = { getNotifications, markNotificationAsRead };
