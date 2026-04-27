'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function IngestPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState('');
    const [source, setSource] = useState('');
    const [isIngesting, setIsIngesting] = useState(false);

    const handleIngest = async () => {
        if (!text || !source) {
            alert('Please provide both text and a source label.');
            return;
        }

        setIsIngesting(true);
        try {
            await axios.post('http://localhost:8000/v1/ingest', {
                text,
                source_label: source,
            });
            alert('Knowledge successfully added!');
            setText('');
            setSource('');
        } catch (error) {
            console.error('Ingestion failed:', error);
            alert('Failed to ingest knowledge.');
        } finally {
            setIsIngesting(false);
        }
    };

    return (
        <div className="border-b border-[#E8D5E8] bg-white/40 backdrop-blur-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 font-caveat text-xl font-medium text-[#7C5C8A] hover:text-[#9B5E9B] transition-colors"
            >
                <span>Knowledge Base Ingestion</span>
                {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                )}
            </button>
            
            {isOpen && (
                <div className="space-y-4 p-4 pt-0">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Once upon a time..."
                        className="h-32 w-full rounded-xl border border-[#D4B8D4] bg-[#FFF8FF] p-3 font-sans text-sm text-[#5C3040] placeholder:text-[#C4A0C4] focus:border-[#C8A2C8] focus:outline-none transition-all shadow-sm"
                    />
                    <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="Source Label (e.g. Secret Journal)"
                        className="w-full rounded-xl border border-[#D4B8D4] bg-[#FFF8FF] p-3 font-sans text-sm text-[#5C3040] placeholder:text-[#C4A0C4] focus:border-[#C8A2C8] focus:outline-none transition-all shadow-sm"
                    />
                    <button
                        onClick={handleIngest}
                        disabled={isIngesting}
                        className="w-full rounded-xl bg-gradient-to-r from-[#C8A2C8] to-[#E8A0B0] py-3 font-caveat text-xl font-semibold text-white shadow-soft transition-all hover:bg-sky-400 disabled:opacity-50"
                    >
                        {isIngesting ? 'Saving...' : 'Add to Knowledge Base'}
                    </button>
                </div>
            )}
        </div>
    );
}
