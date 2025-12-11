import { X, Download, Maximize2, Edit } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { FileSystemNode } from '@/types/filesystem';
import * as mammoth from 'mammoth';
import { read, utils } from 'xlsx';
import { useNavigate } from 'react-router-dom';

interface FilePreviewModalProps {
    file: FileSystemNode;
    onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
    const navigate = useNavigate();
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            if (!file.storage_path) return;

            setLoading(true);
            try {
                // Get Signed URL
                const { data } = await supabase.storage
                    .from('drive-files')
                    .createSignedUrl(file.storage_path, 3600); // 1 hour

                if (data?.signedUrl) {
                    setSignedUrl(data.signedUrl);

                    // Fetch content for specific types
                    if (file.file_type?.includes('spreadsheet') || file.name.endsWith('.xlsx')) {
                        const response = await fetch(data.signedUrl);
                        const blob = await response.blob();
                        const arrayBuffer = await blob.arrayBuffer();
                        const wb = read(arrayBuffer);
                        const ws = wb.Sheets[wb.SheetNames[0]];
                        const html = utils.sheet_to_html(ws);
                        setContent(html);
                    } else if (file.file_type?.includes('document') || file.name.endsWith('.docx')) {
                        const response = await fetch(data.signedUrl);
                        const arrayBuffer = await response.arrayBuffer();
                        const result = await mammoth.convertToHtml({ arrayBuffer });
                        setContent(result.value);
                    } else if (file.name.endsWith('.java') || file.file_type?.includes('text') || file.name.endsWith('.ts') || file.name.endsWith('.js')) {
                        const response = await fetch(data.signedUrl);
                        const text = await response.text();
                        setContent(text);
                    }
                }
            } catch (error) {
                console.error('Error loading file:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [file]);

    const handleDownload = () => {
        if (signedUrl) {
            const link = document.createElement('a');
            link.href = signedUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleEdit = () => {
        navigate(`/editor/${file.id}`);
    };

    const isImage = file.file_type?.startsWith('image/');
    const isPDF = file.file_type === 'application/pdf';
    const isCode = file.name.endsWith('.java') || file.name.endsWith('.ts') || file.name.endsWith('.js');
    const isDoc = file.name.endsWith('.docx') || file.name.endsWith('.xlsx');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className={cn(
                    "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 transition-all",
                    isMaximized ? "fixed inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)]" : "w-full max-w-5xl h-[80vh]"
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate max-w-md">
                            {file.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors" title={isMaximized ? "Restore" : "Maximize"}>
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <button onClick={handleDownload} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors" title="Download">
                            <Download className="w-5 h-5" />
                        </button>
                        <button onClick={handleEdit} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors" title="Edit">
                            <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg text-gray-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900/30 p-4 flex items-center justify-center relative">
                    {loading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    ) : (
                        <>
                            {isImage && signedUrl && (
                                <img src={signedUrl} alt={file.name} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                            )}

                            {isPDF && signedUrl && (
                                <iframe src={signedUrl} className="w-full h-full rounded-lg shadow-lg border-none" title="PDF Viewer" />
                            )}

                            {(isCode || isDoc) && content && (
                                <div className={cn(
                                    "w-full h-full p-8 rounded-lg shadow-sm overflow-auto max-w-none",
                                    isDoc
                                        ? "bg-white text-black prose"
                                        : "bg-white dark:bg-gray-950 prose dark:prose-invert"
                                )}>
                                    {isCode ? (
                                        <pre className="font-mono text-sm">
                                            <code>{content}</code>
                                        </pre>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: content }} />
                                    )}
                                </div>
                            )}

                            {!isImage && !isPDF && !isCode && !isDoc && (
                                <div className="text-center text-gray-500">
                                    <p>No preview available for this file type.</p>
                                    <button onClick={handleDownload} className="mt-4 text-blue-600 hover:underline">Download to view</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
