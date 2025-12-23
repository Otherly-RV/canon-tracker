
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    percentage: number;
    height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, height = 'h-2' }) => {
    return (
        <div className={`w-full bg-slate-700 rounded-full ${height} overflow-hidden`}>
            <motion.div
                className="bg-sky-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
        </div>
    );
};

export default ProgressBar;
