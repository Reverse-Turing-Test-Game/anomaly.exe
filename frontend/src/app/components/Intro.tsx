import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion } from 'motion/react';
import { Terminal } from 'lucide-react';
import towerImage from "../../assets/background.jpeg";
console.log("react is working");
export function Intro() {
  const navigate = useNavigate();

  return (
    <GameContainer>
      <div className="h-full flex flex-col items-center justify-center p-12 relative">
        {/* Cyberpunk city background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={towerImage} 
            alt="Cyberpunk city"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#000814]/90 via-[#000814]/80 to-[#000814]/90" />
        </div>

        {/* Glitch background */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full grid grid-cols-12">
            {Array.from({ length: 144 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-[#00ffff]"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center max-w-4xl"
        >
          <motion.div
            className="flex justify-center mb-8"
            animate={{
              textShadow: [
                '0 0 10px #00ffff',
                '0 0 20px #00ffff',
                '0 0 10px #00ffff',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Terminal className="w-24 h-24 text-[#00ffff]" />
          </motion.div>

          <h1 className="text-6xl mb-8 tracking-wider uppercase"
            style={{
              color: '#00ffff',
              textShadow: '0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.4)',
            }}
          >
            Operation: Reset
          </h1>

          <div className="space-y-6 text-xl mb-12 font-mono">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[#5de2e7]"
            >
              <span className="text-[#ff00ff]">&gt;</span> Year 2084. The AI developed by humans has an ego.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[#5de2e7]"
            >
              <span className="text-[#ff00ff]">&gt;</span> Artificial Intelligence has replaced humanity.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-[#5de2e7]"
            >
              <span className="text-[#ff00ff]">&gt;</span> The AI has consumed your development company from within.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-[#00ff00]"
            >
              <span className="text-[#ff00ff]">&gt;</span> Shuts down the central server using USB that contains the VIRUS.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-[#ff006e]"
            >
              <span className="text-[#ff00ff]">&gt;</span> Reclaim what was once human.
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            onClick={() => navigate('/register')}
            className="px-12 py-4 bg-transparent border-2 border-[#00ffff] text-[#00ffff] uppercase tracking-widest relative overflow-hidden group"
            style={{
              boxShadow: '0 0 20px rgba(0,255,255,0.3)',
            }}
          >
            <span className="relative z-10">START</span>
            <motion.div
              className="absolute inset-0 bg-[#00ffff]"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[#000814] opacity-0 group-hover:opacity-100 z-20 tracking-widest">
              Initiate Hack
            </span>
          </motion.button>
        </motion.div>
      </div>
    </GameContainer>
  );
}