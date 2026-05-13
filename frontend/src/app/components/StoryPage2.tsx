import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion } from 'motion/react';
import { Building2, Shield, AlertTriangle, Zap } from 'lucide-react';
import towerImage from "../../assets/background.jpeg";

export function StoryPage2() {
  const navigate = useNavigate();

  return (
    <GameContainer>
      <div className="h-full flex flex-col items-center justify-center p-12 relative">
        {/* Cyberpunk tower background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={towerImage}
            alt="Cyberpunk city"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#000814]/90 via-[#000814]/80 to-[#000814]/90" />
        </div>

        {/* Pulsing grid effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-full bg-[#00ffff]"
              style={{ top: `${i * 10}%` }}
              animate={{
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-5xl"
        >
          {/* Tower Visual */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h1 className="text-5xl mb-4 uppercase tracking-wider"
                style={{
                  color: '#ff00ff',
                  textShadow: '0 0 20px rgba(255,0,255,0.8), 0 0 40px rgba(255,0,255,0.4)',
                }}
              >
                Nova Robotics Tower
              </h1>
              <p className="text-[#5de2e7] text-xl font-mono">10 Floors of AI-Controlled Territory</p>
            </div>

            {/* Tower floors visualization */}
            <div className="flex justify-center gap-2 mb-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-16 h-12 border-2 border-[#ff006e] relative"
                  style={{
                    backgroundColor: 'rgba(255,0,110,0.1)',
                    boxShadow: '0 0 10px rgba(255,0,110,0.3)',
                  }}
                  animate={{
                    borderColor: ['#ff006e', '#ff00ff', '#ff006e'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: (9 - i) * 0.15,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#ff00ff] text-xs font-mono font-bold">F{10 - i}</span>
                  </div>
                  {/* Blinking lights */}
                  <motion.div
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00ffff]"
                    animate={{
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mission Brief */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-[#001219]/90 border-2 border-[#00ffff] p-8 backdrop-blur-sm mb-8"
            style={{ boxShadow: '0 0 40px rgba(0,255,255,0.4)' }}
          >
            <h2 className="text-3xl text-[#00ffff] mb-6 uppercase tracking-wide text-center">
              Mission Objectives
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-6 h-6 text-[#00ff00] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#00ff00] font-mono mb-1">INFILTRATE</p>
                  <p className="text-[#5de2e7] text-sm">Breach the ground floor security</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-[#00ff00] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#00ff00] font-mono mb-1">BYPASS</p>
                  <p className="text-[#5de2e7] text-sm">Override AI security protocols</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-[#ff00ff] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#ff00ff] font-mono mb-1">NAVIGATE</p>
                  <p className="text-[#5de2e7] text-sm">Ascend through each floor</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-[#ff006e] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#ff006e] font-mono mb-1">TERMINATE</p>
                  <p className="text-[#5de2e7] text-sm">Deploy the reset virus</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Warning and Entry */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="space-y-6"
          >
            <div className="bg-[#ff006e]/20 border-2 border-[#ff006e] p-4 backdrop-blur-sm">
              <p className="text-[#ff006e] font-mono text-center text-lg">
                <span className="text-[#ff00ff]">⚠ WARNING:</span> ARIA has complete control. 
                Every system will resist you. Stay sharp.
              </p>
            </div>

            {/* Start Level 1 Button */}
            <div className="flex justify-center">
              <motion.button
                onClick={() => navigate('/level-1')}
                className="px-16 py-5 bg-transparent border-4 border-[#00ff00] text-[#00ff00] text-2xl uppercase tracking-widest relative overflow-hidden group"
                style={{
                  boxShadow: '0 0 30px rgba(0,255,0,0.5)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-[#00ff00]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 font-bold">Open The Door</span>
                <span className="absolute inset-0 flex items-center justify-center text-[#000814] opacity-0 group-hover:opacity-100 z-20 text-2xl tracking-widest font-bold">
                  Open The Door
                </span>
              </motion.button>
            </div>

            <p className="text-center text-[#5de2e7] font-mono text-sm italic">
              The entrance awaits. Your company awaits. Time to take it back.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </GameContainer>
  );
}
