import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, RefreshCw, User } from 'lucide-react';

// ─── 타입 ─────────────────────────────────────────────────────────────────────
interface RankEntry {
  rank: number;
  nickname: string;
  score: number;
}

interface MyRank {
  rank: number;
  nickname: string;
  score: number;
}

// ─── 백엔드 연결 전 목업 데이터 ───────────────────────────────────────────────
const MOCK_TOP3: RankEntry[] = [
  { rank: 1, nickname: 'SHADOW_X',  score: 9800 },
  { rank: 2, nickname: 'CYBER_WOLF',  score: 8650 },
  { rank: 3, nickname: 'NEON_GHOST', score: 7400 },
];

const MOCK_MY_RANK: MyRank = {
  rank: 12,
  nickname: 'YOU',
  score: 4200,
};

// ─── TODO: 백엔드 연결 시 이 함수들만 교체하면 됨 ─────────────────────────────
async function fetchTop3(): Promise<RankEntry[]> {
  // 백엔드 연결 후:
  // const res = await fetch('https://your-backend.com/api/ranking/top3');
  // return await res.json();
  await new Promise((r) => setTimeout(r, 1000)); // 로딩 시뮬레이션
  return MOCK_TOP3;
}


// ─── 등수별 스타일 ─────────────────────────────────────────────────────────────
const RANK_STYLES = [
  {
    border: '#FFD700',
    glow: 'rgba(255,215,0,0.5)',
    bg: 'rgba(255,215,0,0.08)',
    icon: Crown,
    iconColor: '#FFD700',
    label: '1ST',
    size: 'text-5xl',
  },
  {
    border: '#C0C0C0',
    glow: 'rgba(192,192,192,0.4)',
    bg: 'rgba(192,192,192,0.06)',
    icon: Medal,
    iconColor: '#C0C0C0',
    label: '2ND',
    size: 'text-4xl',
  },
  {
    border: '#CD7F32',
    glow: 'rgba(205,127,50,0.4)',
    bg: 'rgba(205,127,50,0.06)',
    icon: Trophy,
    iconColor: '#CD7F32',
    label: '3RD',
    size: 'text-3xl',
  },
];

// ─── 숫자 카운트업 애니메이션 ──────────────────────────────────────────────────
function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{current.toLocaleString()}</>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Ranking() {
  const navigate = useNavigate();

  const [top3, setTop3] = useState<RankEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 로컬스토리지에서 플레이어 정보 가져오기
  const player = (() => {
    try {
      return JSON.parse(localStorage.getItem('player') || '{}');
    } catch {
      return {};
    }
  })();

  const loadRanking = async () => {
    setIsLoading(true);
    setError(false);
    try {

      setTop3(top3);
      setMyRank(myRank);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#00ffff] text-sm font-mono">MISSION DEBRIEF</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />
            <motion.button
              onClick={loadRanking}
              disabled={isLoading}
              className="flex items-center gap-2 text-[#5de2e7] font-mono text-xs border border-[#1a1f35] px-3 py-1 hover:border-[#00ffff] hover:text-[#00ffff] transition-colors disabled:opacity-40"
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
              >
                <RefreshCw className="w-3 h-3" />
              </motion.div>
              REFRESH
            </motion.button>
          </div>
          <h2 className="text-4xl uppercase tracking-wider"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
            Global Rankings
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">
            Operation Reset — Agent Performance Index
          </p>
        </div>

        {/* ── Loading ── */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-2 border-t-transparent rounded-full"
                style={{ borderColor: '#00ffff', borderTopColor: 'transparent' }}
              />
              <p className="text-[#00ffff] font-mono text-sm tracking-widest animate-pulse">
                RETRIEVING RANKING DATA...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        {!isLoading && error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center border-2 border-[#ff006e] p-8"
              style={{ boxShadow: '0 0 20px rgba(255,0,110,0.3)' }}>
              <p className="text-[#ff006e] font-mono mb-4">⚠ FAILED TO RETRIEVE DATA</p>
              <button onClick={loadRanking}
                className="px-6 py-2 border border-[#00ffff] text-[#00ffff] font-mono text-sm hover:bg-[#00ffff] hover:text-[#000814] transition-colors">
                RETRY
              </button>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        {!isLoading && !error && (
          <div className="flex-1 flex flex-col gap-8 min-h-0">

            {/* TOP 3 */}
            <div>
              <p className="text-[#ff00ff] font-mono text-xs tracking-widest mb-5">
                // TOP AGENTS
              </p>

              {/* 1등 크게, 2~3등 나란히 */}
              <div className="space-y-4">

                {/* 1등 */}
                {top3[0] && (() => {
                  const style = RANK_STYLES[0];
                  const Icon = style.icon;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative border-2 p-6 flex items-center gap-6"
                      style={{
                        borderColor: style.border,
                        backgroundColor: style.bg,
                        boxShadow: `0 0 30px ${style.glow}`,
                      }}
                    >
                      {/* 왕관 */}
                      <div className="flex-shrink-0 w-16 h-16 border-2 flex items-center justify-center"
                        style={{ borderColor: style.border, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <Icon className="w-8 h-8" style={{ color: style.iconColor,
                          filter: `drop-shadow(0 0 8px ${style.iconColor})` }} />
                      </div>

                      {/* 등수 */}
                      <div className="flex-shrink-0 text-center w-16">
                        <p className={`font-mono font-bold ${style.size}`}
                          style={{ color: style.border, textShadow: `0 0 10px ${style.glow}` }}>
                          {style.label}
                        </p>
                      </div>

                      {/* 닉네임 + ID */}
                      <div className="flex-1">
                        <p className="font-mono text-2xl tracking-widest mb-1"
                          style={{ color: style.border }}>
                          {top3[0].nickname}
                        </p>
                        <p className="font-mono text-xs opacity-50"
                          style={{ color: style.border }}>
                        </p>
                      </div>

                      {/* 점수 */}
                      <div className="text-right">
                        <p className="font-mono text-3xl font-bold"
                          style={{ color: style.border, textShadow: `0 0 15px ${style.glow}` }}>
                          <CountUp target={top3[0].score} duration={1200} />
                        </p>
                        <p className="font-mono text-xs opacity-50" style={{ color: style.border }}>
                          POINTS
                        </p>
                      </div>

                      {/* 반짝임 */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ opacity: [0, 0.05, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ backgroundColor: style.border }}
                      />
                    </motion.div>
                  );
                })()}

                {/* 2등 3등 */}
                <div className="grid grid-cols-2 gap-4">
                  {top3.slice(1, 3).map((entry, i) => {
                    const style = RANK_STYLES[i + 1];
                    const Icon = style.icon;
                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="border-2 p-5 flex flex-col gap-3"
                        style={{
                          borderColor: style.border,
                          backgroundColor: style.bg,
                          boxShadow: `0 0 20px ${style.glow}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: style.border }}>
                            <Icon className="w-5 h-5" style={{ color: style.iconColor }} />
                          </div>
                          <span className={`font-mono font-bold ${style.size}`}
                            style={{ color: style.border }}>
                            {style.label}
                          </span>
                        </div>
                        <div>
                          <p className="font-mono text-lg tracking-wider"
                            style={{ color: style.border }}>
                            {entry.nickname}
                          </p>

                        </div>
                        <p className="font-mono text-2xl font-bold"
                          style={{ color: style.border }}>
                          <CountUp target={entry.score} duration={1400} />
                          <span className="text-xs ml-1 opacity-60">PTS</span>
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── 내 순위 ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-[#ff00ff] font-mono text-xs tracking-widest mb-4">
                // YOUR RANKING
              </p>

              {myRank ? (
                <div className="border-2 border-[#00ffff] p-5 flex items-center gap-5"
                  style={{ boxShadow: '0 0 20px rgba(0,255,255,0.25)', backgroundColor: 'rgba(0,255,255,0.05)' }}>

                  {/* 유저 아이콘 */}
                  <div className="w-12 h-12 border-2 border-[#00ffff] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(0,255,255,0.1)' }}>
                    <User className="w-6 h-6 text-[#00ffff]" />
                  </div>

                  {/* 등수 */}
                  <div className="flex-shrink-0 text-center w-14">
                    <p className="font-mono text-3xl font-bold text-[#00ffff]"
                      style={{ textShadow: '0 0 10px rgba(0,255,255,0.7)' }}>
                      #{myRank.rank}
                    </p>
                  </div>

                  {/* 구분선 */}
                  <div className="w-px h-12 bg-[#1a1f35]" />

                  {/* 닉네임 */}
                  <div className="flex-1">
                    <p className="font-mono text-xl text-[#00ffff] tracking-widest">
                      {myRank.nickname || player.nickname || 'UNKNOWN'}
                    </p>
                  </div>

                  {/* 점수 */}
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold text-[#00ffff]"
                      style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                      <CountUp target={myRank.score} duration={1000} />
                    </p>
                    <p className="font-mono text-xs text-[#5de2e7] opacity-60">POINTS</p>
                  </div>

                  {/* TOP3 안에 있으면 배지 */}
                  {myRank.rank <= 3 && (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="px-3 py-1 border border-[#00ff00] text-[#00ff00] font-mono text-xs"
                      style={{ boxShadow: '0 0 8px rgba(0,255,0,0.4)' }}
                    >
                      TOP 3
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="border border-[#1a1f35] p-4 text-center">
                  <p className="text-[#5de2e7] font-mono text-sm opacity-50">
                    No ranking data found for your agent
                  </p>
                </div>
              )}
            </motion.div>

            {/* ── 하단 버튼 ── */}
            <div className="flex gap-4 mt-auto">
              <motion.button
                onClick={() => navigate('/')}
                className="flex-1 py-3 border-2 border-[#1a1f35] text-[#5de2e7] font-mono text-sm hover:border-[#00ffff] hover:text-[#00ffff] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← MAIN MENU
              </motion.button>
              <motion.button
                onClick={() => navigate('/register')}
                className="flex-1 py-3 border-2 border-[#ff00ff] text-[#ff00ff] font-mono text-sm hover:bg-[#ff00ff] hover:text-[#000814] transition-colors"
                style={{ boxShadow: '0 0 15px rgba(255,0,255,0.2)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                PLAY AGAIN →
              </motion.button>
            </div>

          </div>
        )}
      </div>
    </GameContainer>
  );
}