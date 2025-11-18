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
        
        // Parse date string (YYYY-MM-DD) to avoid timezone issues
        const dateParts = story.date.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day);
        
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
        
        // Update SEO meta tags and structured data
        updateSEO(story, storyFolder);
        
        // Initialize upvote system
        initializeUpvote(storyFolder);
        
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
                const imagesHtml = story.images.map((imageName, index) => {
                    const imagePath = `/stories/${storyFolder}/images/${encodeURIComponent(imageName)}`;
                    const altText = `${story.title} - Image ${index + 1}`;
                    return `
                        <div class="story-image-container">
                            <img src="${imagePath}" alt="${altText}" class="story-image" loading="lazy">
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

// Update SEO meta tags and structured data for story pages
function updateSEO(story, storyFolder) {
    const baseUrl = 'https://thegirlinblackhoodie.github.io';
    const storyUrl = `${baseUrl}/story.html?story=${encodeURIComponent(storyFolder)}`;
    // Parse date string (YYYY-MM-DD) to avoid timezone issues
    const dateParts = story.date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2], 10);
    const date = new Date(year, month, day);
    
    // Update page title
    document.title = `${story.title} - thegirlinblackhoodie`;
    
    // Update meta description (first 160 chars of story content)
    const contentText = document.getElementById('storyContent').textContent || story.title;
    const description = contentText.substring(0, 160).replace(/\s+/g, ' ').trim() + '...';
    
    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = description;
    
    // Update Open Graph tags
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const ogUrl = document.getElementById('og-url');
    const ogImage = document.getElementById('og-image');
    
    if (ogTitle) ogTitle.content = story.title;
    if (ogDescription) ogDescription.content = description;
    if (ogUrl) ogUrl.content = storyUrl;
    if (ogImage && story.images && story.images.length > 0) {
        ogImage.content = `${baseUrl}/stories/${storyFolder}/images/${story.images[0]}`;
    }
    
    // Update Twitter tags
    const twitterTitle = document.getElementById('twitter-title');
    const twitterDescription = document.getElementById('twitter-description');
    const twitterUrl = document.getElementById('twitter-url');
    const twitterImage = document.getElementById('twitter-image');
    
    if (twitterTitle) twitterTitle.content = story.title;
    if (twitterDescription) twitterDescription.content = description;
    if (twitterUrl) twitterUrl.content = storyUrl;
    if (twitterImage && story.images && story.images.length > 0) {
        twitterImage.content = `${baseUrl}/stories/${storyFolder}/images/${story.images[0]}`;
    }
    
    // Update canonical URL
    const canonical = document.getElementById('canonical');
    if (canonical) canonical.href = storyUrl;
    
    // Add structured data (JSON-LD)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": story.title,
        "description": description,
        "author": {
            "@type": "Person",
            "name": "thegirlinblackhoodie"
        },
        "datePublished": date.toISOString(),
        "dateModified": date.toISOString(),
        "publisher": {
            "@type": "Person",
            "name": "thegirlinblackhoodie"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": storyUrl
        },
        "url": storyUrl
    };
    
    if (story.hashtags && story.hashtags.length > 0) {
        structuredData.keywords = story.hashtags.join(', ');
    }
    
    if (story.images && story.images.length > 0) {
        structuredData.image = story.images.map(img => 
            `${baseUrl}/stories/${storyFolder}/images/${img}`
        );
    }
    
    const structuredDataElement = document.getElementById('structured-data');
    if (structuredDataElement) {
        structuredDataElement.textContent = JSON.stringify(structuredData);
    }
}

// Initialize upvote system
function initializeUpvote(storyFolder) {
    const upvoteButton = document.getElementById('upvoteButton');
    const upvoteCount = document.getElementById('upvoteCount');
    
    if (!upvoteButton || !upvoteCount) return;
    
    // Get upvote count from localStorage
    const storageKey = `upvotes_${storyFolder}`;
    const hasUpvoted = localStorage.getItem(`upvoted_${storyFolder}`) === 'true';
    let count = parseInt(localStorage.getItem(storageKey) || '0', 10);
    
    // Update UI
    upvoteCount.textContent = count;
    if (hasUpvoted) {
        upvoteButton.classList.add('upvoted');
        upvoteButton.disabled = true;
    }
    
    // Handle upvote click
    upvoteButton.addEventListener('click', function() {
        if (hasUpvoted) return;
        
        // Increment count
        count++;
        localStorage.setItem(storageKey, count.toString());
        localStorage.setItem(`upvoted_${storyFolder}`, 'true');
        
        // Update UI
        upvoteCount.textContent = count;
        upvoteButton.classList.add('upvoted');
        upvoteButton.disabled = true;
        
        // Add animation
        upvoteButton.style.transform = 'scale(1.2)';
        setTimeout(function() {
            upvoteButton.style.transform = 'scale(1)';
        }, 200);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Load the story
    loadStory();
});


