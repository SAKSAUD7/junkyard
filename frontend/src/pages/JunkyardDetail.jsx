import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useData } from '../hooks/useData'

export default function JunkyardDetail() {
    const { id } = useParams()
    const { data: junkyards } = useData('data_junkyards.json')
    const { data: makes } = useData('data_makes.json')
    const { data: parts } = useData('data_parts.json')

    const junkyard = junkyards?.find(j => j.accountID === id)

    if (!junkyard) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-600 text-lg">Junkyard not found</p>
                </div>
                <Footer />
            </div>
        )
    }

    // Sample inventory and parts (in real app, this would come from database)
    const sampleMakes = makes?.slice(0, 8) || []
    const sampleParts = parts?.slice(0, 12) || []

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {junkyard.accountName}
                        </h1>

                        <div className="flex items-center mb-6">
                            <span className="text-yellow-500 text-2xl">★</span>
                            <span className="ml-2 text-2xl font-bold text-gray-700">{junkyard.rating}</span>
                            <span className="ml-2 text-gray-500">
                                ({junkyard.reviewCount} reviews)
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Location</h2>
                                <p className="text-lg text-gray-700">
                                    {junkyard.city}, {junkyard.state}
                                </p>
                                <p className="text-gray-600 mt-2">{junkyard.stateFull}</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold mb-4">Contact</h2>
                                <p className="text-gray-700">Call for availability and pricing</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold mb-4">Available Makes</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {sampleMakes.map(make => (
                                    <div key={make.makeID} className="bg-gray-50 p-3 rounded">
                                        <span className="font-semibold text-gray-800">{make.makeName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold mb-4">Available Parts</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {sampleParts.map(part => (
                                    <div key={part.partID} className="bg-gray-50 p-3 rounded">
                                        <span className="text-gray-800">{part.partName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
