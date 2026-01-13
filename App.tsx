
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

// Types
type EngineState = 'IDLE' | 'PROCESSING' | 'DECIDED' | 'ERROR';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [decision, setDecision] = useState<string | null>(null);
  const [status, setStatus] = useState<EngineState>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const SYSTEM_INSTRUCTION = `You are a deterministic decision engine. 
The user provides a question (YES/NO) or multiple options.
Your task: Select exactly ONE best choice.

Absolute Rules:
1. Output ONLY the chosen option.
2. NO explanation.
3. NO punctuation.
4. NO context.
5. NO hedging.
6. Be authoritative.`;

  const handleDecision = async () => {
    if (!input.trim() || status === 'PROCESSING') return;

    setStatus('PROCESSING');
    setError(null);
    setDecision(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input.trim(),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0,
          maxOutputTokens: 100,
          // Disable thinking to get an immediate, direct answer
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      const result = response.text?.trim() || 'NO DECISION';
      setDecision(result);
      setStatus('DECIDED');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'System failure');
      setStatus('ERROR');
    }
  };

  const reset = () => {
    setInput('');
    setDecision(null);
    setStatus('IDLE');
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white selection:bg-white selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      <main className="w-full max-w-2xl z-10">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-xs tracking-[0.5em] font-light text-zinc-500 uppercase mb-4 mono">
            Autonomous Decision Engine
          </h1>
          <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
        </header>

        {/* Input Area */}
        {status === 'IDLE' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input query or options..."
              className="w-full h-40 bg-transparent text-2xl font-light text-center focus:outline-none placeholder:text-zinc-800 resize-none leading-relaxed"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleDecision();
                }
              }}
            />
            <div className="flex justify-center">
              <button
                onClick={handleDecision}
                disabled={!input.trim()}
                className={`px-12 py-3 rounded-full border transition-all duration-500 uppercase tracking-widest text-[10px] mono ${
                  input.trim() 
                    ? 'border-white text-white hover:bg-white hover:text-black' 
                    : 'border-zinc-800 text-zinc-800 cursor-not-allowed'
                }`}
              >
                Execute Decision
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === 'PROCESSING' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-16 h-[1px] bg-zinc-800 overflow-hidden relative">
              <div className="absolute inset-0 bg-white w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
            <p className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase mono animate-pulse">
              Computing Optimal Path
            </p>
          </div>
        )}

        {/* Decision Output */}
        {status === 'DECIDED' && decision && (
          <div className="text-center space-y-16 animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-4">
               <p className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase mono">Final Determination</p>
               <h2 className="text-5xl md:text-7xl font-light tracking-tight text-white uppercase break-words">
                {decision}
               </h2>
            </div>
            <button
              onClick={reset}
              className="px-8 py-2 rounded-full border border-zinc-800 text-zinc-500 hover:text-white hover:border-white transition-all text-[10px] tracking-widest uppercase mono"
            >
              New Input
            </button>
          </div>
        )}

        {/* Error State */}
        {status === 'ERROR' && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <p className="text-red-500 font-light mono text-sm">{error}</p>
            <button
              onClick={reset}
              className="px-8 py-2 rounded-full border border-red-900/30 text-red-900 hover:text-red-500 transition-all text-[10px] tracking-widest uppercase mono"
            >
              System Reset
            </button>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-10 left-0 w-full flex justify-center pointer-events-none">
        <p className="text-[9px] tracking-[0.2em] text-zinc-700 uppercase mono">
          Deterministic • Authoritative • Precise
        </p>
      </footer>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
