import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorLeads } from '../../services/vendorApi';
import '../../styles/vendor.css';

const VendorLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLeads();
    }, [statusFilter, searchQuery]);

    const loadLeads = async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await vendorLeads.list(params);
            setLeads(response.data.results || response.data);
        } catch (err) {
            setError('Failed to load leads');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return <div>Loading leads...</div>;
    }

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
                    Leads
                </h1>
                <p style={{
                    color: 'var(--vendor-text-secondary)',
                    fontSize: '0.875rem',
                    margin: 0
                }}>
                    Manage and respond to customer inquiries
                </p>
            </div>

            {/* Filters */}
            <div className="vendor-card" style={{ marginBottom: 'var(--vendor-spacing-lg)' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--vendor-spacing-md)'
                }}>
                    <div>
                        <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Search</label>
                        <input
                            type="text"
                            className="vendor-form-input"
                            style={{
                                padding: '0.625rem 0.875rem',
                                fontSize: '0.875rem',
                                minHeight: '2.5rem'
                            }}
                            placeholder="Search by name, email, make, model, or part..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Filter by Status</label>
                        <select
                            className="vendor-form-select"
                            style={{
                                padding: '0.625rem 0.875rem',
                                fontSize: '0.875rem',
                                minHeight: '2.5rem'
                            }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '0.75rem',
                    borderRadius: 'var(--vendor-radius)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            {/* Leads Table - Desktop */}
            <div className="vendor-table-container vendor-desktop-only">
                <table className="vendor-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle</th>
                            <th>Part</th>
                            <th>Customer</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <tr key={lead.id}>
                                    <td style={{ fontWeight: 500 }}>#{lead.id}</td>
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
                                        {lead.customer_phone && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)' }}>
                                                {lead.customer_phone}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {lead.state && lead.zip ? (
                                            <div>
                                                <div>{lead.state}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)' }}>
                                                    {lead.zip}
                                                </div>
                                            </div>
                                        ) : (
                                            lead.location || '-'
                                        )}
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
                                            className="vendor-btn vendor-btn-primary"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--vendor-text-secondary)' }}>
                                    No leads found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Leads Cards - Mobile */}
            <div className="vendor-mobile-cards vendor-mobile-only">
                {leads.length > 0 ? (
                    leads.map((lead) => (
                        <div key={lead.id} className="vendor-mobile-card">
                            <div className="vendor-mobile-card-header">
                                <span style={{ fontWeight: 600, color: 'var(--vendor-text-primary)' }}>
                                    #{lead.id}
                                </span>
                                <span className={`vendor-badge ${getStatusBadgeClass(lead.status)}`}>
                                    {lead.status_display}
                                </span>
                            </div>

                            <div className="vendor-mobile-card-body">
                                <div className="vendor-mobile-card-row">
                                    <span className="vendor-mobile-card-label">Vehicle:</span>
                                    <span className="vendor-mobile-card-value" style={{ fontWeight: 500 }}>
                                        {lead.year} {lead.make} {lead.model}
                                    </span>
                                </div>

                                <div className="vendor-mobile-card-row">
                                    <span className="vendor-mobile-card-label">Part:</span>
                                    <span className="vendor-mobile-card-value">{lead.part}</span>
                                </div>

                                <div className="vendor-mobile-card-row">
                                    <span className="vendor-mobile-card-label">Customer:</span>
                                    <span className="vendor-mobile-card-value">
                                        <div>{lead.customer_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginTop: '0.25rem' }}>
                                            {lead.customer_email}
                                        </div>
                                        {lead.customer_phone && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)' }}>
                                                {lead.customer_phone}
                                            </div>
                                        )}
                                    </span>
                                </div>

                                {(lead.state || lead.location) && (
                                    <div className="vendor-mobile-card-row">
                                        <span className="vendor-mobile-card-label">Location:</span>
                                        <span className="vendor-mobile-card-value">
                                            {lead.state && lead.zip ? `${lead.state}, ${lead.zip}` : (lead.location || '-')}
                                        </span>
                                    </div>
                                )}

                                <div className="vendor-mobile-card-row">
                                    <span className="vendor-mobile-card-label">Date:</span>
                                    <span className="vendor-mobile-card-value">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="vendor-mobile-card-footer">
                                <Link
                                    to={`/vendor/leads/${lead.id}`}
                                    className="vendor-btn vendor-btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--vendor-text-secondary)' }}>
                        No leads found
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorLeads;
