// Parse markdown-like content and extract hashtags
function parseMarkdown(text) {
    // Extract hashtags section
    const hashtagsMatch = text.match(/<hashtags>\s*([\s\S]*?)\s*<\/hashtags>/i);
    let hashtags = [];
    if (hashtagsMatch) {
        const hashtagsText = hashtagsMatch[1];
        // Remove hashtags section from text
        text = text.replace(/<hashtags>[\s\S]*?<\/hashtags>/i, '');
        // Extract individual hashtags
        hashtags = hashtagsText
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.startsWith('#'));
    }
    
    // Convert markdown headers to HTML
    text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    
    // Convert paragraphs (split by double newlines)
    const paragraphs = text.split(/\n\n+/);
    const htmlContent = paragraphs.map(p => {
        p = p.trim();
        if (p.startsWith('<h')) return p;
        if (p) return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        return '';
    }).join('');
    
    return { htmlContent, hashtags };
}

// Typing animation removed - content displays directly

// Load and display story
async function loadStory() {
    const params = new URLSearchParams(window.location.search);
    const storyFolder = params.get('story');
    
    if (!storyFolder) {
        document.getElementById('storyContent').innerHTML = 
            '<div class="empty-state">Story not found.</div>';
        return;
    }
    
    try {
        // Get story metadata from stories-index.json
        const indexResponse = await fetch('/stories-index.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-cache'
        });
        if (!indexResponse.ok) {
            throw new Error(`Failed to load stories index: ${indexResponse.status}`);
        }
        const stories = await indexResponse.json();
        const story = stories.find(s => s.folder === storyFolder);
        
        if (!story) {
            throw new Error('Story not found in index');
        }
        
        // Fetch the story file from the folder (HTML or markdown)
        const response = await fetch(`/stories/${storyFolder}/${story.filename}`, {
            method: 'GET',
            cache: 'no-cache'
        });
        if (!response.ok) {
            throw new Error(`Failed to load story: ${response.status}`);
        }
        const text = await response.text();
        
        // Display story
        document.getElementById('storyTitle').textContent = story.title;
        
        const date = new Date(story.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('storyMeta').textContent = formattedDate;
        
        const contentElement = document.getElementById('storyContent');
        
        // Check if it's HTML or markdown
        if (story.filename.endsWith('.html')) {
            // HTML file - use directly
            contentElement.innerHTML = text;
        } else {
            // Markdown file - parse it
            const lines = text.split('\n');
            let content = text;
            // Remove first line if it's a title
            if (lines[0].match(/^#+\s*/)) {
                content = lines.slice(1).join('\n').trim();
            }
            const { htmlContent } = parseMarkdown(content);
            contentElement.innerHTML = htmlContent;
        }
        
        // Load and display images in the right column
        await loadStoryImages(storyFolder);
        
        // Display hashtags from metadata
        if (story.hashtags && story.hashtags.length > 0) {
            displayHashtags(story.hashtags);
        }
        
    } catch (error) {
        console.error('Error loading story:', error);
        const errorMsg = error.message || 'Unknown error';
        document.getElementById('storyContent').innerHTML = 
            `<div class="empty-state">
                Error loading story: ${errorMsg}<br>
                <small>Story folder: ${storyFolder || 'not specified'}<br>
                Check browser console (F12) for more details.</small>
            </div>`;
    }
}

// Load and display images from story's images folder
async function loadStoryImages(storyFolder) {
    const imagesGallery = document.getElementById('storyImagesGallery');
    if (!imagesGallery) return;
    
    // Get images list from stories index
    try {
        const indexResponse = await fetch('/stories-index.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-cache'
        });
        
        if (indexResponse.ok) {
            const stories = await indexResponse.json();
            const story = stories.find(s => s.folder === storyFolder);
            
            if (story && story.images && story.images.length > 0) {
                // Create images gallery
                const imagesHtml = story.images.map(imageName => {
                    const imagePath = `/stories/${storyFolder}/images/${encodeURIComponent(imageName)}`;
                    return `
                        <div class="story-image-container">
                            <img src="${imagePath}" alt="${imageName}" class="story-image" loading="lazy">
                        </div>
                    `;
                }).join('');
                
                imagesGallery.innerHTML = imagesHtml;
            } else {
                imagesGallery.innerHTML = '<div class="empty-state">No images</div>';
            }
        }
    } catch (error) {
        console.error('Error loading images:', error);
        imagesGallery.innerHTML = '<div class="empty-state">Error loading images</div>';
    }
}

// Display hashtags (simple list format like #coffee #tuesday)
function displayHashtags(hashtags) {
    const hashtagsSection = document.getElementById('hashtagsSection');
    if (!hashtagsSection) return;
    
    // Format as simple list: #coffee #tuesday
    const hashtagsList = hashtags.map(tag => `#${tag}`).join(' ');
    hashtagsSection.innerHTML = `<div class="hashtags-list">${hashtagsList}</div>`;
    hashtagsSection.style.display = 'block';
}



// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Load the story
    loadStory();
});


