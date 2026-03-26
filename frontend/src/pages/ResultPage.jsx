import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!result) { navigate("/"); return; }
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [result, navigate]);

  if (!result) return null;

  const isAI = result.label === "AI Generated";
  const aiProb = Number(result.ai_probability) || 0;
  const humanProb = Number(result.human_probability) || 0;
  const sentences = result.highlighted_sentences || [];

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (aiProb / 100) * circumference;

  return (
    <motion.div
      className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="result-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0B0B0C]/80 backdrop-blur-md">
        <motion.button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 bg-transparent border border-transparent hover:bg-white/[0.04] hover:border-white/[0.08] hover:text-white rounded-xl transition-all duration-200 cursor-pointer"
          onClick={() => navigate("/")}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </motion.button>
        <h1 className="text-lg font-semibold tracking-tight text-white/90">Analysis Results</h1>
        <motion.button
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium bg-[#EAEAEA] hover:bg-white text-[#0B0B0C] hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(234,234,234,0.2)] rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
          onClick={() => navigate("/")}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Analysis
        </motion.button>
      </header>

      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Essay Highlighting */}
        <motion.div 
            className="flex flex-col bg-[#0B0B0C] border border-[#2A2A2A] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden h-[calc(100vh-10rem)] lg:sticky lg:top-24"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="px-6 py-4 border-b border-[#2A2A2A] bg-white/[0.02]">
                <h2 className="text-zinc-200 font-semibold tracking-tight">Analyzed Document</h2>
                <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-red-500/80"></span> AI Highlighted
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-zinc-600"></span> Human Written
                    </span>
                </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-[15px] leading-relaxed tracking-wide space-y-2">
                {sentences.length > 0 ? (
                    <p className="whitespace-pre-wrap">
                        {sentences.map((s, i) => {
                            const isAiChunk = s.is_ai;
                            return (
                                <span 
                                    key={i} 
                                    className={cn(
                                        "transition-colors mr-1",
                                        isAiChunk 
                                            ? "bg-red-500/20 text-red-200 border-b border-red-500/40 hover:bg-red-500/30 cursor-help" 
                                            : "text-zinc-300"
                                    )}
                                    title={isAiChunk ? `AI Probability: ${s.ai_probability}%` : `Human Probability: ${100 - s.ai_probability}%`}
                                >
                                    {s.sentence}{" "}
                                </span>
                            );
                        })}
                    </p>
                ) : (
                    <p className="text-zinc-500 italic">No text content available to display.</p>
                )}
            </div>
        </motion.div>

        {/* RIGHT COLUMN: Metrics */}
        <div className="flex flex-col gap-6 lg:gap-8">
            
            {/* Gauge */}
            <motion.div
                className="bg-[#0B0B0C] border border-[#2A2A2A] rounded-2xl p-8 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="relative w-[210px] h-[210px] flex items-center justify-center mb-6">
                    <svg viewBox="0 0 200 200" className="w-full h-full rotate-[-90deg]">
                        <circle cx="100" cy="100" r={radius} fill="none"
                            stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>
                        <circle cx="100" cy="100" r={radius} fill="none"
                            stroke={isAI ? "#EF4444" : "#22C55E"}
                            strokeWidth="14" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={animated ? offset : circumference}
                            className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn(
                            "text-4xl font-bold tracking-tighter",
                            isAI ? "text-red-500" : "text-green-500"
                        )}>
                            {animated ? aiProb.toFixed(1) : '0.0'}%
                        </span>
                        <span className="text-[11px] text-zinc-500 uppercase tracking-widest mt-1">AI Probability</span>
                    </div>
                </div>

                <div className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full border",
                    isAI ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"
                )}>
                    <span className="text-base">{isAI ? '🤖' : '✍️'}</span>
                    <span className="text-sm font-semibold tracking-wide">
                        {isAI ? 'AI Generated' : 'Human Written'}
                    </span>
                </div>
            </motion.div>

            {/* Probability Bars */}
            <motion.div
                className="flex flex-col gap-5 bg-[#0B0B0C] border border-[#2A2A2A] rounded-2xl p-6 lg:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-zinc-400">AI Probability</span>
                        <span className="text-sm font-bold text-red-500">{aiProb.toFixed(1)}%</span>
                    </div>
                    <div className="h-3.5 w-full bg-white/[0.06] rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                            style={{ 
                                width: animated ? `${aiProb}%` : '0%',
                                backgroundColor: '#EF4444' 
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-zinc-400">Human Probability</span>
                        <span className="text-sm font-bold text-green-500">{humanProb.toFixed(1)}%</span>
                    </div>
                    <div className="h-3.5 w-full bg-white/[0.06] rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                            style={{ 
                                width: animated ? `${humanProb}%` : '0%',
                                backgroundColor: '#22C55E' 
                            }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
