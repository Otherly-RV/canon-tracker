
import React from 'react';
import { Level } from '../types.ts';
import { COMPLETENESS_FIELD_CHECKLIST } from '../data/rules.ts';
import VerticalProgressView from './VerticalProgressView.tsx';

interface SidebarProps {
    selectedLevel: Level;
    onSelectLevel: (level: Level) => void;
}

const levels = Object.keys(COMPLETENESS_FIELD_CHECKLIST).filter(l => l.startsWith('L')) as Level[];

const Sidebar: React.FC<SidebarProps> = ({ selectedLevel, onSelectLevel }) => {
    return (
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col space-y-6 overflow-y-auto">
            <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Horizontal (by Level)</h2>
                <nav className="flex flex-col space-y-2">
                    {levels.map(level => (
                        <button
                            key={level}
                            onClick={() => onSelectLevel(level)}
                            aria-current={selectedLevel === level ? 'page' : undefined}
                            className={`px-4 py-2 text-left rounded-md text-sm font-medium transition-colors duration-200 ${
                                selectedLevel === level
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                            }`}
                        >
                            {`Level ${level.substring(1)}`}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="border-t border-slate-700/50 pt-6">
                 <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Vertical (by Domain)</h2>
                 <VerticalProgressView />
            </div>
        </aside>
    );
};

export default Sidebar;
