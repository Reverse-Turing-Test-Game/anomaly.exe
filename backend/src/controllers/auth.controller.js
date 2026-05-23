const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const { ok, fail } = require('../utils/responseFormatter');

// 닉네임 중복 체크
exports.checkNickname = async (req, res) => {
    try {
        const { nickname } = req.body;

        if (!nickname || nickname.trim() === "") {
            return res.status(400).json(fail("닉네임을 입력해주세요."));
        }

        const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,10}$/;
        if (!nicknameRegex.test(nickname)) {
            return res.status(400).json(fail("닉네임은 특수문자 제외 2~10자 이내여야 합니다."));
        }

        const userSnapshot = await db.collection('users').where('nickname', '==', nickname).get();
        
        if (!userSnapshot.empty) {
            return res.status(400).json(fail("이미 사용 중인 닉네임입니다."));
        }

        return res.status(200).json(ok(null, "사용 가능한 닉네임입니다."));

    } catch (error) {
        console.error("Nickname Check Error:", error);
        return res.status(500).json(fail("서버 오류가 발생했습니다."));
    }
};

// 회원가입 및 초기 설정
exports.registerUser = async (req, res) => {
    try {
        const { uid, email, nickname } = req.body;

        if (!uid || !email || !nickname) {
            return res.status(400).json(fail("필수 정보가 누락되었습니다."));
        }

        // 1. 닉네임 중복 확인 (기존 로직 유지)
        const nicknameCheck = await db.collection('users').where('nickname', '==', nickname).get();
        if (!nicknameCheck.empty) {
            return res.status(400).json(fail("이미 사용 중인 닉네임입니다."));
        }

        // 2. [변경/추가] 'users' 컬렉션에 유저 생성
        const userData = {
            uid,
            email,
            nickname,
            started_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        const userDoc = await db.collection('users').add(userData);
        const newUserId = userDoc.id; // 생성된 유저 문서의 ID 

        // 3. [★새로 추가] 'gameSessions' 컬렉션에 이 유저를 위한 '게임 방' 생성
        const sessionData = {
            user_id: newUserId,  // 방금 생성된 유저의 ID로 연결
            nickname: nickname,
            start_time: new Date().toISOString(), // 
            is_cleared: false,
            total_score: null,
            end_time: null,
            scores: {} 
        };
        
        // gameSessions 폴더에 문서를 추가하고 랜덤 ID를 발급받음
        const sessionDoc = await db.collection('gameSessions').add(sessionData);

        // 4. [변경] 생성된 '세션 ID'를 프론트엔드에 돌려줌
        return res.status(201).json(ok({ 
            id: newUserId,         // 유저 아이디
            sessionId: sessionDoc.id, // ★ 이게 진짜 게임에서 쓸 번호표입니다!
            ...userData 
        }, "회원가입 및 세션 생성이 완료되었습니다."));

    } catch (error) {
        console.error("User Registration Error:", error);
        return res.status(500).json(fail("처리 중 오류가 발생했습니다."));
    }
};