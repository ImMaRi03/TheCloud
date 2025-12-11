import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { HardDrive, Clock, Star, Trash2, Plus, Cloud, FolderPlus, FileUp, FolderUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    onCreateFolder?: () => void;
    onUploadFile?: (file: File) => void;
    onUploadFolder?: (files: FileList) => void;
    storageUsage?: number;
}

import { useLanguage } from '@/context/LanguageContext';

export function Sidebar({ onCreateFolder, onUploadFile, onUploadFolder, storageUsage = 0 }: SidebarProps) {
    const { t } = useLanguage();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    // Constants
    const STORAGE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB
    const usagePercent = Math.min((storageUsage / STORAGE_LIMIT) * 100, 100);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const navItems = [
        { icon: HardDrive, label: t('myDrive'), path: '/' },
        { icon: Clock, label: t('recentFiles'), path: '/recent' },
        { icon: Star, label: t('starred'), path: '/starred' },
        { icon: Trash2, label: t('trash'), path: '/trash' },
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUploadFile) {
            onUploadFile(e.target.files[0]);
        }
        // Reset input
        e.target.value = '';
        setIsDropdownOpen(false);
    };

    const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onUploadFolder) {
            onUploadFolder(e.target.files);
        }
        e.target.value = '';
        setIsDropdownOpen(false);
    };

    return (
        <div className="w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 px-2 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100">CloudDrive</span>
            </div>

            {/* New Button & Dropdown */}
            <div className="relative mb-6" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all group"
                >
                    <Plus className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{t('new')}</span>
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
                        <button
                            onClick={() => { onCreateFolder?.(); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm transition-colors text-left"
                        >
                            <FolderPlus className="w-4 h-4 text-gray-500" />
                            {t('createFolder')}
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm transition-colors text-left"
                        >
                            <FileUp className="w-4 h-4 text-gray-500" />
                            {t('uploadFile')}
                        </button>
                        <button
                            onClick={() => folderInputRef.current?.click()}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm transition-colors text-left"
                        >
                            <FolderUp className="w-4 h-4 text-gray-500" />
                            {t('uploadFolder')}
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <input
                type="file"
                ref={folderInputRef}
                className="hidden"
                {...{ webkitdirectory: "", directory: "" } as any}
                onChange={handleFolderChange}
                multiple
            />

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Storage Status */}
            <div className="mt-auto px-2">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>{t('storage')}</span>
                    <span>{usagePercent > 0 && usagePercent < 1 ? '< 1' : Math.round(usagePercent)}% {t('used')}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500",
                            usagePercent > 90 ? "bg-red-500" : "bg-blue-500"
                        )}
                        style={{ width: `${Math.max(usagePercent, storageUsage > 0 ? 5 : 0)}%` }}
                    />
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">
                    {formatSize(storageUsage)} {t('of')} {formatSize(STORAGE_LIMIT)} {t('used')}
                </div>
            </div>
        </div>
    );
}
