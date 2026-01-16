import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import '../../styles/vendor.css';

const VendorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useVendorAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/vendor/dashboard');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--vendor-bg-secondary)',
            padding: '1rem',
            position: 'relative'
        }}>
            {/* Back to Home Button */}
            <Link
                to="/"
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--vendor-primary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--vendor-radius)',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
            </Link>

            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--vendor-bg-primary)',
                borderRadius: 'var(--vendor-radius-lg)',
                boxShadow: 'var(--vendor-shadow-lg)',
                padding: '2rem'
            }}>
                {/* Logo/Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: 'var(--vendor-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        JYNM Vendor Portal
                    </h1>
                    <p style={{
                        color: 'var(--vendor-text-secondary)',
                        fontSize: '0.875rem',
                        margin: 0
                    }}>
                        Sign in to manage your listings and leads
                    </p>
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

                {/* Demo Credentials Info */}
                <div style={{
                    backgroundColor: '#dbeafe',
                    border: '1px solid #3b82f6',
                    color: '#1e40af',
                    padding: '0.75rem',
                    borderRadius: 'var(--vendor-radius)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        🔑 Demo Credentials
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        <div><strong>Email:</strong> vendor@test.com</div>
                        <div><strong>Password:</strong> vendor123</div>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="vendor-form-group">
                        <label className="vendor-form-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="vendor-form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="vendor@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="vendor-form-group">
                        <label className="vendor-form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="vendor-form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <Link
                            to="/vendor/forgot-password"
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--vendor-primary)',
                                textDecoration: 'none'
                            }}
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="vendor-btn vendor-btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--vendor-border)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--vendor-text-secondary)',
                        margin: 0
                    }}>
                        Need help? Contact support at{' '}
                        <a
                            href="mailto:support@jynm.com"
                            style={{ color: 'var(--vendor-primary)', textDecoration: 'none' }}
                        >
                            support@jynm.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
