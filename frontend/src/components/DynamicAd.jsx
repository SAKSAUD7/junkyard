import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { StandardTemplate, MinimalTemplate, PremiumTemplate, CompactTemplate } from './AdTemplates'

export default function DynamicAd({ slot, page = 'all' }) {
    const [ads, setAds] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAds = async () => {
            try {
                // Fetch ads specifically for this slot and page
                const data = await api.getAds({ slot, target_page: page })

                // API returns paginated response: { count, next, previous, results: [...] }
                const results = data.results || data

                if (results && results.length > 0) {
                    // Process all ads with full image URLs
                    const processedAds = results.map(ad => {
                        let imageUrl = ad.image

                        if (imageUrl && !imageUrl.startsWith('http')) {
                            // Remove /api from the end of VITE_API_URL if present to get base URL
                            const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
                            imageUrl = `${baseUrl}${imageUrl}`
                        }

                        return { ...ad, image: imageUrl }
                    })

                    setAds(processedAds)
                }
            } catch (error) {
                console.error("Failed to load ads", error)
            } finally {
                setLoading(false)
            }
        }
        fetchAds()
    }, [slot, page])

    if (ads.length === 0 && !loading) return null
    if (ads.length === 0 && loading) return null

    const renderTemplate = (ad) => {
        switch (ad.template_type) {
            case 'minimal':
                return <MinimalTemplate key={ad.id} ad={ad} />
            case 'premium':
                return <PremiumTemplate key={ad.id} ad={ad} />
            case 'compact':
                return <CompactTemplate key={ad.id} ad={ad} />
            case 'standard':
            default:
                return <StandardTemplate key={ad.id} ad={ad} />
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {ads.map(ad => renderTemplate(ad))}
        </div>
    )
}
