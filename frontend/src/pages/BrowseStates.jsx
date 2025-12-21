import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useData } from '../hooks/useData'

export default function BrowseStates() {
    const { data: states } = useData('data_states.json')

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2">Browse Junkyards by State</h1>
                    <p className="text-gray-600 mb-8">
                        Select a state to view junkyards in that area
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {states?.map(state => (
                            <Link
                                key={state.stateAbbr}
                                to={`/browse/${state.stateAbbr.toLowerCase()}`}
                                className="card hover:shadow-xl"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {state.stateName}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {state.junkyardCount} junkyards
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
