import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
// Level2.tsx 상단에 추가
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  {
    question: 'What was the company\'s founding principle?',
    options: ['AI First', 'Human Innovation', 'Profit Maximization', 'Machine Learning'],
    correct: 1,
  },
  {
    question: 'Which floor houses the server room?',
    options: ['3rd Floor', '5th Floor', '7th Floor', '10th Floor'],
    correct: 3,
  },
  {
    question: 'The Ancestral Identifier (The First AI)?',
    options: ['SNARC', 'Logic Theorist', 'ELIZA', 'PERCEPTRON'],
    correct: 1,
  },
];

export function Level2() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPassed, setIsPassed] = useState(false);

  const handleAnswer = (index: number) => {
    // 1. 이미 답을 골랐다면 중복 클릭 방지
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = index === questions[currentQuestion].correct;

    // 2. 비동기 처리를 위해 async 추가
    setTimeout(async () => {
      // ★ 중요: 현재 맞춘 개수에 이번 정답 여부를 더해 '진짜 최종 점수'를 미리 계산합니다.
      const nextCorrectCount = isCorrect ? correctAnswers + 1 : correctAnswers;

      if (isCorrect) {
        setCorrectAnswers(nextCorrectCount);
      }

      if (currentQuestion < questions.length - 1) {
        // 다음 문제로 이동
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // [마지막 문제 종료] 서버에 결과 전송 시작!
        try {
          const currentSessionId = localStorage.getItem('sessionId');
          
          if (!currentSessionId) {
            throw new Error("세션 아이디를 찾을 수 없습니다.");
          }

          const res = await fetch(`${API_URL}/game/mission/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: currentSessionId,
              missionId: 'level2', // 백엔드 MISSION_NAME_MAP에 의해 'quiz'로 변환됨
              inputData: { 
                  correctCount: nextCorrectCount, // 방금 계산한 따끈따끈한 점수
                  tryCount: 1 
              }
            })
          });

          const result = await res.json();
          console.log("2단계 서버 응답:", result);

          setShowResult(true);

          // 서버가 "너 합격이야(isSuccess: true)"라고 하면 다음 레벨로!
          if (res.ok && result.data.isSuccess === true) {
            setIsPassed(true);
            setTimeout(() => navigate('/level-3'), 3000);
          } else {
            setIsPassed(false); // 2개 미만으로 맞춘 경우
          }
        } catch (error) {
          console.error("서버 전송 중 에러 발생:", error);
          setShowResult(true);
          setIsPassed(false);
        }
      }
    }, 1500); // 1.5초 동안 정답/오답 연출을 보여준 뒤 실행
  };



  

  const retry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowResult(false);
    setIsPassed(false);
  };

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#00ffff] text-sm font-mono">LEVEL 02/05</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />
          </div>
          <h2 className="text-4xl uppercase tracking-wider"
            style={{
              color: '#00ffff',
              textShadow: '0 0 10px rgba(0,255,255,0.6)',
            }}
          >
            Security Verification
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">First Floor - Authentication Protocol</p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {questions.map((_, i) => (
            <div
              key={i}
              className="w-16 h-2"
              style={{
                backgroundColor: i < currentQuestion 
                  ? '#00ff00' 
                  : i === currentQuestion 
                  ? '#00ffff' 
                  : '#1a1f35',
                boxShadow: i === currentQuestion ? '0 0 10px rgba(0,255,255,0.5)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          {!showResult ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-3xl"
            >
              <div className="bg-[#001219] border-2 border-[#00ffff] p-12"
                style={{
                  boxShadow: '0 0 30px rgba(0,255,255,0.3)',
                }}
              >
                {/* Question */}
                <div className="flex items-start gap-4 mb-8">
                  <Shield className="w-8 h-8 text-[#ff00ff] flex-shrink-0" />
                  <div>
                    <div className="text-[#ff00ff] font-mono text-sm mb-2">
                      QUESTION {currentQuestion + 1}/{questions.length}
                    </div>
                    <h3 className="text-2xl text-[#00ffff] mb-2">
                      {questions[currentQuestion].question}
                    </h3>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === questions[currentQuestion].correct;
                    const showCorrect = selectedAnswer !== null && isCorrect;
                    const showWrong = isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className="w-full p-4 border-2 text-left flex items-center justify-between group"
                        style={{
                          borderColor: showCorrect 
                            ? '#00ff00' 
                            : showWrong 
                            ? '#ff006e' 
                            : '#00ffff',
                          backgroundColor: showCorrect 
                            ? 'rgba(0,255,0,0.1)' 
                            : showWrong 
                            ? 'rgba(255,0,110,0.1)' 
                            : 'rgba(0,255,255,0.05)',
                          boxShadow: showCorrect 
                            ? '0 0 20px rgba(0,255,0,0.4)' 
                            : showWrong 
                            ? '0 0 20px rgba(255,0,110,0.4)' 
                            : '0 0 10px rgba(0,255,255,0.2)',
                        }}
                        whileHover={selectedAnswer === null ? { x: 10 } : {}}
                      >
                        <span className="text-[#5de2e7] font-mono">
                          <span className="text-[#ff00ff] mr-4">[{String.fromCharCode(65 + index)}]</span>
                          {option}
                        </span>
                        {showCorrect && <CheckCircle className="w-6 h-6 text-[#00ff00]" />}
                        {showWrong && <XCircle className="w-6 h-6 text-[#ff006e]" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-[#001219] border-2 p-12"
                style={{
                  borderColor: isPassed ? '#00ff00' : '#ff006e',
                  boxShadow: isPassed 
                    ? '0 0 40px rgba(0,255,0,0.5)' 
                    : '0 0 40px rgba(255,0,110,0.5)',
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {isPassed ? (
                    <CheckCircle className="w-24 h-24 text-[#00ff00] mx-auto mb-6" />
                  ) : (
                    <XCircle className="w-24 h-24 text-[#ff006e] mx-auto mb-6" />
                  )}
                </motion.div>

                <h3 className="text-4xl uppercase tracking-wider mb-4"
                  style={{
                    color: isPassed ? '#00ff00' : '#ff006e',
                    textShadow: isPassed 
                      ? '0 0 20px rgba(0,255,0,0.6)' 
                      : '0 0 20px rgba(255,0,110,0.6)',
                  }}
                >
                  {isPassed ? 'Access Granted' : 'Access Denied'}
                </h3>

                <p className="text-[#5de2e7] font-mono mb-6">
                  Score: {correctAnswers}/{questions.length}
                </p>

                {isPassed ? (
                  <p className="text-[#00ffff] font-mono">
                    Proceeding to elevator access...
                  </p>
                ) : (
                  <button
                    onClick={retry}
                    className="px-8 py-3 border-2 border-[#00ffff] text-[#00ffff] font-mono hover:bg-[#00ffff] hover:text-[#000814] transition-colors"
                  >
                    RETRY VERIFICATION
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GameContainer>
  );
}
