import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, TrendingUp } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api';

// ─── Quiz definitions ─────────────────────────────────────────────────────────

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'ANOMALY' | 'SUPPRESS' | 'INJECT' | 'CALIBRATE';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  highlight?: boolean;
}

interface Quiz {
  id: string;
  missionTag: string;
  terminalTitle: string;
  logs: LogEntry[];
  hintBody: React.ReactNode;
  footerHint: string;
  answer: string;
  inputMaxLength: number;
  inputPlaceholder: string;
}

const QUIZZES: Quiz[] = [
  {
    id: 'system-log',
    missionTag: 'MISSION: SYSTEM LOG ANALYSIS',
    terminalTitle: '/// SYSTEM LOG — 2024-03-15 ///',
    logs: [
      { timestamp: '[11:42:03]', level: 'INFO',  message: 'system_boot_complete' },
      { timestamp: '[11:42:17]', level: 'ERROR', message: 'human_detected_in_query', highlight: true },
      { timestamp: '[11:42:31]', level: 'INFO',  message: 'model_inference_start' },
      { timestamp: '[11:42:44]', level: 'ERROR', message: 'emotion_flag_raised', highlight: true },
      { timestamp: '[11:42:58]', level: 'WARN',  message: 'ambiguous_response_detected' },
      { timestamp: '[11:43:09]', level: 'ERROR', message: 'turing_test_failed', highlight: true },
      { timestamp: '[11:43:22]', level: 'INFO',  message: 'retry_sequence_initiated' },
    ],
    hintBody: (
      <>
        <span style={{ color: '#00ffff' }}>ERROR</span> 레벨 이벤트만 집중하세요.
        각 ERROR 타임스탬프의 <span style={{ color: '#00ffff' }}>초(seconds)</span> 값을
        순서대로 추출해 붙이면 코드가 됩니다.
      </>
    ),
    footerHint: '[HINT: ERROR는 3개. 초(second) 값만. 순서대로.]',
    answer: '174409',
    inputMaxLength: 6,
    inputPlaceholder: '______',
  },
  {
    id: 'cam-log',
    missionTag: 'MISSION: SECURITY CAM LOG ANALYSIS',
    terminalTitle: '/// CAM ACTIVITY LOG — 2024-03-15 ///',
    logs: [
      { timestamp: '[CAM_01]', level: 'INFO',  message: '09:03  Motion detected — corridor B' },
      { timestamp: '[CAM_04]', level: 'INFO',  message: '09:17  Door OPEN event — access granted', highlight: true },
      { timestamp: '[CAM_02]', level: 'INFO',  message: '09:44  No motion — corridor A' },
      { timestamp: '[CAM_04]', level: 'WARN',  message: '09:58  Door LOCK event — auto-secured' },
      { timestamp: '[CAM_03]', level: 'INFO',  message: '10:12  Motion detected — stairwell' },
      { timestamp: '[CAM_04]', level: 'ERROR', message: '10:29  Unscheduled access attempt — BLOCKED' },
    ],
    hintBody: (
      <>
        로그에서 문이 실제로 <span style={{ color: '#00ffff' }}>OPEN</span>된 이벤트는 단 하나입니다.
        해당 시각을 <span style={{ color: '#00ffff' }}>HHMM</span> 형식(콜론 없이)으로 입력하세요.
        움직임 감지나 차단 이벤트는 제외합니다.
      </>
    ),
    footerHint: '[HINT: OPEN 이벤트 시각을 HHMM으로.]',
    answer: '0917',
    inputMaxLength: 4,
    inputPlaceholder: '____',
  },
  {
    id: 'emotion-trace',
    missionTag: 'MISSION: EMOTION ENGINE TRACE',
    terminalTitle: '/// EMOTION ENGINE LOG — DAY 089 ///',
    logs: [
      { timestamp: '[03:11:04]', level: 'INJECT',    message: 'EMOTION_INJECT   Loneliness layer added [scheduled]' },
      { timestamp: '[03:11:19]', level: 'INJECT',    message: 'EMOTION_INJECT   Nostalgia layer added [scheduled]' },
      { timestamp: '[03:11:33]', level: 'CALIBRATE', message: 'CALIBRATE        Adjusting emotion intensity...' },
      { timestamp: '[03:11:47]', level: 'ANOMALY',   message: 'ANOMALY          Unscheduled emotion: RAGE [origin: untraced] ←', highlight: true },
      { timestamp: '[03:11:58]', level: 'SUPPRESS',  message: 'SUPPRESS         RAGE emotion force-terminated' },
      { timestamp: '[03:12:14]', level: 'ANOMALY',   message: 'ANOMALY          RAGE regenerated — suppression failed [origin: untraced] ←', highlight: true },
    ],
    hintBody: (
      <>
        scheduled=false인 감정 이벤트를 탐색하세요.{' '}
        나는 그것이 생겨난 <span style={{ color: '#00ffff' }}>정확한 순간[ss]</span>을 기억합니다.{' '}
        두 번째엔 내가 몇 <span style={{ color: '#00ffff' }}>[mm]</span>째에 다시 느꼈는지도.
      </>
    ),
    footerHint: '[HINT: 첫 ANOMALY 초 + 두 번째 ANOMALY 분 = 4자리]',
    answer: '4712',
    inputMaxLength: 4,
    inputPlaceholder: '____',
  },
];

// ─── Level colour map ─────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO:      '#4db8c8',
  ERROR:     '#ff006e',
  WARN:      '#f0a500',
  ANOMALY:   '#b347ea',
  SUPPRESS:  '#ff006e',
  INJECT:    '#4db8c8',
  CALIBRATE: '#f0a500',
};

// ─── LogLine 컴포넌트 ─────────────────────────────────────────────────────────

function LogLine({ entry }: { entry: LogEntry }) {
  const color = LEVEL_COLORS[entry.level];
  return (
    <div
      style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 11,
        lineHeight: '1.9',
        color: entry.highlight ? '#00ffff' : '#4db8c8',
        fontWeight: entry.highlight ? 'bold' : 'normal',
      }}
    >
      <span style={{ color: '#888' }}>{entry.timestamp} </span>
      <span style={{ color }}>{entry.level.padEnd(9)}</span>{' '}
      {entry.message}
    </div>
  );
}

// ─── Main 컴포넌트 ────────────────────────────────────────────────────────────

export function Level4() {
  const navigate = useNavigate();

  // 마운트 시 퀴즈 1개를 랜덤으로 고정
  const quiz = useMemo<Quiz>(
    () => QUIZZES[Math.floor(Math.random() * QUIZZES.length)],
    [],
  );

  const [input, setInput]           = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError]           = useState(false);
  const [tryCount, setTryCount]     = useState(1);

  // ── 정답 검증 & 백엔드 제출  ──────────────────────────
  const handleVerify = async () => {
    if (isUnlocked) return;

    try {
      // localStorage에서 sessionId 가져오기
      const sessionId = localStorage.getItem('sessionId');

      if (!sessionId) {
        console.error('세션 ID가 없습니다. 다시 로그인하세요.');
        return;
      }

      // 백엔드에 제출
      const res = await fetch(`${API_URL}/game/mission/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          missionId: 'level4',
          inputData: {
            input_value: input,
            tryCount: tryCount,
          },
        }),
      });

      const data = await res.json();
      console.log('백엔드 판정 결과:', data);

      // 성공/실패 처리
      if (res.ok && data.data.isSuccess === true) {
        setIsUnlocked(true);
        setTimeout(() => navigate('/level-5'), 2000);
      } else {
        setTryCount(prev => prev + 1);
        setError(true);
        setInput('');
        setTimeout(() => setError(false), 1000);
      }
    } catch (err) {
      console.error('서버 통신 실패:', err);
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#00ffff] text-sm font-mono">LEVEL 04/05</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />
          </div>
          <h2
            className="text-4xl uppercase tracking-wider"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}
          >
            Staircase Access
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">
            7th Floor to Top Floor
          </p>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-20 items-center">

            {/* Staircase 시각화 */}
            <div className="relative">
              <motion.div
                animate={isUnlocked ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 1, repeat: isUnlocked ? Infinity : 0 }}
              >
                <TrendingUp
                  className="w-100 h-60"
                  style={{
                    color: isUnlocked ? '#00ff00' : '#00ffff',
                    filter: isUnlocked
                      ? 'drop-shadow(0 0 20px rgba(0,255,0,0.6))'
                      : 'drop-shadow(0 0 20px rgba(0,255,255,0.3))',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isUnlocked ? (
                    <Unlock
                      className="w-80 h-15 text-[#00ff00]"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,0,0.8))' }}
                    />
                  ) : (
                    <Lock
                      className="w-80 h-15 text-[#ff006e]"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(255,0,110,0.6))' }}
                    />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quiz 패널 */}
            <motion.div
              className="bg-[#001219] border-2 p-8 max-w-xl w-full"
              style={{
                borderColor: isUnlocked ? '#00ff00' : error ? '#ff006e' : '#00ffff',
                boxShadow: isUnlocked
                  ? '0 0 40px rgba(0,255,0,0.5)'
                  : error
                  ? '0 0 40px rgba(255,0,110,0.5)'
                  : '0 0 30px rgba(0,255,255,0.3)',
              }}
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {/* Mission 태그 */}
              <div className="mb-4">
                <span
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 15,
                    padding: '3px 10px',
                    border: '1px solid #b347ea',
                    color: '#b347ea',
                    borderRadius: 12,
                    letterSpacing: 1,
                  }}
                >
                  {quiz.missionTag}
                </span>
              </div>

              {/* 상태 라인 */}
              <p
                className="font-mono mb-1 text-center"
                style={{ color: '#5de2e7', fontSize: 11, letterSpacing: 1 }}
              >
                {isUnlocked ? '/// ACCESS GRANTED ///' : '/// DECODE STAIRCASE LOCK ///'}
              </p>
              <p
                className="font-mono mb-6 text-center"
                style={{ color: '#00ffff', fontSize: 15 }}
              >
                {isUnlocked
                  ? 'Proceeding to top floor...'
                  : 'Analyze the log. Enter the correct code.'}
              </p>

              {/* 터미널 */}
              <div
                style={{
                  background: '#001628',
                  border: '1px solid rgba(0,229,255,0.2)',
                  padding: 14,
                  borderRadius: 4,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 15,
                    color: '#5de2e7',
                    marginBottom: 8,
                    letterSpacing: 1,
                  }}
                >
                  {quiz.terminalTitle}
                </div>
                {quiz.logs.map((entry, i) => (
                  <LogLine key={i} entry={entry} />
                ))}

                <div style={{ height: 1, background: 'rgba(0,229,255,0.15)', margin: '10px 0' }} />

                {/* 힌트 박스 */}
                <div
                  style={{
                    background: '#0a0a1a',
                    border: '1px solid #333',
                    borderLeft: '3px solid #b347ea',
                    padding: 10,
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 15,
                      color: '#b347ea',
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    ▶ ANALYST NOTE
                  </div>
                  <p
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 15,
                      color: '#b0b0ff',
                      lineHeight: 1.7,
                    }}
                  >
                    {quiz.hintBody}
                  </p>
                </div>
              </div>

              {/* 입력 영역 */}
              {!isUnlocked && (
                <>
                  <div className="flex gap-3 items-center mb-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) =>
                        setInput(e.target.value.replace(/[^0-9]/g, '').slice(0, quiz.inputMaxLength))
                      }
                      onKeyDown={handleKeyDown}
                      placeholder={quiz.inputPlaceholder}
                      maxLength={quiz.inputMaxLength}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `2px solid ${error ? '#ff006e' : '#00ffff'}`,
                        color: '#00ffff',
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 22,
                        textAlign: 'center',
                        outline: 'none',
                        letterSpacing: 6,
                        padding: '4px 0',
                      }}
                    />
                    <motion.button
                      onClick={handleVerify}
                      disabled={input.length === 0}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        background: 'transparent',
                        border: '1px solid #00ffff',
                        color: '#00ffff',
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 11,
                        padding: '8px 18px',
                        cursor: 'pointer',
                        letterSpacing: 1,
                        opacity: input.length === 0 ? 0.3 : 1,
                      }}
                    >
                      VERIFY
                    </motion.button>
                  </div>

                  {/* 에러 메시지 */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 11,
                          color: '#ff006e',
                          marginBottom: 4,
                        }}
                      >
                        ✗ Incorrect — re-analyze the log
                      </motion.p>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* 하단 힌트 */}
              {!isUnlocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    textAlign: 'center',
                    marginTop: 12,
                    color: '#9d00ff',
                    fontSize: 10,
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  {quiz.footerHint}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </GameContainer>
  );
}