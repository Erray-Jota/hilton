# DESIGN SYSTEM

## Color Palette
Use semantic color tokens via Tailwind:

| Token | CSS Variable | Usage |
|-------|-------------|-------|
| `bg-background` | `--background` | Page backgrounds |
| `bg-card` | `--card` | Card surfaces |
| `text-foreground` | `--foreground` | Primary text |
| `text-muted-foreground` | `--muted-foreground` | Secondary text |
| `border` | `--border` | Borders, dividers |
| `bg-primary` | `--primary` | Primary actions |
| `bg-destructive` | `--destructive` | Error states |

## Typography
- **Headings**: `font-semibold` or `font-bold`
- **Body**: Default weight, `text-sm` for secondary
- **Monospace**: Use `font-mono` for numbers/codes

## Spacing Standards
| Context | Padding | Gap |
|---------|---------|-----|
| Cards | `p-4` to `p-6` | - |
| Sections | `py-6` to `py-8` | `gap-4` |
| Inputs | `p-2` to `p-3` | `gap-2` |
| Mobile | Reduce by 1 step | - |

## Component Guidelines

### Buttons
```tsx
// Primary action
<Button variant="default">Save</Button>

// Secondary action  
<Button variant="outline">Cancel</Button>

// Destructive
<Button variant="destructive">Delete</Button>
```

### Form Inputs
- Use Radix primitives (`@radix-ui/react-*`)
- Wrap with `Label` component
- Show validation via `text-destructive`

### Mobile Patterns
- **Min touch target**: 44px × 44px
- **Drawers**: Use `vaul` for bottom sheets
- **Sticky footers**: Pin totals/actions to `bottom-0`

## Responsive Breakpoints
| Breakpoint | Prefix | Min Width |
|------------|--------|-----------|
| Mobile | (default) | 0px |
| Tablet | `md:` | 768px |
| Desktop | `lg:` | 1024px |
| Wide | `xl:` | 1280px |

## Z-Index Scale
| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default content |
| Dropdown | 10 | Menus, popovers |
| Modal | 50 | Dialogs, overlays |
| Toast | 100 | Notifications |

## Animation Guidelines
- Use `transition-all` for hover states
- Framer Motion for complex animations
- Duration: 150-300ms for micro-interactions
