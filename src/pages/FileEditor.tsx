import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import type { FileSystemNode } from '@/types/filesystem';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Save, Loader2, Bold, Italic, List, Heading1, Heading2, Heading3, Link as LinkIcon, Eye, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/context/LanguageContext';

export default function FileEditor() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [file, setFile] = useState<FileSystemNode | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchFile = async () => {
            if (!fileId) return;

            try {
                // Get Metadata
                const { data: node, error } = await supabase
                    .from('nodes')
                    .select('*')
                    .eq('id', fileId)
                    .single();

                if (error) throw error;
                setFile(node);

                // Mark as viewed
                await supabase.from('nodes').update({ updated_at: new Date().toISOString() }).eq('id', fileId);

                if (node.storage_path) {
                    // Get URL
                    const { data: urlData } = await supabase.storage
                        .from('drive-files')
                        .createSignedUrl(node.storage_path, 3600);

                    if (urlData?.signedUrl) {
                        setSignedUrl(urlData.signedUrl);

                        // Fetch Content
                        // Basic logic: if it invites text editing, fetch it.
                        if (isCode(node.name) || node.name.endsWith('.md') || node.name.endsWith('.txt') || node.name.endsWith('.json')) {
                            const res = await fetch(urlData.signedUrl);
                            const text = await res.text();
                            setContent(text);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching file:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFile();
    }, [fileId]);

    const handleSave = async () => {
        if (!file || !file.storage_path) return;
        setSaving(true);
        try {
            const blob = new Blob([content], { type: file.file_type || 'text/plain' });

            // Overwrite in storage
            const { error } = await supabase.storage
                .from('drive-files')
                .upload(file.storage_path, blob, { upsert: true });

            if (error) throw error;

            // Update modified time
            await supabase.from('nodes').update({ updated_at: new Date().toISOString() }).eq('id', file.id);

            alert(t('savedSuccess'));
        } catch (error: any) {
            console.error('Error saving:', error);
            alert(`${t('saveFailed')}: ${error.message || error.error_description || JSON.stringify(error)}`);
        } finally {
            setSaving(false);
        }
    };

    const isCode = (name: string) => name.endsWith('.java') || name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.css') || name.endsWith('.html') || name.endsWith('.json');
    const isImage = (type: string) => type?.startsWith('image/');
    const isMD = (name: string) => name.endsWith('.md');
    const isTxt = (name: string) => name.endsWith('.txt');

    // Markdown Toolbar Helpers
    const insertMarkdown = (prefix: string, suffix: string = '') => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newContent = before + prefix + selection + suffix + after;
        setContent(newContent);

        // Restore focus (timeout needed for React render cycle)
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
            }
        }, 0);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!file) return <div>{t('fileNotFound')}</div>;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{file.name}</span>
                </div>
                {(isCode(file.name) || isMD(file.name) || isTxt(file.name)) && (
                    <div className="flex items-center gap-2">
                        {isMD(file.name) && (
                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mr-2"
                            >
                                {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {previewMode ? 'Editor' : 'Preview'}
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('save')}
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {isCode(file.name) ? (
                    <Editor
                        height="100%"
                        defaultLanguage={file.name.endsWith('.java') ? 'java' : file.name.endsWith('.json') ? 'json' : 'typescript'}
                        theme="vs-dark"
                        value={content}
                        onChange={(val) => setContent(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                        }}
                    />
                ) : isMD(file.name) ? (
                    <div className="flex flex-col h-full">
                        {/* Toolbar */}
                        {!previewMode && (
                            <div className="h-10 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center px-4 gap-2">
                                <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300" title="Bold"><Bold className="w-4 h-4" /></button>
                                <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300" title="Italic"><Italic className="w-4 h-4" /></button>
                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                                <button onClick={() => insertMarkdown('# ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
                                <button onClick={() => insertMarkdown('## ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                                <button onClick={() => insertMarkdown('### ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                                <button onClick={() => insertMarkdown('- ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300" title="List"><List className="w-4 h-4" /></button>
                                <button onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300" title="Link"><LinkIcon className="w-4 h-4" /></button>
                            </div>
                        )}

                        {/* Editor/Preview */}
                        <div className="flex-1 overflow-auto bg-white dark:bg-gray-950">
                            {previewMode ? (
                                <div className="p-8 prose dark:prose-invert max-w-none">
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                </div>
                            ) : (
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full p-6 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                                    placeholder="Write your markdown here..."
                                />
                            )}
                        </div>
                    </div>
                ) : isTxt(file.name) ? (
                    <div className="h-full bg-white dark:bg-gray-950">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full p-6 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                            placeholder="Start typing..."
                        />
                    </div>
                ) : isImage(file.file_type || '') && signedUrl ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
                        <img src={signedUrl} alt={file.name} className="max-h-[80vh] shadow-lg rounded-lg" />
                        <p className="mt-4 text-gray-500">{t('imageEditingComingSoon')}</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <p className="text-lg">{t('editingNotSupported')}</p>
                        <p className="text-sm">{t('downloadToEdit')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
