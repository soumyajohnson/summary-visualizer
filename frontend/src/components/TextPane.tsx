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
    <div className="flex flex-col h-full p-4 bg-gray-50 border-r border-gray-200 shadow-md">
      <label htmlFor="input-text" className="text-lg font-semibold mb-2 text-gray-800">
        Describe Process
      </label>
      <textarea
        id="input-text"
        className="w-full flex-grow p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., User logs in. If successful, show dashboard. Otherwise, show error."
        disabled={isLoading}
      />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
            onClick={onGenerate}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
            {isGenerating ? 'Generating...' : 'From Text'}
        </button>
        <button
            onClick={onTidy}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
        >
            {isTidying ? 'Tidying...' : 'Auto Tidy'}
        </button>
      </div>
    </div>
  );
}