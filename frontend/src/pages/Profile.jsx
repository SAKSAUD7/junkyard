import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Navigate } from 'react-router-dom';

const Profile = () => {
    const { user, isAuthenticated, logout } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SEO title="My Profile | JYNM" description="Manage your account settings" />
            <Navbar />

            <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            User Profile
                        </h3>
                        {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Personal details and settings.
                        </p> */}
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user?.first_name} {user?.last_name}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                                <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.user_type || 'User'}</dd>
                            </div>
                        </dl>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
