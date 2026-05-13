const { db } = require('../config/firebase');
const { calculateScores } = require('../utils/scoreCalculator');
const { verifyCircleMission } = require('./missions/1circle.mission');
const { verifyQuizMission } = require('./missions/2quiz.mission'); 
const { verifyElevatorMission } = require('./missions/3elevator.mission');
const { verifyPasswordMission } = require('./missions/4password.mission');
const { verifyTuringMission } = require('./missions/5turing.mission');

// 1. 미션 아이디를 scoreCalculator가 인식하는 이름으로 변환하는 지도
const MISSION_NAME_MAP = {
    'level1': 'circle',
    'level2': 'quiz',
    'level3': 'elevator',
    'level4': 'password',
    'level5': 'turingtest'
};

/**
 * 미션 판정 및 저장
 */
const submitMission = async (sessionId, missionId, inputData) => {
    try {
        let verdict;

        if (missionId === 'level1') {
            verdict = verifyCircleMission(inputData.accuracy, inputData.tryCount);
        } 
        else if (missionId === 'level2') {
            verdict = verifyQuizMission(inputData.correctCount, inputData.tryCount);
        }
        else if (missionId === 'level3') {
            verdict = verifyElevatorMission(inputData.stoppedFloor, inputData.attemptCount);
        }
        else if (missionId === 'level4') {
            verdict = verifyPasswordMission(inputData.input_value, inputData.tryCount);
        }
        else if (missionId === 'level5') {
            verdict = await verifyTuringMission(inputData.answers);
        }
        else {
            throw new Error("알 수 없는 미션입니다.");
        }
        // ↑ 중복 } 제거, else 블록을 if-else 체인에 바로 연결

        if (verdict.isSuccess) {
            const sessionRef = db.collection('gameSessions').doc(sessionId);
            const dbKey = MISSION_NAME_MAP[missionId] || missionId;

            await sessionRef.set({
                scores: {
                    [dbKey]: { 
                        ...verdict.data,
                        cleared_at: new Date().toISOString()
                    }
                }
            }, { merge: true });

            console.log(`[Session: ${sessionId}] ${dbKey} 저장 완료`);
        }

        return verdict; 
        
    } catch (error) {
        console.error("미션 판정 에러:", error);
        throw error;
    }
};

/**
 * 게임 종료 처리
 */
const completeSession = async (sessionId) => {
    try {
        const sessionRef = db.collection('gameSessions').doc(sessionId);
        const snapshot = await sessionRef.get();

        if (!snapshot.exists) {
            throw new Error("해당 게임 세션을 찾을 수 없습니다.");
        }

        const sessionData = snapshot.data();
        const startTime = new Date(sessionData.start_time);
        const endTime = new Date();
        const durationSeconds = (endTime - startTime) / 1000;

        // 여기서 scores.quiz 등을 찾아서 계산합니다.
        const { finalScore } = calculateScores(sessionData.scores, durationSeconds);

        await sessionRef.update({
            is_cleared: true,
            end_time: endTime.toISOString(),
            total_score: finalScore
        });

        return { 
            user_id: sessionData.user_id, 
            total_score: finalScore 
        };
    } catch (error) {
        console.error("gameSessions 업데이트 에러:", error);
        throw error;
    }
};

module.exports = {
    completeSession,
    submitMission
};