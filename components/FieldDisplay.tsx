
import React from 'react';

interface FieldDisplayProps {
    label: string;
    content: string;
}

const FieldDisplay: React.FC<FieldDisplayProps> = ({ label, content }) => {
    const hasContent = content && content.trim() !== '';

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-400">{label.replace(/\|/g, ' | ')}</label>
            <div 
                className={`w-full p-3 rounded-md text-sm transition-colors duration-300 ${
                    hasContent 
                        ? 'bg-slate-700/50 border border-slate-600 text-slate-200' 
                        : 'bg-slate-800/60 border border-dashed border-slate-700 text-slate-500 italic'
                }`}
                style={{ minHeight: '40px' }}
            >
                {hasContent ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                ) : (
                    'No content generated'
                )}
            </div>
        </div>
    );
};

export default FieldDisplay;
