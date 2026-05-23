// 정답 후보 리스트
const CORRECT_PASSWORDS = ["174409", "0917", "4712"]; 

const verifyPasswordMission = (inputValue, tryCount) => {
    const isSuccess = CORRECT_PASSWORDS.includes(String(inputValue));

    let finalScore = 0;
    if (isSuccess) {
        finalScore = Math.max(0, 1050 - (tryCount * 50));
    }

    return {
        isSuccess,
        data: {              
            input_value: inputValue,
            score: Number(finalScore.toFixed(1)),
            try_count: tryCount
        }
    };
};

module.exports = { verifyPasswordMission };