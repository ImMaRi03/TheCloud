export interface FileSystemNode {
    id: string;
    created_at: string;
    owner_id: string;
    parent_id: string | null;
    name: string;
    is_folder: boolean;
    storage_path: string | null;
    file_type: string | null;
    size: number;
    content: string | null;
    is_starred: boolean;
    is_trashed: boolean;
    trashed_at: string | null;
}

export interface BreadcrumbItem {
    id: string;
    name: string;
}
