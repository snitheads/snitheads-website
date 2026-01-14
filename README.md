# Snitheads Art Portfolio

A simple, responsive portfolio website for showcasing artwork.

## Quick Start

1. Open `index.html` in your browser to preview the site locally
2. Add your artwork images to the `images/` folder
3. Edit `index.html` to add your art pieces (see instructions below)

## Adding Your Artwork

### Step 1: Add Images
Put your artwork images in the `images/` folder. Recommended:
- Use JPG or PNG format
- Optimize images for web (aim for under 500KB per image)
- Square or near-square images work best for the gallery grid

### Step 2: Add Gallery Items
In `index.html`, find the `<div class="gallery-grid">` section and add items like this:

```html
<div class="gallery-item">
    <img src="images/your-image.jpg" alt="Description of artwork">
    <div class="gallery-info">
        <h3>Artwork Title</h3>
        <p>Medium or description</p>
    </div>
</div>
```

### Step 3: Update Your Info
- Change "Snitheads" in the logo/title if desired
- Update the About section with your bio
- Add your contact email and social links

## Customizing Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --color-bg: #0a0a0a;        /* Background color */
    --color-surface: #141414;    /* Card/surface color */
    --color-text: #f5f5f5;       /* Main text color */
    --color-text-muted: #888;    /* Secondary text */
    --color-accent: #e0e0e0;     /* Accent/hover color */
    --color-border: #2a2a2a;     /* Border color */
}
```

## Deploying to the Web

### Option A: GitHub Pages (Recommended)

1. Create a GitHub repository named `snitheads-website`
2. Push this code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio setup"
   git remote add origin https://github.com/YOUR-USERNAME/snitheads-website.git
   git push -u origin main
   ```
3. Go to repository Settings > Pages
4. Set Source to "Deploy from a branch" and select `main`
5. Your site will be live at `https://YOUR-USERNAME.github.io/snitheads-website`

### Option B: Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop your website folder onto the Netlify dashboard
3. Your site will be live instantly with a random URL

## Connecting Your Domain (snitheads.com)

### For GitHub Pages:
1. In repository Settings > Pages > Custom domain, enter `snitheads.com`
2. At your domain registrar, add these DNS records:
   - A record: `185.199.108.153`
   - A record: `185.199.109.153`
   - A record: `185.199.110.153`
   - A record: `185.199.111.153`
   - CNAME record: `www` pointing to `YOUR-USERNAME.github.io`

### For Netlify:
1. In Netlify, go to Site settings > Domain management > Add custom domain
2. Follow their instructions to configure DNS

## File Structure

```
snitheads-website/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles
├── images/
│   └── (your artwork)  # Add your images here
└── README.md           # This file
```

## Tips

- **Image optimization**: Use [TinyPNG](https://tinypng.com) or [Squoosh](https://squoosh.app) to compress images
- **Alt text**: Always add descriptive alt text for accessibility
- **Testing**: Test on mobile devices before deploying
