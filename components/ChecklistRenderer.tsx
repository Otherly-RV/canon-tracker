
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ChecklistRendererProps } from '../types.ts';
import FieldDisplay from './FieldDisplay.tsx';
import { useCompleteness } from '../context/CompletenessContext.tsx';
import { COMPLETENESS_FIELD_CHECKLIST } from '../data/rules.ts';

const EntityCard: React.FC<{ name: string; pathPrefix: string; template: any }> = ({ name, pathPrefix, template }) => {
    const [isOpen, setIsOpen] = useState(true);
    const fullPath = `${pathPrefix}.${name}`;
    const { getCompletenessForPath } = useCompleteness();
    const completeness = getCompletenessForPath(fullPath);

    return (
        <div className="bg-slate-800/40 rounded-lg border border-slate-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left">
                <span className="font-semibold text-sky-300">{name}</span>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{completeness.percentage}%</span>
                    <motion.div animate={{ rotate: isOpen ? 0 : -90 }}>
                        <ChevronDown size={18} className="text-slate-400" />
                    </motion.div>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700">
                    <ChecklistRenderer data={template} pathPrefix={fullPath} />
                </div>
            )}
        </div>
    );
};

const ChecklistRenderer: React.FC<ChecklistRendererProps> = ({ data, pathPrefix }) => {
    const { fieldContents, identifiedEntities } = useCompleteness();

    if (Array.isArray(data)) {
        return (
            <ul className="space-y-4 pl-1">
                {data.map((item, index) => {
                    const path = `${pathPrefix}.${item}`;
                    const content = fieldContents.get(path) || '';
                    return (
                        <li key={index}>
                            <FieldDisplay label={item} content={content} />
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className="space-y-5">
            {Object.entries(data).map(([key, value]) => {
                // Dynamic rendering for Characters
                if (key === 'Character' && pathPrefix.includes('CHARACTERS')) {
                    return (
                        <div key={key} className="space-y-3">
                            {identifiedEntities.characters.map(charName => (
                                <EntityCard key={charName} name={charName} pathPrefix={pathPrefix} template={value} />
                            ))}
                        </div>
                    );
                }
                // Dynamic rendering for Locations
                if (key === 'Location' && pathPrefix.includes('WORLD.Locations')) {
                     return (
                        <div key={key} className="space-y-3">
                            {identifiedEntities.locations.map(locName => (
                                <EntityCard key={locName} name={locName} pathPrefix={pathPrefix} template={value} />
                            ))}
                        </div>
                    );
                }

                // Static rendering for other nodes
                return (
                    <div key={key} className="pl-3 border-l-2 border-slate-700/50">
                        <h4 className="text-md font-semibold text-slate-300 mb-3">{key}</h4>
                        <div className="pl-2">
                            <ChecklistRenderer data={value} pathPrefix={`${pathPrefix}.${key}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChecklistRenderer;
