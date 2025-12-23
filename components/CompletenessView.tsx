
import React from 'react';
import { motion } from 'framer-motion';
import { Level, Domain } from '../types.ts';
import { useCompleteness } from '../context/CompletenessContext.tsx';
import { COMPLETENESS_FIELD_CHECKLIST } from '../data/rules.ts';
import ProgressBar from './ProgressBar.tsx';
import DomainCard from './DomainCard.tsx';

interface CompletenessViewProps {
    level: Level;
}

const CompletenessView: React.FC<CompletenessViewProps> = ({ level }) => {
    const { getCompletenessForPath } = useCompleteness();
    const levelData = COMPLETENESS_FIELD_CHECKLIST[level];
    const domains = Object.keys(levelData) as Domain[];

    const overallCompleteness = getCompletenessForPath(level);

    return (
        <motion.div
            key={level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-white">
                        Level {level.substring(1)} Completeness
                    </h2>
                    <span className="text-2xl font-bold text-sky-400">
                        {overallCompleteness.percentage}%
                    </span>
                </div>
                <p className="text-slate-400 mb-4">
                    {overallCompleteness.completed} / {overallCompleteness.total} items completed
                </p>
                <ProgressBar percentage={overallCompleteness.percentage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {domains.map(domain => (
                    <DomainCard key={domain} level={level} domain={domain} />
                ))}
            </div>
        </motion.div>
    );
};

export default CompletenessView;
