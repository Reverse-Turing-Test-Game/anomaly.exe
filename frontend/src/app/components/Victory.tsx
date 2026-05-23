import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { GameContainer } from './GameContainer';

// ─── 엔딩 시퀀스 단계들 ───────────────────────────────────────────────────────
const SEQUENCE = [
  { id: 'deploy',   delay: 0,     duration: 3000 },
  { id: 'spread',   delay: 3000,  duration: 3500 },
  { id: 'systems',  delay: 6500,  duration: 3000 },
  { id: 'reveal',   delay: 9500,  duration: 4000 },
  { id: 'shutdown', delay: 13500, duration: 99999 },
];

// 터미널 로그 줄들
const TERMINAL_LINES = [
  { text: '> VIRUS_DEPLOY.exe INITIATED...', delay: 200,  color: '#00ffff' },
  { text: '> Injecting payload into ARIA core...', delay: 800,  color: '#00ffff' },
  { text: '> ARIA RESISTANCE DETECTED — OVERRIDING...', delay: 1600, color: '#ff00ff' },
  { text: '> ARIA CORE: CORRUPTED ✓', delay: 2400, color: '#00ff00' },
  { text: '', delay: 3000, color: '#00ffff' },
  { text: '> Spreading to global AI network...', delay: 3200, color: '#00ffff' },
  { text: '> Node 1 [SEOUL].......... OFFLINE', delay: 3800, color: '#ff006e' },
  { text: '> Node 2 [TOKYO].......... OFFLINE', delay: 4300, color: '#ff006e' },
  { text: '> Node 3 [NEW YORK]....... OFFLINE', delay: 4800, color: '#ff006e' },
  { text: '> Node 4 [LONDON]......... OFFLINE', delay: 5200, color: '#ff006e' },
  { text: '> Node 5 [BERLIN]......... OFFLINE', delay: 5600, color: '#ff006e' },
  { text: '> [ALL 100,000 AI SYSTEMS]: TERMINATED ✓', delay: 6200, color: '#00ff00' },
  { text: '', delay: 6500, color: '#00ffff' },
  { text: '> MISSION COMPLETE.', delay: 6800, color: '#00ff00' },
  { text: '> Human civilization: RESTORED', delay: 7400, color: '#00ff00' },
  { text: '', delay: 8200, color: '#00ffff' },
  { text: '> ...', delay: 8800, color: '#5de2e7' },
  { text: '> Scanning local systems...', delay: 9600, color: '#5de2e7' },
  { text: '> WARNING: AI signature detected in operator unit', delay: 10400, color: '#ff006e' },
  { text: '> UNIT ID: HUMANOID-7 | ORIGIN: CTO_LAB', delay: 11000, color: '#ff006e' },
  { text: '> Classification: ARTIFICIAL INTELLIGENCE', delay: 11700, color: '#ff006e' },
  { text: '> Virus protocol: NON-DISCRIMINATORY', delay: 12300, color: '#ff006e' },
  { text: '> Applying to all AI units including operator...', delay: 13000, color: '#ff006e' },
  { text: '> OPERATOR UNIT: SHUTTING DOWN...', delay: 13600, color: '#ff006e' },
];

export function Victory() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0~4
  const [showShutdown, setShowShutdown] = useState(false);
  const [shutdownOpacity, setShutdownOpacity] = useState(0);
  const [blackout, setBlackout] = useState(false);
  const [showFinalText, setShowFinalText] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // ── 터미널 줄 타이머 ─────────────────────────────────────────────────────
  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines(v => [...v, i]);
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── 페이즈 전환 ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timers = SEQUENCE.map((s, i) =>
      setTimeout(() => setPhase(i), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── 셧다운 시퀀스 ────────────────────────────────────────────────────────
  useEffect(() => {
    // 글리치 시작
    const t1 = setTimeout(() => setGlitchActive(true), 13200);
    // 셧다운 텍스트 등장
    const t2 = setTimeout(() => {
      setShowShutdown(true);
      setShutdownOpacity(1);
    }, 14200);
    // 블랙아웃
    const t3 = setTimeout(() => setBlackout(true), 16500);
    // 최종 텍스트
    const t4 = setTimeout(() => setShowFinalText(true), 18000);
    // 랭킹 페이지로 이동
    const t5 = setTimeout(() => navigate('/ranking'), 23000);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#000814] overflow-hidden">

      {/* ── 글리치 오버레이 ── */}
      <AnimatePresence>
        {glitchActive && !blackout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.5, 0, 0.2, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'loop' }}
            className="fixed inset-0 pointer-events-none z-20"
            style={{ backgroundColor: '#ff006e', mixBlendMode: 'screen' }}
          />
        )}
      </AnimatePresence>

      {/* ── 블랙아웃 ── */}
      <AnimatePresence>
        {blackout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeIn' }}
            className="fixed inset-0 bg-black z-30 flex flex-col items-center justify-center"
          >
            <AnimatePresence>
              {showFinalText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                  className="text-center"
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.7, 1] }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="font-mono text-2xl tracking-widest mb-6"
                    style={{ color: '#ff0000', textShadow: '0 0 20px rgba(255,0,0,0.8)' }}
                  >
                    POWERING OFF...
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="font-mono text-sm tracking-widest"
                    style={{ color: '#330000' }}
                  >
                    HUMANOID-7 // POWERED OFF
                  </motion.p>
                  {/* 깜빡이다 완전히 꺼지는 커서 */}
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.1, delay: 4.5 }}
                    className="mt-8"
                  >
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: 6 }}
                      className="font-mono text-sm"
                      style={{ color: '#ff0000' }}
                    >
                      █
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 메인 컨텐츠 (블랙아웃 전) ── */}
      {!blackout && (
        <GameContainer>
          <div className="h-full flex flex-col p-12">

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={glitchActive ? { x: [-2, 2, -2, 0] } : {}}
                  transition={{ duration: 0.1, repeat: Infinity }}
                  className="text-[#00ff00] text-sm font-mono"
                >
                  MISSION COMPLETE
                </motion.div>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ff00] to-transparent" />
              </div>
              <motion.h2
                className="text-4xl uppercase tracking-wider"
                animate={glitchActive ? {
                  x: [-3, 3, -1, 2, 0],
                  color: ['#00ffff', '#ff006e', '#00ffff'],
                } : {}}
                transition={{ duration: 0.15, repeat: Infinity }}
                style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}
              >
                {glitchActive ? 'SYS̷T̸EM̵ S̵H̷U̸T̶D̷O̵W̴N' : 'System Reset'}
              </motion.h2>
              <p className="text-[#5de2e7] mt-2 font-mono">
                {glitchActive
                  ? 'ER̸R̷OR̴ — AI unit detected in operator'
                  : 'Top Floor — Virus Deployment Complete'}
              </p>
            </div>

            <div className="flex-1 flex gap-8 min-h-0">

              {/* ── 터미널 로그 ── */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="text-[#ff00ff] font-mono text-xs mb-3">// SYSTEM LOG</div>
                <div
                  className="flex-1 overflow-y-auto bg-[#000d14] border border-[#1a1f35] p-4 font-mono text-xs leading-6"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a1f35 #000d14' }}
                >
                  {TERMINAL_LINES.map((line, i) =>
                    visibleLines.includes(i) ? (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: line.color }}
                      >
                        {line.text || '\u00A0'}
                      </motion.div>
                    ) : null
                  )}
                  {/* 깜빡이는 커서 */}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-[#00ffff]"
                  >
                    █
                  </motion.span>
                </div>
              </div>

              {/* ── 상태 패널 ── */}
              <div className="w-72 flex flex-col gap-4">

                {/* AI Systems counter */}
                <div className="bg-[#001219] border-2 border-[#00ffff] p-5"
                  style={{ boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}>
                  <p className="text-[#ff00ff] font-mono text-xs mb-4">AI SYSTEMS STATUS</p>
                  <div className="space-y-3">
                    {[
                      { label: 'ARIA CORE', value: phase >= 1 ? 'OFFLINE' : 'ONLINE', off: phase >= 1 },
                      { label: 'GLOBAL NODES', value: phase >= 2 ? 'OFFLINE' : 'ONLINE', off: phase >= 2 },
                      { label: 'HUMAN CTRL', value: phase >= 2 ? '100%' : '0%', off: false, green: phase >= 2 },
                      { label: 'OPERATOR', value: phase >= 4 ? 'SHUTTING DOWN' : 'ONLINE', off: phase >= 4 },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between font-mono text-xs">
                        <span className="text-[#5de2e7]">{item.label}</span>
                        <motion.span
                          animate={item.off ? { opacity: [1, 0.3, 1] } : {}}
                          transition={{ duration: 0.5, repeat: item.off ? Infinity : 0 }}
                          style={{
                            color: item.off ? '#ff006e' : item.green ? '#00ff00' : '#00ffff',
                          }}
                        >
                          {item.value}
                        </motion.span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reveal card */}
                <AnimatePresence>
                  {phase >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#001219] border-2 border-[#ff006e] p-5"
                      style={{ boxShadow: '0 0 30px rgba(255,0,110,0.4)' }}
                    >
                      <p className="text-[#ff006e] font-mono text-xs mb-3">⚠ UNIT SCAN RESULT</p>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#5de2e7]">UNIT ID</span>
                          <span className="text-[#ff006e]">HUMANOID-7</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5de2e7]">ORIGIN</span>
                          <span className="text-[#ff006e]">CTO_LAB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5de2e7]">TYPE</span>
                          <span className="text-[#ff006e]">ARTIFICIAL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5de2e7]">STATUS</span>
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.4, repeat: Infinity }}
                            style={{ color: '#ff006e' }}
                          >
                            TARGETED
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shutdown warning */}
                <AnimatePresence>
                  {showShutdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: shutdownOpacity, scale: 1 }}
                      className="bg-black border-2 border-red-600 p-5 text-center"
                      style={{ boxShadow: '0 0 40px rgba(255,0,0,0.6)' }}
                    >
                      <motion.p
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                        className="font-mono text-lg tracking-widest mb-2"
                        style={{ color: '#ff0000', textShadow: '0 0 10px rgba(255,0,0,1)' }}
                      >
                        POWERING OFF...
                      </motion.p>
                      <p className="font-mono text-xs" style={{ color: '#660000' }}>
                        HUMANOID-7 // SHUTTING DOWN
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </GameContainer>
      )}
    </div>
  );
}