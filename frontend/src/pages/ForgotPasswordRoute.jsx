import { useNavigate } from 'react-router-dom';
import Home from './Home';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

export default function ForgotPasswordRoute() {
    const navigate = useNavigate();
    return (
        <div className="relative min-h-screen">
            <Home />
            <ForgotPasswordModal
                isOpen={true}
                userType="customer"
                onClose={() => navigate('/', { replace: true })}
                onBackToLogin={() => navigate('/signin', { replace: true })}
            />
        </div>
    );
}
