import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import type { FileSystemNode } from '@/types/filesystem';
import { FileIcon, ImageIcon, Film, Music, Code, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileThumbnailProps {
    file: FileSystemNode;
    className?: string; // For container sizing/styling
}

export function FileThumbnail({ file, className }: FileThumbnailProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    const isImage = file.file_type?.startsWith('image/');

    useEffect(() => {
        if (!isImage || !file.storage_path) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [file, isImage]);

    useEffect(() => {
        if (isVisible && isImage && file.storage_path && !signedUrl) {
            const fetchUrl = async () => {
                setIsLoading(true);
                try {
                    const { data } = await supabase.storage
                        .from('drive-files')
                        .createSignedUrl(file.storage_path!, 3600); // 1 hour

                    if (data?.signedUrl) {
                        setSignedUrl(data.signedUrl);
                    }
                } catch (error) {
                    console.error("Error loading thumbnail:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUrl();
        }
    }, [isVisible, isImage, file, signedUrl]);

    // Icon logic (simplified version of what's likely in Dashboard or common usage)
    const getIcon = () => {
        if (file.file_type?.startsWith('image/')) return ImageIcon;
        if (file.file_type?.includes('pdf')) return FileText;
        if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) return FileText;
        if (file.name.endsWith('.xlsx')) return FileText;
        if (file.file_type?.startsWith('video/')) return Film;
        if (file.file_type?.startsWith('audio/')) return Music;
        if (file.name.endsWith('.java') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css')) return Code;
        return FileIcon;
    };

    const Icon = getIcon();

    if (isImage) {
        return (
            <div ref={imgRef} className={cn("w-full h-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg", className)}>
                {signedUrl ? (
                    <img
                        src={signedUrl}
                        alt={file.name}
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-300 dark:text-gray-600">
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Icon className="w-12 h-12" />
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn("w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg", className)}>
            <Icon className="w-12 h-12" />
        </div>
    );
}
