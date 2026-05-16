# Design System Documentation

## Overview

The Phalanx Cyber Academy design system is built on Tailwind CSS with custom animations, a comprehensive dark mode implementation, and a cyber-themed aesthetic. This design system ensures consistency across all pages and components while providing an immersive cybersecurity training experience.

## Core Technologies

### CSS Framework
- **Tailwind CSS v4** (via CDN)
- Custom Tailwind configuration in base template
- Utility-first CSS approach
- Responsive design utilities

### Icon System
- **Bootstrap Icons v1.13.1** (via CDN)
- Consistent icon usage across components
- Cyber-themed icon selections

### JavaScript
- ES6 modules for component logic
- Custom animation utilities
- Theme management system
- Toast notification system

## Color System

### Primary Colors

#### Blue Gradient
```css
/* Primary action gradient */
from-blue-500 to-cyan-600
from-blue-600 to-cyan-700 (hover)
```

#### Green Gradient
```css
/* Success/CTA gradient */
from-green-500 to-emerald-600
from-green-600 to-emerald-700 (hover)
```

#### Purple Gradient
```css
/* Accent/secondary gradient */
from-purple-500 to-pink-600
from-blue-600 to-purple-600 (navigation)
```

### Cyber Theme Colors

#### Success (Green)
```css
/* Success states, completed actions */
text-green-400 / text-green-600
bg-green-500 / bg-green-600
border-green-200 / border-green-700
```

#### Warning (Yellow/Orange)
```css
/* Warning states, caution */
text-yellow-400 / text-yellow-600
bg-yellow-500 / bg-orange-600
border-yellow-200 / border-yellow-700
```

#### Error (Red)
```css
/* Error states, danger */
text-red-400 / text-red-600
bg-red-500 / bg-red-600
border-red-200 / border-red-700
```

#### Info (Blue)
```css
/* Information states, primary */
text-blue-400 / text-blue-600
bg-blue-500 / bg-blue-600
border-blue-200 / border-blue-700
```

### Dark Mode Colors

#### Backgrounds
```css
/* Light mode backgrounds */
bg-gray-50 / bg-white
bg-gradient-to-br from-gray-50 to-gray-100

/* Dark mode backgrounds */
dark:bg-gray-900 / dark:bg-gray-800
dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800
```

#### Text
```css
/* Light mode text */
text-gray-900 (primary)
text-gray-600 (secondary)
text-gray-500 (tertiary)

/* Dark mode text */
dark:text-white (primary)
dark:text-gray-300 (secondary)
dark:text-gray-400 (tertiary)
```

#### Borders
```css
/* Light mode borders */
border-gray-200 / border-gray-300

/* Dark mode borders */
dark:border-gray-700 / dark:border-gray-600
```

### Difficulty Gradients

#### Beginner
```css
background: linear-gradient(135deg, #10b981, #059669);
```

#### Intermediate
```css
background: linear-gradient(135deg, #f59e0b, #d97706);
```

#### Advanced
```css
background: linear-gradient(135deg, #ef4444, #dc2626);
```

#### Expert
```css
background: linear-gradient(135deg, #8b5cf6, #7c3aed);
```

#### Master
```css
background: linear-gradient(135deg, #ec4899, #db2777);
```

## Typography

### Font Families
```css
/* System font stack (Tailwind default) */
font-sans: ui-sans-serif, system-ui, sans-serif
font-mono: ui-monospace, SFMono-Regular, monospace
```

### Font Sizes

#### Headings
```css
text-5xl md:text-7xl (hero title)
text-4xl md:text-5xl (section titles)
text-3xl md:text-4xl (page titles)
text-2xl (card titles)
text-xl (subtitles)
```

#### Body
```css
text-lg (lead paragraphs)
text-base (body text)
text-sm (secondary text)
text-xs (labels, metadata)
```

### Font Weights
```css
font-bold (headings, emphasis)
font-semibold (subheadings, buttons)
font-medium (labels, links)
font-normal (body text)
```

### Text Utilities
```css
text-transparent (gradient text)
bg-clip-text (gradient clipping)
leading-relaxed (improved readability)
truncate (text overflow)
```

## Spacing System

### Padding Scale
```css
p-2 (8px) - tight spacing
p-4 (16px) - standard spacing
p-6 (24px) - comfortable spacing
p-8 (32px) - generous spacing
p-10 (40px) - section spacing
```

### Margin Scale
```css
m-2 (8px) - tight spacing
m-4 (16px) - standard spacing
m-6 (24px) - comfortable spacing
m-8 (32px) - generous spacing
mb-4 / mt-4 (vertical spacing)
ml-4 / mr-4 (horizontal spacing)
```

### Gap Scale
```css
gap-2 (8px) - tight grid spacing
gap-4 (16px) - standard grid spacing
gap-6 (24px) - comfortable grid spacing
gap-8 (32px) - generous grid spacing
```

## Border Radius

### Corner Radius
```css
rounded-lg (8px) - cards, buttons
rounded-xl (12px) - larger cards, modals
rounded-2xl (16px) - hero sections, large cards
rounded-full (50%) - avatars, badges, icons
```

## Shadows

### Shadow Scale
```css
shadow-sm (subtle elevation)
shadow-md (standard elevation)
shadow-lg (prominent elevation)
shadow-xl (hero elevation)
shadow-2xl (maximum elevation)
```

### Custom Shadows

#### Cyber Glow
```css
.cyber-glow {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), 
                0 0 40px rgba(34, 197, 94, 0.1);
}
```

#### Focus Rings
```css
focus:ring-4 focus:ring-blue-500/25
focus:ring-4 focus:ring-green-500/25
```

## Animations

### Entry Animations

#### Fade In Up
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
}
```

#### Fade In Left
```css
@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-fade-in-left {
    animation: fadeInLeft 0.6s ease-out forwards;
}
```

#### Fade In Right
```css
@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-fade-in-right {
    animation: fadeInRight 0.6s ease-out forwards;
}
```

#### Scale In
```css
@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-scale-in {
    animation: scaleIn 0.4s ease-out forwards;
}
```

### Interactive Animations

#### Hover Effects
```css
/* Button hover */
hover:scale-105 transform
hover:shadow-2xl

/* Card hover */
hover:-translate-y-2 transform
hover:shadow-2xl

/* Icon hover */
hover:scale-110 transform
hover:rotate-3
```

#### Focus Effects
```css
/* Input focus */
focus:outline-none focus:ring-2 focus:ring-blue-500
focus:border-transparent
transform: translateY(-1px)
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15)
```

### Loading Animations

#### Spinner
```css
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.submit-spinner {
    animation: spin 1s linear infinite;
}
```

#### Pulse
```css
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.8;
    }
}

.animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
}
```

#### Bounce
```css
/* Tailwind built-in */
animate-bounce
```

### Animation Delays
```css
.animate-delay-50 (0.05s)
.animate-delay-100 (0.1s)
.animate-delay-150 (0.15s)
.animate-delay-200 (0.2s)
.animate-delay-250 (0.25s)
```

## Components

### Buttons

#### Primary Button
```html
<button class="group inline-flex items-center justify-center px-8 py-4 
                  bg-gradient-to-r from-blue-500 to-cyan-600 
                  text-white font-semibold text-lg rounded-xl 
                  hover:from-blue-600 hover:to-cyan-700 
                  transition-all duration-300 
                  focus:outline-none focus:ring-4 focus:ring-blue-500/25 
                  shadow-xl hover:shadow-2xl hover:scale-105 transform">
    <i class="bi bi-play-circle mr-2"></i>
    <span>Start Learning</span>
</button>
```

#### Secondary Button
```html
<button class="group inline-flex items-center justify-center px-8 py-4 
                  bg-white/80 dark:bg-transparent 
                  text-gray-700 dark:text-white font-semibold text-lg rounded-xl 
                  border-2 border-gray-300 dark:border-white/30 
                  hover:bg-gray-100 dark:hover:bg-white/20 
                  backdrop-blur-sm 
                  transition-all duration-300 
                  focus:outline-none focus:ring-4 focus:ring-gray-300/25 
                  hover:border-gray-400 dark:hover:border-white/50 
                  hover:scale-105 transform shadow-lg">
    <span>Learn More</span>
    <i class="bi bi-shield-check ml-2"></i>
</button>
```

#### Success Button
```html
<button class="group inline-flex items-center justify-center px-8 py-4 
                  bg-gradient-to-r from-green-500 to-emerald-600 
                  text-white font-semibold text-lg rounded-xl 
                  hover:from-green-600 hover:to-emerald-700 
                  transition-all duration-300 
                  focus:outline-none focus:ring-4 focus:ring-green-500/25 
                  shadow-xl hover:shadow-2xl hover:scale-105 transform cyber-glow">
    <i class="bi bi-check-circle mr-2"></i>
    <span>Confirm</span>
</button>
```

### Cards

#### Feature Card
```html
<div class="group text-center p-8 rounded-2xl 
            bg-white dark:bg-gray-800 
            shadow-lg hover:shadow-2xl 
            transition-all duration-500 
            border border-gray-100 dark:border-gray-700 
            hover:border-green-200 dark:hover:border-green-600 
            hover:-translate-y-2 transform">
    <div class="w-20 h-20 mx-auto mb-6 
                bg-gradient-to-br from-green-500 to-emerald-600 
                rounded-2xl flex items-center justify-center 
                text-white text-3xl 
                group-hover:scale-110 group-hover:rotate-3 
                transition-all duration-300 shadow-lg">
        <i class="bi bi-controller"></i>
    </div>
    <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Gamified Learning
    </h3>
    <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
        Earn XP, unlock achievements, and level up through interactive challenges.
    </p>
</div>
```

#### Stats Card
```html
<div class="bg-white dark:bg-gray-800 rounded-xl 
            shadow-lg p-6 
            border border-gray-200 dark:border-gray-700">
    <div class="flex items-center">
        <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <i class="bi bi-star text-blue-600 dark:text-blue-400 text-xl"></i>
        </div>
        <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total XP
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
                12,450
            </p>
        </div>
    </div>
</div>
```

#### Level Card
```html
<div class="level-card p-6 bg-white dark:bg-gray-800 rounded-xl 
            shadow-lg hover:shadow-xl 
            transition-all duration-300 
            border border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            Level Name
        </h3>
        <span class="px-3 py-1 rounded-full text-xs font-semibold 
                   bg-gradient-to-r from-yellow-500 to-orange-600 
                   text-white">
            Intermediate
        </span>
    </div>
    <!-- Level content -->
</div>
```

### Forms

#### Input Field
```html
<div>
    <label for="email" class="block text-sm font-semibold 
                              text-blue-600 dark:text-blue-400 mb-2">
        <i class="bi bi-envelope mr-2"></i>Email Address
    </label>
    <input id="email" name="email" type="email" required 
           class="w-full px-4 py-4 
                  bg-gray-50 dark:bg-gray-700/50 
                  border border-blue-300 dark:border-blue-500/30 
                  rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-transparent 
                  transition-all duration-300 
                  text-gray-900 dark:text-white 
                  placeholder-gray-500 dark:placeholder-gray-400 
                  hover:border-blue-400 dark:hover:border-blue-500/50"
           placeholder="Enter your email address">
</div>
```

#### Form Container
```html
<form class="bg-white/90 dark:bg-gray-800/90 
             backdrop-blur-sm 
             rounded-2xl p-8 space-y-6 
             shadow-xl 
             border border-gray-200/50 dark:border-gray-700/50">
    <!-- Form fields -->
</form>
```

### Navigation

#### Navbar
```html
<nav class="bg-white/90 dark:bg-gray-900/90 
           backdrop-blur-md 
           shadow-lg 
           sticky top-0 z-50 
           border-b border-gray-200/50 dark:border-gray-700/50 
           transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <!-- Logo and links -->
        </div>
    </div>
</nav>
```

#### Navigation Link
```html
<a href="#" class="text-gray-600 dark:text-gray-300 
                   hover:text-blue-600 dark:hover:text-blue-400 
                   transition-all duration-300 
                   font-medium relative group">
    Home
    <span class="absolute -bottom-1 left-0 w-0 h-0.5 
                 bg-gradient-to-r from-blue-600 to-purple-600 
                 group-hover:w-full 
                 transition-all duration-300"></span>
</a>
```

### Toast Notifications

#### Success Toast
```html
<div class="flex items-center justify-between p-4 text-sm rounded-xl 
            shadow-lg animate-slide-in-right 
            bg-gradient-to-r from-green-50 to-emerald-50 
            dark:from-green-900/90 dark:to-emerald-900/90 
            text-green-800 dark:text-green-200 
            border border-green-200 dark:border-green-700">
    <div class="flex items-center">
        <i class="bi bi-check-circle-fill mr-2 
                  text-green-600 dark:text-green-400"></i>
        <span class="font-medium">Success message</span>
    </div>
    <button type="button" class="ml-4 text-lg font-bold 
                          cursor-pointer hover:scale-110 
                          transition-transform duration-200 
                          text-green-600 dark:text-green-400">
        <i class="bi bi-x"></i>
    </button>
</div>
```

### Modals

#### Modal Container
```html
<div class="fixed inset-0 z-50 flex items-center justify-center 
            bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-2xl 
                shadow-2xl max-w-md w-full mx-4 
                border border-gray-200 dark:border-gray-700">
        <!-- Modal content -->
    </div>
</div>
```

## Layout Patterns

### Container
```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Content -->
</div>
```

### Grid System
```html
<!-- 3-column grid -->
<div class="grid md:grid-cols-3 gap-8">
    <!-- Grid items -->
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Grid items -->
</div>

<!-- Stats grid -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Stat cards -->
</div>
```

### Flex Layouts
```html
<!-- Center alignment -->
<div class="flex items-center justify-center">
    <!-- Content -->
</div>

<!-- Space between -->
<div class="flex items-center justify-between">
    <!-- Content -->
</div>

<!-- Vertical flex -->
<div class="flex flex-col space-y-4">
    <!-- Content -->
</div>

<!-- Responsive flex -->
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <!-- Content -->
</div>
```

### Sections
```html
<section class="py-20 bg-gradient-to-br from-gray-50 to-white 
                    dark:from-gray-800 dark:to-gray-900 
                    transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section content -->
    </div>
</section>
```

## Dark Mode

### Implementation

#### Theme Initialization
```javascript
// Prevents flash of unstyled content (FOUC)
<script src="{{ url_for('static', filename='js/utils/theme/theme-initializator.js') }}"></script>
```

#### Dark Mode Toggle
```html
<button id="theme-toggle" 
        class="p-2 text-gray-600 dark:text-gray-300 
               hover:text-blue-600 dark:hover:text-blue-400 
               transition-all duration-300 
               hover:scale-110 transform rounded-lg 
               hover:bg-gray-100 dark:hover:bg-gray-800">
    <i class="bi bi-moon-stars dark:hidden"></i>
    <i class="bi bi-sun hidden dark:inline"></i>
</button>
```

### Dark Mode Transitions
```css
/* Global transition for dark mode */
html {
    transition: background-color 0.3s ease, color 0.3s ease;
}

/* Smooth transitions for all properties */
*, *::before, *::after {
    transition-property: background-color, border-color, color, fill, stroke, transform, opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.3s;
}
```

### Dark Mode Classes

#### Backgrounds
```css
/* Light mode */
bg-gray-50
bg-white
bg-gradient-to-br from-gray-50 to-gray-100

/* Dark mode */
dark:bg-gray-900
dark:bg-gray-800
dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800
```

#### Text
```css
/* Light mode */
text-gray-900 (primary)
text-gray-600 (secondary)
text-gray-500 (tertiary)

/* Dark mode */
dark:text-white (primary)
dark:text-gray-300 (secondary)
dark:text-gray-400 (tertiary)
```

#### Borders
```css
/* Light mode */
border-gray-200
border-gray-300

/* Dark mode */
dark:border-gray-700
dark:border-gray-600
```

#### Interactive Elements
```css
/* Light mode hover */
hover:bg-gray-100
hover:text-blue-600

/* Dark mode hover */
dark:hover:bg-gray-700
dark:hover:text-blue-400
```

## Responsive Design

### Breakpoints
```css
/* Mobile first approach */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Responsive Patterns

#### Typography
```html
<h1 class="text-5xl md:text-7xl font-bold">
    Responsive heading
</h1>
<p class="text-lg md:text-xl">
    Responsive paragraph
</p>
```

#### Layout
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Responsive grid -->
</div>
```

#### Spacing
```html
<div class="p-4 sm:p-6 lg:p-8">
    <!-- Responsive padding -->
</div>
```

#### Navigation
```html
<div class="hidden md:flex items-center space-x-8">
    <!-- Desktop navigation -->
</div>
<div class="md:hidden">
    <!-- Mobile navigation -->
</div>
```

### Mobile Optimizations

#### Touch Targets
```css
@media (max-width: 768px) {
    .email-item,
    .desktop-icon,
    button {
        min-height: 44px;
        min-width: 44px;
    }
}
```

#### Scrollbar Sizing
```css
@media (max-width: 768px) {
    .window-content::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
}
```

## Accessibility

### ARIA Labels
```html
<button aria-label="Select theme" title="Select theme">
    <!-- Theme toggle -->
</button>

<i class="bi bi-play-circle" aria-hidden="true"></i>
```

### Semantic HTML
```html
<nav aria-label="Main navigation">
    <!-- Navigation -->
</nav>

<main aria-label="Main content">
    <!-- Content -->
</main>

<footer aria-label="Site footer">
    <!-- Footer -->
</footer>
```

### Focus States
```html
<button class="focus:outline-none focus:ring-4 focus:ring-blue-500/25">
    <!-- Button with visible focus ring -->
</button>
```

### Keyboard Navigation
```html
<!-- Ensure interactive elements are keyboard accessible -->
<a href="#" class="focus:outline-none focus:ring-2">
    <!-- Accessible link -->
</a>

<button class="focus:outline-none focus:ring-2">
    <!-- Accessible button -->
</button>
```

### Screen Reader Support
```html
<!-- Hidden visual elements for screen readers -->
<span class="sr-only">Hidden text</span>

<!-- Descriptive labels -->
<label for="email">Email Address</label>
<input id="email" type="email" aria-describedby="email-help">
<span id="email-help">Enter your email address</span>
```

## Custom Utilities

### Cyber Gradient
```css
.cyber-gradient {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c75 100%);
}

.dark .cyber-gradient {
    background: linear-gradient(135deg, #020617 0%, #0c1426 50%, #0a2540 100%);
}
```

### Cyber Glow
```css
.cyber-glow {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), 
                0 0 40px rgba(34, 197, 94, 0.1);
}
```

### Backdrop Blur
```css
.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

.backdrop-blur-md {
    backdrop-filter: blur(12px);
}

.backdrop-blur-lg {
    backdrop-filter: blur(16px);
}
```

### Line Clamp
```css
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

## Scrollbar Styling

### Custom Scrollbars

#### Window Content Scrollbar
```css
.window-content::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

.window-content::-webkit-scrollbar-track {
    background: #1f2937;
    border-radius: 6px;
    border: 1px solid #374151;
}

.window-content::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #4b5563 0%, #374151 100%);
    border-radius: 6px;
    border: 1px solid #6b7280;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.window-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%);
    border-color: #9ca3af;
}
```

#### Terminal Scrollbar
```css
.terminal-output::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.terminal-output::-webkit-scrollbar-track {
    background: #111827;
    border-radius: 5px;
    border: 1px solid #1f2937;
}

.terminal-output::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
    border-radius: 5px;
    border: 1px solid #4b5563;
    box-shadow: inset 0 1px 0 rgba(16, 185, 129, 0.1);
}
```

### Firefox Support
```css
.window-content {
    scrollbar-width: thin;
    scrollbar-color: #4b5563 #1f2937;
}
```

## Best Practices

### 1. Consistent Spacing
```html
<!-- ✅ Good - Use consistent spacing scale -->
<div class="p-6 mb-4">
    Content
</div>

<!-- ❌ Bad - Arbitrary values -->
<div class="p-13 mb-7">
    Content
</div>
```

### 2. Semantic Classes
```html
<!-- ✅ Good - Semantic class names -->
<button class="btn-primary">Submit</button>

<!-- ❌ Bad - Non-semantic names -->
<button class="blue-button-big">Submit</button>
```

### 3. Responsive Design
```html
<!-- ✅ Good - Mobile-first approach -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    Content
</div>

<!-- ❌ Bad - Desktop-first approach -->
<div class="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-1">
    Content
</div>
```

### 4. Dark Mode Support
```html
<!-- ✅ Good - Always include dark mode variants -->
<div class="bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white">
    Content
</div>

<!-- ❌ Bad - No dark mode support -->
<div class="bg-white text-gray-900">
    Content
</div>
```

### 5. Accessibility
```html
<!-- ✅ Good - Include ARIA labels -->
<button aria-label="Close modal">
    <i class="bi bi-x" aria-hidden="true"></i>
</button>

<!-- ❌ Bad - Missing accessibility -->
<button>
    <i class="bi bi-x"></i>
</button>
```

### 6. Performance
```html
<!-- ✅ Good - Use CSS animations -->
<div class="animate-fade-in-up">
    Content
</div>

<!-- ❌ Bad - Use JavaScript animations -->
<div style="animation: fadeInUp 0.6s ease-out forwards;">
    Content
</div>
```

## Design Tokens

### Spacing Tokens
```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 0.75rem;  /* 12px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 2.5rem;  /* 40px */
```

### Border Radius Tokens
```css
--radius-sm: 0.5rem;   /* 8px */
--radius-md: 0.75rem;  /* 12px */
--radius-lg: 1rem;     /* 16px */
--radius-xl: 1.5rem;   /* 24px */
--radius-full: 9999px; /* 50% */
```

### Shadow Tokens
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Transition Tokens
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

## File Structure

### CSS Files
```
app/static/css/
├── main.css                 # Global styles and animations
├── home.css                 # Home page specific styles
├── auth.css                 # Authentication pages styles
├── dashboard.css            # Dashboard specific styles
├── levels.css               # Levels page styles
├── about.css                # About page styles
├── contact.css              # Contact page styles
└── simulated-pc/
    └── windows.css          # Simulated PC window styles
```

### JavaScript Files
```
app/static/js/
├── main.js                  # Main JavaScript entry point
├── utils/
│   ├── toast.js            # Toast notification system
│   ├── theme/
│   │   └── theme-initializator.js  # Theme initialization
│   └── auth-state-validator.js     # Auth state validation
└── simulated-pc/
    ├── desktop.js          # Desktop initialization
    ├── boot-sequence.js    # Boot sequence logic
    └── desktop-components/ # Desktop components
```

## Browser Support

### Supported Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Fallbacks
- CSS Grid/ Flexbox with fallbacks
- Custom properties with fallbacks
- JavaScript with feature detection

## Performance Considerations

### CSS Optimization
- Use Tailwind's purging for production
- Minimize custom CSS
- Use CSS animations over JavaScript
- Lazy load non-critical styles

### Image Optimization
- Use appropriate image formats
- Implement lazy loading
- Use responsive images
- Optimize SVG icons

### JavaScript Optimization
- Use ES6 modules for code splitting
- Lazy load non-critical JavaScript
- Minimize bundle size
- Use efficient event handling

## Future Enhancements

### Planned Improvements
1. **Design Token System** - Centralized design token management
2. **Component Library** - Reusable component documentation
3. **Storybook Integration** - Interactive component showcase
4. **Automated Testing** - Visual regression testing
5. **Performance Monitoring** - Design system performance metrics

### Scalability Considerations
- Support for larger component libraries
- Improved theming system
- Better accessibility tools
- Enhanced developer experience

## Related Documentation

- [Simulated PC System](./systems/simulated-pc-system.md)
- [Window Management System](./systems/window-management-system.md)
- [Desktop Components System](./systems/desktop-components-system.md)

## Resources

### External Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Internal Resources
- CSS files in `app/static/css/`
- Template files in `app/templates/`
- JavaScript files in `app/static/js/`