// middlewares/error.middleware.js
const errorHandler = (err, req, res, next) => {
    console.error(`[Error 발생]: ${err.message}`);

    // 프론트엔드(responseFormatter 기준)에게 일관된 에러 메시지 전달
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "서버 내부에서 오류가 발생했습니다.",
    });
};

module.exports = errorHandler;