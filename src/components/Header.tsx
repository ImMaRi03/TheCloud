import { Search, Bell, Settings, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { SettingsModal } from './SettingsModal';
import { useSearch } from '@/context/SearchContext';

export function Header() {
    const {
        notifications,
        isNotificationPanelOpen,
        toggleNotificationPanel,
        closeNotificationPanel
    } = useNotification();
    const { user, signOut } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { searchQuery, setSearchQuery } = useSearch();

    // User Menu State
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const activeNotifications = notifications.filter(n => n.status !== 'completed' && n.status !== 'failed');

    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-2xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-lg outline-none transition-all placeholder:text-gray-500"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        id="notification-bell"
                        onClick={toggleNotificationPanel}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
                    >
                        <Bell className="w-5 h-5" />
                        {activeNotifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>

                    {isNotificationPanelOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('notifications')}</h3>
                                <button onClick={closeNotificationPanel} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">{t('close')}</button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className="p-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{notification.title}</span>
                                                <span className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            {notification.message && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{notification.message}</p>}
                                            {notification.type === 'download' && (
                                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-blue-500 h-full transition-all duration-300"
                                                        style={{ width: `${notification.progress || 0}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        {t('noNotifications')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm ring-2 ring-transparent hover:ring-blue-500/50 transition-all overflow-hidden"
                    >
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.email?.[0].toUpperCase() || 'U'
                        )}
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            {/* User Info */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('freePlan')}</p>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={toggleTheme}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    {isDark ? t('lightMode') : t('darkMode')}
                                </button>

                                <button
                                    onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Globe className="w-4 h-4" />
                                    {language === 'en' ? 'Español' : 'English'}
                                </button>

                                <button
                                    onClick={() => {
                                        setIsSettingsModalOpen(true);
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    {t('settings')}
                                </button>

                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

                                <button
                                    onClick={() => signOut()}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t('signOut')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </header>
    );
}
