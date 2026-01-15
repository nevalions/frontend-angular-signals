# Naming Conventions

This document covers file and code naming conventions.

## Files and Directories

### Component Files

- Components: `feature-name.component.ts`, `feature-name.component.html`, `feature-name.component.less`
- All lowercase with hyphens (kebab-case)
- Example: `user-profile.component.ts`

### Service Files

- Services: `feature.service.ts`
- Example: `person.service.ts`

### Type Files

- Types: `feature.type.ts`
- Example: `person.type.ts`

### Store Files

- Store files: `actions.ts`, `reducers.ts`, `effects.ts`, `selectors.ts`
- Example: `person.actions.ts`

### Directory Names

- All lowercase with hyphens (kebab-case)
- Example: `user-profile`, `team-detail`, `person-list`

## Code Naming

### Components

- PascalCase (e.g., `PersonComponent`, `AllPersonsComponent`)
- Prefix with `app-` in selector (kebab-case)
- Example: `@Component({ selector: 'app-person-detail' })`

### Services

- PascalCase with 'Service' suffix (e.g., `PersonService`)
- Example: `export class PersonService`

### Facade Services

- PascalCase without suffix (e.g., `Person`)
- Example: `export class Person`

### Interfaces

- PascalCase with 'I' prefix (e.g., `IPerson`, `IMatch`)
- Example: `export interface IPerson`

### Types

- PascalCase without prefix (e.g., `AgeStats`, `PaginationState`)
- Example: `export type AgeStats`

### Observables

- End with `$` suffix (e.g., `currentPerson$`, `allPersons$`)
- Example: `export const persons$ = ...`

### Methods

- camelCase
- Example: `loadPersons()`, `createPerson()`, `updatePerson()`

### Constants

- UPPER_SNAKE_CASE (e.g., `API_ENDPOINT`, `MAX_ITEMS`)
- Example: `export const MAX_RETRIES = 3;`

## Separating Words in Names

### File Names

Separate words within a file name with hyphens (`-`). For example, a component named `UserProfile` has a file name `user-profile.ts`.

### Test Files

Use the same name for a file's tests with `.spec` at the end. For example, unit test file for the `UserProfile` component has a file name `user-profile.spec.ts`.

### File Name vs Class Name

If a file contains more than one primary namable identifier, choose a name that describes the common theme to the code within. If the code in a file does not fit within a common theme or feature area, consider breaking the code up into different files.

Avoid overly generic file names like:
- `helpers.ts`
- `utils.ts`
- `common.ts`

## Related Documentation

- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
- [Type Definitions](./type-definitions.md) - Type conventions
