# Roots of Hope & Wellness

Marketing website for **Roots of Hope & Wellness** — Elyse Fearon's faith-based
functional-medicine practice. *Healing from the roots up.*

A hand-built **static site** (HTML / CSS / vanilla JS, no build step).

## Structure

```
index.html            Home
about.html            About Elyse
services.html         Services & pricing
booking.html          Book a consultation (SimplePractice + email)
blog.html             Blog index
blog-post.html        "Your Body is Not the Enemy"
blog-pcos.html        "PCOS Crash Course & Care Plan"
blog-disconnected.html "The Disconnected World"
assets/css/styles.css  Design system
assets/js/main.js      Nav, scroll reveal, MailerLite signup
assets/img/            Photos + favicon
```

## Run locally

```
python3 -m http.server 8753
# open http://localhost:8753
```

## Deploy

Static site — no build step. On Cloudflare Pages: **Build command:** _(none)_ ·
**Build output directory:** `/`

## Integrations

- **Scheduling:** SimplePractice client portal (Booking page)
- **Newsletter:** MailerLite (Home + Blog signup boxes)
