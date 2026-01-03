# Design Guidelines: Solana Crypto Promotion Platform

## Design Approach
**System-Based with Crypto Industry References**: Drawing from Coinbase's trust-centric UI, Phantom Wallet's modern minimalism, and Binance's data-rich layouts. Focus on clarity, professionalism, and reducing cognitive load for campaign management.

## Core Design Principles
- **Trust Through Transparency**: Clear hierarchy, generous whitespace, prominent verification indicators
- **Data Density with Breathing Room**: Information-rich without feeling cluttered
- **Professional Crypto Aesthetic**: Sharp, modern, tech-forward but accessible

---

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) - Modern, highly legible for UI
- Accent: Space Grotesk (Google Fonts) - Technical feel for headings/stats

**Hierarchy**:
- H1: Space Grotesk, 2.5rem (40px), font-bold - Campaign titles, dashboard headers
- H2: Space Grotesk, 1.875rem (30px), font-semibold - Section headers
- H3: Inter, 1.25rem (20px), font-semibold - Card headers, campaign names
- Body Large: Inter, 1rem (16px), font-normal - Primary content
- Body Small: Inter, 0.875rem (14px), font-normal - Metadata, secondary info
- Caption: Inter, 0.75rem (12px), font-medium - Labels, tags, badges
- Monospace Stats: JetBrains Mono, variable sizes - Token amounts, addresses

---

## Layout & Spacing System

**Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-16
- Card gaps: gap-6
- Button padding: px-6 py-3 (standard), px-8 py-4 (primary CTAs)
- Container max-width: max-w-7xl

**Grid Strategy**:
- Dashboard: 3-column grid (lg:grid-cols-3) for campaign cards
- Campaign details: 2-column split (left: info, right: actions/stats)
- Mobile: Always single column stack

---

## Component Library

### Navigation Header
- Fixed top, backdrop blur effect
- Left: Logo + platform name
- Center: Main navigation (Dashboard, Campaigns, Analytics)
- Right: Wallet connection button (prominent), user profile dropdown
- Height: h-20
- Include verified badge icon next to connected wallet address

### Wallet Connection Button
- Primary CTA styling with icon (wallet icon from Heroicons)
- Shows abbreviated address when connected (0x1234...5678)
- Disconnect option in dropdown
- Visual indicator for connection status (dot icon)

### Campaign Cards
**Structure** (each card: border, rounded-2xl, p-6):
- Top: Campaign banner image (16:9 ratio, rounded-xl)
- Badge overlay: Status indicator (Active/Completed/Pending)
- Campaign logo (circular, -mt-8 overlapping banner, border-4)
- Title (H3) + Creator info
- Stats row: 4 columns (Participants, Rewards Pool, End Date, Completion %)
- Action buttons row: X, Telegram, Website (icon buttons with labels)
- Footer: "View Details" link

### Campaign List View
- Filter bar: Search, status filter, sort dropdown
- Active count badge
- Grid layout with 6 spacing between cards
- Pagination at bottom

### Campaign Detail Page
**Layout**: 2-column (lg:grid-cols-3 with left col-span-2)

Left Panel:
- Hero banner (full-width, rounded-2xl)
- Campaign info section (p-8, organized in definition list format)
- Task checklist (each task: checkbox, icon, description, reward amount)
- Requirements section (expandable accordions)

Right Panel (sticky):
- Stats card: Total rewards, participants, time remaining (countdown)
- Quick actions: Social platform buttons (large, vertical stack)
- Share campaign button
- Report/flag option (subtle)

### Action Buttons (Social Tasks)
- Platform icon + label layout
- Twitter/X: Bird icon
- Telegram: Paper plane icon
- Website: Globe icon
- Size: px-6 py-4, gap-3 between icon and text
- Completion checkmark appears on completed tasks

### Dashboard Overview
- Top: Welcome message + wallet balance card
- Stats grid: 4 columns (Total Campaigns, Active, Rewards Earned, Pending Claims)
- Recent activity feed (timeline design with icons)
- Active campaigns section (horizontal scroll cards on mobile)

---

## Images Guidelines

**Hero Section**: 
- NOT using traditional hero - Leading with immediate campaign grid/dashboard
- Top section: Gradient mesh background (decorative, subtle) with welcome message overlay

**Campaign Banners**: 
- Required for each campaign: 1200x675px (16:9)
- Showcases project branding, promotional graphics
- Overlay: Semi-transparent gradient (top-to-bottom) for text legibility
- Buttons on banners: Backdrop blur (backdrop-blur-md), semi-transparent background

**Campaign Logos**:
- Circular, 120x120px minimum
- Border treatment for depth
- Placed overlapping banner (negative margin)

**Platform Icons**:
- Use Heroicons for UI icons (outline style)
- Social platform logos via Font Awesome brands

**Background Elements**:
- Subtle geometric patterns (grid dots, mesh gradients) for visual interest
- Never overwhelm content - extremely low opacity

---

## Special Components

### Trust Indicators
- Verified badge icons next to campaign creators
- "Audited" labels for verified projects
- Security info tooltips

### Token/Reward Display
- Monospace font for amounts
- Token symbol in bold
- USD equivalent in smaller, muted text below

### Progress Indicators
- Circular progress rings for campaign completion
- Linear progress bars for individual tasks
- Visual countdown timers (days:hours:minutes)

### Notification Toasts
- Top-right positioning
- Transaction success/pending states
- Wallet connection status

### Empty States
- Illustration placeholders for no campaigns
- Helpful CTA to create first campaign
- Centered, friendly messaging

---

## Accessibility & Polish

- All interactive elements: min-height 44px (touch targets)
- Form inputs: Consistent height h-12, rounded-lg
- Focus states: Prominent outline, 2px offset
- Loading skeletons for async data
- Smooth transitions (transition-all duration-200)
- Hover states: Subtle scale/shadow changes
- Icon sizes: Consistent 20px or 24px throughout

This design creates a professional, trustworthy crypto platform that prioritizes clarity and user confidence while maintaining modern web app standards.