// Load and display all stories from the stories folder
async function loadStories() {
    const storiesList = document.getElementById('storiesList');
    if (!storiesList) {
        console.error('storiesList element not found');
        return;
    }
    
    storiesList.innerHTML = '<div class="empty-state">Loading stories...</div>';
    
    try {
        // Fetch the stories directory listing
        // Since GitHub Pages doesn't support directory listing, we'll use a stories index
        const url = '/stories-index.json';
        console.log('Fetching:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-cache'
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Could not load ${url}`);
        }
        
        const stories = await response.json();
        console.log('Loaded stories:', stories);
        
        if (!Array.isArray(stories)) {
            throw new Error('Invalid stories format');
        }
        
        if (stories.length === 0) {
            storiesList.innerHTML = '<div class="empty-state">No stories yet. Check back soon.</div>';
            return;
        }
        
        storiesList.innerHTML = '';
        
        // Sort stories by date (newest first)
        // Parse dates properly to avoid timezone issues
        stories.sort((a, b) => {
            const parseDate = (dateStr) => {
                const parts = dateStr.split('-');
                return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            };
            return parseDate(b.date) - parseDate(a.date);
        });
        
        stories.forEach(story => {
            const storyCard = document.createElement('a');
            // Use canonical URL format that matches Disqus config exactly
            // This ensures Disqus comment counts work properly
            const baseUrl = 'https://thegirlinblackhoodie.github.io';
            const canonicalUrl = `${baseUrl}/story.html?story=${encodeURIComponent(story.folder)}`;
            // Don't put #disqus_thread in the main card href - it causes Disqus to replace entire card
            // Instead, we'll add a separate element for comment count
            storyCard.href = canonicalUrl;
            storyCard.className = 'story-card';
            
            // For local development, intercept clicks and use relative URL
            storyCard.addEventListener('click', function(e) {
                // Check if we're on localhost
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    e.preventDefault();
                    const relativeUrl = `story.html?story=${encodeURIComponent(story.folder)}`;
                    window.location.href = relativeUrl;
                }
                // On production (GitHub Pages), let the link work normally
            });
            
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
            
            // Format hashtags
            const hashtagsHtml = story.hashtags && story.hashtags.length > 0
                ? `<div class="story-hashtags">${story.hashtags.map(tag => `<span class="hashtag-small">#${tag}</span>`).join(' ')}</div>`
                : '';
            
            // Create card content structure
            storyCard.innerHTML = `
                <h2>${story.title}</h2>
                <div class="story-date">${formattedDate}</div>
                ${hashtagsHtml}
            `;
            
            storiesList.appendChild(storyCard);
        });
        
        // Load Disqus count script AFTER links are created
        // This ensures the script can find and process all the links with #disqus_thread
        loadDisqusCountScript();
    } catch (error) {
        console.error('Error loading stories:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            pathname: window.location.pathname
        });
        storiesList.innerHTML = `
            <div class="empty-state">
                Error loading stories: ${error.message}<br>
                <small>URL: ${window.location.href}<br>
                Trying to fetch: /stories-index.json<br>
                Check browser console (F12) for more details.</small>
            </div>
        `;
    }
}

// Load Disqus count script dynamically
function loadDisqusCountScript() {
    // Check if script is already loaded
    if (document.getElementById('dsq-count-scr')) {
        // Script already exists, trigger refresh
        if (window.DISQUSWIDGETS && window.DISQUSWIDGETS.getCount) {
            window.DISQUSWIDGETS.getCount({reset: true});
        }
        return;
    }
    
    // Create and load the count script
    var script = document.createElement('script');
    script.id = 'dsq-count-scr';
    script.src = '//thegirlinblackhoodie.disqus.com/count.js';
    script.async = true;
    
    // When script loads, it will automatically scan for links with #disqus_thread
    script.onload = function() {
        console.log('Disqus count script loaded');
        
        // Find all links with #disqus_thread
        const disqusLinks = document.querySelectorAll('a[href*="#disqus_thread"]');
        console.log('Found', disqusLinks.length, 'links with #disqus_thread');
        disqusLinks.forEach(function(link, index) {
            console.log('Link', index + ':', link.href);
        });
        
        // Give it a moment to process, then trigger refresh if needed
        setTimeout(function() {
            if (window.DISQUSWIDGETS) {
                console.log('DISQUSWIDGETS available:', typeof window.DISQUSWIDGETS.getCount);
                if (window.DISQUSWIDGETS.getCount) {
                    window.DISQUSWIDGETS.getCount({reset: true});
                    console.log('Triggered Disqus count refresh');
                }
            } else {
                console.log('DISQUSWIDGETS not available yet');
            }
        }, 1000);
    };
    
    script.onerror = function() {
        console.error('Failed to load Disqus count script');
    };
    
    document.body.appendChild(script);
}

// Load stories when page loads
document.addEventListener('DOMContentLoaded', loadStories);

