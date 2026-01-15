# Component Patterns

This document covers component-specific patterns and requirements.

## Component Structure

All components are standalone with this pattern:

```typescript
@Component({
  selector: 'app-feature-name', // kebab-case, app prefix
  standalone: true, // Always standalone
  imports: [
    /* dependencies */
  ], // All imports listed
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush, // REQUIRED
})
export class FeatureNameComponent {
  // Component logic
}
```

## Signal Inputs/Outputs

### Signal Inputs

```typescript
// Read-only signal input
seasonId = input.required<number>();

// Optional signal input with default
disabled = input(false);

// Signal output
seasonChange = output<Season>();

// Signal model for two-way binding
checked = model(false);
```

### View Queries

```typescript
import { viewChild, viewChildren, contentChild, contentChildren } from '@angular/core';

// Required view child
button = viewChild.required('button');

// Optional view child
container = viewChild<ElementRef>('container');

// Multiple view children
items = viewChildren(ItemComponent);

// Content projection
content = contentChild('content');
```

## Template Patterns

### Modern Control Flow

- Use `@if` instead of `*ngIf`
- Use `@for` instead of `*ngFor`
- Use `track` for list iteration

```html
<!-- GOOD - Modern control flow -->
@if (loading()) {
  <div>Loading...</div>
} @for (season of seasons(); track season.id) {
  <div>{{ season.year }}</div>
}
```

### Signal Bindings

```html
<!-- Direct signal binding -->
@if (loading()) {
  <div>Loading...</div>
} @for (season of seasons(); track season.id) {
  <div>{{ season.year }}</div>
}
```

### Class and Style Bindings

- Use `[class.name]` instead of `ngClass`
- Use `[style.property]` instead of `ngStyle`

```html
<!-- GOOD - Modern class binding -->
<div [class.active]="isActive()">{{ content }}</div>

<!-- BAD - Old ngClass -->
<div [ngClass]="{ active: isActive() }">{{ content }}</div>
```

## Component Organization

### Group Related Files Together

Components typically consist of one TypeScript file, one template file, and one style file. These files should share the same name with different file extensions.

Example for a `UserProfile` component:
- `user-profile.component.ts`
- `user-profile.component.html`
- `user-profile.component.less`

If a component has more than one style file, append name with additional words that describe the styles specific to that file.

Example:
- `user-profile-settings.less`
- `user-profile-subscription.less`

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal-based patterns
- [Template Requirements](./template-requirements.md) - Template best practices
- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
