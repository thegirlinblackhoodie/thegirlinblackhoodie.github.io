# thegirlinblackhoodie Blog

A dark-themed personal blog built for GitHub Pages, featuring stories with a clean, minimalist design.

## Features

- **Dark Theme**: Beautiful dark background with brunette color highlights
- **Auto-Discovery**: New story files are automatically added to the blog
- **Image Gallery**: Stories can include images displayed alongside the content
- **Hashtags**: Stories support hashtags for categorization

## Adding New Stories

To add a new story:

1. Create a new markdown file in the `stories/` folder (e.g., `my-new-story.md`)
2. Start the file with a title using markdown header format:
   ```markdown
   # Your Story Title
   
   Your story content here...
   ```
3. Run the index generator script:
   ```bash
   node generate-stories-index.js
   ```
4. Commit and push your changes:
   ```bash
   git add stories/my-new-story.md stories-index.json
   git commit -m "Add new story: Your Story Title"
   git push
   ```

The story will automatically appear on the stories page!

## Story Format

Stories should be written in markdown format:

```markdown
# Story Title

Your story content here. You can use paragraphs, and they will be automatically formatted.

You can also use headers:

## Subheading

And continue with more content...
```

## Local Development

To test locally, you can use a simple HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
.
├── index.html              # Landing page
├── stories.html            # Stories list page
├── story.html              # Individual story viewer
├── styles.css              # Dark theme styles
├── stories.js              # Stories list functionality
├── story.js                # Story viewer
├── stories-index.json      # Auto-generated index of stories
├── generate-stories-index.js  # Script to generate index
├── logo.png                # Your logo
└── stories/                # Story files folder
    ├── placeholder-story.md
    └── ... (your stories)
```


## Customization

You can customize colors in `styles.css` by modifying the CSS variables:

```css
:root {
    --bg-dark: #0a0a0a;        /* Background color */
    --text-white: #ffffff;      /* Text color */
    --brunette: #8b6f47;        /* Primary accent */
    --brunette-light: #a6895d;  /* Light accent */
    --brunette-dark: #6b5435;   /* Dark accent */
    --accent: #c9a882;           /* Highlight color */
}
```

## GitHub Pages Setup

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the sidebar
3. Select the branch (usually `main`) and folder (`/ (root)`)
4. Your site will be available at `https://yourusername.github.io/thegirlinblackhoodie.github.io/`

Enjoy sharing your stories! 📖

