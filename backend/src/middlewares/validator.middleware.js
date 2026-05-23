const verifyToken = (req, res, next) => {
    // 토큰 검증 로직
    console.log("토큰 검증 중...");
    next();
};

const validateGameScore = (req, res, next) => {
    const { score } = req.body;
    if (score === undefined || typeof score !== 'number') {
        return res.status(400).json({ 
            success: false, 
            message: "잘못된 요청입니다. 점수(score) 데이터가 없거나 숫자가 아닙니다." 
        });
    }
    next();
};

module.exports = {
    verifyToken,
    validateGameScore
};