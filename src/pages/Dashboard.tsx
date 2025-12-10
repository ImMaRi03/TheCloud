import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useFileSystem } from '@/hooks/useFileSystem';
import {
    Folder, FileText, MoreVertical, Star, Trash2,
    LayoutGrid, List as ListIcon,
    ChevronRight, UploadCloud, File as FileIcon,
    Image as ImageIcon, Code, Music, Video,
    RotateCcw, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
    view?: 'my-drive' | 'recent' | 'starred' | 'trash';
}

export default function Dashboard({ view = 'my-drive' }: DashboardProps) {
    const {
        nodes, loading, currentFolderId, breadcrumbs,
        createFolder, uploadFile, toggleStar, moveToTrash,
        setCurrentFolderId, fetchNodes, fetchStarred, fetchTrash,
        restoreFromTrash, deletePermanently
    } = useFileSystem();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [dragActive, setDragActive] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);

    // Fetch data based on view
    useEffect(() => {
        if (view === 'starred') fetchStarred();
        else if (view === 'trash') fetchTrash();
        else fetchNodes();
    }, [view, currentFolderId, fetchNodes, fetchStarred, fetchTrash]);

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get icon for file type
    const getFileIcon = (type: string | null) => {
        if (!type) return <FileIcon className="w-8 h-8 text-gray-400" />;
        if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-purple-500" />;
        if (type.startsWith('audio/')) return <Music className="w-8 h-8 text-pink-500" />;
        if (type.startsWith('video/')) return <Video className="w-8 h-8 text-red-500" />;
        if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-600" />;
        if (type.includes('json') || type.includes('javascript') || type.includes('typescript')) return <Code className="w-8 h-8 text-blue-500" />;
        return <FileIcon className="w-8 h-8 text-gray-400" />;
    };

    // Drag and Drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Handle file upload
            Array.from(e.dataTransfer.files).forEach(file => uploadFile(file));
        }
    };

    // Actions
    const handleCreateFolder = () => {
        const name = prompt("Enter folder name:");
        if (name) createFolder(name);
    };

    const getTitle = () => {
        switch (view) {
            case 'recent': return 'Recent Files';
            case 'starred': return 'Starred';
            case 'trash': return 'Trash';
            default: return 'My Drive';
        }
    };

    const ContextMenu = () => {
        if (!contextMenu) return null;
        const node = nodes.find(n => n.id === contextMenu.nodeId);
        if (!node) return null;

        return (
            <div
                className="fixed bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[200px]"
                style={{ top: contextMenu.y, left: contextMenu.x }}
            >
                {view === 'trash' ? (
                    <>
                        <button
                            onClick={() => { restoreFromTrash(node.id); setContextMenu(null); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                        >
                            <RotateCcw className="w-4 h-4" /> Restore
                        </button>
                        <button
                            onClick={() => { deletePermanently(node.id, node.storage_path); setContextMenu(null); }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 text-sm"
                        >
                            <X className="w-4 h-4" /> Delete Forever
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => { toggleStar(node.id, node.is_starred); setContextMenu(null); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                        >
                            <Star className={cn("w-4 h-4", node.is_starred && "fill-yellow-400 text-yellow-400")} />
                            {node.is_starred ? 'Remove from Starred' : 'Add to Starred'}
                        </button>
                        {/* <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm">
                            <Download className="w-4 h-4" /> Download
                        </button> */}
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                        <button
                            onClick={() => { moveToTrash(node.id); setContextMenu(null); }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 text-sm"
                        >
                            <Trash2 className="w-4 h-4" /> Move to Trash
                        </button>
                    </>
                )}
            </div>
        );
    };

    // Close context menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <DashboardLayout>
            <div
                className="h-full flex flex-col"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getTitle()}</h1>
                        {/* Breadcrumbs */}
                        {view === 'my-drive' && breadcrumbs.length > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                                <span
                                    className="hover:underline cursor-pointer"
                                    onClick={() => setCurrentFolderId(null)}
                                >
                                    Home
                                </span>
                                {breadcrumbs.map((crumb) => (
                                    <div key={crumb.id} className="flex items-center">
                                        <ChevronRight className="w-4 h-4 mx-1" />
                                        <span
                                            className="hover:underline cursor-pointer"
                                            onClick={() => setCurrentFolderId(crumb.id)}
                                        >
                                            {crumb.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {view === 'my-drive' && (
                            <button
                                onClick={handleCreateFolder}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mr-2"
                            >
                                + New Folder
                            </button>
                        )}
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500")}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Drag Overlay */}
                {dragActive && (
                    <div className="absolute inset-0 bg-blue-500/10 border-4 border-blue-500 border-dashed rounded-xl z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                            <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
                            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">Drop files to upload</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : nodes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <img src="/placeholder-empty.svg" alt="" className="w-32 h-32 opacity-50" />
                        </div>
                        <p className="text-xl font-medium text-gray-600 dark:text-gray-300">It's pretty empty here</p>
                        <p className="text-sm mt-2">Drag and drop files to upload</p>
                    </div>
                ) : (
                    <div className={cn(
                        viewMode === 'grid'
                            ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4"
                            : "space-y-1 p-4"
                    )}>
                        {nodes.map((node) => (
                            <div
                                key={node.id}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
                                }}
                                onClick={() => node.is_folder && setCurrentFolderId(node.id)}
                                className={cn(
                                    "group relative border border-gray-200 dark:border-gray-700 rounded-xl transition-all cursor-pointer hover:border-blue-500 dark:hover:border-blue-500",
                                    viewMode === 'grid'
                                        ? "aspect-[4/3] flex flex-col bg-white dark:bg-gray-800 p-3 hover:shadow-md"
                                        : "flex items-center px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                )}
                            >
                                {/* Context Menu Trigger (Mobile/Accessible) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>

                                {viewMode === 'grid' ? (
                                    <>
                                        <div className="flex-1 flex items-center justify-center">
                                            {node.is_folder ? (
                                                <Folder className={cn("w-16 h-16", node.content ? "text-blue-500" : "text-gray-400 fill-gray-100 dark:fill-gray-700")} />
                                            ) : (
                                                getFileIcon(node.file_type)
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[80%]">
                                                {node.name}
                                            </span>
                                            {node.is_starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mr-4">
                                            {node.is_folder ? (
                                                <Folder className="w-6 h-6 text-gray-400" />
                                            ) : (
                                                getFileIcon(node.file_type)
                                            )}
                                        </div>
                                        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {node.name}
                                        </span>
                                        <span className="text-xs text-gray-500 w-24">
                                            {node.size ? formatSize(node.size) : '--'}
                                        </span>
                                        <span className="text-xs text-gray-500 w-32 hidden md:block">
                                            {new Date(node.created_at).toLocaleDateString()}
                                        </span>
                                        {node.is_starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-4" />}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <ContextMenu />
            </div>
        </DashboardLayout>
    );
}
