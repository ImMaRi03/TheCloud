
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
    onCreateFolder?: () => void;
    onUploadFile?: (file: File) => void;
    onUploadFolder?: (files: FileList) => void;
    storageUsage?: number;
}

export function DashboardLayout({ children, onCreateFolder, onUploadFile, onUploadFolder, storageUsage }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
            <Sidebar
                onCreateFolder={onCreateFolder}
                onUploadFile={onUploadFile}
                onUploadFolder={onUploadFolder}
                storageUsage={storageUsage}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                    {children}
                </main>
            </div>
        </div>
    );
}
