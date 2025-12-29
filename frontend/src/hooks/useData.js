import { useState, useEffect } from 'react';
import { api } from '../services/api';

// Mapping of old filename-based calls to new API methods
const API_METHOD_MAP = {
    'data_makes.json': 'getMakes',
    'data_models.json': 'getModels',
    'data_parts.json': 'getParts',
    'data_states.json': 'getStates',
    'data_cities.json': 'getCities',
    'data_junkyards.json': 'getVendors'
};

export function useData(filename, params = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(`Loading ${filename} from API...`);

                // Get the API method name from the mapping
                const methodName = API_METHOD_MAP[filename];

                if (!methodName) {
                    throw new Error(`No API method mapped for ${filename}`);
                }

                // Call the appropriate API method
                const result = await api[methodName](params);

                console.log(`Data loaded for ${filename}:`, result?.length || result?.results?.length || 'N/A', 'items');

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
    }, [filename, JSON.stringify(params)]);

    return { data, loading, error };
}
