import { useNavigate } from 'react-router-dom';
import Home from '../Home';
import AddYardModal from '../../components/auth/AddYardModal';
import SEO from '../../components/SEO';

export default function VendorLogin() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen">
            <SEO
                title="Vendor Login – JYNM"
                description="Sign in to your JYNM Vendor account."
                noindex={true}
            />
            {/* Background screen */}
            <Home />

            {/* On-screen popup modal in login mode */}
            <AddYardModal
                isOpen={true}
                initialMode="login"
                onClose={() => navigate('/', { replace: true })}
            />
        </div>
    );
}
