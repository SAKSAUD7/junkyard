import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/vendor.css';

const VendorForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/vendor/password-reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Failed to send reset instructions');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Password reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--vendor-bg-secondary)',
                padding: '1rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'var(--vendor-bg-primary)',
                    borderRadius: 'var(--vendor-radius-lg)',
                    boxShadow: 'var(--vendor-shadow-lg)',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#d1fae5',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#065f46"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--vendor-text-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Check Your Email
                    </h2>

                    <p style={{
                        color: 'var(--vendor-text-secondary)',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem'
                    }}>
                        We've sent password reset instructions to <strong>{email}</strong>
                    </p>

                    <Link
                        to="/vendor/login"
                        className="vendor-btn vendor-btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            display: 'block',
                            textAlign: 'center'
                        }}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--vendor-bg-secondary)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--vendor-bg-primary)',
                borderRadius: 'var(--vendor-radius-lg)',
                boxShadow: 'var(--vendor-shadow-lg)',
                padding: '2rem'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: 'var(--vendor-text-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Forgot Password?
                    </h1>
                    <p style={{
                        color: 'var(--vendor-text-secondary)',
                        fontSize: '0.875rem',
                        margin: 0
                    }}>
                        Enter your email address and we'll send you instructions to reset your password.
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

                {/* Form */}
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

                    <button
                        type="submit"
                        className="vendor-btn vendor-btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginBottom: '1rem'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                    </button>

                    <Link
                        to="/vendor/login"
                        className="vendor-btn vendor-btn-secondary"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            display: 'block',
                            textAlign: 'center'
                        }}
                    >
                        Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default VendorForgotPassword;
