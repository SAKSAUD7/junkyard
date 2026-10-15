import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';
import authService from '../services/authService';

export default function ResetPassword() {
    const { accountType = 'customer', uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password.length < 8) {
            setError('Use at least 8 characters for your new password.');
            return;
        }
        if (password !== confirmation) {
            setError('The passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authService.confirmPasswordReset(accountType, uid, token, password);
            setComplete(true);
        } catch (requestError) {
            const data = requestError.response?.data;
            setError(data?.error || data?.new_password?.[0] || 'This reset link is invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
            <SEO title="Reset Password – JYNM" description="Create a new JYNM password." noindex={true} />
            <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                <Link to="/" className="mb-8 block text-center text-2xl font-black text-blue-700">JYNM</Link>
                {complete ? (
                    <div className="text-center"><h1 className="text-2xl font-black text-slate-900">Password updated</h1><p className="mt-3 text-slate-600">Your password has been changed. You can now sign in.</p><button type="button" onClick={() => navigate(accountType === 'vendor' ? '/vendor/login' : accountType === 'admin' ? '/admin-portal/login' : '/signin')} className="mt-6 w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white">Continue to sign in</button></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div><h1 className="text-2xl font-black text-slate-900">Create a new password</h1><p className="mt-2 text-sm text-slate-600">Choose a strong password for your JYNM account.</p></div>
                        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                        <div><label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="reset-password">New password</label><PasswordInput id="reset-password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
                        <div><label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="reset-password-confirm">Confirm password</label><PasswordInput id="reset-password-confirm" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-200 px-4 py-3" /></div>
                        <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Updating…' : 'Update password'}</button>
                    </form>
                )}
            </section>
        </main>
    );
}
