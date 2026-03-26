import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "./ui/textarea";
import { cn } from "../lib/utils";
import { Paperclip, ArrowUpIcon, Loader2, X, FileText } from "lucide-react";

function useAutoResizeTextarea({ minHeight, maxHeight }) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback((reset) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (reset) {
            textarea.style.height = `${minHeight}px`;
            return;
        }

        // Temporarily shrink to get the right scrollHeight
        textarea.style.height = `${minHeight}px`;
        const newHeight = Math.max(
            minHeight,
            Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
        );
        textarea.style.height = `${newHeight}px`;
    }, [minHeight, maxHeight]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) textarea.style.height = `${minHeight}px`;
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export default function InputArea({ onAnalyze, loading }) {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileRef = useRef(null);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 450,
        maxHeight: 800,
    });

    const handleSubmit = () => {
        if (!text.trim() && !file) return;
        onAnalyze(text.trim(), file);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (text.trim() || file) {
                handleSubmit();
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const acceptTypes = ".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp,.txt";

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white/90 self-start">
                Submit Content for Analysis
            </h1>

            <div className="w-full">
                <div 
                    className={cn(
                        "relative bg-[#0B0B0C] rounded-2xl border transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.5)]",
                        isDragging ? "border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-[#111116]" : "border-white/[0.08]"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            setFile(e.dataTransfer.files[0]);
                        }
                    }}
                >
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Paste your text here, or drag and drop a file..."
                            className={cn(
                                "w-full px-5 py-4",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-white text-[15px] leading-relaxed",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-white/20",
                                "min-h-[450px]"
                            )}
                            style={{ overflow: "hidden" }}
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between p-4 border-t border-[#2A2A2A]/50 bg-[#0B0B0C] rounded-b-2xl">
                        <div className="flex items-center gap-3">
                            <input
                                ref={fileRef}
                                type="file"
                                accept={acceptTypes}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {!file && (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="group px-4 py-2 rounded-xl border border-[#2A2A2A] bg-transparent hover:bg-white/[0.04] transition-all duration-200 flex items-center gap-2 cursor-pointer"
                                    title="Attach a file"
                                >
                                    <Paperclip className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                        Attach
                                    </span>
                                </button>
                            )}

                            <AnimatePresence>
                                {file && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, x: -10 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -10 }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-[#2A2A2A]"
                                    >
                                        <FileText className="w-4 h-4 text-zinc-300" />
                                        <span className="text-sm font-medium text-zinc-200 max-w-[150px] truncate">
                                            {file.name}
                                        </span>
                                        <button 
                                            onClick={removeFile}
                                            className="ml-1 p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                            title="Remove file"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[13px] text-zinc-400 hidden sm:inline tracking-wider font-medium uppercase">
                                Enter to submit
                            </span>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || (!text.trim() && !file)}
                                className={cn(
                                    "flex items-center justify-center px-5 py-2.5 rounded-xl transition-all duration-200 gap-2 font-medium cursor-pointer",
                                    (text.trim() || file) && !loading
                                        ? "bg-[#EAEAEA] text-[#0B0B0C] hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(234,234,234,0.15)] shadow-sm"
                                        : "bg-[#1A1A1C] text-zinc-500 border border-[#333333] cursor-not-allowed"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-inherit" />
                                ) : (
                                    <>
                                        <span className="text-sm font-medium">Analyze</span>
                                        <ArrowUpIcon className="w-4 h-4 text-inherit" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
