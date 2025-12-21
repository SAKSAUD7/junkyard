import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h1 className="text-4xl font-bold mb-6">About Junkyards Near Me</h1>

                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 mb-4">
                                Welcome to Junkyards Near Me, your comprehensive directory for finding auto salvage yards
                                and used auto parts across the United States.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
                            <p className="text-gray-700 mb-4">
                                We help car owners, mechanics, and auto enthusiasts find quality used auto parts from
                                trusted junkyards and salvage yards nationwide. Our platform makes it easy to search by
                                vehicle make, model, part type, or location.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Over 1,000 junkyards listed across all 50 states</li>
                                <li>Search by vehicle make, model, or part type</li>
                                <li>Browse junkyards by state and city</li>
                                <li>User ratings and reviews</li>
                                <li>Contact information for each junkyard</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Used Auto Parts?</h2>
                            <p className="text-gray-700 mb-4">
                                Buying used auto parts from junkyards offers several benefits:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Save money compared to new parts</li>
                                <li>Environmentally friendly - reduce waste</li>
                                <li>Find parts for older or discontinued vehicles</li>
                                <li>Quality parts from salvaged vehicles</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4">Get Started</h2>
                            <p className="text-gray-700 mb-4">
                                Use our search tool to find junkyards near you, or browse by state to discover auto
                                salvage yards in your area. Each listing includes location information, ratings, and
                                available inventory to help you find exactly what you need.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
