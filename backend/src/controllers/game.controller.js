const gameService = require('../services/game.service');
const { ok, fail } = require('../utils/responseFormatter');

// 세션 생성
const startSession = async (req, res) => {
    try {
        const userId = req.user.uid;  // body에서 userId를 받는 대신, authMiddleware가 넣어준 uid 사용
        const session = await gameService.startSession(userId);
        return res.status(201).json(ok(session, "게임 세션이 시작되었습니다."));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

// 상태 조회
const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessionData = await gameService.getSessionById(sessionId);
        return res.status(200).json(ok(sessionData, "세션 조회 성공"));
    } catch (error) {
        const status = error.message.includes("찾을 수 없음") ? 404 : 500;
        return res.status(status).json(fail(error.message));
    }
};

// 미션 시작
const startMission = async (req, res) => {
    try {
        const { sessionId, missionId } = req.body;
        const result = await gameService.startMission(sessionId, missionId);
        return res.status(200).json(ok(result, "미션이 시작되었습니다."));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

// 미션 판정 (핵심 로직)
const submitMission = async (req, res) => {
    try {
        const { sessionId, missionId, inputData } = req.body;
        // submitMission 서비스 내에서 미션 핸들러를 통해 판정 진행
        console.log('[DEBUG] req.body:', JSON.stringify(req.body));

        const verdict = await gameService.submitMission(sessionId, missionId, inputData);
        
        return res.status(200).json(ok(verdict, "미션 판정 완료"));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

// 미션 결과 조회
const getMissionResult = async (req, res) => {
    try {
        const { sessionId, missionId } = req.params;
        const result = await gameService.getMissionResult(sessionId, missionId);
        return res.status(200).json(ok(result, "미션 결과 조회 성공"));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

// 게임 종료 처리
const completeSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const result = await gameService.completeSession(sessionId);
        // 이후 랭킹 서비스 호출 등 추가...
        return res.status(200).json(ok(result, "게임이 종료되었습니다."));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

// 포기 처리
const abandonSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        await gameService.abandonSession(sessionId);
        return res.status(200).json(ok(null, "게임 포기 처리가 완료되었습니다."));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

const getTop3Ranking = async (req, res) => {
    try {
        const result = await gameService.getTop3Ranking();
        return res.status(200).json(ok(result, "랭킹 조회 성공"));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

const getMyRanking = async (req, res) => {
    try {
        const { nickname } = req.query;
        const result = await gameService.getMyRanking(nickname);
        return res.status(200).json(ok(result, "내 랭킹 조회 성공"));
    } catch (error) {
        return res.status(500).json(fail(error.message));
    }
};

module.exports = {
    startSession,
    getSession,
    startMission,
    submitMission,
    getMissionResult,
    completeSession,
    abandonSession,
    getTop3Ranking,  // ★ 추가
    getMyRanking     // ★ 추가
};