# Tabs Navigation Component Schema

**Component**: `TabsNavComponent`
**Type**: Shared/Reusable Component
**Usage**: Reusable tab navigation for detail pages, settings, and segmented tab layouts

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Tournaments] [Teams] [Players] [Positions]                         │
│  (pills / underline / segmented variants based on appearance)         │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Overview

The `TabsNavComponent` provides a reusable tab navigation control with three visual variants (pills, underline, segmented). It supports:

- **Configurable tab lists** with labels, values, and optional icons
- **Active tab tracking** via input signals
- **Variant rendering** (pills, underline, segmented)
- **Accessible tab semantics** with `role="tablist"` and `role="tab"`

## Component Inputs

```typescript
@Input() tabs: TabsNavItem[];                                // Required: array of tab definitions
@Input() activeTab: string;                                  // Required: active tab value
@Input() appearance: 'pills' | 'underline' | 'segmented';    // Default: 'pills'
@Input() segmentedSize: 's' | 'm' | 'l';                     // Default: 'l'
```

## Component Outputs

```typescript
@Output() tabChange: EventEmitter<string>;                   // Emits selected tab value
```

## Display Elements

- **Tabs List**: Rendered based on `tabs` input
- **Tab Label**: `TabsNavItem.label`
- **Tab Icon** (optional): `TabsNavItem.icon` (Taiga UI icon name)
- **Active State**: Determined by `activeTab`

## TabsNavItem Interface

```typescript
export interface TabsNavItem {
  label: string;                                              // Visible tab label
  value: string;                                              // Tab identifier used in routing/state
  icon?: string;                                              // Optional Taiga UI icon name
}
```

## What we need from backend

**None.** This component is purely presentational and requires no backend data or endpoints.

## TODOs

None - no backend dependencies.
