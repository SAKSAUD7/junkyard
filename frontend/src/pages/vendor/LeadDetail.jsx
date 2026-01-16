import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vendorLeads } from '../../services/vendorApi';
import '../../styles/vendor.css';

const VendorLeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadLead();
    }, [id]);

    const loadLead = async () => {
        try {
            const response = await vendorLeads.get(id);
            setLead(response.data);
        } catch (err) {
            setError('Failed to load lead details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            await vendorLeads.updateStatus(id, newStatus);
            setSuccess('Status updated successfully');
            loadLead();
        } catch (err) {
            setError('Failed to update status');
            console.error(err);
        } finally {
            setUpdating(false);
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
        return <div>Loading lead details...</div>;
    }

    if (!lead) {
        return <div>Lead not found</div>;
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{
                marginBottom: 'var(--vendor-spacing-xl)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <Link
                        to="/vendor/leads"
                        style={{
                            color: 'var(--vendor-primary)',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            marginBottom: '0.5rem'
                        }}
                    >
                        ← Back to Leads
                    </Link>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: 'var(--vendor-text-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Lead #{lead.id}
                    </h1>
                    <p style={{
                        color: 'var(--vendor-text-secondary)',
                        fontSize: '0.875rem',
                        margin: 0
                    }}>
                        Submitted on {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                </div>

                <span className={`vendor-badge ${getStatusBadgeClass(lead.status)}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {lead.status_display}
                </span>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '0.75rem',
                    borderRadius: 'var(--vendor-radius)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    {success}
                </div>
            )}

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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--vendor-spacing-xl)' }}>
                {/* Lead Details */}
                <div>
                    {/* Vehicle Information */}
                    <div className="vendor-card" style={{ marginBottom: 'var(--vendor-spacing-lg)' }}>
                        <h3 className="vendor-card-title">Vehicle Information</h3>
                        <div className="vendor-card-body" style={{ marginTop: 'var(--vendor-spacing-md)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--vendor-spacing-md)' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                        Year
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{lead.year}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                        Make
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{lead.make}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                        Model
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{lead.model}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                        Part Requested
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{lead.part}</div>
                                </div>
                                {lead.options && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                            Options
                                        </div>
                                        <div style={{ fontWeight: 500 }}>{lead.options}</div>
                                    </div>
                                )}
                                {lead.hollander_number && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                            Hollander Number
                                        </div>
                                        <div style={{ fontWeight: 500 }}>{lead.hollander_number}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="vendor-card">
                        <h3 className="vendor-card-title">Customer Information</h3>
                        <div className="vendor-card-body" style={{ marginTop: 'var(--vendor-spacing-md)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--vendor-spacing-md)' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                        Name
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{lead.customer_name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                        Email
                                    </div>
                                    <div style={{ fontWeight: 500 }}>
                                        <a href={`mailto:${lead.customer_email}`} style={{ color: 'var(--vendor-primary)' }}>
                                            {lead.customer_email}
                                        </a>
                                    </div>
                                </div>
                                {lead.customer_phone && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                            Phone
                                        </div>
                                        <div style={{ fontWeight: 500 }}>
                                            <a href={`tel:${lead.customer_phone}`} style={{ color: 'var(--vendor-primary)' }}>
                                                {lead.customer_phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                        Location
                                    </div>
                                    <div style={{ fontWeight: 500 }}>
                                        {lead.state && lead.zip ? `${lead.state}, ${lead.zip}` : lead.location || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Sidebar */}
                <div>
                    <div className="vendor-card">
                        <h3 className="vendor-card-title">Update Status</h3>
                        <div className="vendor-card-body" style={{ marginTop: 'var(--vendor-spacing-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vendor-spacing-sm)' }}>
                                <button
                                    onClick={() => handleStatusUpdate('new')}
                                    disabled={updating || lead.status === 'new'}
                                    className="vendor-btn vendor-btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    Mark as New
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('contacted')}
                                    disabled={updating || lead.status === 'contacted'}
                                    className="vendor-btn vendor-btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    Mark as Contacted
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('converted')}
                                    disabled={updating || lead.status === 'converted'}
                                    className="vendor-btn vendor-btn-success"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    Mark as Converted
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('closed')}
                                    disabled={updating || lead.status === 'closed'}
                                    className="vendor-btn vendor-btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    Mark as Closed
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="vendor-card" style={{ marginTop: 'var(--vendor-spacing-lg)' }}>
                        <h3 className="vendor-card-title">Quick Actions</h3>
                        <div className="vendor-card-body" style={{ marginTop: 'var(--vendor-spacing-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vendor-spacing-sm)' }}>
                                <a
                                    href={`mailto:${lead.customer_email}?subject=Re: ${lead.year} ${lead.make} ${lead.model} - ${lead.part}`}
                                    className="vendor-btn vendor-btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                                >
                                    Email Customer
                                </a>
                                {lead.customer_phone && (
                                    <a
                                        href={`tel:${lead.customer_phone}`}
                                        className="vendor-btn vendor-btn-secondary"
                                        style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                                    >
                                        Call Customer
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLeadDetail;
