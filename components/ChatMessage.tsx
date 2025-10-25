import React from 'react';
// @ts-ignore
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
// @ts-ignore
import remarkGfm from 'https://esm.sh/remark-gfm@4';
import { ChatMessage as ChatMessageType } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { LoadingSpinner } from './LoadingSpinner';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, '')).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return !inline && match ? (
    <div dir="ltr" className="bg-black/50 rounded-md my-2 overflow-hidden border border-gray-700 text-left">
        <div className="flex justify-between items-center px-4 py-1 bg-gray-700/50 text-xs text-gray-300">
            <span>{match[1]}</span>
            <button
                onClick={handleCopy}
                className="hover:text-white transition-colors text-sm"
            >
                {isCopied ? 'Copied!' : 'Copy code'}
            </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
            <code className={`language-${match[1]}`} {...props}>
                {children}
            </code>
        </pre>
    </div>
  ) : (
    <code className="bg-gray-700/50 text-blue-300 py-0.5 px-1.5 rounded-md text-sm" {...props}>
      {children}
    </code>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isModel = message.role === 'model';
  const textContent = message.parts.map(part => part.text || '').join('');
  const isArabic = containsArabic(textContent);

  return (
    <div 
      className={`flex items-start gap-4 p-4 rounded-lg my-2 ${isModel ? 'bg-gray-800/50' : ''} ${isArabic ? 'flex-row-reverse' : ''}`}
      dir={isArabic && !message.parts.some(p => p.inlineData) ? 'rtl' : 'ltr'}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isModel ? 'bg-blue-500' : 'bg-gray-600'}`}>
        {isModel ? <BotIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className={`prose prose-invert prose-p:text-gray-200 prose-li:text-gray-200 prose-a:text-blue-400 hover:prose-a:text-blue-300 max-w-none ${isArabic ? 'text-right' : ''}`}>
          {isLoading && isModel ? (
            <LoadingSpinner />
          ) : (
            message.parts.map((part, index) => {
                if (part.inlineData) {
                    return (
                      <img
                        key={index}
                        src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                        alt="Generated content"
                        className="rounded-lg border border-gray-700 max-w-full h-auto"
                      />
                    );
                }
                if (part.text) {
                    return (
                        <ReactMarkdown
                            key={index}
                            remarkPlugins={[remarkGfm]}
                            components={{ code: CodeBlock }}
                        >
                            {part.text}
                        </ReactMarkdown>
                    );
                }
                return null;
            })
          )}
        </div>
      </div>
    </div>
  );
};