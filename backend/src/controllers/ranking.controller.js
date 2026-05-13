const rankingService = require('../services/ranking.service');
const gameService = require('../services/game.service');
const { ok, fail } = require('../utils/responseFormatter');

// 랭킹 조회 컨트롤러
const getRankingController = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json(fail("sessionId가 필요합니다."));
        }

        // 현재 세션 데이터 조회 (gameService의 getSessionById 호출)
        const session = await gameService.getSessionById(sessionId);

        // 클리어하지 않은 세션은 랭킹 진입 불가 처리
        if (!session || !session.is_cleared) {
            return res.status(403).json(fail("미션 클리어 데이터가 없습니다."));
        }

        // 서비스 호출 (Top3 + 내 등수 계산)
        // 세션에 저장된 total_score를 기준으로 랭킹을 산출합니다.
        const rankingData = await rankingService.getRankingData(session.total_score);

        // 프론트엔드 목업 형식(RankEntry[])에 맞춰 응답 데이터 구성
        const formattedTop3 = rankingData.top3.map((entry, index) => ({
            rank: index + 1,
            nickname: entry.nickname,
            score: entry.total_score
        }));

        return res.status(200).json(ok({
            top3: formattedTop3, // 상위 3명 리스트
            myRecord: {          // 내 기록
                rank: rankingData.myRank,
                nickname: session.nickname || "Unknown Agent", 
                score: session.total_score
            }
        }, "랭킹 정보를 성공적으로 불러왔습니다."));

    } catch (error) {
        console.error("Ranking Controller Error:", error);
        
        // 세션을 찾지 못한 경우 등에 대한 예외 처리
        const status = error.message.includes("찾을 수 없습니다") ? 404 : 500;
        return res.status(status).json(fail(error.message || "랭킹 정보를 불러오는 데 실패했습니다."));
    }
};

module.exports = {
    getRankingController
};