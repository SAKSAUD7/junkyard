import { useState, useEffect, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function AdminAnalytics() {
    const { token } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getSiteAnalyticsSummary(token);
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError('Could not load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAnalytics();
        else setLoading(false);
    }, [token]);

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Site Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Track key actions across the platform.</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && !analytics ? (
                <div className="flex justify-center items-center h-48">
                    <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-50 p-6 rounded-xl flex items-center gap-3">
                    <p className="text-red-700 font-semibold">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500">
                                <ChartBarIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Logins</h2>
                        </div>
                        <p className="text-3xl font-black text-slate-900 mt-2">{analytics?.login || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500">
                                <ChartBarIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Signups</h2>
                        </div>
                        <p className="text-3xl font-black text-slate-900 mt-2">{analytics?.signup || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500">
                                <ChartBarIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Lead Submissions</h2>
                        </div>
                        <p className="text-3xl font-black text-slate-900 mt-2">{analytics?.lead_submit || 0}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
