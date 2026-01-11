# Design Guidelines: Solana Campaign Marketing Platform

## Design Approach
**Reference-Based**: Drawing from Coinbase's trust-centric UI, Stripe's marketing clarity, and ProductHunt's celebration design. Prioritizing conversion-optimized layouts with professional crypto aesthetic and strategic celebration moments.

## Core Principles
- **Trust Through Clarity**: Professional, data-rich layouts with generous breathing room
- **Strategic Celebration**: Confetti/success animations for campaign milestones only
- **SEO-First Structure**: Content hierarchy optimized for discoverability

---

## Typography System

**Fonts** (Google Fonts CDN):
- Primary: Inter - All UI, body text
- Accent: Space Grotesk - Headlines, campaign titles, stats
- Monospace: JetBrains Mono - Token amounts, wallet addresses

**Hierarchy**:
- H1: Space Grotesk, 3rem, font-bold - Hero headlines, landing page titles
- H2: Space Grotesk, 2rem, font-semibold - Section headers
- H3: Inter, 1.5rem, font-semibold - Campaign names, card titles
- Body: Inter, 1rem, font-normal - Content
- Small: Inter, 0.875rem - Metadata, captions
- Label: Inter, 0.75rem, font-medium, uppercase, tracking-wide - Tags, badges

---

## Layout & Spacing

**Spacing Scale**: Tailwind units 4, 6, 8, 12, 16, 20, 24
- Section padding: py-20 (desktop), py-12 (mobile)
- Card padding: p-8
- Component gaps: gap-6
- Container: max-w-7xl

**Grid Patterns**:
- Campaign showcase: 3-column (lg:grid-cols-3)
- Feature sections: 2-column (lg:grid-cols-2)
- Stats: 4-column (lg:grid-cols-4)
- Mobile: Always single column

---

## Page Structure

### Landing Page Layout

**Hero Section** (h-screen min):
- Full-width background: Gradient mesh with Solana-themed abstract shapes
- Overlay image: 3D rendered Solana coin/token floating with subtle glow
- Centered content max-w-4xl:
  - H1 headline emphasizing campaign reach
  - Subheadline (Body Large) highlighting key benefits
  - Dual CTA buttons (px-8 py-4): "Launch Campaign" (primary) + "View Active Campaigns" (secondary with backdrop-blur-md bg-white/10)
  - Trust indicators below: "10,000+ Campaigns Launched" | "50M+ Rewards Distributed"
- Buttons use backdrop-blur-md, semi-transparent backgrounds for image overlay

**Platform Features Section** (py-20):
- Grid of 6 feature cards (lg:grid-cols-3, gap-8)
- Each card: Icon (Heroicons 32px), H3 title, description, supporting metric
- Cards have subtle border, rounded-2xl, p-8

**Active Campaigns Showcase** (py-24):
- Header with count badge + filter tabs
- 3-column campaign card grid
- Each card: Banner image (16:9), campaign logo (overlapping, -mt-12), title, stats grid, action buttons

**Success Stories** (py-20):
- 2-column layout
- Left: Large campaign showcase with metrics
- Right: Stacked testimonial cards with creator photos, quotes, verified badges

**SEO-Optimized Content Section** (py-16):
- max-w-prose centered
- H2 + rich text content explaining platform value
- Internal links to campaign categories
- Structured with semantic HTML headings

**Final CTA Section** (py-24):
- Centered, max-w-3xl
- H2 headline + supporting text
- Large primary button
- Background: Subtle gradient with geometric pattern overlay

**Footer** (py-16):
- 4-column grid: Platform links, Campaign categories, Resources, Social + Newsletter signup
- Bottom bar: Copyright, legal links, Solana verification badge

---

## Component Library

### Navigation
- Fixed, backdrop-blur-lg, border-b
- Logo + platform name (left)
- Main links: Campaigns, Launch, Analytics (center)
- Wallet connect button + user menu (right)
- Height: h-20

### Campaign Cards
- Banner image: 16:9 ratio, rounded-t-2xl
- Status badge overlay (top-right): Active/Ending Soon
- Campaign logo: Circular, 96px, overlapping banner with border-4
- Content padding: p-6
- Stats grid: 4 metrics (Participants, Pool, Time Left, Completion %)
- Social action buttons: Icon + platform name, px-4 py-2
- "View Campaign" link at bottom

### Trust Elements
- Verified badges next to campaign creators
- Audit status labels
- Security tooltips (info icon with Heroicons)

### Celebration Components
- Confetti animation: Campaign milestone completions only (using canvas-confetti library)
- Success toasts: Top-right, rounded-xl, with icon
- Subtle pulse animations on reward claims

### Stats Display
- Monospace font for token amounts
- Token symbol in Space Grotesk bold
- USD conversion below in muted text
- Large numbers use Space Grotesk for visual impact

### Form Elements
- Input height: h-12
- Rounded-lg borders
- Label above input (font-medium, text-sm)
- Helper text below (text-xs)
- Search bars: Icon prefix (Heroicons)

---

## Images Strategy

**Hero**: 
- Primary: 3D rendered Solana-themed visual (coin, blockchain network, abstract shapes)
- Background: Gradient mesh with geometric overlays
- All images full-width, high-resolution

**Campaign Banners**:
- Required: 1200x675px minimum
- Project branding showcases
- Gradient overlay for text legibility

**Feature Icons**:
- Use Heroicons (outline style) throughout
- Consistent 24px or 32px sizing

**Backgrounds**:
- Subtle dot grids, mesh gradients at very low opacity
- Never compete with foreground content

---

## Accessibility & Polish

- Touch targets: min-h-11 (44px)
- Focus rings: 2px offset, high contrast
- Transitions: duration-200 for micro-interactions
- Loading states: Skeleton screens for cards
- Hover: Subtle scale (scale-105) or shadow elevation
- Icon consistency: 20px (inline), 24px (standalone)
- Empty states: Helpful messaging with CTA

This design creates a high-converting marketing platform that balances professional crypto credibility with engaging celebration moments, optimized for both user experience and search visibility.