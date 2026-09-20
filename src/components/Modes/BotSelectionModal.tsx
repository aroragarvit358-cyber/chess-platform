import React, { useState } from 'react';
import { BotProfile } from '../../types/chess';
import { BOT_PROFILES } from '../../engine/chessEngine';
import { X, Play, ShieldAlert, Sparkles } from 'lucide-react';

interface BotSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBot: (bot: BotProfile) => void;
  currentBotId: string;
}

export const BotSelectionModal: React.FC<BotSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectBot,
  currentBotId,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<string>('All');
  const tabs = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Master'];

  const filteredBots = BOT_PROFILES.filter(
    (b) => activeTab === 'All' || b.difficulty === activeTab
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#262421] border border-[#3d3b38] rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#383531] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                Choose an AI Opponent
              </h2>
              <p className="text-xs text-gray-400">
                Play against unique personalities with tailored ratings and styles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#383531] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#81b64c] text-white shadow'
                  : 'bg-[#312f2c] text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredBots.map((bot) => {
            const isSelected = bot.id === currentBotId;
            return (
              <div
                key={bot.id}
                onClick={() => {
                  onSelectBot(bot);
                  onClose();
                }}
                className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all relative group ${
                  isSelected
                    ? 'bg-[#312f2c] border-[#81b64c] shadow-lg ring-1 ring-[#81b64c]'
                    : 'bg-[#21201d] border-[#383531] hover:border-gray-500 hover:bg-[#2b2926]'
                }`}
              >
                {/* Top Profile Row */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${bot.avatarBg}`}
                  >
                    {bot.avatar}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-base group-hover:text-[#81b64c] transition-colors">
                        {bot.name}
                      </span>
                      <span className="bg-[#383531] text-amber-400 text-xs font-mono font-bold px-2 py-0.5 rounded">
                        {bot.rating}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      {bot.difficulty}
                    </span>
                  </div>
                </div>

                {/* Quote / Description */}
                <p className="text-xs text-gray-300 mt-2.5 line-clamp-2 italic">
                  "{bot.quote}"
                </p>

                {/* Play Button */}
                <div className="mt-3 pt-2.5 border-t border-[#33312d] flex items-center justify-between text-xs font-bold text-gray-400 group-hover:text-white">
                  <span>{bot.description.split('.')[0]}.</span>
                  <div className="flex items-center gap-1 text-[#81b64c]">
                    <Play size={14} className="fill-[#81b64c]" />
                    <span>Play</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
