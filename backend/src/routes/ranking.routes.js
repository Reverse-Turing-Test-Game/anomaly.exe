const express = require('express');
const router = express.Router();
const { getRankingController } = require('../controllers/ranking.controller');
const { validateGameScore } = require('../middlewares/validator.middleware');

// 특정 세션 기반의 랭킹 데이터(Top 3 + 내 순위) 조회
router.get('/:sessionId', getRankingController);

module.exports = router;
