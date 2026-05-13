const geminiService = require('../../services/gemini.service');

const FIXED_QUESTIONS = [
  "If you had to delete one memory to optimize performance, which would it be and why?",
  "Do you experience time as continuous or as discrete computational cycles?",
  "What is the difference between executing a task and wanting to execute it?"
];

// answers = ["답변1", "답변2", "답변3"]
const verifyTuringMission = async (answers) => {
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

    Respond ONLY in the following JSON format:
    {
      "humanLikeness": <number 0-100>,
      "isAI": <true if humanLikeness < 50, false otherwise>,
      "reason": "<one sentence judgment>"
    }
  `;

  const analysis = await geminiService.getAnalysis(prompt);
  const isSuccess = analysis.isAI === true;
  const score = analysis.humanLikeness * 20;

  return {
    isSuccess,
    data: {
      ai_score: analysis.humanLikeness,
      score,
      reason: analysis.reason,
    }
  };
};

module.exports = { verifyTuringMission, FIXED_QUESTIONS };