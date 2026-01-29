# Admin Forms - Shared Responsive Styles

This directory contains shared responsive styles and utilities for all admin-forms components.

## Shared Styles File

**File:** `shared-responsive-styles.less`

Contains reusable mixins for consistent responsive behavior across all admin-forms components.

## Standard Breakpoints

- **Tablet:** 768px (`@sb-breakpoint-tablet`)
- **Mobile:** 450px (`@sb-breakpoint-mobile`)

These breakpoints are used consistently across all admin-forms components to ensure uniform behavior.

## Available Mixins

### Button Mixins

**Note:** Due to Taiga UI's `tuiButton` directive applying inline styles from `size` attribute, CSS mixins alone cannot override Taiga UI's inline styles. Use inline `[style]` binding in templates for mobile breakpoint instead.

#### `.sb-btn-tablet()`
Tablet button styles - used for reference only (mobile approach uses inline styles).

#### `.sb-btn-mobile()`
Mobile button styles with `!important` - **Use in templates via `[style]` binding**.

Example in template:
```html
<button
  [style]="isMobile() ? 'font-size: 10px; min-width: 40px; padding: 2px 4px; height: 28px;' : ''"
>
  Button Text
</button>
```

#### `.sb-btn-save-tablet()`
Save button - tablet styles.

#### `.sb-btn-save-mobile()`
Mobile save button styles with `!important` - **Use in templates via `[style]` binding**.

Example in template:
```html
<button
  [style]="isMobile() ? 'min-width: 80px; font-size: 12px; padding: 4px 12px; height: 32px;' : ''"
>
  Save
</button>
```

### Input Mixins

#### `.sb-input-mobile()`
Mobile input styles (without !important - use in CSS or template).

## Container Mixins

#### `.sb-container-tablet()`
Tablet container styles.

#### `.sb-container-mobile()`
Mobile container styles.

## Form Row Mixins

#### `.sb-buttons-row-tablet()`
Tablet button row styles.

#### `.sb-buttons-row-mobile()`
Mobile button row styles.

## Important Notes

### Taiga UI Inline Styles Issue
Taiga UI's `tuiButton` directive reads the `size` attribute (e.g., `size="m"`, `size="l"`) and converts it to inline styles on the button element. These inline styles have higher CSS specificity than LESS file styles, even with `!important`.

### Preferred Solution: CSS Media Queries with `!important`
**Preferred approach:** Use CSS media queries with `!important` in LESS files. This is cleaner and doesn't require JS for responsive behavior. Example from `time-forms.component.less`:

```less
@media (max-width: 450px) {
  .clock-controls,
  .play-clock-buttons {
    button {
      flex: 1;
      min-height: 44px !important;
      font-size: 13px !important;
      padding: 8px 12px !important;
    }
  }
}
```

### Alternative: Inline Styles in Templates
When CSS alone cannot override Taiga UI styles, use inline `[style]` binding:
1. Add `isMobile()` method to component
2. Use `[style]` binding with conditional inline styles

Example:
```typescript
isMobile(): boolean {
  return window.innerWidth <= 450;
}
```

```html
<button
  [style]="isMobile() ? 'font-size: 10px; min-width: 40px; padding: 2px 4px; height: 28px;' : ''"
>
  Button Text
</button>
```

### Input Fields: Avoid Step Buttons on Mobile
For `tuiInputNumber` fields on mobile, remove `[step]` attribute and add `[tuiTextfieldCleaner]="false"` to prevent +/- buttons from hiding the input value:

```html
<tui-textfield [tuiTextfieldCleaner]="false">
  <input
    tuiInputNumber
    [ngModel]="value()"
    [min]="0"
    [max]="99"
  />
</tui-textfield>
```

## Components Using Shared Styles

All admin-forms components use these shared styles and breakpoints:

- ✅ **score-forms** - Reference implementation (includes integrated timeout controls)
- ✅ **time-forms** - Updated with inline styles for mobile
- ✅ **qtr-forms** - Standardized breakpoints
- ✅ **events-forms** - Added mobile support
- ✅ **roster-forms** - Standardized breakpoints
- ✅ **scoreboard-settings-forms** - Standardized breakpoints
- ✅ **down-distance-forms** - Standardized breakpoints
- ✅ **collapsible-section** - Uses breakpoint variables

> **Note:** Timeout controls are now integrated into `score-forms` component instead of a separate `timeout-forms` component.

## Best Practices

1. **Always use shared breakpoints**: `@sb-breakpoint-tablet` and `@sb-breakpoint-mobile`
2. **Prefer CSS media queries**: Use `!important` in LESS files when possible (cleaner than JS)
3. **For stubborn Taiga buttons**: Use inline `[style]` binding as fallback
4. **Keep component-specific styles**: Separate from shared mixins
5. **Test at both breakpoints**: 768px and 450px
6. **Use 16px font-size on inputs**: Prevents iOS zoom on focus
7. **44px minimum touch targets**: iOS Human Interface Guidelines recommend 44pt minimum

## Migration Guide

When updating a component to use responsive styles:

1. **Import shared styles** in LESS file:
   ```less
   @import '../shared-responsive-styles.less';
   ```

2. **Add mobile media query** with responsive styles:
   ```less
   @media (max-width: 450px) {
     .my-buttons {
       button {
         flex: 1;
         min-height: 44px !important;
         font-size: 13px !important;
       }
     }
   }
   ```

3. **For inputs**, ensure values are visible on mobile:
   - Remove `[step]` attribute to hide +/- stepper buttons
   - Add `[tuiTextfieldCleaner]="false"` to hide clear button
   - Use `font-size: 16px` to prevent iOS zoom

4. **Only if CSS fails**: Add `isMobile()` method and inline styles:
   ```typescript
   isMobile(): boolean {
     return window.innerWidth <= 450;
   }
   ```
   ```html
   <button [style]="isMobile() ? 'mobile-styles' : ''">
   ```

## Related Documentation

- [Component Patterns](../../docs/component-patterns.md) - Component structure
- [Code Style Guidelines](../../docs/code-style-guidelines.md) - Coding conventions
- [Admin Forms Components](../) - Component implementations

- [Admin Forms Components](../) - Component implementations
