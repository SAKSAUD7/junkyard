
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function AdminSettings() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                            {user?.username}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                            {user?.email}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                            {user?.is_superuser ? 'Super Admin' : 'Staff'}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={logout}
                        className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
