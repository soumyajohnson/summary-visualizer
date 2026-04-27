'use client';

import { SparklesIcon, ScissorsIcon } from '@heroicons/react/24/outline';

interface TextPaneProps {
  text: string;
  setText: (text: string) => void;
  onGenerate: () => void;
  onTidy: () => void;
  isGenerating: boolean;
  isTidying: boolean;
}

export default function TextPane({
  text,
  setText,
  onGenerate,
  onTidy,
  isGenerating,
  isTidying,
}: TextPaneProps) {
  return (
    <div className="flex h-full flex-col space-y-6 p-6 font-sans">
      <div className="flex items-center space-x-2">
        <span className="text-3xl">🌸</span>
        <h1 className="font-caveat text-3xl font-bold tracking-tight bg-gradient-to-r from-[#C06090] to-[#9060C0] bg-clip-text text-transparent">
          FLOWRA
        </h1>
      </div>

      <div className="flex-1 space-y-4">
        <div className="space-y-2">
            <h2 className="font-caveat text-xl font-medium text-[#7C5C8A]">
                Flowchart Generator
            </h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Once upon a time..."
                className="h-64 w-full rounded-2xl border border-[#D4B8D4] bg-[#FFF8FF] p-4 text-base text-[#5C3040] placeholder:text-[#C4A0C4] focus:border-[#C8A2C8] focus:ring-2 focus:ring-[#C8A2C8]/20 focus:outline-none transition-all shadow-sm"
            />
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#C8A2C8] to-[#E8A0B0] p-4 font-caveat text-xl font-semibold text-white shadow-soft transition-all hover:shadow-lifted active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex items-center justify-center space-x-2">
            {isGenerating ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <SparklesIcon className="h-6 w-6" />
            )}
            <span>{isGenerating ? 'Blooming...' : 'Generate Flowchart'}</span>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between rounded-full border border-[#D4B8D4] bg-[#F0E8F4] p-2 pl-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#E87878]" />
          <span className="font-caveat text-base font-medium text-[#7C5C8A]">N 1 Issue</span>
        </div>
        <button
          onClick={onTidy}
          disabled={isTidying}
          className="flex items-center space-x-1 rounded-full bg-[#E8D0F0] px-4 py-1.5 font-caveat text-lg font-medium text-[#6B4A8A] transition-colors hover:bg-[#DCC0E8] active:bg-[#D4B8D4] disabled:opacity-50"
        >
          <ScissorsIcon className="h-4 w-4" />
          <span>{isTidying ? 'Tidying...' : 'Auto Tidy'}</span>
        </button>
      </div>
    </div>
  );
}
