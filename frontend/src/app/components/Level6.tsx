import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GameContainer } from './GameContainer';
import { motion } from 'motion/react';
import { Usb, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';

export function Level6() {
  const navigate = useNavigate();
  const [isUsbInserted, setIsUsbInserted] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isDeploying && deployProgress < 100) {
      const timer = setTimeout(() => {
        setDeployProgress(deployProgress + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else if (deployProgress === 100 && !isComplete) {
      setIsComplete(true);
      setTimeout(() => navigate('/victory'), 3000);
    }
  }, [isDeploying, deployProgress, isComplete, navigate]);

  const handleUsbClick = () => {
    if (!isUsbInserted) {
      setIsUsbInserted(true);
    }
  };

  const handleDeploy = () => {
    if (isUsbInserted && !isDeploying) {
      setIsDeploying(true);
    }
  };

  return (
    <GameContainer>
      <div className="h-full flex flex-col p-15">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#00ffff] text-sm font-mono">LEVEL 06/06</div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[#00ffff] to-transparent" />
          </div>
          <h2 className="text-4xl uppercase tracking-wider"
            style={{
              color: '#00ffff',
              textShadow: '0 0 10px rgba(0,255,255,0.6)',
            }}
          >
            System Core
          </h2>
          <p className="text-[#5de2e7] mt-2 font-mono">Top Floor - Main Server Room</p>
        </div>

        {/* Warning banner */}
        {!isComplete && (
          <motion.div
            className="mb-8 border-2 border-[#ff006e] p-4 flex items-center gap-4"
            style={{
              backgroundColor: 'rgba(255,0,110,0.1)',
              boxShadow: '0 0 20px rgba(255,0,110,0.3)',
            }}
            animate={{
              opacity: [1, 0.7, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <AlertTriangle className="w-8 h-8 text-[#ff006e]" />
            <div>
              <p className="text-[#ff006e] font-mono">
                /// CRITICAL SYSTEM DETECTED ///
              </p>
              <p className="text-[#ff006e] text-sm font-mono opacity-80">
                Deploying virus will reset all AI systems. This action is irreversible.
              </p>
            </div>
          </motion.div>
        )}

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center gap-16">
          {/* Server visualization */}
          <div className="flex flex-col items-center">
            <div className="text-[#00ffff] font-mono text-sm mb-4">MAIN SERVER</div>
            <motion.div
              className="relative"
              animate={isComplete ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 1, repeat: isComplete ? Infinity : 0 }}
            >
              <HardDrive className="w-80 h-80"
                style={{
                  color: isComplete ? '#00ff00' : isDeploying ? '#ff00ff' : '#00ffff',
                  filter: isComplete 
                    ? 'drop-shadow(0 0 30px rgba(0,255,0,0.8))' 
                    : isDeploying 
                    ? 'drop-shadow(0 0 30px rgba(255,0,255,0.6))'
                    : 'drop-shadow(0 0 20px rgba(0,255,255,0.3))',
                }}
              />

              {/* USB port */}
              <motion.div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 w-24 h-8 border-2 flex items-center justify-center cursor-pointer"
                style={{
                  borderColor: isUsbInserted ? '#00ff00' : '#00ffff',
                  backgroundColor: isUsbInserted ? 'rgba(0,255,0,0.2)' : 'rgba(0,255,255,0.1)',
                  boxShadow: isUsbInserted ? '0 0 20px rgba(0,255,0,0.5)' : 'none',
                }}
                onClick={handleUsbClick}
                whileHover={!isUsbInserted ? { scale: 1.1 } : {}}
              >
                <span className="text-xs font-mono text-[#00ffff]">USB PORT</span>
              </motion.div>

              {/* USB device */}
              {!isUsbInserted && (
                <motion.div
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 cursor-pointer"
                  drag
                  dragConstraints={{
                    top: -200,
                    left: -200,
                    right: 200,
                    bottom: 200,
                  }}
                  onClick={handleUsbClick}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Usb className="w-16 h-16 text-[#ff00ff]"
                    style={{
                      filter: 'drop-shadow(0 0 15px rgba(255,0,255,0.6))',
                    }}
                  />
                  <p className="text-center text-[#ff00ff] text-xs font-mono mt-2">
                    CLICK OR DRAG
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Control panel */}
          <div className="w-96">
            <motion.div
              className="bg-[#001219] border-2 p-8"
              style={{
                borderColor: isComplete ? '#00ff00' : isDeploying ? '#ff00ff' : '#00ffff',
                boxShadow: isComplete 
                  ? '0 0 40px rgba(0,255,0,0.5)' 
                  : isDeploying 
                  ? '0 0 40px rgba(255,0,255,0.5)'
                  : '0 0 30px rgba(0,255,255,0.3)',
              }}
            >
              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#ff00ff] font-mono text-sm">STATUS:</span>
                  <span className="text-[#00ffff] font-mono text-sm">
                    {isComplete 
                      ? 'RESET COMPLETE' 
                      : isDeploying 
                      ? 'DEPLOYING...' 
                      : isUsbInserted 
                      ? 'USB CONNECTED'
                      : 'AWAITING USB'}
                  </span>
                </div>
                <div className="h-2 bg-[#1a1f35] relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{
                      backgroundColor: isComplete ? '#00ff00' : '#ff00ff',
                      boxShadow: isComplete 
                        ? '0 0 10px rgba(0,255,0,0.6)' 
                        : '0 0 10px rgba(255,0,255,0.6)',
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${deployProgress}%` }}
                  />
                </div>
                <div className="text-right text-[#5de2e7] text-xs font-mono mt-1">
                  {deployProgress}%
                </div>
              </div>

              {/* System info */}
              <div className="mb-6 space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5de2e7]">AI Systems:</span>
                  <span className="text-[#ff006e]">
                    {isComplete ? '0 Active' : '100000 Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5de2e7]">Human Control:</span>
                  <span style={{ color: isComplete ? '#00ff00' : '#ff006e' }}>
                    {isComplete ? '100%' : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5de2e7]">USB Device:</span>
                  <span style={{ color: isUsbInserted ? '#00ff00' : '#ff006e' }}>
                    {isUsbInserted ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>

              {/* Deploy button */}
              {!isComplete && (
                <motion.button
                  onClick={handleDeploy}
                  disabled={!isUsbInserted || isDeploying}
                  className="w-full py-4 border-2 font-mono uppercase tracking-wider"
                  style={{
                    borderColor: isUsbInserted && !isDeploying ? '#ff006e' : '#1a1f35',
                    color: isUsbInserted && !isDeploying ? '#ff006e' : '#5de2e7',
                    backgroundColor: isUsbInserted && !isDeploying 
                      ? 'rgba(255,0,110,0.1)' 
                      : 'transparent',
                    opacity: isUsbInserted && !isDeploying ? 1 : 0.5,
                    cursor: isUsbInserted && !isDeploying ? 'pointer' : 'not-allowed',
                  }}
                  whileHover={isUsbInserted && !isDeploying ? {
                    backgroundColor: 'rgba(255,0,110,0.3)',
                    scale: 1.02,
                  } : {}}
                  whileTap={isUsbInserted && !isDeploying ? { scale: 0.98 } : {}}
                >
                  {isDeploying ? 'Deploying Virus...' : 'Deploy Reset Virus'}
                </motion.button>
              )}

              {/* Success message */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <CheckCircle className="w-16 h-16 text-[#00ff00] mx-auto mb-4"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(0,255,0,0.8))',
                    }}
                  />
                  <p className="text-[#00ff00] font-mono mb-2">
                    /// RESET SUCCESSFUL ///
                  </p>
                  <p className="text-[#5de2e7] text-sm font-mono">
                    Compiling mission report...
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Warning */}
            {isUsbInserted && !isDeploying && !isComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-4 text-center text-[#ff006e] text-sm font-mono"
              >
                ⚠ WARNING: This will erase all AI consciousness
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </GameContainer>
  );
}