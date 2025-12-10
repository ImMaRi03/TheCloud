
import { Search, Bell, Settings, User } from 'lucide-react';

export function Header() {
    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-2xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search in Drive..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-lg outline-none transition-all placeholder:text-gray-500"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium cursor-pointer">
                    <User className="w-4 h-4" />
                </div>
            </div>
        </header>
    );
}
