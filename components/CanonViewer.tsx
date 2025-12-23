
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCompleteness } from '../context/CompletenessContext.tsx';

const CanonViewer: React.FC = () => {
    const { isViewerVisible, setIsViewerVisible, extractedContent } = useCompleteness();

    const variants = {
        hidden: { x: '100%', opacity: 0 },
        visible: { x: 0, opacity: 1 },
    };

    return (
        <AnimatePresence>
            {isViewerVisible && (
                <motion.aside
                    key="canon-viewer"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={variants}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
                    className="w-full md:w-1/2 lg:w-2/5 h-full bg-slate-900/80 backdrop-blur-md border-l border-slate-700 flex flex-col z-20"
                    aria-label="Canon Document Viewer"
                >
                    <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-slate-100">Canon Viewer</h2>
                        <button
                            onClick={() => setIsViewerVisible(false)}
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            aria-label="Close canon viewer"
                        >
                            <X size={20} />
                        </button>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6">
                        {extractedContent ? (
                            extractedContent.format === 'html' ? (
                                <div
                                    className="prose-viewer"
                                    dangerouslySetInnerHTML={{ __html: extractedContent.content }}
                                />
                            ) : (
                                <pre className="whitespace-pre-wrap text-slate-300 text-sm font-sans">
                                    {extractedContent.content}
                                </pre>
                            )
                        ) : (
                            <div className="text-slate-500 text-center mt-10">
                                <p>No document processed yet.</p>
                                <p className="text-sm">Process a document to see its content here.</p>
                            </div>
                        )}
                    </div>
                    <style>{`
                        .prose-viewer {
                            color: #d1d5db; /* text-gray-300 */
                            font-size: 0.9rem;
                            line-height: 1.6;
                        }
                        .prose-viewer h1, .prose-viewer h2, .prose-viewer h3, .prose-viewer h4 {
                            color: #f1f5f9; /* slate-100 */
                            margin-bottom: 0.5em;
                            margin-top: 1em;
                            font-weight: 600;
                        }
                        .prose-viewer h1 { font-size: 1.5em; }
                        .prose-viewer h2 { font-size: 1.3em; }
                        .prose-viewer h3 { font-size: 1.1em; }
                        .prose-viewer p { margin-bottom: 1em; }
                        .prose-viewer ul, .prose-viewer ol { margin-left: 1.5em; margin-bottom: 1em; }
                        .prose-viewer li { margin-bottom: 0.5em; }
                        .prose-viewer strong { color: #e2e8f0; /* slate-200 */ }
                        .prose-viewer a { color: #38bdf8; /* sky-400 */ text-decoration: underline; }
                        .prose-viewer img { 
                            max-width: 100%; 
                            height: auto; 
                            border-radius: 0.5rem; 
                            margin-top: 1em;
                            margin-bottom: 1em;
                            border: 1px solid #475569; /* slate-600 */
                        }
                    `}</style>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default CanonViewer;
