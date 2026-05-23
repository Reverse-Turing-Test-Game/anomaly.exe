const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateGameScore } = require('../middlewares/validator.middleware');

// 닉네임 체크
router.post('/check-nickname', authController.checkNickname);

// 회원가입
router.post('/register', authController.registerUser);

module.exports = router;