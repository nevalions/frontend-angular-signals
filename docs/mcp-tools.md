# MCP Tools for Angular Development

This document covers the available MCP tools for Angular development.

## Angular CLI MCP Tools

Use MCP (Model Context Protocol) tools for Angular-specific tasks.

### List Angular Workspaces and Projects

```typescript
angular-cli_list_projects();
```

### Get Angular Best Practices

Get version-specific best practices for your project:

```typescript
angular-cli_get_best_practices({
  workspacePath: '/path/to/angular.json',
});
```

### Search Angular Documentation

Search official Angular.dev documentation:

```typescript
angular-cli_search_documentation({
  query: 'standalone components',
  includeTopContent: true,
  version: 21,
});
```

### Start Angular AI Tutor

For guided, step-by-step learning:

```typescript
angular-cli_ai_tutor();
```

### Migrate to OnPush/Zoneless

Get iterative migration plans for change detection:

```typescript
angular-cli_onpush_zoneless_migration({
  fileOrDirPath: '/path/to/component',
});
```

## ESLint MCP Tool

Use ESLint MCP for linting specific files:

```typescript
eslint_lint-files({
  filePaths: ['/path/to/file1.ts', '/path/to/file2.ts'],
});
```

## When to Use MCP Tools

1. **Learning and Documentation**: Use `angular-cli_search_documentation` to find current Angular API usage
2. **Project Analysis**: Use `angular-cli_list_projects` to understand workspace structure
3. **Best Practices**: Use `angular-cli_get_best_practices` before writing new features
4. **Refactoring**: Use `angular-cli_onpush_zoneless_migration` for OnPush migration planning
5. **Code Quality**: Use `eslint_lint-files` to check specific files during development
6. **Tutorials**: Use `angular-cli_ai_tutor` for guided step-by-step learning

## MCP Tool Benefits

- **Version-Specific Guidance**: Get accurate information for your Angular version (21.x)
- **Official Documentation**: Access official Angular.dev documentation
- **Best Practices**: Ensure code follows current Angular conventions
- **Automated Refactoring**: Get iterative migration plans for complex changes
- **Targeted Linting**: Check specific files without full project lint
- **Guided Learning**: Interactive tutorials for Angular concepts

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal-based patterns
- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
