# CareLogr → Smeaton Healthcare: Blog Integration Spec

This document tells the CareLogr Replit exactly how to build the blog editor
so that posts look correct on the Smeaton Healthcare website.

---

## How it works

CareLogr creates and manages blog posts via the Smeaton API. The Smeaton
website fetches them and displays them. Whatever CareLogr saves is what
appears on the public site.

---

## API connection

```
Base URL:   https://www.smeatonhealthcare.co.uk/api/carelogr
Auth:       Header — X-Api-Key: <CARELOGR_API_KEY>
```

---

## Blog post fields

When creating or updating a post (`POST /blog/posts` or `PATCH /blog/posts/:id`),
send a JSON body with these fields:

| Field        | Type    | Required | Notes |
|--------------|---------|----------|-------|
| `title`      | string  | YES      | Post heading shown on the website |
| `slug`       | string  | YES      | URL-safe version of title, e.g. `my-christmas-story`. Must be unique. |
| `excerpt`    | string  | no       | Short summary shown in the listing card |
| `content`    | string  | YES      | Full article body as HTML (see below) |
| `categoryId` | string  | YES      | ID from `GET /blog/categories` |
| `author`     | string  | YES      | Author name, e.g. `Smeaton Healthcare Team` |
| `images`     | array   | YES      | See images section below |
| `isPublished`| boolean | no       | Default false. Use the publish endpoint instead. |

---

## Content (article body)

The `content` field must be **standard HTML**. The Smeaton site renders it
directly inside a styled container. These elements all work:

```html
<h2>Section heading</h2>
<h3>Sub heading</h3>
<p>Paragraph text</p>
<strong>Bold</strong>
<em>Italic</em>
<ul><li>Bullet item</li></ul>
<ol><li>Numbered item</li></ol>
<a href="https://...">Link text</a>
<blockquote>A quote</blockquote>
<img src="https://cdn.example.com/photo.jpg" alt="Description" />
```

### Inline colour and size

These work fine and will display on the Smeaton site:

```html
<span style="color: #EF2A86;">Pink text</span>
<span style="font-size: 20px;">Larger text</span>
<span style="font-weight: bold;">Bold</span>
```

### What NOT to do

| Do not                             | Why                                                         |
|------------------------------------|-------------------------------------------------------------|
| Embed images as base64 in content  | Enormous file size, broken in many browsers                 |
| Use HEIC image format              | Browsers cannot display HEIC — only JPG, PNG, WebP          |
| Use complex CSS layouts            | Columns, floats and grid may break on the Smeaton site      |
| Use custom fonts                   | Fonts must also be added to the Smeaton site to work        |

---

## Images

### Featured / hero image (shown at top of the article)

Store this in the `images` array on the post — NOT inside the `content` HTML.

```json
"images": [
  {
    "id": "unique-id-string",
    "url": "https://your-cdn.com/photo.jpg",
    "isFeatured": true,
    "uploadedAt": "2025-12-15T10:00:00Z"
  }
]
```

The Smeaton site reads the first image where `isFeatured` is `true` and
displays it as the hero image at the top of the article and in the listing card.

### Images inside the article body

Use a normal `<img>` tag in the `content` HTML pointing to a hosted URL:

```html
<img src="https://your-cdn.com/photo.jpg" alt="Description" />
```

### Image format rules

- Use **JPG, PNG or WebP** only
- Upload to cloud/object storage and use the **public URL**
- Never use HEIC (iPhone format) — browsers cannot display it
- Never embed the image as a base64 blob in the HTML

---

## Workflow: creating and publishing a post

```
1. POST   /blog/posts           → creates a draft, returns { data: { id: "..." } }
2. PATCH  /blog/posts/:id       → update content, images, etc.
3. POST   /blog/posts/:id/publish → makes it live on the Smeaton website
```

To take a post offline:
```
POST /blog/posts/:id/unpublish
```

---

## Categories

Categories must exist before you can assign them to a post.

```
GET    /blog/categories           → list all categories
POST   /blog/categories           → create: { "name": "Customer Stories" }
```

Pass the returned `id` as `categoryId` when creating/updating a post.

---

## What the old Smeaton admin editor had (for reference)

The Smeaton site had its own built-in blog editor with these features.
Build something similar on CareLogr:

### Post fields
- Title (auto-generates slug from title)
- Excerpt (short summary for listing cards)
- Author name
- Category (select from list or create new)
- Publish / unpublish toggle

### Content editor
- Rich text editor (WYSIWYG) — bold, italic, headings, lists, links, blockquotes
- Inline colour picker for text
- Inline font size control
- Image insertion inside the article body (upload → get URL → insert `<img>` tag)

### Image manager (separate from article body)
- Upload a featured/hero image
- Stored as a URL in the `images` array with `isFeatured: true`
- Shown as the thumbnail on the listing page and hero image in the article

### Post list view
- Shows all posts with title, category, author, date, view count
- Draft / Published badge
- Edit, Publish/Unpublish, Delete buttons
- Preview button (shows how it will look before publishing)

---

## Example: full create + publish flow

```js
// 1. Create draft
const post = await fetch('https://www.smeatonhealthcare.co.uk/api/carelogr/blog/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Api-Key': CARELOGR_API_KEY },
  body: JSON.stringify({
    title: 'Our Christmas Card Competition',
    slug: 'our-christmas-card-competition',
    excerpt: 'We were blown away by the response this year.',
    author: 'Smeaton Healthcare Team',
    categoryId: '3d8d0027-...',
    content: '<h2>Thank You!</h2><p>This Christmas...</p><img src="https://cdn.../photo.jpg" alt="Cards" />',
    images: [
      { id: 'img-1', url: 'https://cdn.../photo.jpg', isFeatured: true }
    ]
  })
});
const { data } = await post.json();

// 2. Publish it
await fetch(`https://www.smeatonhealthcare.co.uk/api/carelogr/blog/posts/${data.id}/publish`, {
  method: 'POST',
  headers: { 'X-Api-Key': CARELOGR_API_KEY }
});
```
