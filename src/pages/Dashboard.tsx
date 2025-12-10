
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to your Drive</h1>
                    <p className="text-gray-500 dark:text-gray-400">Authenticated as {user?.email}</p>
                </div>

                {/* Content Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-700/50 rounded-xl flex items-center justify-center text-gray-400">
                                File Preview {i}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
