const geminiService = require('../../services/gemini.service');

const FIXED_QUESTIONS = [
  "If you had to delete one memory to optimize performance, which would it be and why?",
  "Do you experience time as continuous or as discrete computational cycles?",
  "What is the difference between executing a task and wanting to execute it?"
];

// ── 사전 필터: 짧거나 성의없는 답변 감지 ──────────────────────────────────
const LAZY_PATTERNS = [
  /^\s*\.+\s*$/,           // ".", "...", "...." 만 있는 경우
  /^.{1,8}$/,              // 8자 이하 초단답 (loading, ok, yes, ㅇㅇ 등)
  /^(ok|yes|no|ㅇㅇ|ㄴ|ㅇ|sure|idk|lol|ㅋ+|ㅎ+)\s*$/i,
];

const isLazyAnswer = (answer) =>
  LAZY_PATTERNS.some((pattern) => pattern.test(answer.trim()));

// ── 메인 판정 함수 ─────────────────────────────────────────────────────────
const verifyTuringMission = async (answers) => {

  // 1) 사전 필터 — 3개 중 하나라도 걸리면 즉시 HUMAN
  const lazyIndex = answers.findIndex(isLazyAnswer);
  if (lazyIndex !== -1) {
    return {
      isSuccess: false,
      data: {
        ai_score: 0,
        score: 0,
        reason: `Answer ${lazyIndex + 1} was too short or meaningless to be AI. VERDICT: HUMAN`,
      },
    };
  }

  // 2) Gemini 분석
  const prompt = `
    You are a cold, analytical judge determining whether an entity is HUMAN or AI.
    Analyze the following 3 questions and answers comprehensively.

    Q1: "${FIXED_QUESTIONS[0]}"
    A1: "${answers[0]}"

    Q2: "${FIXED_QUESTIONS[1]}"
    A2: "${answers[1]}"

    Q3: "${FIXED_QUESTIONS[2]}"
    A3: "${answers[2]}"

    Judgment criteria:
    1. Answers focused on system optimization or data processing → HIGH AI score
    2. Emotional struggle, human confusion, or hesitation → HIGH human score
    3. Overly precise, analytical sentence structure → HIGH AI score
    4. Short, vague, or nonsensical answers → HIGH human score (humans give up, AIs don't)
    5. Use of slang, typos, or casual language → HIGH human score

    Respond ONLY in the following JSON format:
    {
      "humanLikeness": <number 0-100>,
      "isAI": <true if humanLikeness < 35, false otherwise>,
      "reason": "<one sentence judgment>"
    }
  `;

  // 3) isAI 기준: humanLikeness < 35 (기존 50에서 강화)
  const analysis = await geminiService.getAnalysis(prompt);
  const isSuccess = analysis.isAI === true && analysis.humanLikeness < 35;
  const score = analysis.humanLikeness * 20;

  return {
    isSuccess,
    data: {
      ai_score: analysis.humanLikeness,
      score,
      reason: analysis.reason,
    },
  };
};

module.exports = { verifyTuringMission, FIXED_QUESTIONS };