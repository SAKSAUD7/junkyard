import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const CMSContext = createContext({})

// Page-level cache to avoid refetching on re-renders
const contentCache = new Map()

export function CMSProvider({ children }) {
    const [pageContents, setPageContents] = useState({})
    const [loading, setLoading] = useState(false)

    const fetchPage = useCallback(async (page) => {
        if (contentCache.has(page)) {
            setPageContents(prev => ({ ...prev, [page]: contentCache.get(page) }))
            return
        }
        try {
            const data = await api.cms.getPageContent(page)
            contentCache.set(page, data)
            setPageContents(prev => ({ ...prev, [page]: data }))
        } catch (e) {
            // Silently fail — fallback content will be used
        }
    }, [])

    const getValue = useCallback((page, section, key, fallback = '') => {
        const pageData = pageContents[page]
        if (!pageData) return fallback
        const sectionData = pageData[section]
        if (!sectionData) return fallback
        return sectionData[key] !== undefined ? sectionData[key] : fallback
    }, [pageContents])

    const invalidatePage = useCallback((page) => {
        contentCache.delete(page)
        setPageContents(prev => {
            const next = { ...prev }
            delete next[page]
            return next
        })
    }, [])

    return (
        <CMSContext.Provider value={{ fetchPage, getValue, invalidatePage, pageContents, loading }}>
            {children}
        </CMSContext.Provider>
    )
}

export function useCMSContext() {
    return useContext(CMSContext)
}
