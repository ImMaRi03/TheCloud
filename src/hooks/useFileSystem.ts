import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import type { FileSystemNode, BreadcrumbItem } from '../types/filesystem';

export const useFileSystem = (initialFolderId: string | null = null, view: 'my-drive' | 'recent' | 'starred' | 'trash' = 'my-drive') => {
    const { user } = useAuth();
    const [nodes, setNodes] = useState<FileSystemNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [totalUsage, setTotalUsage] = useState(0);

    const fetchStorageUsage = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('nodes')
            .select('size')
            .eq('owner_id', user.id)
            .eq('is_folder', false);

        if (data) {
            const total = data.reduce((acc, curr) => acc + (curr.size || 0), 0);
            setTotalUsage(total);
        }
    }, [user]);

    useEffect(() => {
        fetchStorageUsage();
    }, [fetchStorageUsage]);

    const fetchNodes = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        try {
            let query = supabase
                .from('nodes')
                .select('*')
                .eq('owner_id', user.id)
                .eq('is_trashed', false);

            if (currentFolderId) {
                query = query.eq('parent_id', currentFolderId);
            } else {
                query = query.is('parent_id', null);
            }

            const { data, error } = await query.order('is_folder', { ascending: false }).order('name');

            if (error) throw error;
            setNodes(data as FileSystemNode[]);
        } catch (error) {
            console.error('Error fetching nodes:', error);
        } finally {
            setLoading(false);
        }
    }, [user, currentFolderId]);

    // Fetch breadcrumbs
    useEffect(() => {
        const fetchPath = async () => {
            if (!currentFolderId) {
                setBreadcrumbs([]);
                return;
            }
            // Recursive CTE would be better, but implementing iterative fetch for simplicity
            const path: BreadcrumbItem[] = [];
            let currentId = currentFolderId;

            while (currentId) {
                const { data } = await supabase.from('nodes').select('id, name, parent_id').eq('id', currentId).single();
                if (data) {
                    path.unshift({ id: data.id, name: data.name });
                    currentId = data.parent_id;
                } else {
                    break;
                }
            }
            setBreadcrumbs(path);
        };
        fetchPath();
    }, [currentFolderId]);



    const createFolder = async (name: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('nodes').insert({
                name,
                is_folder: true,
                parent_id: currentFolderId,
                owner_id: user.id
            });
            if (error) throw error;
            fetchNodes();
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const uploadFile = async (file: File) => {
        if (!user) return;
        try {
            const filePath = `${user.id}/${Date.now()}_${file.name}`;

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('drive-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Insert into Database
            const { error: dbError } = await supabase.from('nodes').insert({
                name: file.name,
                is_folder: false,
                parent_id: currentFolderId,
                owner_id: user.id,
                storage_path: filePath,
                file_type: file.type,
                size: file.size
            });

            if (dbError) throw dbError;

            fetchNodes();
            fetchStorageUsage();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const toggleStar = async (nodeId: string, currentStatus: boolean) => {
        try {
            await supabase.from('nodes').update({ is_starred: !currentStatus }).eq('id', nodeId);
            // Optimistic update
            setNodes(nodes.map(n => n.id === nodeId ? { ...n, is_starred: !currentStatus } : n));
        } catch (error) {
            console.error('Error toggling star:', error);
        }
    };

    const moveToTrash = async (nodeId: string) => {
        try {
            await supabase.from('nodes').update({
                is_trashed: true,
                trashed_at: new Date().toISOString()
            }).eq('id', nodeId);
            fetchNodes();
        } catch (error) {
            console.error('Error moving to trash:', error);
        }
    };

    // Dedicated fetchers for special views
    const fetchStarred = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase.from('nodes').select('*').eq('owner_id', user.id).eq('is_starred', true).eq('is_trashed', false);
        setNodes(data as FileSystemNode[]);
        setLoading(false);
    }, [user]);

    const fetchTrash = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase.from('nodes').select('*').eq('owner_id', user.id).eq('is_trashed', true);
        setNodes(data as FileSystemNode[]);
        setLoading(false);
    }, [user]);

    const restoreFromTrash = async (nodeId: string) => {
        await supabase.from('nodes').update({ is_trashed: false, trashed_at: null }).eq('id', nodeId);
        fetchTrash(); // Refresh trash view
    };

    const moveNode = async (nodeId: string, targetFolderId: string | null) => {
        try {
            await supabase.from('nodes').update({ parent_id: targetFolderId }).eq('id', nodeId);
            fetchNodes();
        } catch (error) {
            console.error('Error moving node:', error);
        }
    };

    const uploadFolderStructure = async (files: FileList) => {
        if (!user) return;
        setLoading(true);

        const fileArray = Array.from(files);
        // Sort by path length to ensure folders are created in order
        fileArray.sort((a, b) => (a.webkitRelativePath || a.name).length - (b.webkitRelativePath || b.name).length);

        const folderCache: { [key: string]: string } = {};
        if (currentFolderId) folderCache[''] = currentFolderId;

        try {
            for (const file of fileArray) {
                const relativePath = file.webkitRelativePath || file.name;
                const pathParts = relativePath.split('/');
                pathParts.pop(); // Remove file name

                // Find or create parent folder
                let parentId = currentFolderId;
                let currentPath = '';

                for (const part of pathParts) {
                    currentPath = currentPath ? `${currentPath}/${part}` : part;

                    if (folderCache[currentPath]) {
                        parentId = folderCache[currentPath];
                    } else {
                        // Check if folder exists in DB under the current parent
                        // Optimization: We could query all folders upfront, but for now we do specific checks/creates
                        // Note: To properly support this without excessive queries, we should likely select all folders in tree.
                        // For this implementation, we will try to just create if it doesn't exist in our cache for this session.

                        // We need a way to check if this folder already exists in the destination to avoid dupes
                        const { data: existing } = await supabase
                            .from('nodes')
                            .select('id')
                            .eq('name', part)
                            .eq('is_folder', true)
                            .is('parent_id', parentId) // Check in the resolved parent
                            .eq('owner_id', user.id)
                            .maybeSingle();

                        if (existing) {
                            parentId = existing.id;
                            folderCache[currentPath] = existing.id;
                        } else {
                            // Create
                            const { data: newFolder, error } = await supabase
                                .from('nodes')
                                .insert({
                                    name: part,
                                    is_folder: true,
                                    parent_id: parentId,
                                    owner_id: user.id
                                })
                                .select('id')
                                .single();

                            if (error) throw error;
                            if (newFolder) {
                                parentId = newFolder.id;
                                folderCache[currentPath] = newFolder.id;
                            }
                        }
                    }
                }

                // Upload the file to the resolved parentId
                await uploadFileToFolder(file, parentId);
            }
        } catch (error) {
            console.error('Error uploading folder structure:', error);
            alert('Error in batch upload');
        } finally {
            fetchNodes();
            setLoading(false);
        }
    };

    // Modified uploadFile to accept targetFolderId optionally
    const uploadFileToFolder = async (file: File, targetFolderId: string | null) => {
        if (!user) return;
        // Logic same as uploadFile but using targetFolderId
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('drive-files').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from('nodes').insert({
            name: file.name,
            is_folder: false,
            parent_id: targetFolderId,
            owner_id: user.id,
            storage_path: filePath,
            file_type: file.type,
            size: file.size
        });
        if (dbError) throw dbError;
        fetchStorageUsage();
    };

    const deletePermanently = async (nodeId: string, storagePath: string | null) => {
        // If file, delete from storage first
        if (storagePath) {
            await supabase.storage.from('drive-files').remove([storagePath]);
        }
        await supabase.from('nodes').delete().eq('id', nodeId);
        fetchTrash(); // Refresh
        fetchStorageUsage();
    };

    const touchNode = async (nodeId: string) => {
        try {
            await supabase.from('nodes').update({ updated_at: new Date().toISOString() }).eq('id', nodeId);
            // Optimistic update if needed, but usually we refetch or let next fetch handle it
        } catch (error) {
            console.error('Error touching node:', error);
        }
    };

    const fetchRecent = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch all files (not folders) owned by user, ordered by updated_at
            const { data } = await supabase
                .from('nodes')
                .select('*')
                .eq('owner_id', user.id)
                .eq('is_folder', false)
                .eq('is_trashed', false)
                .order('updated_at', { ascending: false })
                .limit(50); // increased limit to ensure we find enough candidates

            if (data) {
                // Filter client side: Only show files where updated_at > created_at (with some tolerance)
                // or just updated_at is significantly later than created_at
                const recentFiles = (data as FileSystemNode[]).filter(node => {
                    if (!node.updated_at) return false;
                    const created = new Date(node.created_at).getTime();
                    const updated = new Date(node.updated_at).getTime();
                    return updated > created;
                });
                setNodes(recentFiles);
            }
        } catch (error) {
            console.error('Error fetching recent:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        setNodes([]); // Clear nodes to prevent state leakage
        if (view !== 'my-drive') {
            setCurrentFolderId(null);
        }

        if (view === 'recent') {
            fetchRecent();
        } else if (view === 'starred') {
            fetchStarred();
        } else if (view === 'trash') {
            fetchTrash();
        } else {
            fetchNodes();
        }
    }, [view, fetchNodes, fetchRecent, fetchStarred, fetchTrash]);

    return {
        nodes,
        loading,
        currentFolderId,
        breadcrumbs,
        viewMode,
        setViewMode,
        setCurrentFolderId,
        createFolder,
        uploadFile,
        toggleStar,
        moveToTrash,
        fetchNodes,
        fetchStarred,
        fetchTrash,
        fetchRecent,
        touchNode,
        restoreFromTrash,
        deletePermanently,
        moveNode,
        uploadFolderStructure,
        totalUsage
    };
};
