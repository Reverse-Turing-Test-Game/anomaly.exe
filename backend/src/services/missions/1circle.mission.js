const verifyCircleMission = (accuracy, tryCount) => {
    // 통과 기준 설정
    const TARGET_ACCURACY = 96.0;
    
    // 성공 여부 판단
    const isSuccess = accuracy >= TARGET_ACCURACY;

    return {
        isSuccess, // true 또는 false
        data: {
            accuracy: Number(accuracy.toFixed(1)),
            score: Number(accuracy.toFixed(1)),
            try_count: tryCount
        }
    };
};

module.exports = { verifyCircleMission };