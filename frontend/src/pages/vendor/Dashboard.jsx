import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorDashboard } from '../../services/vendorApi';
import '../../styles/vendor.css';

const VendorDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await vendorDashboard.getOverview();
            setDashboardData(response.data);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (error) {
        return <div style={{ color: 'var(--vendor-error)' }}>{error}</div>;
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'new':
                return 'vendor-badge-info';
            case 'contacted':
                return 'vendor-badge-warning';
            case 'converted':
                return 'vendor-badge-success';
            case 'closed':
                return 'vendor-badge-neutral';
            default:
                return 'vendor-badge-neutral';
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: 'var(--vendor-spacing-xl)' }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    color: 'var(--vendor-text-primary)',
                    margin: '0 0 0.5rem 0'
                }}>
                    Dashboard
                </h1>
                <p style={{
                    color: 'var(--vendor-text-secondary)',
                    fontSize: '0.875rem',
                    margin: 0
                }}>
                    Welcome back! Here's an overview of your vendor account.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="vendor-stats-grid">
                <div className="vendor-stat-card">
                    <div className="vendor-stat-label">Total Leads</div>
                    <div className="vendor-stat-value">{dashboardData?.total_leads || 0}</div>
                    <div className="vendor-stat-change positive">All time</div>
                </div>

                <div className="vendor-stat-card">
                    <div className="vendor-stat-label">New Leads</div>
                    <div className="vendor-stat-value">{dashboardData?.new_leads || 0}</div>
                    <div className="vendor-stat-change">Awaiting response</div>
                </div>

                <div className="vendor-stat-card">
                    <div className="vendor-stat-label">Contacted</div>
                    <div className="vendor-stat-value">{dashboardData?.contacted_leads || 0}</div>
                    <div className="vendor-stat-change">In progress</div>
                </div>

                <div className="vendor-stat-card">
                    <div className="vendor-stat-label">Converted</div>
                    <div className="vendor-stat-value">{dashboardData?.converted_leads || 0}</div>
                    <div className="vendor-stat-change positive">Successful</div>
                </div>
            </div>

            {/* Account Status */}
            <div className="vendor-card" style={{ marginBottom: 'var(--vendor-spacing-xl)' }}>
                <div className="vendor-card-header">
                    <h3 className="vendor-card-title">Account Status</h3>
                    <span className={`vendor-badge ${dashboardData?.account_status === 'Active' ? 'vendor-badge-success' : 'vendor-badge-error'}`}>
                        {dashboardData?.account_status || 'Active'}
                    </span>
                </div>
                <div className="vendor-card-body">
                    <p style={{ margin: 0 }}>
                        Your vendor account is currently active and receiving leads.
                    </p>
                </div>
            </div>

            {/* Recent Leads */}
            <div className="vendor-card">
                <div className="vendor-card-header">
                    <h3 className="vendor-card-title">Recent Leads</h3>
                    <Link to="/vendor/leads" className="vendor-btn vendor-btn-secondary">
                        View All
                    </Link>
                </div>

                <div className="vendor-table-container" style={{ marginTop: 'var(--vendor-spacing-md)' }}>
                    <table className="vendor-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Part</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData?.recent_leads && dashboardData.recent_leads.length > 0 ? (
                                dashboardData.recent_leads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>
                                                {lead.year} {lead.make} {lead.model}
                                            </div>
                                        </td>
                                        <td>{lead.part}</td>
                                        <td>
                                            <div>{lead.customer_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)' }}>
                                                {lead.customer_email}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`vendor-badge ${getStatusBadgeClass(lead.status)}`}>
                                                {lead.status_display}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)' }}>
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Link
                                                to={`/vendor/leads/${lead.id}`}
                                                className="vendor-btn vendor-btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--vendor-text-secondary)' }}>
                                        No recent leads found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
