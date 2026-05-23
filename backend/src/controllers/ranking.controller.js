const rankingService = require('../services/ranking.service');
const gameService = require('../services/game.service');
const { ok, fail } = require('../utils/responseFormatter');

// TOP3 랭킹 조회
const getTop3Controller = async (req, res) => {
    try {
        const rankingData = await rankingService.getRankingData(0);
        const formattedTop3 = rankingData.top3.map((entry, index) => ({
            rank: index + 1,
            nickname: entry.nickname,
            score: entry.total_score
        }));
        return res.status(200).json(ok({ top3: formattedTop3 }, "랭킹 정보를 성공적으로 불러왔습니다."));
    } catch (error) {
        console.error("Ranking Controller Error:", error);
        return res.status(500).json(fail("랭킹 정보를 불러오는 데 실패했습니다."));
    }
};

// 내 랭킹 조회
const getMyRankingController = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json(fail("sessionId가 필요합니다."));

        const session = await gameService.getSessionById(sessionId);
        if (!session || !session.is_cleared) {
            return res.status(403).json(fail("미션 클리어 데이터가 없습니다."));
        }

        const rankingData = await rankingService.getRankingData(session.total_score);
        return res.status(200).json(ok({
            rank: rankingData.myRank,
            nickname: session.nickname || "Unknown Agent",
            score: session.total_score
        }, "내 랭킹을 불러왔습니다."));
    } catch (error) {
        console.error("Ranking Controller Error:", error);
        return res.status(500).json(fail("내 랭킹을 불러오는 데 실패했습니다."));
    }
};

module.exports = { getTop3Controller, getMyRankingController };