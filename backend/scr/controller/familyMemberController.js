const familyMemberModel = require('../model/familyMemberModel');
const notifyModel = require('../model/notifyModel');
const userModel = require('../model/userModel');
const { sendInvitationEmail } = require('../helper/invitationEmail');

const relationMap = {
    father: 'child',
    mother: 'child',
    brother: 'sibling',
    sister: 'sibling',
    son: 'parent',
    daughter: 'parent',
    husband: 'wife',
    wife: 'husband',
    uncle: 'nephew/niece',
    aunt: 'nephew/niece',
    nephew: 'uncle/aunt',
    niece: 'uncle/aunt',
    friend: 'friend',
    cousin: 'cousin'
};

const addFamilyMember = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, relation, memberEmail } = req.body;

        if (!name || !relation || !memberEmail) {
            return res.status(400).json({ error: 'Name, relation, and email are required' });
        }

        // Save the family member record for logged-in user (status: pending)
      const familyMember = new familyMemberModel({
    user: userId,
    name,
    relation,
    memberEmail,
    status: 'pending' // ✅ Explicitly set it
});


        await familyMember.save();

        // Check if invited email is a registered user
        const familyMemberUser = await userModel.findOne({ email: memberEmail });

        if (familyMemberUser) {
            // Registered user - send notification
           const notify = new notifyModel({
    toUser: familyMemberUser._id,
    fromUser: userId,
    message: `${req.user.name} has added you as their ${relation}`,
    type: 'family_member_added',
    relatedMemberId: familyMember._id // ✅ Add this line
});
await notify.save();


            // Create reverse family member if not exist
            const reverseRelation = relationMap[relation.toLowerCase()] || 'family';

            const existingReverse = await familyMemberModel.findOne({
                user: familyMemberUser._id,
                memberEmail: req.user.email
            });

            if (!existingReverse) {
                const reverseMember = new familyMemberModel({
    user: familyMemberUser._id,
    name: req.user.name,
    relation: reverseRelation,
    memberEmail: req.user.email,
    status: 'pending' // ✅ Also here
});

                await reverseMember.save();
            }

            return res.status(201).json({
                message: 'Family member added successfully. User has been notified.',
                familyMember,
                userExists: true
            });

        } else {
            // Not registered - send invitation email
            const emailResult = await sendInvitationEmail(memberEmail, name, req.user.name, relation);

            return res.status(201).json({
                message: 'Family member added successfully. Invitation email sent.',
                familyMember,
                userExists: false,
                emailSent: emailResult.success,
                emailError: emailResult.error || null
            });
        }

    } catch (error) {
        console.error('Error adding family member:', error);
        res.status(500).json({ error: error.message });
    }
};



const getFamilyMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const members = await familyMemberModel.find({ user: userId });
    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteFamilyMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const member = await familyMemberModel.findOneAndDelete({ _id: id, user: userId });

    if (!member) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.status(200).json({ message: 'Family member deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addFamilyMember, getFamilyMembers, deleteFamilyMember };
