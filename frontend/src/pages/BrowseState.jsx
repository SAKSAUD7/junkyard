import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useData } from '../hooks/useData'

export default function BrowseState() {
    const { state } = useParams()
    const { data: junkyards } = useData('data_junkyards.json')

    const stateJunkyards = junkyards?.filter(
        j => j.state.toLowerCase() === state.toLowerCase()
    ) || []

    const stateName = stateJunkyards[0]?.stateFull || state.toUpperCase()

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2">Junkyards in {stateName}</h1>
                    <p className="text-gray-600 mb-8">
                        {stateJunkyards.length} junkyards found
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stateJunkyards.map(junkyard => (
                            <Link
                                key={junkyard.accountID}
                                to={`/junkyard/${junkyard.accountID}`}
                                className="card hover:shadow-xl"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {junkyard.accountName}
                                </h3>
                                <p className="text-gray-600 mb-2">
                                    {junkyard.city}, {junkyard.state}
                                </p>
                                <div className="flex items-center mt-4">
                                    <span className="text-yellow-500">★</span>
                                    <span className="ml-1 text-gray-700">{junkyard.rating}</span>
                                    <span className="ml-1 text-gray-500 text-sm">
                                        ({junkyard.reviewCount} reviews)
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
