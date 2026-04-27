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
        <div className="border-b border-white/10 bg-white/5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 text-sm font-medium text-white/70 hover:text-white"
            >
                <span>Knowledge Base Ingestion</span>
                {isOpen ? (
                    <ChevronUpIcon className="h-4 w-4" />
                ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                )}
            </button>
            
            {isOpen && (
                <div className="space-y-4 p-4 pt-0">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste document text here..."
                        className="h-32 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="Source Label (e.g. Policy Manual)"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none"
                    />
                    <button
                        onClick={handleIngest}
                        disabled={isIngesting}
                        className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition-all hover:bg-sky-400 disabled:opacity-50"
                    >
                        {isIngesting ? 'Ingesting...' : 'Add to Knowledge Base'}
                    </button>
                </div>
            )}
        </div>
    );
}
