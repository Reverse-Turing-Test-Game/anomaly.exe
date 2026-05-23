// 2quiz.mission.js
const verifyQuizMission = (correctCount, tryCount) => {
    const MIN_CORRECT = 2; // 통과 기준: 2문제
    const isSuccess = correctCount >= MIN_CORRECT;

    // ★ 에러 원인 해결: quizScore를 여기서 직접 계산합니다.
    // 3문제 중 맞춘 개수를 100점 만점으로 환산 (예: 3개 다 맞으면 100점)
    const calculatedScore = (correctCount / 3) * 100;

    return {
        isSuccess,
        // ★ gameservice와 약속한 'data'라는 이름의 상자에 담습니다.
        data: {
            score: Number(calculatedScore.toFixed(1)), 
            try_count: tryCount,
            correct_count: correctCount
        }
    };
};

module.exports = { verifyQuizMission };