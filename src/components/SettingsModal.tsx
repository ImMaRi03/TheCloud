import { useState, useRef } from 'react';
import { X, Upload, Download, Trash2, Key, User, ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabaseClient';
import { downloadFolderAsZip } from '@/lib/downloadUtils';
import { useLanguage } from '@/context/LanguageContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user, signOut } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'profile' | 'data' | 'danger'>('profile');
    const [loading, setLoading] = useState(false);

    // Form States
    const [newPassword, setNewPassword] = useState('');
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        try {
            setLoading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;


            // Use 'avatars' public bucket for profile photos
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            // Force reload or state update if needed? AuthContext should pick up user change

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setIsEditingPassword(false);
            setNewPassword('');
            alert('Password updated successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        try {
            setLoading(true);
            await downloadFolderAsZip(null, {
                onProgress: (_pct, msg) => console.log(msg),
                onError: (err) => alert('Backup failed: ' + err),
                onComplete: () => alert('Backup downloaded!')
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm(t('confirmDelete'))) return;

        const confirmResult = prompt("Type 'DELETE' to confirm deletion of all data and account.");
        if (confirmResult !== 'DELETE') return;

        setLoading(true);
        try {
            if (!user) return;

            // 1. Delete all files in storage
            // Listing all files is expensive, for now we will just delete the DB nodes and let storage be orphaned 
            // OR try to delete what we know. Best effort:
            const { data: nodes } = await supabase.from('nodes').select('storage_path').eq('owner_id', user.id);
            if (nodes) {
                const paths = nodes.filter(n => n.storage_path).map(n => n.storage_path!);
                // Delete in chunks of 50
                while (paths.length > 0) {
                    await supabase.storage.from('drive-files').remove(paths.splice(0, 50));
                }
            }

            // 2. Delete all records
            await supabase.from('nodes').delete().eq('owner_id', user.id);

            // 3. Delete user (Client side cannot delete User from Auth schema usually, unless Admin)
            // We will Sign Out and clear local data.
            await signOut();

            alert('Account data deleted. Please contact support to fully remove your authentication record.');
            onClose();

        } catch (error) {
            console.error(error);
            alert('Error deleting account');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settingsTitle')}</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex min-h-[400px]">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            {t('profile')}
                        </button>
                        <button
                            onClick={() => setActiveTab('data')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'data'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Download className="w-4 h-4" />
                            {t('dataBackup')}
                        </button>
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                            <button
                                onClick={() => setActiveTab('danger')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'danger'
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600'
                                    }`}
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('dangerZone')}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 flex animate-spin text-blue-600" />
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{t('profilePhoto')}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                            {user?.user_metadata?.avatar_url ? (
                                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-gray-400">{user?.email?.[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {t('changePhoto')}
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t('emailAddress')}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-500"
                                            />
                                            {/* Changing email requires email verification flow usually, simplification here */}
                                            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium">
                                                {t('change')}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t('password')}</label>
                                        {!isEditingPassword ? (
                                            <button
                                                onClick={() => setIsEditingPassword(true)}
                                                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <Key className="w-4 h-4" />
                                                {t('changePassword')}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="New password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-lg text-sm outline-none"
                                                />
                                                <button
                                                    onClick={handleChangePassword}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingPassword(false)}
                                                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{t('exportData')}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {t('exportDesc')}
                                            </p>
                                            <button
                                                onClick={handleBackup}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                                            >
                                                {t('downloadBackup')} ({user?.email?.split('@')[0]}.zip)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'danger' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                    <div className="flex items-start gap-2 mb-2">
                                        <ShieldAlert className="w-5 h-5 text-red-600" />
                                        <h3 className="text-base font-semibold text-red-600 dark:text-red-400">{t('deleteAccount')}</h3>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {t('deleteDesc')}
                                    </p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-4 py-2 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {t('deleteButton')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
