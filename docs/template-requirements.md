# Template Requirements

This document covers template-specific requirements and best practices.

## Modern Control Flow

### @if Directive

Use `@if` instead of `*ngIf` for conditional rendering.

```html
<!-- GOOD - Modern @if -->
@if (loading()) {
  <div>Loading...</div>
} @else if (error()) {
  <div>Error: {{ error() }}</div>
} @else {
  <div>{{ content() }}</div>
}

<!-- BAD - Old *ngIf -->
<div *ngIf="loading(); else errorBlock">Loading...</div>
<ng-template #errorBlock>
  <div *ngIf="error()">Error: {{ error() }}</div>
</ng-template>
```

### @for Directive

Use `@for` instead of `*ngFor` for list iteration. Always use `track` for better performance.

```html
<!-- GOOD - Modern @for with track -->
@for (season of seasons(); track season.id) {
  <div class="season">{{ season.year }}</div>
}

<!-- BAD - Old *ngFor -->
<div *ngFor="let season of seasons; trackBy: season.id">
  <div class="season">{{ season.year }}</div>
</div>
```

### @switch Directive

Use `@switch` for multi-way conditional rendering.

```html
@switch (status()) {
  @case ('loading') {
    <div>Loading...</div>
  }
  @case ('error') {
    <div>Error occurred</div>
  }
  @default {
    <div>{{ content() }}</div>
  }
}
```

## Signal Bindings

### Direct Signal Access

Always call signals with `()` in templates to access their values.

```html
<!-- GOOD - Signal access -->
@if (loading()) {
  <div>Loading...</div>
}

<!-- BAD - Missing () -->
@if (loading) {
  <div>Loading...</div>
}
```

### Computed Signal Usage

Computed signals work the same way in templates.

```html
@for (item of filteredItems(); track item.id) {
  <div>{{ item.name }}</div>
}
```

## Class and Style Bindings

### Class Bindings

Use `[class.name]` syntax for conditional classes.

```html
<!-- GOOD - Modern class binding -->
<button [class.active]="isActive()" [class.disabled]="isDisabled()">
  Click me
</button>

<!-- BAD - Old ngClass -->
<button [ngClass]="{ active: isActive(), disabled: isDisabled() }">
  Click me
</button>
```

Multiple classes:

```html
<div [class.active]="isActive()" [class.large]="isLarge()" [class.card]="isCard()">
  Content
</div>
```

### Style Bindings

Use `[style.property]` syntax for dynamic styles.

```html
<!-- GOOD - Modern style binding -->
<div [style.width.px]="width()" [style.opacity]="opacity()">
  Content
</div>

<!-- BAD - Old ngStyle -->
<div [ngStyle]="{ 'width.px': width(), 'opacity': opacity() }">
  Content
</div>
```

## Property and Event Bindings

### Property Binding

Use `[property]` for one-way data binding.

```html
<input [value]="title()" [disabled]="isDisabled()" />
```

### Event Binding

Use `(event)` for event handling.

```html
<button (click)="onSave()">Save</button>
<input (input)="onInput($event)" />
```

### Two-Way Binding

Use `[(ngModel)]` or signal `model()` for two-way binding.

```html
<!-- With ngModel -->
<input [(ngModel)]="title()" />

<!-- With signal model -->
<input [(ngModel)]="checked" />
```

## Template Best Practices

### Keep Templates Simple

- Move complex logic to components or methods
- Use pipes for data transformation
- Avoid complex expressions in templates

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation support

### Performance

- Use `track` with `@for` for large lists
- Avoid unnecessary template re-evaluations
- Use `OnPush` change detection

## Related Documentation

- [Component Patterns](./component-patterns.md) - Component structure
- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal usage
- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
