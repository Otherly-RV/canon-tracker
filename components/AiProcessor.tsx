
import React, { useState, useCallback, useEffect } from 'react';
import { BrainCircuit, CheckCircle, XCircle, RotateCcw, Search } from 'lucide-react';
import { useCompleteness } from '../context/CompletenessContext.tsx';
import { useAiAnalysis } from '../hooks/useAiAnalysis.ts';
import { ProcessingStatus } from '../types.ts';
import { getStaticChecklist, COMPLETENESS_FIELD_CHECKLIST } from '../data/rules.ts';
import { extractTextFromFile } from '../utils/fileReader.ts'; // Although we don't upload here, settings does.

const AiProcessor: React.FC = () => {
    const [status, setStatus] = useState<ProcessingStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const { 
        updateFieldContent, 
        resetCompleteness, 
        generateAllItems,
        setIdentifiedEntities,
        canonText,
        execContractText,
        fieldRules,
        setExtractedContent,
    } = useCompleteness();
    const { identifyEntities, generateContentForAllFields, error: analysisError } = useAiAnalysis();

    useEffect(() => {
        if (analysisError) {
            setError(analysisError);
            setStatus('error');
        }
    }, [analysisError]);

    const handleProcess = async () => {
        if (!canonText) {
            setError("Canon text is empty. Please add content in Settings.");
            setStatus('error');
            return;
        }
        
        resetCompleteness();
        // Set the content for the viewer. Since we only have raw text, format is 'text'.
        // A more advanced version could re-process the original file if it was a DOCX.
        setExtractedContent({ content: canonText, format: 'text' });

        setStatus('identifying');
        setError(null);
        setProgress({ current: 0, total: 0 });

        try {
            // Stage 1: Identify Entities
            const entities = await identifyEntities(canonText, execContractText);
            setIdentifiedEntities(entities);
            
            // Generate the full dynamic checklist
            generateAllItems(entities);
            
            setTimeout(async () => {
                const staticItems = getStaticChecklist(COMPLETENESS_FIELD_CHECKLIST);
                let dynamicItems: string[] = [];
                entities.characters.forEach(char => {
                    if(COMPLETENESS_FIELD_CHECKLIST.L2.CHARACTERS.Character) dynamicItems.push(...getStaticChecklist(COMPLETENESS_FIELD_CHECKLIST.L2.CHARACTERS.Character, `L2.CHARACTERS.${char}`));
                    if(COMPLETENESS_FIELD_CHECKLIST.L3.CHARACTERS.Character) dynamicItems.push(...getStaticChecklist(COMPLETENESS_FIELD_CHECKLIST.L3.CHARACTERS.Character, `L3.CHARACTERS.${char}`));
                });
                entities.locations.forEach(loc => {
                    if(COMPLETENESS_FIELD_CHECKLIST.L2.WORLD.Locations.Location) dynamicItems.push(...getStaticChecklist(COMPLETENESS_FIELD_CHECKLIST.L2.WORLD.Locations.Location, `L2.WORLD.Locations.${loc}`));
                    if(COMPLETENESS_FIELD_CHECKLIST.L3.WORLD.Locations.Location) dynamicItems.push(...getStaticChecklist(COMPLETENESS_FIELD_CHECKLIST.L3.WORLD.Locations.Location, `L3.WORLD.Locations.${loc}`));
                });
                const allItemsToProcess = [...staticItems, ...dynamicItems];

                // Stage 2: Populate Content
                setStatus('analyzing');
                setProgress({ current: 0, total: allItemsToProcess.length });

                let completedCount = 0;
                const onFieldCompleted = (path: string, content: string) => {
                    updateFieldContent(path, content);
                    completedCount++;
                    setProgress({ current: completedCount, total: allItemsToProcess.length });
                };

                await generateContentForAllFields(canonText, allItemsToProcess, execContractText, fieldRules, onFieldCompleted);
                
                setStatus('success');
            }, 100);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setStatus('error');
        }
    };

    const handleReset = () => {
        resetCompleteness();
        setStatus('idle');
        setError(null);
        setProgress({ current: 0, total: 0 });
    };

    const isLoading = status === 'analyzing' || status === 'identifying';
    
    let buttonText = "Process";
    let buttonIcon = BrainCircuit;

    switch (status) {
        case 'identifying':
            buttonText = 'Identifying...';
            buttonIcon = Search;
            break;
        case 'analyzing':
            buttonText = `Generating... (${progress.current}/${progress.total})`;
            buttonIcon = BrainCircuit;
            break;
        case 'success':
            buttonText = 'Success!';
            buttonIcon = CheckCircle;
            break;
        case 'error':
            buttonText = 'Error!';
            buttonIcon = XCircle;
            break;
    }

    return (
        <div className="flex items-center gap-4">
            <button 
                onClick={handleProcess} 
                disabled={isLoading || !canonText}
                className={`flex items-center justify-center px-4 h-9 min-w-[120px] text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors ${
                    isLoading ? 'bg-slate-600 cursor-not-allowed' : 
                    !canonText ? 'bg-slate-600 cursor-not-allowed' :
                    status === 'success' ? 'bg-green-600' :
                    status === 'error' ? 'bg-red-600' :
                    'bg-sky-600 hover:bg-sky-500 focus:ring-sky-500'
                }`}
                aria-label="Process Canon"
            >
                <buttonIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {buttonText}
            </button>
            <div className="relative group">
                <button 
                    onClick={handleReset}
                    className="flex items-center justify-center w-9 h-9 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-colors"
                    aria-label="Reset generated content"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Reset Content
                </div>
            </div>
        </div>
    );
};

export default AiProcessor;
