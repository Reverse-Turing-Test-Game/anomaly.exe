const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { validateGameScore } = require('../middlewares/validator.middleware');

// 게임 시작 (세션 생성)
router.post('/start', gameController.startSession);

// 현재 게임 상태 조회
router.get('/:sessionId', gameController.getSession);

// 게임 종료 및 최종 점수 기록
router.post('/complete', validateGameScore, gameController.completeSession);

// 게임 포기 (중도 종료)
router.post('/abandon', gameController.abandonSession);

// 미션 시작 초기화
router.post('/mission/start', gameController.startMission);

// 미션 데이터 제출 및 판정 (게임의 핵심 로직)
router.post('/mission/submit', gameController.submitMission);

// 특정 미션 결과 조회
router.get('/mission/result/:sessionId/:missionId', gameController.getMissionResult);

module.exports = router;