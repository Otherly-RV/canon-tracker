
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Save, AlertTriangle, Copy, Download } from 'lucide-react';
import { useCompleteness } from '../context/CompletenessContext.tsx';
import { extractTextFromFile } from '../utils/fileReader.ts';

type Tab = 'canon' | 'contract' | 'rules';

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { canonText, setCanonText, execContractText, setExecContractText, fieldRules, setFieldRules, setExtractedContent } = useCompleteness();
    const [activeTab, setActiveTab] = useState<Tab>('canon');
    
    const [localCanon, setLocalCanon] = useState('');
    const [localContract, setLocalContract] = useState('');
    const [localRules, setLocalRules] = useState('');
    
    const [rulesError, setRulesError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalCanon(canonText);
            setLocalContract(execContractText);
            setLocalRules(JSON.stringify(fieldRules, null, 2));
            setRulesError(null);
            setCopySuccess('');
        }
    }, [isOpen, canonText, execContractText, fieldRules]);

    const handleSave = (tab: Tab) => {
        if (tab === 'canon') {
            setCanonText(localCanon);
        } else if (tab === 'contract') {
            setExecContractText(localContract);
        } else if (tab === 'rules') {
            try {
                const parsedRules = JSON.parse(localRules);
                setFieldRules(parsedRules);
                setRulesError(null);
            } catch (e) {
                setRulesError(e instanceof Error ? e.message : 'Invalid JSON format.');
                return;
            }
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleDownload = () => {
        const blob = new Blob([localRules], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'field-rules.json';
        document.body.appendChild(a);
a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const extracted = await extractTextFromFile(file);
            setExtractedContent(extracted); // Set content for the visual viewer
            const plainText = extracted.format === 'html' ? new DOMParser().parseFromString(extracted.content, 'text/html').body.textContent || '' : extracted.content;
            setLocalCanon(plainText); // Set raw text for the editor and AI
            setCanonText(plainText); // Also update the main context immediately
        } catch (e) {
            console.error("Error reading file:", e);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === tab ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}>
            {label}
        </button>
    );

    const Editor: React.FC<{ value: string; onChange: (val: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full flex-1 bg-slate-900 text-slate-300 p-4 rounded-md border border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none font-mono text-sm" />
    );

    const TabHeader: React.FC<{ onSave: () => void; onCopy: () => void; onDownload?: () => void; }> = ({ onSave, onCopy, onDownload }) => (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <button onClick={onSave} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"><Save size={14} /> Save</button>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-green-400 transition-opacity duration-300 opacity-100">{copySuccess}</span>
                <button onClick={onCopy} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"><Copy size={14} /> Copy</button>
                {onDownload && <button onClick={onDownload} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors"><Download size={14} /> Download JSON</button>}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-4 border-b border-slate-700"><h2 className="text-lg font-semibold text-slate-100">Settings</h2><button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"><X size={20} /></button></header>
                        <div className="flex-shrink-0 px-4 pt-2 border-b border-slate-700"><TabButton tab="canon" label="Canon" /><TabButton tab="contract" label="Exec Contract" /><TabButton tab="rules" label="Field Rules" /></div>
                        <main className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'canon' && <div className="h-full flex flex-col"><TabHeader onSave={() => handleSave('canon')} onCopy={() => handleCopy(localCanon)} /><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx" /><button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors mb-2 w-fit"><Upload size={16} /> Upload Document</button><Editor value={localCanon} onChange={setLocalCanon} placeholder="Paste your canon text here, or upload a document." /></div>}
                            {activeTab === 'contract' && <div className="h-full flex flex-col"><TabHeader onSave={() => handleSave('contract')} onCopy={() => handleCopy(localContract)} /><Editor value={localContract} onChange={setLocalContract} /></div>}
                            {activeTab === 'rules' && <div className="h-full flex flex-col"><TabHeader onSave={() => handleSave('rules')} onCopy={() => handleCopy(localRules)} onDownload={handleDownload} /><Editor value={localRules} onChange={setLocalRules} />{rulesError && <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/30 p-3 rounded-md mt-4"><AlertTriangle size={16} /><span>{rulesError}</span></div>}</div>}
                        </main>
                        <footer className="flex justify-end p-4 border-t border-slate-700"><button onClick={onClose} className="px-4 py-2 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-500">Close</button></footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
