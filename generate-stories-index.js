#!/usr/bin/env node

/**
 * Script to automatically generate stories-index.json from story folders
 * Each story is in its own folder with:
 * - A markdown file (story-name.md)
 * - A metadata.txt file (title, hashtags, date)
 * - An images folder
 * 
 * Run this script whenever you add a new story: node generate-stories-index.js
 */

const fs = require('fs');
const path = require('path');

const storiesDir = path.join(__dirname, 'stories');
const indexPath = path.join(__dirname, 'stories-index.json');

function parseMetadata(metadataPath) {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = {};
    
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    
    cleanContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && trimmed.includes('=')) {
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex > 0) {
                const key = trimmed.substring(0, equalIndex).trim();
                const value = trimmed.substring(equalIndex + 1).trim();
                metadata[key] = value;
            }
        }
    });
    
    return metadata;
}

function findStoryFile(folderPath) {
    const files = fs.readdirSync(folderPath);
    // Prefer HTML files, fall back to markdown
    const htmlFile = files.find(file => file.endsWith('.html'));
    if (htmlFile) {
        return path.join(folderPath, htmlFile);
    }
    const mdFile = files.find(file => file.endsWith('.md'));
    return mdFile ? path.join(folderPath, mdFile) : null;
}

function findImages(folderPath) {
    const imagesPath = path.join(folderPath, 'images');
    if (!fs.existsSync(imagesPath)) {
        return [];
    }
    
    const files = fs.readdirSync(imagesPath);
    // Get all PNG files except logo.png
    const images = files
        .filter(file => file.toLowerCase().endsWith('.png') && file.toLowerCase() !== 'logo.png')
        .sort(); // Sort alphabetically for consistent ordering
    
    return images;
}

function generateIndex() {
    try {
        const folders = fs.readdirSync(storiesDir)
            .filter(item => {
                const itemPath = path.join(storiesDir, item);
                return fs.statSync(itemPath).isDirectory();
            });
        
        const stories = folders.map(folderName => {
            const folderPath = path.join(storiesDir, folderName);
            const metadataPath = path.join(folderPath, 'metadata.txt');
            const storyFilePath = findStoryFile(folderPath);
            
            if (!fs.existsSync(metadataPath)) {
                console.warn(`⚠️  Warning: No metadata.txt found in ${folderName}`);
                return null;
            }
            
            if (!storyFilePath) {
                console.warn(`⚠️  Warning: No story file (.html or .md) found in ${folderName}`);
                return null;
            }
            
            const metadata = parseMetadata(metadataPath);
            const storyFileName = path.basename(storyFilePath);
            
            // Find images in the images folder
            const images = findImages(folderPath);
            
            // Parse date (format: DD-MM-YYYY)
            let dateStr = metadata.date || new Date().toISOString().split('T')[0];
            if (dateStr && dateStr.includes('-') && dateStr.split('-').length === 3) {
                const parts = dateStr.split('-');
                // Check if it's DD-MM-YYYY format
                if (parts[0].length === 2 && parts[1].length === 2) {
                    const [day, month, year] = parts;
                    dateStr = `${year}-${month}-${day}`;
                }
            }
            
            // Parse hashtags
            const hashtags = metadata.hashtags 
                ? metadata.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];
            
            return {
                folder: folderName,
                filename: storyFileName,
                title: metadata.title || 'Untitled Story',
                date: dateStr,
                hashtags: hashtags,
                images: images
            };
        }).filter(story => story !== null);
        
        // Sort by date (newest first)
        stories.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        fs.writeFileSync(indexPath, JSON.stringify(stories, null, 2), 'utf-8');
        console.log(`✅ Generated stories-index.json with ${stories.length} story/stories`);
        stories.forEach(story => {
            console.log(`   - ${story.folder}: ${story.title}`);
        });
    } catch (error) {
        console.error('❌ Error generating index:', error);
        process.exit(1);
    }
}

generateIndex();

