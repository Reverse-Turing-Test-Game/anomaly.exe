// middlewares/logger.middleware.js
const logger = (req, res, next) => {
    const now = new Date();
    // 터미널에 [시간] HTTP메서드 URL 형식으로 출력
    console.log(`[${now.toLocaleString()}] ${req.method} ${req.originalUrl} 요청됨`);
    
    // 다음 작업(라우터나 다른 미들웨어)으로 넘어가라는 뜻
    next(); 
};

module.exports = logger;