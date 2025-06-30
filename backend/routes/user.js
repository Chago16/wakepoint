const express = require('express');
const router = express.Router();
const { getUserNameById } = require('../controllers/userController');

// POST /api/user-name
router.post('/user-name', getUserNameById);

module.exports = router;
