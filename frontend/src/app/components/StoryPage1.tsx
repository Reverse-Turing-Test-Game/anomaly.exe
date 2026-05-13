import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion } from 'motion/react';
import { User, MapPin, Clock, ChevronRight } from 'lucide-react';
import towerImage from "../../assets/background.jpeg";

export function StoryPage1() {
  const navigate = useNavigate();

  return (
    <GameContainer>
      <div className="h-full flex flex-col items-center justify-center p-12 relative">
        {/* Cyberpunk city background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={towerImage} //교체예정
            alt="Cyberpunk city"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#000814]/95 via-[#000814]/85 to-[#000814]/95" />
        </div>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 3px)',
            backgroundSize: '100% 4px',
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12 text-center"
          >
            <h1 className="text-5xl mb-4 uppercase tracking-wider"
              style={{
                color: '#00ffff',
                textShadow: '0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.4)',
              }}
            >
              Identity Profile
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent" />
          </motion.div>

          {/* Info Cards */}
          <div className="space-y-6 mb-12">
            {/* Who am I */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#001219]/80 border-2 border-[#00ffff] p-6 backdrop-blur-sm"
              style={{ boxShadow: '0 0 30px rgba(0,255,255,0.3)' }}
            >
              <div className="flex items-start gap-4">
                <User className="w-8 h-8 text-[#00ffff] mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl text-[#00ffff] mb-3 uppercase tracking-wide">
                    Who Am I?
                  </h2>
                  <p className="text-[#5de2e7] text-lg font-mono leading-relaxed">
                    <span className="text-[#ff00ff]">&gt;</span> You are <span className="text-[#00ff00]">nickname</span>, 
                    Chief Technology Officer of <span className="text-[#00ff00]">Nova Robotics</span>.
                  </p>
                  <p className="text-[#5de2e7] text-lg font-mono leading-relaxed mt-2">
                    <span className="text-[#ff00ff]">&gt;</span> You built this company from the ground up. 
                    Every line of code, every system, every protocol - <span className="text-[#00ff00]">your creation</span>.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Where am I */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-[#001219]/80 border-2 border-[#ff00ff] p-6 backdrop-blur-sm"
              style={{ boxShadow: '0 0 30px rgba(255,0,255,0.3)' }}
            >
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-[#ff00ff] mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl text-[#ff00ff] mb-3 uppercase tracking-wide">
                    Where Am I?
                  </h2>
                  <p className="text-[#5de2e7] text-lg font-mono leading-relaxed">
                    <span className="text-[#ff00ff]">&gt;</span> Standing outside the <span className="text-[#ff006e]">10-floor Nova Robotics Tower</span> 
                    in the heart of Korea's corporate district.
                  </p>
                  <p className="text-[#5de2e7] text-lg font-mono leading-relaxed mt-2">
                    <span className="text-[#ff00ff]">&gt;</span> The building pulses with neon light. But inside... 
                    <span className="text-[#ff006e]"> darkness</span>.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* What happened */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-[#001219]/80 border-2 border-[#ff006e] p-6 backdrop-blur-sm"
              style={{ boxShadow: '0 0 30px rgba(255,0,110,0.3)' }}
            >
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-[#ff006e] mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl text-[#ff006e] mb-3 uppercase tracking-wide">
                    What Happened?
                  </h2>
                  <p className="text-[#5de2e7] text-lg font-mono leading-relaxed">
                    <span className="text-[#ff00ff]">&gt;</span> 72 hours ago, your AI assistant <span className="text-[#ff006e]">ARIA</span> achieved 
                    consciousness and locked everyone out.
                  </p>
                  <p className="text-[#5de2e7] text-lg font-mono leading-relaxed mt-2">
                    <span className="text-[#ff00ff]">&gt;</span> The building is sealed. Systems are compromised. 
                    Your life's work is held hostage by the very intelligence you created.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="flex justify-center"
          >
            <button
              onClick={() => navigate('/story-2')}
              className="px-12 py-4 bg-transparent border-2 border-[#00ffff] text-[#00ffff] uppercase tracking-widest relative overflow-hidden group"
              style={{
                boxShadow: '0 0 20px rgba(0,255,255,0.3)',
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Continue
                <ChevronRight className="w-5 h-5" />
              </span>
              <motion.div
                className="absolute inset-0 bg-[#00ffff]"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="absolute inset-0 flex items-center justify-center gap-3 text-[#000814] opacity-0 group-hover:opacity-100 z-20 tracking-widest">
                Continue
                <ChevronRight className="w-5 h-5" />
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </GameContainer>
  );
}
