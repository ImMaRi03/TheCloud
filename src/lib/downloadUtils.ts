import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '@/supabaseClient';
import type { FileSystemNode } from '@/types/filesystem';

export interface DownloadCallbacks {
    onStart?: () => void;
    onProgress?: (progress: number, message: string) => void;
    onComplete?: () => void;
    onError?: (error: unknown) => void;
}

/**
 * Downloads a node (file or folder).
 */
export const downloadNode = async (node: FileSystemNode, callbacks?: DownloadCallbacks) => {
    try {
        if (callbacks?.onStart) callbacks.onStart();

        if (node.is_folder) {
            await downloadFolderAsZip(node, callbacks);
        } else {
            await downloadFile(node);
        }

        if (callbacks?.onComplete) callbacks.onComplete();
    } catch (error) {
        console.error('Download failed', error);
        if (callbacks?.onError) callbacks.onError(error);
        else alert(`Failed to download ${node.name}`);
    }
};

const downloadFile = async (node: FileSystemNode) => {
    if (!node.storage_path) return;

    const { data, error } = await supabase.storage
        .from('drive-files')
        .download(node.storage_path);

    if (error) throw error;
    if (data) {
        saveAs(data, node.name);
    }
};

/**
 * Downloads a folder as a ZIP file.
 * If folderNode is null, it downloads the entire drive (root backup).
 */
export const downloadFolderAsZip = async (folderNode: FileSystemNode | null, callbacks?: DownloadCallbacks) => {
    const zip = new JSZip();
    let totalFiles = 0;
    let processedFiles = 0;
    const folderName = folderNode ? folderNode.name : 'TheCloud_Backup';
    const folderId = folderNode ? folderNode.id : null;

    // Helper to count files first for accurate progress
    const countFiles = async (parentId: string | null): Promise<number> => {
        let query = supabase.from('nodes').select('id, is_folder, parent_id').eq('is_trashed', false).eq('owner_id', (await supabase.auth.getUser()).data.user?.id);

        if (parentId === null) {
            query = query.is('parent_id', null);
        } else {
            query = query.eq('parent_id', parentId);
        }

        const { data: children } = await query;

        if (!children) return 0;

        let count = 0;
        for (const child of children) {
            if (child.is_folder) {
                count += await countFiles(child.id);
            } else {
                count++;
            }
        }
        return count;
    };

    if (callbacks?.onProgress) callbacks.onProgress(5, "Counting files...");
    totalFiles = await countFiles(folderId);

    if (totalFiles === 0) {
        // Empty folder, just create empty zip
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${folderName}.zip`);
        return;
    }

    const updateProgress = () => {
        if (callbacks?.onProgress) {
            const percentage = Math.round((processedFiles / totalFiles) * 80) + 10; // 10% to 90%
            callbacks.onProgress(percentage, `Zipping ${processedFiles}/${totalFiles} files...`);
        }
    };

    // For root backup, we iterate over all root items
    // For specific folder, we create the folder in zip ?? No, usually the zip content IS the folder content.
    // But if we download "MyFolder", the zip should probably contain "MyFolder" or just the contents?
    // Standard behavior: Zip name is FolderName.zip, contents are children.

    await addChildrenToZipFolder(zip, folderId, () => {
        processedFiles++;
        updateProgress();
    });

    if (callbacks?.onProgress) callbacks.onProgress(95, "Finalizing zip...");
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folderName}.zip`);

    if (callbacks?.onProgress) callbacks.onProgress(100, "Download started");
};

const addChildrenToZipFolder = async (
    zipFolder: JSZip,
    parentId: string | null,
    onFileProcessed: () => void
) => {
    let query = supabase.from('nodes').select('*').eq('is_trashed', false).eq('owner_id', (await supabase.auth.getUser()).data.user?.id);

    if (parentId === null) {
        query = query.is('parent_id', null);
    } else {
        query = query.eq('parent_id', parentId);
    }

    const { data: children, error } = await query;

    if (error) throw error;
    if (!children) return;

    for (const child of children) {
        if (child.is_folder) {
            const newFolder = zipFolder.folder(child.name);
            if (newFolder) {
                await addChildrenToZipFolder(newFolder, child.id, onFileProcessed);
            }
        } else {
            if (child.storage_path) {
                try {
                    const { data: blob, error: downError } = await supabase.storage
                        .from('drive-files')
                        .download(child.storage_path);

                    if (downError) throw downError;
                    if (blob) {
                        zipFolder.file(child.name, blob);
                    }
                } catch (e) {
                    console.error(`Failed to download file: ${child.name}`, e);
                    zipFolder.file(`${child.name}.error.txt`, "Failed to download this file.");
                } finally {
                    onFileProcessed();
                }
            } else {
                onFileProcessed();
            }
        }
    }
}
