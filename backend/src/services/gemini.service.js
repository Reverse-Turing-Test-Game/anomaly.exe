const model = require("../config/gemini");

const getAnalysis = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 분석 실패");
  }
};

module.exports = { getAnalysis };