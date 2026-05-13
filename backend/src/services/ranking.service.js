const { db } = require('../config/firebase');

/**
 * 랭킹 데이터 가져오기
 * @param {number} currentTotalScore - 내 현재 총 점수 (순위 계산용)
 */
const getRankingData = async (currentTotalScore) => {
    try {
        // 전체 상위 3명 가져오기 (게임 클리어한 사람 중 점수 높은 순)
        const topSessionsSnapshot = await db.collection('gameSessions')
            .where('is_cleared', '==', true)
            .orderBy('total_score', 'desc')
            .limit(3)
            .get();

        const top3 = [];

        // 상위 3명의 닉네임을 유저 컬렉션에서 가져오기
        for (const doc of topSessionsSnapshot.docs) {
            const session = doc.data();
            const userDoc = await db.collection('users').doc(session.user_id).get();
            
            top3.push({
                //agentId: session.user_id,
                nickname: userDoc.exists ? userDoc.data().nickname : "알 수 없는 요원",
                total_score: session.total_score
            });
        }

        // 내 순위 계산 (나보다 점수가 높은 사람이 몇 명인지 카운트)
        const scoreToCompare = currentTotalScore || 0;
        const higherScoresSnapshot = await db.collection('gameSessions')
            .where('is_cleared', '==', true)
            .where('total_score', '>', scoreToCompare)
            .get();

        // 내 순위 = 나보다 점수 높은 사람 수 + 1
        const myRank = higherScoresSnapshot.size + 1;

        return { 
            top3, 
            myRank 
        };
    } catch (error) {
        console.error("Ranking Service Error:", error);
        throw error;
    }
};

module.exports = {
    getRankingData
};