import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../Home';
import AddYardModal from '../../components/auth/AddYardModal';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import SEO from '../../components/SEO';

export default function VendorLogin() {
    const navigate = useNavigate();
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    return (
        <div className="relative min-h-screen">
            <SEO title="Vendor Login – JYNM" description="Sign in to your JYNM Vendor account." noindex={true} />
            <Home />
            <AddYardModal
                isOpen={true}
                initialMode="login"
                successPath="/vendor/dashboard"
                authenticatedPath="/vendor/dashboard"
                onForgotPassword={() => setForgotPasswordOpen(true)}
                onClose={() => navigate('/', { replace: true })}
            />
            <ForgotPasswordModal
                isOpen={forgotPasswordOpen}
                userType="vendor"
                onClose={() => setForgotPasswordOpen(false)}
                onBackToLogin={() => setForgotPasswordOpen(false)}
            />
        </div>
    );
}
