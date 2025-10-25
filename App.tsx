import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat, Modality } from '@google/genai';
import { ChatMessage as ChatMessageType, Part } from './types';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { BotIcon } from './components/icons/BotIcon';
import { ImagePlaceholder } from './components/ImagePlaceholder';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
          systemInstruction: 'You are a friendly and helpful AI assistant. Your goal is to provide clear, concise, and accurate answers to user questions on any topic. Format your responses using Markdown.',
        },
      });

      setMessages([
        {
          role: 'model',
          parts: [{ text: "Hello! I'm Slyver. How can I help you today? You can also ask me to generate images by starting your prompt with `/imagine`." }],
        },
      ]);
    } catch (e) {
      console.error(e);
      setError('Failed to initialize the AI model. Please check your API key and refresh the page.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isGeneratingImage]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const isImagePrompt = input.trim().startsWith('/imagine ');
    const userMessage: ChatMessageType = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    if (isImagePrompt) {
        setIsGeneratingImage(true);
    }

    try {
      if (isImagePrompt) {
        const prompt = input.trim().substring('/imagine '.length);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);

        if (!imagePart) {
            throw new Error("API did not return an image. The model may have refused the prompt.");
        }

        const modelMessage: ChatMessageType = { role: 'model', parts: [imagePart as Part] };
        setMessages(prev => [...prev, modelMessage]);

      } else { // Text generation
        if (!chatRef.current) return;
        const response = await chatRef.current.sendMessage({ message: input });
        const modelMessage: ChatMessageType = { role: 'model', parts: [{ text: response.text }] };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response from AI: ${errorMessage}`);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: `Sorry, I encountered an error. Please try again. \n\nDetails: ${errorMessage}` }],
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  }, [input, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto pt-24 pb-4">
        <div className="container mx-auto px-4 max-w-4xl">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && !isGeneratingImage && <ChatMessage message={{ role: 'model', parts: [{text: ''}]}} isLoading={true} />}
          {isGeneratingImage && (
            <div className="flex items-start gap-4 p-4 rounded-lg my-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-blue-500">
                    <BotIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <ImagePlaceholder />
                </div>
            </div>
          )}
          {error && <div className="p-4 my-4 text-red-400 bg-red-900/50 rounded-md">{error}</div>}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <div className="sticky bottom-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl px-4">
          <ChatInput input={input} setInput={setInput} onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;