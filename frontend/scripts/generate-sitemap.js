/**
 * Sitemap Generator for Junkyards Near Me
 * 
 * This script generates a sitemap.xml file for SEO purposes.
 * Run this script before deployment to generate an up-to-date sitemap.
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://junkyardsnearme.com';

// Static pages with their priorities and change frequencies
const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/browse', priority: 0.9, changefreq: 'weekly' },
    { url: '/vendors', priority: 0.8, changefreq: 'weekly' },
    { url: '/how-it-works', priority: 0.7, changefreq: 'monthly' },
    { url: '/faq', priority: 0.7, changefreq: 'monthly' },
    { url: '/about', priority: 0.6, changefreq: 'monthly' },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' },
    { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { url: '/terms', priority: 0.3, changefreq: 'yearly' },
];

// Load dynamic data
const loadJunkyards = () => {
    try {
        const data = fs.readFileSync(
            path.join(__dirname, '../public/data/data_junkyards.json'),
            'utf8'
        );
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading junkyards:', error);
        return [];
    }
};

const loadStates = () => {
    try {
        const data = fs.readFileSync(
            path.join(__dirname, '../public/data/data_states.json'),
            'utf8'
        );
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading states:', error);
        return [];
    }
};

// Generate sitemap XML
const generateSitemap = () => {
    const junkyards = loadJunkyards();
    const states = loadStates();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    staticPages.forEach(page => {
        sitemap += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add state pages
    const uniqueStates = [...new Set(junkyards.map(j => j.state))];
    uniqueStates.forEach(state => {
        if (state) {
            sitemap += `  <url>
    <loc>${SITE_URL}/browse/${state.toLowerCase()}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
        }
    });

    // Add vendor pages (limit to prevent huge sitemap)
    junkyards.slice(0, 5000).forEach(junkyard => {
        sitemap += `  <url>
    <loc>${SITE_URL}/vendors/${junkyard.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    return sitemap;
};

// Write sitemap to file
const writeSitemap = () => {
    try {
        const sitemap = generateSitemap();
        const outputPath = path.join(__dirname, '../public/sitemap.xml');
        fs.writeFileSync(outputPath, sitemap, 'utf8');
        console.log('✅ Sitemap generated successfully at:', outputPath);
        console.log(`📊 Total URLs: ${(sitemap.match(/<url>/g) || []).length}`);
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
};

// Run the generator
writeSitemap();
