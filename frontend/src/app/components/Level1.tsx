import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api';

const QR_GRID = Array.from({ length: 20 * 20 }, (_, i) => {
  const x = i % 20;
  const y = Math.floor(i / 20);
  // leave centre area clear for the canvas
  if (x >= 5 && x <= 14 && y >= 5 && y <= 14) return false;
  return (x * 3 + y * 7 + x * y) % 3 !== 0;
});

// ─── Circle accuracy algorithm ────────────────────────────────────────────────
function measureCircleAccuracy(pts: { x: number; y: number }[]): number {
  if (pts.length < 20) return 0;

  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;

  const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const avgR = radii.reduce((s, r) => s + r, 0) / radii.length;
  if (avgR < 20) return 0;

  const variance = radii.reduce((s, r) => s + (r - avgR) ** 2, 0) / radii.length;
  const stdDev = Math.sqrt(variance);

  const first = pts[0];
  const last = pts[pts.length - 1];
  const closureGap = Math.hypot(last.x - first.x, last.y - first.y);
  const closureRatio = closureGap / avgR;

  const radiusScore = Math.max(0, 1 - stdDev / avgR);
  const closureScore = Math.max(0, 1 - closureRatio / 1.5);
  const coverage = Math.min(1, pts.length / 80);

  return (radiusScore * 0.6 + closureScore * 0.3 + coverage * 0.1) * 100;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Level1() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);

  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'drawing' | 'success' | 'fail'>('idle');
  const [attempts, setAttempts] = useState(0);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (status === 'success') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    points.current = [getPos(e, canvas)];
    setStatus('drawing');
    setScore(null);
    clearCanvas();

    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0,255,255,0.8)';
    ctx.shadowBlur = 8;
    ctx.moveTo(points.current[0].x, points.current[0].y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    points.current.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

 // async(비동기: 서버에 데이터를 요청하고 응답이 올 때까지 멈추지 않고 기다려줌)


  const endDraw = async () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const accuracy = measureCircleAccuracy(points.current);
    const rounded = Math.round(accuracy);
    const currentAttempt = attempts + 1;
    
    setScore(rounded);
    setAttempts(currentAttempt);

    try {
      // 로그인 시 저장한 세션 ID 호출
      const currentSessionId = localStorage.getItem('sessionId'); 

      if (!currentSessionId) {
        console.error("세션 ID가 없습니다. 다시 로그인하세요.");
        setStatus('fail');
        return;
      }

      // 서버에 판정 요청
      const res = await fetch(`${API_URL}/game/mission/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: currentSessionId, 
          missionId: 'level1',
          inputData: { 
            accuracy: rounded, 
            tryCount: currentAttempt 
          }
        }), 
      });

      const data = await res.json();
      console.log("백엔드 판정 결과:", data);

      // 서버가 성공(isSuccess: true)이라고 응답했을 때만 통과
      if (res.ok && data.data.isSuccess === true) { 
        setStatus('success');
        setTimeout(() => navigate('/level-2'), 2500);
      } else {
        setStatus('fail');
      }
    } catch (error) {
      console.error("서버 통신 실패:", error);
      setStatus('fail');
    }
  };



  const reset = () => {
    clearCanvas();
    points.current = [];
    setScore(null);
    setStatus('idle');
  };

  // Draw score arc overlay after scoring
  useEffect(() => {
    if (score === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(canvas.width, canvas.height) * 0.38;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (score / 100));
    ctx.strokeStyle = score >= 90 ? '#00ff00' : '#ff006e';
    ctx.lineWidth = 4;
    ctx.shadowColor = score >= 90 ? 'rgba(0,255,0,0.8)' : 'rgba(255,0,110,0.8)';
    ctx.shadowBlur = 12;
    ctx.stroke();
  }, [score]);

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#00ffff] text-sm font-mono">LEVEL 01/05</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />
          </div>
          <h2
            className="text-4xl uppercase tracking-wider"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}
          >
            Cipher Lock
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">First Floor - Biometric Override</p>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center gap-12">

          {/* QR background + canvas */}
          <div className="relative">
            {/* QR decorative grid */}
            <div
              className="absolute inset-0 grid pointer-events-none"
              style={{
                gridTemplateColumns: 'repeat(20, 1fr)',
                gap: '2px',
                padding: '2px',
                opacity: 0.25,
              }}
            >
              {QR_GRID.map((filled, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: filled ? '#00ffff' : 'transparent',
                    boxShadow: filled ? '0 0 2px rgba(0,255,255,0.5)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Canvas */}
            <motion.div
              style={{
                border: '2px solid',
                borderColor:
                  status === 'success'
                    ? '#00ff00'
                    : status === 'fail'
                    ? '#ff006e'
                    : '#00ffff',
                boxShadow:
                  status === 'success'
                    ? '0 0 40px rgba(0,255,0,0.5)'
                    : status === 'fail'
                    ? '0 0 40px rgba(255,0,110,0.5)'
                    : '0 0 30px rgba(0,255,255,0.3)',
                backgroundColor: '#001219',
                position: 'relative',
              }}
              animate={status === 'fail' ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="block cursor-crosshair"
                style={{ touchAction: 'none' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />

              {/* Idle ghost circle guide */}
              <AnimatePresence>
                {status === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  >
                    <motion.div
                      className="w-52 h-52 rounded-full border-2 border-dashed mb-4"
                      style={{ borderColor: 'rgba(0,255,255,0.3)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />
                    <p
                      className="text-[#00ffff] font-mono text-sm text-center px-4"
                      style={{ textShadow: '0 0 8px rgba(0,255,255,0.6)' }}
                    >
                      DRAW A PERFECT CIRCLE
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-6 w-64">
            {/* Score panel */}
            <div
              className="bg-[#001219] border-2 border-[#00ffff] p-6"
              style={{ boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}
            >
              <p className="text-[#ff00ff] font-mono text-xs mb-4">BIOMETRIC ANALYSIS</p>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-[#5de2e7] font-mono text-xs">CIRCULARITY</span>
                  <span
                    className="font-mono text-xs"
                    style={{
                      color: score !== null && score >= 90 ? '#00ff00' : '#ff006e',
                    }}
                  >
                    {score !== null ? `${score}%` : '--'}
                  </span>
                </div>
                <div className="h-2 bg-[#1a1f35] w-full overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{
                      backgroundColor:
                        score !== null && score >= 90 ? '#00ff00' : '#00ffff',
                      boxShadow: '0 0 8px rgba(0,255,255,0.5)',
                    }}
                    animate={{ width: score !== null ? `${Math.min(score, 100)}%` : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs font-mono mb-3">
                <span className="text-[#5de2e7]">THRESHOLD</span>
                <span className="text-[#ff00ff]">≥ 96%</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#5de2e7]">ATTEMPTS</span>
                <span className="text-[#00ffff]">{attempts}</span>
              </div>
            </div>

            {/* Status card */}
            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#001219] border-2 border-[#00ff00] p-4 text-center"
                  style={{ boxShadow: '0 0 20px rgba(0,255,0,0.4)' }}
                >
                  <CheckCircle className="w-8 h-8 text-[#00ff00] mx-auto mb-2" />
                  <p className="text-[#00ff00] font-mono text-sm">CIPHER CRACKED</p>
                  <p className="text-[#5de2e7] font-mono text-xs mt-1">Advancing...</p>
                </motion.div>
              )}

              {status === 'fail' && (
                <motion.div
                  key="fail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#001219] border-2 border-[#ff006e] p-4 text-center"
                  style={{ boxShadow: '0 0 20px rgba(255,0,110,0.4)' }}
                >
                  <XCircle className="w-8 h-8 text-[#ff006e] mx-auto mb-2" />
                  <p className="text-[#ff006e] font-mono text-sm">PATTERN REJECTED</p>
                  <p className="text-[#5de2e7] font-mono text-xs mt-1 mb-3">
                    Score: {score}% — need 96%
                  </p>
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 mx-auto px-4 py-2 border border-[#00ffff] text-[#00ffff] font-mono text-xs hover:bg-[#00ffff] hover:text-[#000814] transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    RETRY
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            <motion.p
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-[#9d00ff] font-mono text-xs text-center"
            >
              [DRAW SLOWLY &amp; CLOSE THE LOOP]
            </motion.p>
          </div>
        </div>
      </div>
    </GameContainer>
  );
}