const { db } = require('../config/firebase');

const getRankingData = async (currentTotalScore) => {
    try {
        const topSnapshot = await db.collection('rankings')
            .orderBy('totalScore', 'desc')
            .limit(3)
            .get();

        const top3 = topSnapshot.docs.map(doc => ({
            nickname: doc.data().nickname,
            total_score: doc.data().totalScore
        }));

        const scoreToCompare = currentTotalScore || 0;
        const higherScoresSnapshot = await db.collection('rankings')
            .where('totalScore', '>', scoreToCompare)
            .get();

        const myRank = higherScoresSnapshot.size + 1;

        return { top3, myRank };
    } catch (error) {
        console.error("Ranking Service Error:", error);
        throw error;
    }
};

module.exports = { getRankingData };