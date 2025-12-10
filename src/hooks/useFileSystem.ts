import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import type { FileSystemNode, BreadcrumbItem } from '../types/filesystem';

export const useFileSystem = (initialFolderId: string | null = null) => {
    const { user } = useAuth();
    const [nodes, setNodes] = useState<FileSystemNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    useEffect(() => {
        fetchNodes();
    }, [fetchNodes]);

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

    const deletePermanently = async (nodeId: string, storagePath: string | null) => {
        // If file, delete from storage first
        if (storagePath) {
            await supabase.storage.from('drive-files').remove([storagePath]);
        }
        await supabase.from('nodes').delete().eq('id', nodeId);
        fetchTrash(); // Refresh
    };

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
        fetchTrash, // Expose these for specialized pages or views
        restoreFromTrash,
        deletePermanently
    };
};
