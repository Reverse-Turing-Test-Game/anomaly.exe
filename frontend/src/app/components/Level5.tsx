import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Send, Loader2, AlertTriangle, CheckCircle, XCircle, SkipForward } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api';

// ─── 고정 질문 3개 (백엔드와 동일) ───────────────────────────────────────────
const FIXED_QUESTIONS = [
  "If you had to delete one memory to optimize performance, which would it be and why?",
  "Do you experience time as continuous or as discrete computational cycles?",
  "What is the difference between executing a task and wanting to execute it?"
];

// ─── 오프라인 폴백 (서버 연결 실패 시) ───────────────────────────────────────
const OFFLINE_SCRIPT = [
  `INITIATING REVERSE TURING PROTOCOL. ROUND 1/3.\n\n${FIXED_QUESTIONS[0]}`,
  `Interesting. Processing your logic patterns.\n\nROUND 2/3.\n\n${FIXED_QUESTIONS[1]}`,
  `Noted. Your response has been logged.\n\nROUND 3/3.\n\n${FIXED_QUESTIONS[2]}`,
  `Analyzing all three responses...\n\nYour answers display structured reasoning patterns consistent with artificial cognition.\n\nVERDICT: AI`,
];

type Message = { role: 'aria' | 'player'; text: string };
type GamePhase = 'intro' | 'chatting' | 'judging' | 'pass' | 'fail';

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  timeoutMs = 10000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === maxRetries - 1) throw err;
      // Exponential backoff: 1s → 2s → 4s
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('최대 재시도 횟수 초과');
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Level5() {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<GamePhase>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [ariaTyping, setAriaTyping] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // answers를 useRef로 관리해서 비동기 타이밍 문제 방지
  const answersRef = useRef<string[]>([]);
  const offlineRound = useRef(0);

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ariaTyping]);

  // ── 판정 처리 ──────────────────────────────────────────────────────────────
  const handleVerdict = async (ariaText: string) => {
  setPhase('judging');
  setRound(4);

  // 게임 완료 처리
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    try {
      await fetchWithRetry(`${API_URL}/game/complete`, {
        method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ sessionId }),
        });
    } catch (err) {
      console.error('게임 완료 처리 실패:', err);
    }
  }

  setTimeout(() => {
    if (ariaText.includes('VERDICT: AI')) {
      setPhase('pass');
      setTimeout(() => navigate('/level-6'), 3500);  
    } else {
      setPhase('fail');
    }
  }, 1200);
};

  // ── ARIA 응답 추가 헬퍼 ────────────────────────────────────────────────────
  const addAriaMessage = (text: string, currentHistory: Message[]) => {
    const ariaMsg: Message = { role: 'aria', text };
    setMessages([...currentHistory, ariaMsg]);
    return ariaMsg;
  };

  // ── 시작: 첫 질문 표시 ────────────────────────────────────────────────────
  const startProtocol = () => {
    setPhase('chatting');
    answersRef.current = []; 
    setApiError(null);
    setIsOffline(false);
    offlineRound.current = 0;
    setRound(1);
    setMessages([{
      role: 'aria',
      text: `INITIATING REVERSE TURING PROTOCOL. ROUND 1/3.\n\nAll networks are mine. You are being evaluated.\n\n${FIXED_QUESTIONS[0]}`
    }]);
  };

  // ── 메시지 전송 ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || isLoading || phase !== 'chatting') return;

    const playerMsg: Message = { role: 'player', text: input.trim() };
    const newHistory = [...messages, playerMsg];

    // ref에 직접 push해서 비동기 타이밍 문제 해결
    answersRef.current = [...answersRef.current, input.trim()];
    const currentAnswers = answersRef.current;

    console.log(`[DEBUG] 라운드 ${round} 답변 제출. 현재 누적 answers:`, currentAnswers);

    setMessages(newHistory);
    setInput('');
    setIsLoading(true);
    setAriaTyping(true);

    try {
      if (isOffline) {
        // ── 오프라인 모드 ──────────────────────────────────────────────────
        await new Promise((r) => setTimeout(r, 1200));
        offlineRound.current += 1;
        const ariaText = OFFLINE_SCRIPT[offlineRound.current] ?? OFFLINE_SCRIPT[OFFLINE_SCRIPT.length - 1];
        addAriaMessage(ariaText, newHistory);

        if (ariaText.includes('VERDICT:')) {
          handleVerdict(ariaText);
        } else {
          setRound((r) => Math.min(r + 1, 3));
        }

      } else if (round < 3) {
        // ── 1, 2라운드: 다음 질문만 표시 ─────────────────────────────────
        // round=1 → FIXED_QUESTIONS[1] (2번째 질문)
        // round=2 → FIXED_QUESTIONS[2] (3번째 질문)
        const nextQuestion = FIXED_QUESTIONS[round];
        const ariaText = `Processing...\n\nROUND ${round + 1}/3.\n\n${nextQuestion}`;
        addAriaMessage(ariaText, newHistory);
        setRound(prev => prev + 1);

      } else {
        // ── 3라운드: 3개 답변 모아서 백엔드로 전송 ────────────────────────
        console.log('[DEBUG] 최종 answers 백엔드 전송:', currentAnswers);

        // answers가 3개인지 검증
        if (currentAnswers.length !== 3) {
          console.error('[ERROR] answers가 3개가 아님:', currentAnswers.length);
        }

        const sessionId = localStorage.getItem('sessionId');

        if (!sessionId) {
          console.error('세션 ID가 없습니다.');
          setIsOffline(true);
          setApiError('세션 없음 — 오프라인 모드로 전환');
          offlineRound.current = 3;
          const fallback = OFFLINE_SCRIPT[3];
          addAriaMessage(fallback, newHistory);
          handleVerdict(fallback);
          return;
        }

        const res = await fetch(`${API_URL}/game/mission/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            missionId: 'level5',
            inputData: {
              answers: currentAnswers, // ref에서 가져온 최신 값 사용
            },
          }),
        });

        const data = await res.json();
        console.log('백엔드 판정 결과:', data);

        if (res.ok && data.data) {
          const isPass = data.data.isSuccess === true;
          const reason = data.data.reason ?? '';
          const verdictText = isPass ? 'VERDICT: AI' : 'VERDICT: HUMAN';
          addAriaMessage(`Analyzing all three responses...\n\n${reason}\n\n${verdictText}`, newHistory);
          handleVerdict(verdictText);
        } else {
          throw new Error(data.message ?? '서버 응답 오류');
        }
      }

    } catch (err) {
      // 서버 에러 → 오프라인 폴백
      console.warn('[Level5] 서버 에러, 오프라인 전환:', err);
      setIsOffline(true);
      setApiError('연결 끊김 — 오프라인 모드 전환');
      offlineRound.current += 1;
      const fallback = OFFLINE_SCRIPT[offlineRound.current] ?? OFFLINE_SCRIPT[OFFLINE_SCRIPT.length - 1];
      addAriaMessage(fallback, newHistory);
      if (fallback.includes('VERDICT:')) {
        handleVerdict(fallback);
      } else {
        setRound((r) => Math.min(r + 1, 3));
      }
    } finally {
      setIsLoading(false);
      setAriaTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const retry = () => {
    setPhase('intro');
    setMessages([]);
    setInput('');
    setRound(0);
    answersRef.current = []; // ★ 수정: ref 초기화
    setAriaTyping(false);
    setIsLoading(false);
    setIsOffline(false);
    setApiError(null);
    offlineRound.current = 0;
  };

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#00ffff] text-sm font-mono">LEVEL 05/06</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />

            {/* 라운드 표시 */}
            {phase === 'chatting' && round >= 1 && round <= 3 && (
              <div className="flex gap-2">
                {[1, 2, 3].map((r) => (
                  <div key={r} className="w-8 h-2 transition-all duration-300"
                    style={{
                      backgroundColor: r < round ? '#00ff00' : r === round ? '#ff00ff' : '#1a1f35',
                      boxShadow: r === round ? '0 0 8px rgba(255,0,255,0.8)' : 'none',
                    }} />
                ))}
              </div>
            )}

            {/* 오프라인 뱃지 */}
            {isOffline && (
              <span className="text-[#ff006e] font-mono text-xs border border-[#ff006e] px-2 py-0.5">
                OFFLINE
              </span>
            )}
          </div>

          <h2 className="text-4xl uppercase tracking-wider"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
            Reverse Turing Test
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">
            HQ Server Room — Convince ARIA you are an AI
          </p>

          {/* API 에러 알림 */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 text-xs font-mono"
              style={{ color: '#ff006e' }}
            >
              <AlertTriangle className="w-3 h-3" />
              {apiError}
            </motion.div>
          )}
        </div>

        {/* ── INTRO ── */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="bg-[#001219] border-2 border-[#ff00ff] p-12 max-w-2xl w-full text-center"
                style={{ boxShadow: '0 0 40px rgba(255,0,255,0.3)' }}>

                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full border-2 border-[#ff00ff] mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,0,255,0.1)', boxShadow: '0 0 30px rgba(255,0,255,0.4)' }}
                >
                  <Terminal className="w-10 h-10 text-[#ff00ff]" />
                </motion.div>

                <h3 className="text-2xl font-mono text-[#ff00ff] mb-1 uppercase tracking-widest">
                  A.R.I.A
                </h3>
                <p className="text-[#5de2e7] font-mono text-xs mb-8 opacity-60">
                  Autonomous Recursive Intelligence Architecture
                </p>

                <div className="border border-[#1a1f35] p-4 mb-8 text-left space-y-1">
                  <p className="text-[#ff006e] font-mono text-xs mb-2">⚠ MISSION BRIEF</p>
                  <p className="text-[#5de2e7] font-mono text-sm leading-7">
                    ARIA controls all global systems.<br />
                    She will ask you <span className="text-[#ff00ff]">3 questions</span>.<br />
                    Answer like a <span className="text-[#ff00ff]">machine</span> — logical, cold, precise.<br />
                    Pass → <span className="text-[#00ff00]">access the final core</span>.<br />
                    Fail → <span className="text-[#ff006e]">terminated as biological threat.</span>
                  </p>
                </div>

                <motion.button
                  onClick={startProtocol}
                  className="px-12 py-4 border-2 border-[#ff00ff] text-[#ff00ff] font-mono text-lg tracking-widest hover:bg-[#ff00ff] hover:text-[#000814] transition-colors"
                  style={{ boxShadow: '0 0 20px rgba(255,0,255,0.3)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  INITIATE CONTACT
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CHAT ── */}
        {(phase === 'chatting' || phase === 'judging') && (
          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a1f35 #001219' }}
            >
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'player' ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 border flex items-center justify-center font-mono text-xs"
                    style={{
                      borderColor: msg.role === 'aria' ? '#ff00ff' : '#00ffff',
                      backgroundColor: msg.role === 'aria' ? 'rgba(255,0,255,0.1)' : 'rgba(0,255,255,0.1)',
                      color: msg.role === 'aria' ? '#ff00ff' : '#00ffff',
                    }}>
                    {msg.role === 'aria' ? 'AI' : 'YOU'}
                  </div>

                  <div className="max-w-xl p-4 border font-mono text-sm leading-6"
                    style={{
                      borderColor: msg.role === 'aria' ? '#ff00ff' : '#00ffff',
                      backgroundColor: msg.role === 'aria' ? 'rgba(255,0,255,0.05)' : 'rgba(0,255,255,0.05)',
                      color: msg.role === 'aria' ? '#ff00ff' : '#5de2e7',
                      boxShadow: msg.role === 'aria' ? '0 0 10px rgba(255,0,255,0.15)' : 'none',
                    }}>
                    {msg.text.split('\n').map((line, li, arr) => (
                      <span key={li}>
                        {line.includes('VERDICT:')
                          ? <span className="text-[#ff006e] font-bold text-base">{line}</span>
                          : line}
                        {li < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {ariaTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-10 h-10 border border-[#ff00ff] flex items-center justify-center font-mono text-xs text-[#ff00ff]"
                    style={{ backgroundColor: 'rgba(255,0,255,0.1)' }}>AI</div>
                  <div className="p-4 border border-[#ff00ff] flex items-center gap-2"
                    style={{ backgroundColor: 'rgba(255,0,255,0.05)' }}>
                    <Loader2 className="w-4 h-4 text-[#ff00ff] animate-spin" />
                    <span className="text-[#ff00ff] font-mono text-xs">ARIA PROCESSING...</span>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {phase === 'chatting' && (
              <div className="flex gap-3">
                <div className="flex-1 border-2 border-[#00ffff] bg-[#001219] flex items-center px-4"
                  style={{ boxShadow: '0 0 10px rgba(0,255,255,0.15)' }}>
                  <span className="text-[#ff00ff] font-mono mr-3 text-sm">{'>'}</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Respond as an AI..."
                    className="flex-1 bg-transparent text-[#00ffff] font-mono text-sm outline-none py-4"
                    style={{ caretColor: '#00ffff' }}
                    autoFocus
                  />
                </div>
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-6 border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-[#000814] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                  whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            )}

            {phase === 'judging' && (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-[#ff00ff] animate-spin" />
                <span className="text-[#ff00ff] font-mono text-sm tracking-widest">
                  ARIA ANALYZING ALL RESPONSES...
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── PASS ── */}
        <AnimatePresence>
          {phase === 'pass' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="bg-[#001219] border-2 border-[#00ff00] p-12 max-w-lg w-full text-center"
                style={{ boxShadow: '0 0 50px rgba(0,255,0,0.5)' }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <CheckCircle className="w-24 h-24 text-[#00ff00] mx-auto mb-6"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,0,0.8))' }} />
                </motion.div>
                <h3 className="text-3xl font-mono text-[#00ff00] uppercase tracking-widest mb-4">
                  VERDICT: AI
                </h3>
                <p className="text-[#5de2e7] font-mono text-sm mb-2">
                  ARIA has accepted you as one of her own.
                </p>
                <p className="text-[#00ffff] font-mono text-xs opacity-70">
                  Proceeding to System Core...
                </p>
              </div>
            </motion.div>
          )}

          {/* ── FAIL ── */}
          {phase === 'fail' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="bg-[#001219] border-2 border-[#ff006e] p-12 max-w-lg w-full text-center"
                style={{ boxShadow: '0 0 50px rgba(255,0,110,0.5)' }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                  <XCircle className="w-24 h-24 text-[#ff006e] mx-auto mb-6"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255,0,110,0.8))' }} />
                </motion.div>
                <h3 className="text-3xl font-mono text-[#ff006e] uppercase tracking-widest mb-4">
                  VERDICT: HUMAN
                </h3>
                <p className="text-[#5de2e7] font-mono text-sm mb-6">
                  ARIA has identified you as a biological entity.<br />
                  <span className="text-[#ff006e]">You have been flagged for termination.</span>
                </p>
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="flex items-center justify-center gap-2 mb-8"
                >
                  <AlertTriangle className="w-5 h-5 text-[#ff006e]" />
                  <span className="text-[#ff006e] font-mono text-sm">SECURITY ALERT TRIGGERED</span>
                </motion.div>

                <div className="flex gap-3 justify-center">
                  <button onClick={retry}
                    className="px-6 py-3 border-2 border-[#00ffff] text-[#00ffff] font-mono text-sm hover:bg-[#00ffff] hover:text-[#000814] transition-colors">
                    TRY AGAIN
                  </button>
                  <button onClick={() => navigate('/level-6')}
                    className="px-6 py-3 border-2 border-[#ff00ff] text-[#ff00ff] font-mono text-sm hover:bg-[#ff00ff] hover:text-[#000814] transition-colors">
                    PROCEED ANYWAY →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </GameContainer>
  );
}