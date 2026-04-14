import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { StandardTemplate, MinimalTemplate, PremiumTemplate, CompactTemplate, MicroTemplate } from './AdTemplates'

export default function DynamicAd({ slot, page = 'all', templateOverride = null }) {
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
                    // Backend now returns absolute HTTPS URLs for images
                    // No URL construction needed - use as-is
                    setAds(results)
                }
            } catch (error) {
                console.warn("[DynamicAd] Ads unavailable — backend 500")
            } finally {
                setLoading(false)
            }
        }
        fetchAds()
    }, [slot, page])

    if (ads.length === 0 && !loading) return null
    if (ads.length === 0 && loading) return null

    const renderTemplate = (ad) => {
        const type = templateOverride || ad.template_type

        switch (type) {
            case 'micro':
                return <MicroTemplate key={ad.id} ad={ad} />
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
