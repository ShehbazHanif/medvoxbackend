const express = require('express');
const profileRoute = express.Router();
const {authenticateToken} = require('../middleware/auth')
const multer = require('multer');
const { createProfile, getProfile ,updateProfile} = require('../controller/profileController');
const { addFamilyMember, getFamilyMembers, deleteFamilyMember } = require('../controller/familyMemberController');
const { getNotifications, markNotificationAsRead, deleteAllNotifications  } = require('../controller/notificationController');
const storage = multer.memoryStorage();
const upload = multer({storage})
profileRoute.post('/createProfile', authenticateToken, upload.single('photo'), createProfile);
profileRoute.get('/getProfile',authenticateToken, getProfile)
profileRoute.patch('/updateProfile', authenticateToken, upload.single('photo'), updateProfile);
profileRoute.post('/addFamilyMember', authenticateToken ,addFamilyMember)
profileRoute.get('/getFamilyMembers', authenticateToken, getFamilyMembers);
profileRoute.get('/notifications', authenticateToken, getNotifications);
profileRoute.patch('/notifications/:id/read', authenticateToken, markNotificationAsRead);
profileRoute.delete('/deleteFamilyMember/:id', authenticateToken, deleteFamilyMember);

module.exports = profileRoute;