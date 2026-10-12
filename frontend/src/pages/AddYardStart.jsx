import { useNavigate } from 'react-router-dom';
import Home from './Home';
import AddYardModal from '../components/auth/AddYardModal';
import SEO from '../components/SEO';

export default function AddYardStart() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen">
            <SEO
                title="List Your Junkyard – Partner Network | JYNM"
                description="List your salvage yard on JYNM and connect with thousands of buyers looking for used auto parts nationwide."
            />
            {/* Background current screen */}
            <Home />

            {/* On-screen popup modal */}
            <AddYardModal
                isOpen={true}
                onClose={() => navigate('/', { replace: true })}
            />
        </div>
    );
}
