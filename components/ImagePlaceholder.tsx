import React from 'react';
import { ImageIcon } from './icons/ImageIcon';

export const ImagePlaceholder: React.FC = () => {
  return (
    <div className="bg-gray-800/70 p-4 rounded-lg animate-pulse">
      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-600 rounded-lg">
        <div className="text-center text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto" />
          <p className="mt-2 text-sm font-medium">Generating image...</p>
        </div>
      </div>
    </div>
  );
};
