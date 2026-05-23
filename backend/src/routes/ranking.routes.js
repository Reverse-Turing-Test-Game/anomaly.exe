const express = require('express');
const router = express.Router();
const { getTop3Controller, getMyRankingController } = require('../controllers/ranking.controller');

// TOP3 랭킹 조회
router.get('/top3', getTop3Controller);

// 내 랭킹 조회
router.get('/my', getMyRankingController);

module.exports = router;