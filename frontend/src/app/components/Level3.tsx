const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Terminal } from 'lucide-react';


const TARGET_FLOOR = 7;
const MIN_FLOOR = 1;
const MAX_FLOOR = 10;
const TOTAL_FLOORS = 10;

// Speed 
function getInterval(floor: number): number {
  const distToTarget = Math.abs(TARGET_FLOOR - floor);
  if (distToTarget >= 5) return 90;
  if (distToTarget === 4) return 85;
  if (distToTarget === 3) return 100;
  if (distToTarget === 2) return 120;
  if (distToTarget === 1) return 130;
  return 120; 

}

type GameState = 'idle' | 'moving' | 'success' | 'fail' | 'advancing';

export function Level3() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const floorRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<GameState>('idle');

  stateRef.current = gameState;

  const stopElevator = useCallback(async () => { 
  if (stateRef.current !== 'moving') return;
  if (timerRef.current) clearTimeout(timerRef.current);

  const stopped = floorRef.current;
  const currentAttempts = attempts + 1; // 이번 시도 포함 시도 횟수
  
  setStoppedAt(stopped);
  setAttempts(currentAttempts);

  if (stopped === TARGET_FLOOR) {
    // 성공 시 서버 전송
    try {
      const currentSessionId = localStorage.getItem('sessionId');
      const res = await fetch(`${API_URL}/game/mission/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          missionId: 'level3',
          inputData: { 
            stoppedFloor: stopped, 
            attemptCount: currentAttempts 
          }
        })
      });

      const result = await res.json();

      if (res.ok && result.data.isSuccess) {
        setGameState('success');
        setDoorsOpen(true);
        setTimeout(() => {
          setGameState('advancing');
          setTimeout(() => navigate('/level-4'), 2000);
        }, 2500);
      } else {
        setGameState('fail'); // 서버 판정 실패 시
      }
    } catch (error) {
      console.error("서버 통신 에러:", error);
      setGameState('fail');
    }
  } else {
    // 7층이 아니면 기존 실패 로직
    setGameState('fail');
    setTimeout(() => {
      setGameState('idle');
      setCurrentFloor(1);
      floorRef.current = 1;
      setStoppedAt(null);
      setDoorsOpen(false);
    }, 2000);
  }
}, [attempts, navigate]);


  // Tick the elevator up
  const scheduleTick = useCallback(() => {
    if (stateRef.current !== 'moving') return;

    const nextFloor = floorRef.current + 1;

    if (nextFloor > MAX_FLOOR) {
      // Overshot — fail
      stopElevator();
      return;
    }

    const delay = getInterval(floorRef.current);
    timerRef.current = setTimeout(() => {
      if (stateRef.current !== 'moving') return;
      floorRef.current = nextFloor;
      setCurrentFloor(nextFloor);

      if (nextFloor >= MAX_FLOOR) {
        stopElevator();
      } else {
        scheduleTick();
      }
    }, delay);
  }, [stopElevator]);

  const startElevator = () => {
    if (gameState !== 'idle') return;
    floorRef.current = 1;
    setCurrentFloor(1);
    setStoppedAt(null);
    setDoorsOpen(false);
    setGameState('moving');
  };

  useEffect(() => {
    if (gameState === 'moving') {
      scheduleTick();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, scheduleTick]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'idle') startElevator();
        else if (gameState === 'moving') stopElevator();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, stopElevator]);

  const floorPct = ((currentFloor - MIN_FLOOR) / (MAX_FLOOR - MIN_FLOOR)) * 100;

  const statusColor =
    gameState === 'success' || gameState === 'advancing'
      ? '#00ff00'
      : gameState === 'fail'
      ? '#ff006e'
      : '#00ffff';

  const boxShadow =
    gameState === 'success' || gameState === 'advancing'
      ? '0 0 40px rgba(0,255,0,0.5)'
      : gameState === 'fail'
      ? '0 0 40px rgba(255,0,110,0.5)'
      : '0 0 30px rgba(0,255,255,0.3)';

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#00ffff] text-sm font-mono">LEVEL 03/05</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />
          </div>
          <h2 className="text-4xl uppercase tracking-wider"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
            Elevator Access
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">
            AI Identification Protocol — Destination: 7th Floor
          </p>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center gap-12">

          {/* ── Elevator shaft ── */}
          <div className="flex flex-col items-center">
            <div className="text-[#00ffff] font-mono text-sm mb-4 tracking-widest">
              FLOOR INDICATOR
            </div>

            <div className="relative h-[600px] w-24 border-2 border-[#00ffff] bg-[#001219]"
              style={{ boxShadow: '0 0 20px rgba(0,255,255,0.3)' }}>

              {/* Floor markers */}
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((floor, idx) => (
                <div key={floor}
                  className="absolute w-full flex items-center justify-center border-b border-[#1a1f35]"
                  style={{ top: `${idx * 60}px`, height: '60px' }}>

                  {/* Target floor highlight */}
                  {floor === TARGET_FLOOR && (
                    <motion.div
                      className="absolute inset-0"
                      style={{ backgroundColor: 'rgba(255,0,255,0.06)' }}
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}

                  <span className="font-mono relative z-10"
                    style={{
                      color:
                        currentFloor === floor
                          ? statusColor
                          : floor === TARGET_FLOOR
                          ? '#ff00ff'
                          : '#5de2e7',
                      textShadow:
                        currentFloor === floor
                          ? `0 0 10px ${statusColor}`
                          : floor === TARGET_FLOOR
                          ? '0 0 8px rgba(255,0,255,0.6)'
                          : 'none',
                      fontSize: floor === TARGET_FLOOR ? '18px' : '14px',
                      fontWeight: floor === TARGET_FLOOR ? 'bold' : 'normal',
                    }}>
                    {floor}
                    {floor === TARGET_FLOOR && (
                      <span className="ml-1 text-[10px] text-[#ff00ff]">★</span>
                    )}
                  </span>
                </div>
              ))}

              {/* Elevator cab */}
              <motion.div
                className="absolute left-0 right-0 flex items-center justify-center"
                style={{
                  height: '58px',
                  backgroundColor:
                    gameState === 'success' || gameState === 'advancing'
                      ? 'rgba(0,255,0,0.3)'
                      : gameState === 'fail'
                      ? 'rgba(255,0,110,0.3)'
                      : 'rgba(0,255,0,0.2)',
                  boxShadow:
                    gameState === 'success' || gameState === 'advancing'
                      ? '0 0 20px rgba(0,255,0,0.6)'
                      : gameState === 'fail'
                      ? '0 0 20px rgba(255,0,110,0.6)'
                      : '0 0 20px rgba(0,255,0,0.6)',
                  borderTop: '2px solid',
                  borderBottom: '2px solid',
                  borderColor:
                    gameState === 'success' || gameState === 'advancing'
                      ? '#00ff00'
                      : gameState === 'fail'
                      ? '#ff006e'
                      : '#00ff00',
                }}
                animate={{
                  top: `${(TOTAL_FLOORS - currentFloor) * 60 + 1}px`,
                }}
                transition={{ duration: 0.15, ease: 'linear' }}
              >
                {/* Elevator doors */}
                <div className="relative w-full h-full overflow-hidden flex">
                  {/* Left door */}
                  <motion.div
                    className="h-full bg-[#001219] border-r border-[#00ffff] flex-1"
                    animate={{ width: doorsOpen ? '0%' : '50%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{ minWidth: 0 }}
                  />
                  {/* Center — show arrow or floor when doors closed */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {gameState === 'moving' && (
                      <ArrowUp className="w-5 h-5" style={{ color: '#00ff00' }} />
                    )}
                    {(gameState === 'success' || gameState === 'advancing') && doorsOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[#00ff00] font-mono text-xs font-bold">
                        ✓
                      </motion.span>
                    )}
                  </div>
                  {/* Right door */}
                  <motion.div
                    className="h-full bg-[#001219] border-l border-[#00ffff] flex-1"
                    animate={{ width: doorsOpen ? '0%' : '50%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{ minWidth: 0 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Speed indicator below shaft */}
            <div className="mt-4 w-24">
              <div className="text-[#5de2e7] font-mono text-xs text-center mb-1">SPEED</div>
              <div className="h-1.5 bg-[#1a1f35] w-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: '#ff00ff', boxShadow: '0 0 6px rgba(255,0,255,0.7)' }}
                  animate={{
                    width: gameState === 'moving'
                      ? `${Math.min(100, ((700 - getInterval(currentFloor)) / 580) * 100)}%`
                      : '0%'
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* ── Control panel ── */}
          <div className="flex flex-col items-center">
            <motion.div
              className="bg-[#001219] border-2 p-8 w-96"
              style={{ borderColor: statusColor, boxShadow }}
              animate={gameState === 'fail' ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {/* Status bar */}
              <div className="flex items-center gap-2 mb-6">
                <Terminal className="w-6 h-6 text-[#ff00ff]" />
                <span className="text-[#ff00ff] font-mono text-sm">
                  {gameState === 'idle' && 'AWAITING AUTHORIZATION'}
                  {gameState === 'moving' && 'ELEVATOR IN MOTION'}
                  {gameState === 'success' && 'FLOOR 7 — ACCESS GRANTED'}
                  {gameState === 'fail' && `STOPPED AT FLOOR ${stoppedAt} — DENIED`}
                  {gameState === 'advancing' && 'PROCEEDING TO HQ...'}
                </span>
              </div>

              {/* Big floor display */}
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  className="w-32 h-32 border-2 flex items-center justify-center"
                  style={{
                    borderColor: statusColor,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    boxShadow: `0 0 20px ${statusColor}55`,
                  }}
                  animate={gameState === 'moving' ? { borderColor: ['#00ffff', '#ff00ff', '#00ffff'] } : {}}
                  transition={{ duration: 0.4, repeat: Infinity }}
                >
                  <motion.span
                    key={currentFloor}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono"
                    style={{
                      fontSize: '56px',
                      color: statusColor,
                      textShadow: `0 0 20px ${statusColor}`,
                      fontWeight: 'bold',
                    }}
                  >
                    {currentFloor}
                  </motion.span>
                </motion.div>
              </div>

              {/* Target reminder */}
              <div className="text-center mb-6">
                <p className="text-[#5de2e7] font-mono text-xs">
                  TARGET FLOOR:{' '}
                  <span className="text-[#ff00ff] font-bold">7</span>
                  {'  '}|{'  '}ATTEMPTS:{' '}
                  <span className="text-[#00ffff]">{attempts}</span>
                </p>
              </div>

              {/* Timing hint bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#5de2e7]">PRECISION WINDOW</span>
                  <span style={{ color: '#ff00ff' }}>FLOOR 7 ONLY</span>
                </div>
                <div className="h-3 bg-[#1a1f35] w-full relative overflow-hidden">
                  {/* target zone highlight */}
                  <div className="absolute h-full bg-[rgba(255,0,255,0.3)]"
                    style={{
                      left: `${((TARGET_FLOOR - 1 - MIN_FLOOR) / (MAX_FLOOR - MIN_FLOOR)) * 100}%`,
                      width: `${(1 / (MAX_FLOOR - MIN_FLOOR)) * 100}%`,
                    }} />
                  {/* current position cursor */}
                  <motion.div
                    className="absolute top-0 h-full w-1"
                    style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
                    animate={{ left: `${floorPct}%` }}
                    transition={{ duration: 0.15, ease: 'linear' }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono mt-1 text-[#1a1f35]">
                  <span className="text-[#5de2e7]">F1</span>
                  <span className="text-[#5de2e7]">F10</span>
                </div>
              </div>

              {/* Main action button */}
              <AnimatePresence mode="wait">
                {gameState === 'idle' && (
                  <motion.button
                    key="start"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={startElevator}
                    className="w-full py-4 border-2 border-[#00ffff] text-[#00ffff] font-mono text-lg tracking-widest hover:bg-[#00ffff] hover:text-[#000814] transition-colors"
                    style={{ boxShadow: '0 0 15px rgba(0,255,255,0.3)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ▶ START ELEVATOR
                  </motion.button>
                )}

                {gameState === 'moving' && (
                  <motion.button
                    key="stop"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={stopElevator}
                    className="w-full py-4 border-2 font-mono text-lg tracking-widest transition-colors"
                    style={{
                      borderColor: '#ff006e',
                      color: '#ff006e',
                      backgroundColor: 'rgba(255,0,110,0.1)',
                      boxShadow: '0 0 20px rgba(255,0,110,0.4)',
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,0,110,0.25)', scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ⬛ STOP
                  </motion.button>
                )}

                {gameState === 'success' && (
                  <motion.div key="success"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="w-full py-4 border-2 border-[#00ff00] text-[#00ff00] font-mono text-lg tracking-widest text-center"
                    style={{ boxShadow: '0 0 20px rgba(0,255,0,0.5)' }}>
                    ✓ DOORS OPENING
                  </motion.div>
                )}

                {gameState === 'advancing' && (
                  <motion.div key="advancing"
                    initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-full py-4 border-2 border-[#00ff00] text-[#00ff00] font-mono text-sm tracking-widest text-center"
                    style={{ boxShadow: '0 0 20px rgba(0,255,0,0.5)' }}>
                    PROCEEDING TO LEVEL 4...
                  </motion.div>
                )}

                {gameState === 'fail' && (
                  <motion.div key="fail"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="w-full py-4 border-2 border-[#ff006e] text-[#ff006e] font-mono text-sm tracking-widest text-center"
                    style={{ boxShadow: '0 0 20px rgba(255,0,110,0.5)' }}>
                    ✗ WRONG FLOOR — RESETTING...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spacebar hint */}
              {(gameState === 'idle' || gameState === 'moving') && (
                <motion.p
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center text-[#9d00ff] font-mono text-xs mt-4">
                  [SPACEBAR also works]
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </GameContainer>
  );
}