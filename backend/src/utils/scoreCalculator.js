const calculateScores = (scores, duration) => {
    // Mission 1 (Circle) - 정확도가 낮거나 시도 횟수가 많을 경우 방어
    const circleScore = Math.max(0, (scores.circle.accuracy * 10) - ((scores.circle.try_count - 1) * 15));

    // Mission 2 (Quiz) - 이미 고정 점수라 안전함
    let quizScore = 0;
    if (scores.quiz.correct_count === 3) quizScore = 1000;
    else if (scores.quiz.correct_count === 2) quizScore = 700;

    // Mission 3 (Elevator) - 시도 105회 이상 시 음수 방어
    const elevatorScore = Math.max(0, 1050 - (scores.elevator.attempt_count * 10));

    // Mission 4 (Password) - 시도 21회 이상 시 음수 방어
    const passwordScore = Math.max(0, 1050 - (scores.password.try_count * 50));

    // Mission 5 (Turingtest) - 0~100 사이라면 안전함 (최대 2000점)
    const turingScore = Math.max(0, scores.turingtest.ai_score * 20);

    // 시간 점수 - 로그 함수 특성상 매우 큰 시간이 흐르면 음수 가능성 있음
    const timeScore = Math.max(0, 1500 - (Math.log(duration + 1) * 200));

    // 최종 합계
    const finalScore = circleScore + quizScore + elevatorScore + passwordScore + turingScore + timeScore;

    return {
        finalScore: Number(finalScore.toFixed(2))
    };
    console.log(finalScore);
};

module.exports = { calculateScores };