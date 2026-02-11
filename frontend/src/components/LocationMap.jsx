import React from 'react';

const LocationMap = ({ address, city, state, zipcode, name, theme = 'dark' }) => {
    // Create the full address string for the map
    const fullAddress = `${address}, ${city}, ${state} ${zipcode}`;

    // Encode the address for URL
    const encodedAddress = encodeURIComponent(fullAddress);

    // Google Maps embed URL
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`;

    // Alternative: Use Google Maps search URL (works without API key)
    const searchMapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    const isLight = theme === 'light';

    return (
        <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'} backdrop-blur-xl border rounded-2xl md:rounded-3xl overflow-hidden`}>
            <div className={`compact-card border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                <h2 className={`compact-title font-bold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-1.5 sm:gap-2`}>
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Location Map
                </h2>
                <p className={`${isLight ? 'text-gray-600' : 'text-white/60'} compact-text mt-1 sm:mt-2`}>{fullAddress}</p>
            </div>

            <div className="relative w-full h-96">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={searchMapUrl}
                    allowFullScreen
                    aria-label={`Map showing location of ${name}`}
                    title={`Location of ${name}`}
                    className="w-full h-full"
                />
            </div>

            <div className={`p-2 sm:p-3 md:p-4 ${isLight ? 'bg-gray-50' : 'bg-white/5'}`}>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 sm:gap-2 ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-cyan-400 hover:text-cyan-300'} font-semibold transition-colors compact-text`}
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    Open in Google Maps
                </a>
            </div>
        </div>
    );
};

export default LocationMap;
