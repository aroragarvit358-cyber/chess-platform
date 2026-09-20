import React from 'react';
import { 
  Swords, 
  Bot, 
  Puzzle, 
  Search, 
  Users, 
  Volume2, 
  VolumeX, 
  Award,
  Crown
} from 'lucide-react';
import { GameMode } from '../types/chess';
import { sounds } from '../audio/soundEffects';

interface SidebarProps {
  activeMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenBotModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMode,
  onSelectMode,
  onOpenBotModal,
  soundEnabled,
  onToggleSound,
}) => {
  const navItems = [
    {
      id: 'bot' as GameMode,
      label: 'Play Bots',
      icon: <Bot size={20} />,
      badge: 'AI',
      onClick: () => {
        onSelectMode('bot');
        onOpenBotModal();
      },
    },
    {
      id: 'local' as GameMode,
      label: 'Pass & Play',
      icon: <Users size={20} />,
      onClick: () => onSelectMode('local'),
    },
    {
      id: 'puzzle' as GameMode,
      label: 'Puzzles',
      icon: <Puzzle size={20} />,
      badge: 'Daily',
      onClick: () => onSelectMode('puzzle'),
    },
    {
      id: 'analysis' as GameMode,
      label: 'Analysis',
      icon: <Search size={20} />,
      onClick: () => onSelectMode('analysis'),
    },
  ];

  return (
    <aside className="w-16 md:w-56 bg-[#21201d] border-r border-[#302e2b] flex flex-col justify-between py-3 flex-shrink-0 select-none z-20">
      {/* Top Logo & Branding */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 px-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#81b64c] flex items-center justify-center text-white shadow-md shadow-emerald-950/50 flex-shrink-0">
            <Crown size={22} className="fill-white" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-extrabold text-white text-lg tracking-tight leading-none">
              Chess<span className="text-[#81b64c]">.com</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">
              Play & Learn
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = activeMode === item.id;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold cursor-pointer group ${
                  isActive
                    ? 'bg-[#312f2c] text-white border-l-4 border-[#81b64c]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2b2926]'
                }`}
              >
                <div className={`${isActive ? 'text-[#81b64c]' : 'text-gray-400 group-hover:text-white'}`}>
                  {item.icon}
                </div>
                <span className="hidden md:inline flex-1 text-left">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="hidden md:inline-block bg-[#81b64c]/20 text-[#81b64c] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Settings */}
      <div className="flex flex-col gap-2 px-2">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2b2926] text-xs font-semibold cursor-pointer transition-colors"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="hidden md:inline">
            {soundEnabled ? 'Sound On' : 'Muted'}
          </span>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 p-2 bg-[#2b2926] rounded-lg border border-[#383531]">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
            You
          </div>
          <div className="hidden md:flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-white truncate">Player</span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Award size={12} className="text-amber-400" />
              <span>1200</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
