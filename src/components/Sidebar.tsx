import { NavLink } from 'react-router-dom';
import { HardDrive, Clock, Star, Trash2, Plus, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const navItems = [
        { icon: HardDrive, label: 'My Drive', path: '/' },
        { icon: Clock, label: 'Recent', path: '/recent' },
        { icon: Star, label: 'Starred', path: '/starred' },
        { icon: Trash2, label: 'Trash', path: '/trash' },
    ];

    return (
        <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 px-2 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100">CloudDrive</span>
            </div>

            {/* New Button */}
            <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all mb-6 group">
                <Plus className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">New</span>
            </button>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
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
                    <span>Storage</span>
                    <span>75% used</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[75%] rounded-full" />
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">
                    15 GB of 20 GB used
                </div>
            </div>
        </div>
    );
}
