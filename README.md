# thegirlinblackhoodie Blog

A personal blog, featuring stories with a clean, minimalist design.

## Adding New Stories

To add a new story:

1. Create a new folder in the `stories/` directory (e.g., `my_new_story`)
2. Inside the folder, create:
   - A story file: `my_new_story.html` (or `.md` file)
   - A `metadata.txt` file with:
     ```
     title=Your Story Title
     date=2025-01-16
     hashtags=tag1, tag2, tag3
     ```
   - An `images/` folder (optional) with story images (PNG format)
3. Run the index generator script:
   ```bash
   node generate-stories-index.js
   ```
   This will automatically:
   - Generate `stories-index.json`
   - Generate `sitemap.xml` for SEO
4. Commit and push your changes:
   ```bash
   git add stories/my_new_story/ stories-index.json sitemap.xml
   git commit -m "Add new story: Your Story Title"
   git push
   ```

The story will automatically appear on the stories page!

## Story Format

Stories can be written in HTML or Markdown format. HTML is preferred for better formatting control.

**HTML Format** (recommended):
```html
<p>Your story content here. You can use paragraphs, and they will be automatically formatted.</p>

<p>You can also add line breaks with &lt;br&gt; tags.</p>

<p>And continue with more content...</p>
```

**Markdown Format**:
```markdown
# Story Title

Your story content here. You can use paragraphs, and they will be automatically formatted.

You can also use headers:

## Subheading

And continue with more content...
```

**Metadata Format** (`metadata.txt`):
```
title=Your Story Title
date=2025-01-16
hashtags=tag1, tag2, tag3
```

**Images**: Place PNG images in the `images/` folder. They will be automatically discovered and displayed alongside your story.

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
├── sitemap.xml             # Auto-generated sitemap for SEO
├── robots.txt              # Search engine crawler instructions
├── generate-stories-index.js  # Script to generate index and sitemap
├── generate-sitemap.js     # Standalone script to generate sitemap
├── logo.png                # Your logo
└── stories/                # Story folders
    ├── story-folder-1/
    │   ├── story.html (or .md)
    │   ├── metadata.txt
    │   └── images/
    └── ... (your stories)
```


## Customization

You can customize in `styles.css` by modifying the CSS variables:

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
4. Your site will be available at `https://thegirlinblackhoodie.github.io/`

## SEO Features

The blog includes comprehensive SEO optimization:

- **Meta Tags**: Title, description, keywords, and author tags on all pages
- **Open Graph Tags**: For better social media sharing (Facebook, LinkedIn, etc.)
- **Twitter Cards**: Optimized previews when sharing on Twitter
- **Structured Data**: JSON-LD schema for blog posts (Article schema)
- **Sitemap**: Auto-generated `sitemap.xml` for search engine discovery
- **Robots.txt**: Guides search engine crawlers
- **Canonical URLs**: Prevents duplicate content issues
- **Image Alt Text**: Descriptive alt text for better accessibility and SEO

The sitemap is automatically regenerated when you run `generate-stories-index.js`.

Enjoy the stories! 📖

