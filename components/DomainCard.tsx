
import React from 'react';
import { motion } from 'framer-motion';
import { Level, Domain } from '../types.ts';
import { useCompleteness } from '../context/CompletenessContext.tsx';
import { COMPLETENESS_FIELD_CHECKLIST } from '../data/rules.ts';
import ProgressBar from './ProgressBar.tsx';
import ChecklistRenderer from './ChecklistRenderer.tsx';

interface DomainCardProps {
    level: Level;
    domain: Domain;
}

const DomainCard: React.FC<DomainCardProps> = ({ level, domain }) => {
    const { getCompletenessForPath } = useCompleteness();
    const path = `${level}.${domain}`;
    const domainData = COMPLETENESS_FIELD_CHECKLIST[level][domain as keyof typeof COMPLETENESS_FIELD_CHECKLIST[Level]];
    const completeness = getCompletenessForPath(path);

    return (
        <motion.div 
            layout
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-100 capitalize">{domain.toLowerCase()}</h3>
                    <p className="text-sm text-slate-400">{completeness.completed} / {completeness.total} items</p>
                </div>
                <span className="font-semibold text-sky-400">{completeness.percentage}%</span>
            </div>
            <ProgressBar percentage={completeness.percentage} height="h-1.5" />
            <div className="mt-6 space-y-4">
                <ChecklistRenderer data={domainData} pathPrefix={path} />
            </div>
        </motion.div>
    );
};

export default DomainCard;
