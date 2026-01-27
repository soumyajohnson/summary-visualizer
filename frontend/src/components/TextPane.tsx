'use client';

interface TextPaneProps {
  text: string;
  setText: (text: string) => void;
  onGenerate: () => void;
  onTidy: () => void;
  isGenerating: boolean;
  isTidying: boolean;
}

export default function TextPane({ text, setText, onGenerate, onTidy, isGenerating, isTidying }: TextPaneProps) {
  const isLoading = isGenerating || isTidying;
  
  return (
    <div className="flex flex-col h-full p-5 bg-white border-r border-gray-200/80 shadow-lg z-10">
      <label htmlFor="input-text" className="text-xl font-bold mb-3 text-gray-500">
        Flowchart Generator
      </label>
      <div className="flex flex-col flex-grow">
        <p className="text-sm text-gray-500 mb-2">
            Describe a process, and we&apos;ll visualize it for you.
        </p>
        <textarea
            id="input-text"
            className="w-full flex-grow p-3 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow shadow-soft"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., User logs in. If successful, show dashboard..."
            disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4">
        <button
            onClick={onGenerate}
            disabled={isLoading}
            className="px-5 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-lifted"
        >
            {isGenerating ? 'Generating...' : 'Generate'}
        </button>
        <button
            onClick={onTidy}
            disabled={isLoading}
            className="px-5 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-lifted"
        >
            {isTidying ? 'Tidying...' : 'Auto Tidy'}
        </button>
      </div>
    </div>
  );
}
