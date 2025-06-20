const user = require('../model/userModel');
const profileModel = require('../model/profileModel');
const {uploadToCloud} = require('../helper/uploadToCloud');

const createProfile = async (req, res) => {
    try {
        let photoUrl = null;
        const userId = req.user.id;
        
        // Handle file upload if present
        if (req.file) {
            const { buffer, originalname, mimetype } = req.file;
            const uploadData = await uploadToCloud(buffer, originalname, mimetype);
            
            if (uploadData.success) {
                photoUrl = uploadData.fileUrl;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'File upload failed',
                    error: uploadData.error
                });
            }
        }
        
        // Get user data
        const existingUser = await user.findById(userId).select('name email');
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Check if profile already exists
        const existingProfile = await profileModel.findOne({ userId }); // Fixed: use profileModel
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Profile already exists for this user'
            });
        }

        // Create new profile with user data
        const newProfile = await profileModel.create({
            user: existingUser._id,
            name: existingUser.name, // Fixed: use 'name' not 'username'
            email: existingUser.email, // Added email field
            photo:photoUrl,
        });
        
        res.status(201).json({ // Fixed: use 201 for creation
            success: true,
            message: 'Profile created successfully',
            profile: newProfile,
        });
        
    } catch (error) {
        console.log('Create profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fixed: use findOne instead of find, and correct field name
        const existingProfile = await profileModel.findOne({ user:userId });
        
        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        // Return user profile with name, email, and photo
      res.status(200).json({
  success: true,
  message: 'Profile retrieved successfully',
  data: {
    userId: existingProfile.user,
    name: existingProfile.name,
    email: existingProfile.email,
    photoUrl: existingProfile.photo,
  }
});

        
    } catch (error) {
        console.log('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};



const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    let photoUrl = null;

    if (req.file) {
      const { buffer, originalname, mimetype } = req.file;
      const uploadData = await uploadToCloud(buffer, originalname, mimetype);

      if (uploadData.success) {
        photoUrl = uploadData.fileUrl;
      } else {
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
          error: uploadData.error
        });
      }
    }

    const profile = await profileModel.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (name !== undefined) profile.name = name;
    if (email !== undefined) profile.email = email;
    if (photoUrl) profile.photo = photoUrl;

    await profile.save();

    // ✅ Update the email in the User model too
    if (email, name !== undefined) {
      await user.findByIdAndUpdate(userId, { email, name });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });

  } catch (error) {
    console.error('[updateProfile] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};





module.exports = { 
    createProfile, 
    getProfile, 
    updateProfile
  
};