# Resume Comparison Visual Guide

## Overview
This guide shows how the new resume comparison feature works.

## View Modes

### 1. Toggle View (Recommended)
```
┌─────────────────────────────────────────────────────────────┐
│ View: [Toggle] Split View        📄 +15 words  250 → 265   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┐ ┌─────────────────────────┐  │
│  │ Original Resume          │ │ Customized Resume    ✓  │  │
│  │ Your original content    │ │ AI-tailored          │  │
│  └──────────────────────────┘ └─────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Customized Resume                    [Switch to Original]│
│  │ Tailored for: Senior Software Engineer at...           │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  # John Doe                                            │  │
│  │  Senior Software Engineer                              │  │
│  │                                                         │  │
│  │  ## Experience                                         │  │
│  │  Led development of microservices architecture...     │  │
│  │  (Full resume content here)                            │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Tap above to switch between versions                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Split View (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ View: Toggle [Split View]        📄 +15 words  250 → 265   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────┐ ┌────────────────────────────┐│
│ │ Original Resume    [Orig]│ │ Customized Resume  [Custom]││
│ │ Your original content    │ │ AI-tailored for the job    ││
│ ├──────────────────────────┤ ├────────────────────────────┤│
│ │                          │ │                            ││
│ │ # John Doe               │ │ # John Doe                 ││
│ │ Software Engineer        │ │ Senior Software Engineer   ││
│ │                          │ │                            ││
│ │ ## Experience            │ │ ## Experience              ││
│ │ Developed web apps...    │ │ Led development of         ││
│ │                          │ │ microservices architecture ││
│ │ ## Skills                │ │                            ││
│ │ - JavaScript             │ │ ## Skills                  ││
│ │ - React                  │ │ - JavaScript, TypeScript   ││
│ │ - Node.js                │ │ - React, Node.js           ││
│ │                          │ │ - AWS, Docker, K8s         ││
│ │                          │ │                            ││
│ └──────────────────────────┘ └────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Experience (< 640px)

### Toggle View on Mobile
```
┌───────────────────────┐
│ View: [Toggle] Split  │
│ 📄 +15 words          │
├───────────────────────┤
│                       │
│ ┌───────────────────┐ │
│ │ Original Resume   │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │ Customized ✓      │ │
│ │ AI-tailored       │ │
│ └───────────────────┘ │
│                       │
├───────────────────────┤
│                       │
│ ┌─────────────────┐   │
│ │ Customized      │   │
│ │    [Switch]     │   │
│ ├─────────────────┤   │
│ │                 │   │
│ │ # John Doe      │   │
│ │ Senior SW Eng   │   │
│ │                 │   │
│ │ ## Experience   │   │
│ │ Led development │   │
│ │ of microservices│   │
│ │ ...             │   │
│ │                 │   │
│ └─────────────────┘   │
│                       │
│ Tap to switch         │
└───────────────────────┘
```

## Key Interactions

### Switching Versions in Toggle View
1. Click on the version card at the top
2. Or click the "Switch to..." button in the header
3. Smooth transition animation shows the change
4. Active version is clearly marked with checkmark

### Using Split View
1. Click "Split View" in the control bar
2. Both resumes appear side-by-side
3. Scroll independently in each column
4. Headers stick to top while scrolling

### Statistics Bar
```
┌────────────────────────────────────────────┐
│ View: [Toggle] Split    📄 +15 words       │
│                         250 → 265          │
└────────────────────────────────────────────┘
     ▲                    ▲        ▲
     │                    │        │
  View Mode      Word Difference  Total Words
  Selector       Indicator        (Original → Customized)
```

## Visual Indicators

### Original Resume
- Gray border and header
- "Original" badge
- Neutral colors
- Clean, simple appearance

### Customized Resume
- Blue border and header
- "Customized" badge
- Job description context shown
- Emphasis on being AI-tailored

### Active Version (Toggle Mode)
- Thicker border
- "Viewing" badge
- Checkmark icon
- Highlighted background

## User Flow

1. **Create Customization**
   ```
   Customize Tab → Enter Job Description → Click "Customize"
   ```

2. **View Comparison**
   ```
   Click "Compare" Tab → See Toggle View (default)
   ```

3. **Switch Between Views**
   ```
   Toggle View ⟷ Split View (click buttons in control bar)
   ```

4. **Switch Between Versions** (Toggle Mode)
   ```
   Click version card OR click "Switch to..." button
   ```

5. **Save or Discard**
   ```
   "Save as Version" | "Save as Application" | "Discard Changes"
   ```

## Responsive Behavior

### Desktop (> 1024px)
- Split view: True side-by-side
- Toggle view: Centered with max-width
- Full navigation visible
- All features accessible

### Tablet (640px - 1024px)
- Split view: Stacks vertically
- Toggle view: Full width
- Touch-friendly buttons
- Optimized spacing

### Mobile (< 640px)
- Toggle view recommended
- Larger tap targets
- Vertical layout
- Simplified navigation
- Tip shown for better mode

## Color Coding

```
Original Resume:
├─ Border: Gray (#E5E7EB)
├─ Header: Light Gray (#F9FAFB)
└─ Badge: Gray (#6B7280)

Customized Resume:
├─ Border: Blue (#93C5FD)
├─ Header: Light Blue (#EFF6FF)
└─ Badge: Blue (#2563EB)

Active State:
├─ Border: Dark Blue (#1D4ED8) or Dark Gray (#111827)
└─ Background: Slightly tinted
```

## Accessibility Features

- ✅ Keyboard navigation supported
- ✅ Clear focus indicators
- ✅ Sufficient color contrast
- ✅ Screen reader friendly labels
- ✅ Semantic HTML structure
- ✅ Touch targets meet size requirements

## Performance

- ⚡ Smooth 60fps transitions
- ⚡ Lazy loading for markdown rendering
- ⚡ Efficient state management
- ⚡ No layout shifts
- ⚡ Optimized for large documents

---

**This visual guide helps you understand the new comparison feature at a glance!**
