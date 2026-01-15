# Code Style Guidelines

This document covers code style guidelines and conventions.

## Editor Configuration (.editorconfig)

- 2 space indentation
- UTF-8 charset
- Insert final newline on save
- Trim trailing whitespace
- Single quotes for TypeScript files

## TypeScript Configuration

- Strict mode enabled: `strict: true`
- No implicit returns: `noImplicitReturns: true`
- No property access from index signature
- No fallthrough cases in switch
- Force consistent casing: `forceConsistentCasingInFileNames: true`

## Import Order

1. Angular core/common/framework imports
2. External library imports (RxJS, Taiga UI, etc.)
3. Internal application imports (services, types, components)
4. Relative imports

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { ErrorHandlingService } from '../../services/error.service';
import { IPerson } from '../../type/person.type';
```

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureNameComponent {
  // Component logic
}
```

## Class Organization

### Group Angular-Specific Properties

Components and directives should group Angular-specific properties together, typically near the top of the class declaration. This includes injected dependencies, inputs, outputs, and queries.

**Example:**

```typescript
@Component({ ... })
export class ExampleComponent {
  // Injected dependencies
  private http = inject(HttpClient);
  private store = inject(Store);

  // Inputs and outputs
  data = input.required<Data[]>();
  selected = output<Data>();

  // Queries
  items = viewChildren(ItemComponent);

  // Private signals
  private expanded = signal(false);

  // Public computed
  filtered = computed(() => ...);

  // Methods
  handleSelect(item: Data) { ... }
}
```

This practice makes it easier to find a class's template APIs and dependencies.

### Keep Components Focused

Code inside your components and directives should generally relate to the UI shown on the page. For code that makes sense on its own, decoupled from the UI, prefer refactoring to other files.

For example, you can factor form validation rules or data transformations into separate functions or classes.

## File Organization

### One Concept Per File

Prefer focusing source files on a single concept. For Angular classes specifically, this usually means one component, directive, or service per file.

However, it's okay if a file contains more than one component or directive if your classes are relatively small and they tie together as part of a single concept.

When in doubt, go with the approach that leads to smaller files.

### Group Related Files

Angular components consist of a TypeScript file and, optionally, a template and one or more style files. You should group these together in the same directory.

Unit tests should live in the same directory as the code-under-test. Avoid collecting unrelated tests into a single `tests` directory.

## Related Documentation

- [Component Patterns](./component-patterns.md) - Component structure
- [Template Requirements](./template-requirements.md) - Template best practices
- [Naming Conventions](./naming-conventions.md) - Naming standards
