const { admin } = require('../config/firebase');
const { fail } = require('../utils/responseFormatter'); 

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json(fail("인증 토큰이 없습니다. 로그인이 필요합니다."));
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // 유저 식별을 위해 req.user에 저장
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        
        next();
    } catch (error) {
        console.error("❌ [Auth Error]:", error.message);
        return res.status(403).json(fail("유효하지 않거나 만료된 토큰입니다."));
    }
};

module.exports = auth;