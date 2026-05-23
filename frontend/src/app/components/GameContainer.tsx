import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home } from 'lucide-react';

interface GameContainerProps {
  children: ReactNode;
}

export function GameContainer({ children }: GameContainerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000000] overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.1) 0px, transparent 1px, transparent 2px, rgba(0,255,255,0.1) 3px)',
        }} />
      </div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />
      
      {/* Game viewport - fixed 1440x1024 */}
      <div className="relative w-full h-full max-w-[1440px] max-h-[1024px] border-2 border-[#00ffff] shadow-[0_0_30px_rgba(0,255,255,0.5)]"
        style={{
          background: 'linear-gradient(180deg, #000814 0%, #001219 100%)',
        }}
      >
        {/* Home button - only show if not on home page */}
        {!isHomePage && (
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-2 z-30 p-3 bg-[#001219]/80 border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-[#000814] transition-all duration-300 group"
            style={{
              boxShadow: '0 0 15px rgba(0,255,255,0.3)',
            }}
            title="Return to Main Menu"
          >
            <Home className="w-5 h-5" />
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
}