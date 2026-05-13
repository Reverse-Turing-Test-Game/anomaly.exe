// 3elevator.mission.js
const verifyElevatorMission = (stoppedFloor, attemptCount) => {
    const TARGET_FLOOR = 7;
    const isSuccess = stoppedFloor === TARGET_FLOOR;

    const rawScore = 1050 - (attemptCount * 10);
    const finalScore = Math.max(0, rawScore);

    return {
        isSuccess,
        data: { // gameservice가 가져갈 'data' 상자
            attempt_count: attemptCount,
            stopped_floor: stoppedFloor,
            score: Number(finalScore.toFixed(1))
        }
    };
};

module.exports = { verifyElevatorMission };