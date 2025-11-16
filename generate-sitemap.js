#!/usr/bin/env node

/**
 * Script to automatically generate sitemap.xml from stories-index.json
 * Run this script after adding new stories: node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'stories-index.json');
const sitemapPath = path.join(__dirname, 'sitemap.xml');
const baseUrl = 'https://thegirlinblackhoodie.github.io';

function generateSitemap() {
    try {
        // Read stories index
        if (!fs.existsSync(indexPath)) {
            console.error('❌ Error: stories-index.json not found. Run generate-stories-index.js first.');
            process.exit(1);
        }
        
        const stories = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Build sitemap XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/stories.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

        // Add each story
        stories.forEach(story => {
            const storyUrl = `${baseUrl}/story.html?story=${encodeURIComponent(story.folder)}`;
            xml += `
  <url>
    <loc>${storyUrl}</loc>
    <lastmod>${story.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        xml += `
</urlset>
`;

        fs.writeFileSync(sitemapPath, xml, 'utf-8');
        console.log(`✅ Generated sitemap.xml with ${stories.length + 2} URLs`);
        console.log(`   - Home page`);
        console.log(`   - Stories page`);
        stories.forEach(story => {
            console.log(`   - ${story.title}`);
        });
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();

