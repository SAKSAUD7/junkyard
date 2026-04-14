import React, { useState, useEffect } from 'react';
import { vendorAds } from '../../services/vendorApi';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const VendorAds = () => {
    const [adsData, setAdsData] = useState({ active_plan: null, history: [] });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const plans = [
        {
            type: 'standard',
            title: 'Standard Plan',
            price: '$29/mo',
            features: ['Basic Visibility', 'Standard Support', 'Monthly Reports']
        },
        {
            type: 'minimal',
            title: 'Minimal Plan',
            price: '$9/mo',
            features: ['Listing Only', 'Community Support']
        },
        {
            type: 'premium',
            title: 'Premium Plan',
            price: '$59/mo',
            features: ['Top Position', 'Priority Support', 'Weekly Reports', 'Featured Badge']
        },
        {
            type: 'compact',
            title: 'Compact Plan',
            price: '$19/mo',
            features: ['Better Visibility', 'Email Support']
        }
    ];

    const fetchAds = async () => {
        try {
            const data = await vendorAds.get();
            setAdsData(data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load ads data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const activatePlan = async (planType) => {
        setActionLoading(true);
        setError('');
        setSuccess('');
        try {
            await vendorAds.activate(planType);
            setSuccess(`Successfully activated ${planType} plan!`);
            await fetchAds();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to activate plan');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Ad Management</h1>
            
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {success}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Current Active Plan</h2>
                {adsData.active_plan ? (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-sm font-medium text-blue-800 uppercase bg-blue-200 px-2 py-1 rounded inline-block mb-2">
                                    {adsData.active_plan.plan_type}
                                </span>
                                <p className="text-gray-700">Valid until: <span className="font-semibold">{adsData.active_plan.end_date}</span></p>
                            </div>
                            <span className="flex items-center text-green-600 font-medium">
                                <CheckCircle className="w-5 h-5 mr-1" /> Active
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">You do not have any active ad plans. Select a plan below.</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <div key={plan.type} className={`bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col ${adsData.active_plan?.plan_type === plan.type ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'}`}>
                        <div className="p-6 flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.title}</h3>
                            <div className="text-2xl font-black text-blue-600 mb-4">{plan.price}</div>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={() => activatePlan(plan.type)}
                                disabled={actionLoading || !!adsData.active_plan}
                                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                                    adsData.active_plan?.plan_type === plan.type 
                                        ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                                        : !!adsData.active_plan 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                }`}
                            >
                                {adsData.active_plan?.plan_type === plan.type ? 'Current Plan' : 'Activate Plan'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {adsData.history.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Ad History</h2>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {adsData.history.map((ad, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{ad.plan_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.start_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.end_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {ad.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorAds;
