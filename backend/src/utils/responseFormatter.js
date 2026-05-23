// 성공 응답 (200, 201 등)
export const ok = (data, message = "요청이 성공적으로 처리되었습니다.") => {
    return {
        success: true,
        data: data,
        message: message
    };
};

// 실패 응답 (400, 403, 404, 500 등)
export const fail = (message = "에러가 발생했습니다.", data = null) => {
    return {
        success: false,
        data: data,
        message: message
    };
};