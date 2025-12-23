
import React from 'react';
import { useCompleteness } from '../context/CompletenessContext.tsx';
import { Domain } from '../types.ts';
import ProgressBar from './ProgressBar.tsx';

const domains: Domain[] = ["OVERVIEW", "CHARACTERS", "WORLD", "LORE", "STYLE", "STORY"];

const VerticalProgressView: React.FC = () => {
    const { getCompletenessForPath } = useCompleteness();

    return (
        <div className="space-y-4">
            {domains.map(domain => {
                const { percentage, completed, total } = getCompletenessForPath(domain);
                if (total === 0) return null;

                return (
                    <div key={domain}>
                        <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-medium text-slate-300 capitalize">{domain.toLowerCase()}</span>
                            <span className="text-slate-400">{percentage}%</span>
                        </div>
                        <ProgressBar percentage={percentage} height="h-1.5" />
                    </div>
                );
            })}
        </div>
    );
};

export default VerticalProgressView;
