import React from 'react';
import { BotProfile } from '../../types/chess';
import { MessageSquare } from 'lucide-react';

interface BotDialogProps {
  bot: BotProfile;
  message: string;
}

export const BotDialog: React.FC<BotDialogProps> = ({ bot, message }) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2.5 p-2.5 bg-[#21201d] rounded-lg border border-[#383531] shadow animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Bot Mini Avatar */}
      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-lg ${bot.avatarBg} flex-shrink-0 shadow`}>
        {bot.avatar}
      </div>

      {/* Speech Bubble */}
      <div className="flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-0.5">
          <span>{bot.name}</span>
          <MessageSquare size={11} className="text-gray-500" />
        </div>
        <p className="text-xs text-gray-200 leading-relaxed italic">
          "{message}"
        </p>
      </div>
    </div>
  );
};
