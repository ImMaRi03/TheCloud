import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import type { FileSystemNode } from '@/types/filesystem';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { read, utils } from 'xlsx';
import * as mammoth from 'mammoth';

export default function FileEditor() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState<FileSystemNode | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);

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

                        // Fetch Content for Text/Code types
                        // Note: For binary files we might not fetch "content" string here except for specific handlers
                        if (isCode(node.name)) {
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

            // Update modified time? DB trigger handles 'updated_at' usually, or we update it manually.
            await supabase.from('nodes').update({ updated_at: new Date().toISOString() }).eq('id', file.id);

            alert('Saved successfully!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const isCode = (name: string) => name.endsWith('.java') || name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.txt') || name.endsWith('.css') || name.endsWith('.html');
    const isImage = (type: string) => type?.startsWith('image/');

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!file) return <div>File not found</div>;

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
                {isCode(file.name) && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden">
                {isCode(file.name) ? (
                    <Editor
                        height="100%"
                        defaultLanguage={file.name.endsWith('.java') ? 'java' : 'typescript'}
                        theme="vs-dark"
                        value={content}
                        onChange={(val) => setContent(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                        }}
                    />
                ) : isImage(file.file_type || '') && signedUrl ? (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <img src={signedUrl} alt={file.name} className="max-h-[80vh] shadow-lg rounded-lg" />
                        <p className="mt-4 text-gray-500">Image editing features coming soon.</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <p className="text-lg">Editing is not yet supported for this file type in the browser.</p>
                        <p className="text-sm">Please download the file to edit locally.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
