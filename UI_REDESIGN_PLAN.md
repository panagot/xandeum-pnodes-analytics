# UI Redesign Plan - Professional Analytics Platform

## Design Inspiration
- **Google Analytics**: Sidebar navigation, top bar with date controls, metric cards, clean data tables
- **Mixpanel**: Dark mode, board-like dashboards, professional data density
- **Amplitude**: Perfect visual hierarchy, data storytelling, zero clutter
- **PostHog**: Modern SaaS aesthetic, clean typography, professional spacing

## New Layout Structure

### 1. Sidebar Navigation (Left)
- Fixed sidebar with navigation items
- Logo/branding at top
- Main sections: Overview, Nodes, Analytics, Compare, Settings
- Collapsible/expandable
- Active state indicators
- Icons + text labels

### 2. Top Bar (Header)
- Fixed top bar with:
  - Page title/breadcrumbs
  - Date range selector
  - Refresh button
  - Search (global)
  - User menu/theme toggle
  - Notifications (optional)

### 3. Main Content Area
- Full-width content area
- Proper padding and spacing
- Grid system for cards/metrics
- Professional data tables
- Clean typography hierarchy

## Design Principles

### Color Scheme
- **Background**: Clean white/light gray (or refined dark mode)
- **Primary**: Professional blue/purple accent
- **Text**: High contrast, readable
- **Borders**: Subtle, light gray
- **Shadows**: Soft, professional elevation

### Typography
- **Headings**: Bold, clear hierarchy (Inter or system font)
- **Body**: Clean, readable (Inter)
- **Data/Metrics**: Monospace for numbers
- **Sizes**: Clear scale (12px, 14px, 16px, 20px, 24px, 32px)

### Spacing
- Consistent 8px/16px grid
- Generous whitespace
- Clear section separation
- Professional padding

### Components Redesign

#### Metric Cards
- Clean white cards with subtle shadow
- Large number, small label
- Optional sparkline/mini chart
- Hover states

#### Data Tables
- Professional table design
- Sticky headers
- Row hover states
- Clear sorting indicators
- Inline actions
- Pagination

#### Charts
- Clean, minimal design
- Professional color palette
- Clear labels and legends
- Export options

#### Navigation
- Sidebar with icons
- Clear active states
- Smooth transitions
- Responsive collapse

## Implementation Steps

1. Create new layout structure with sidebar
2. Redesign header/top bar
3. Update main content area
4. Redesign metric cards
5. Redesign data tables
6. Update charts styling
7. Add professional spacing/typography
8. Test responsiveness

## Files to Modify

- `app/layout.tsx` - Add sidebar structure
- `app/page.tsx` - Restructure layout
- `app/globals.css` - Update color scheme and typography
- `components/*` - Update component styles
- New: `components/Sidebar.tsx`
- New: `components/TopBar.tsx`

