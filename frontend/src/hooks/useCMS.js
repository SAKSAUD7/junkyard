import { useEffect } from 'react'
import { useCMSContext } from '../contexts/CMSContext'

/**
 * Hook to access CMS content for a specific page.
 *
 * Usage:
 *   const { get, ready } = useCMS('home')
 *   <h1>{get('hero', 'heading', 'Default Heading')}</h1>
 *
 * @param {string} page - The page identifier (e.g. 'home', 'about', 'blog')
 */
export function useCMS(page) {
    const { fetchPage, getValue, pageContents } = useCMSContext()

    useEffect(() => {
        if (page) {
            fetchPage(page)
        }
    }, [page, fetchPage])

    const get = (section, key, fallback = '') => {
        return getValue(page, section, key, fallback)
    }

    const ready = !!pageContents[page]

    return { get, ready }
}
