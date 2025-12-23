
import React, { useState } from 'react';
import { CompletenessProvider, useCompleteness } from './context/CompletenessContext.tsx';
import { Level } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import CompletenessView from './components/CompletenessView.tsx';
import AiProcessor from './components/AiProcessor.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import CanonViewer from './components/CanonViewer.tsx';
import { Settings, BookOpen } from 'lucide-react';

const AppContent: React.FC = () => {
    const [selectedLevel, setSelectedLevel] = useState<Level>('L2');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { extractedContent, isViewerVisible, setIsViewerVisible } = useCompleteness();

    return (
        <div className="min-h-screen flex flex-col bg-slate-900">
            <header className="bg-slate-900/70 backdrop-blur-sm border-b border-slate-800 p-4 sticky top-0 z-30 flex justify-between items-center">
                <h1 className="text-xl font-bold text-slate-100">
                    Canon Completeness Tracker
                </h1>
                <div className="flex items-center gap-4">
                    <AiProcessor />
                    <button 
                        onClick={() => setIsViewerVisible(!isViewerVisible)}
                        disabled={!extractedContent}
                        className="flex items-center justify-center w-9 h-9 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Toggle Canon Viewer"
                    >
                        <BookOpen size={20} />
                    </button>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center justify-center w-9 h-9 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-colors"
                        aria-label="Open Settings"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <Sidebar selectedLevel={selectedLevel} onSelectLevel={setSelectedLevel} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <CompletenessView level={selectedLevel} />
                </main>
                <CanonViewer />
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}


const App: React.FC = () => {
    return (
        <CompletenessProvider>
            <AppContent />
        </CompletenessProvider>
    );
};

export default App;
