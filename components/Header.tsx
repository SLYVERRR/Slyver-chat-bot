import React from 'react';
import { BotIcon } from './icons/BotIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto flex items-center gap-4 max-w-4xl px-4">
        <BotIcon className="w-10 h-10 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Slyver chat box</h1>
          <p className="text-sm text-gray-400">Your personal AI powered by Gemini</p>
        </div>
      </div>
    </header>
  );
};