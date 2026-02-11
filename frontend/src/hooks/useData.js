import { useState, useEffect } from 'react';
import { api } from '../services/api';

// Mapping of old filename-based calls to new API methods
const API_METHOD_MAP = {
    'data_makes.json': 'getMakes',
    'data_models.json': 'getModels',
    'data_parts.json': 'getParts',
    'data_states.json': 'getStates',
    'data_cities.json': 'getCities',
    'data_junkyards.json': 'getVendors',
    'data_junkyards_complete.json': 'getVendors'
};

export function useData(filename, params = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Using a stringified version of params for the effect dependency
    const paramsKey = JSON.stringify(params);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get the API method name from the mapping
                const methodName = API_METHOD_MAP[filename];

                if (!methodName) {
                    throw new Error(`No API method mapped for ${filename}`);
                }

                // Call the appropriate API method
                const result = await api[methodName](params);

                // Handle paginated responses from Django REST framework
                const finalData = result?.results || result;

                setData(finalData);
                setLoading(false);
            } catch (err) {
                console.error(`Error loading ${filename}:`, err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [filename, paramsKey]);

    return { data, loading, error };
}
