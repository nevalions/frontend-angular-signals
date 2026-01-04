# STAF-119: Evaluation of Experimental `signals: true` Component Option

## Executive Summary

**Recommendation: WAIT** - Do not adopt the `signals: true` component option at this time.

The `signals: true` component decorator option is **NOT available in Angular 21.0.6** and remains experimental. The TypeScript compiler confirms this by rejecting the option with: "Object literal may only specify known properties, and 'signals' does not exist in type 'Component'."

## Research Findings

### 1. What is `signals: true`?

Based on Angular RFC #49682 (Signal-based Components), `signals: true` is a proposed experimental component decorator option that would:

- Make component inputs read-only by default
- Simplify component lifecycle (only `ngOnInit` and `ngOnDestroy`)
- Enable local change detection (no global zone.js checking)
- Change how `@Input()`, `@Output()`, and queries work
- Remove support for decorators like `@Input()`, `@Output()`, `@ViewChild()`, etc.

### 2. Current Status in Angular 21.0.6

**Key Finding:** `signals: true` does NOT exist in Angular 21.0.6.

The Angular 21.0.0 release (November 2025) includes:
- ✅ **Signal Forms** (experimental) - `@angular/forms/signals` package
- ✅ **Zoneless by default** - applications are zoneless by default in Angular 21
- ✅ **Vitest** as default testing framework
- ✅ **Signal primitives** - `signal()`, `computed()`, `effect()` are stable
- ✅ **Function-based component APIs** - `input()`, `output()`, `model()`, `viewChild()`, `contentChild()` are available
- ❌ **`signals: true` component option** - NOT available

**Proof:**
```typescript
// Attempting to use signals: true in Angular 21.0.6
@Component({
  selector: 'app-home',
  standalone: true,
  signals: true,  // ❌ ERROR: Property 'signals' does not exist
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

Compiler error: `Object literal may only specify known properties, and 'signals' does not exist in type 'Component'.`

### 3. What IS Available in Angular 21?

The codebase can benefit from these stable features **without** `signals: true`:

#### Signal Primitives (Stable)
```typescript
// Already used in the codebase
count = signal(0);
doubleCount = computed(() => count() * 2);
effect(() => console.log(count()));
```

#### Function-Based Component APIs (Stable - can use without `signals: true`)
```typescript
import { Component, input, output, model, viewChild } from '@angular/core';

// Signal inputs (replaces @Input)
title = input.required<string>();
disabled = input(false);

// Signal outputs (replaces @Output)
save = output<void>();

// Two-way binding (replaces [(ngModel)])
checked = model(false);

// Signal queries (replaces @ViewChild)
button = viewChild.required('button');
```

These APIs work with standard components and provide:
- Better type safety
- Required/optional inputs with compile-time checks
- Reactive behavior out of the box
- Full signal integration

### 4. Proof-of-Concept Attempt

**Test Component:** `src/app/features/home/components/home.component.ts`

This component is ideal for testing because it:
- Has no inputs/outputs
- Has no lifecycle hooks
- Is simple and self-contained

**Result:** Adding `signals: true` causes a TypeScript compilation error, confirming the option does not exist in Angular 21.0.6.

## Evaluation Criteria

| Factor | Status | Finding |
| -- | -- | -- |
| API Stability | ❌ FAIL | Option does not exist in Angular 21.0.6 |
| Angular Team Recommendation | ❌ FAIL | Not mentioned in v21 release notes |
| Migration Effort | ❌ FAIL | Cannot migrate - feature unavailable |
| Third-party Library Support | ❌ FAIL | Cannot test - feature unavailable |
| Performance Impact | ❌ FAIL | Cannot measure - feature unavailable |
| Documentation | ❌ FAIL | Only RFC discussion, no stable docs |

## Risks and Trade-offs

### Adoption Risks (if it were available)

- ⚠️ **API Instability** - Being experimental, the API may change significantly before stable release
- ⚠️ **Breaking Changes** - Potential for major breaking changes in future Angular versions
- ⚠️ **Limited Documentation** - Only RFC discussions available, no comprehensive guides
- ⚠️ **Third-party Library Compatibility** - Unknown compatibility with Taiga UI, Angular Material, etc.
- ⚠️ **Testing Complexity** - New testing patterns would need to be learned
- ⚠️ **Cannot Inherit** - Signal-based components cannot extend zone-based components or vice versa
- ⚠️ **Decorator Removal** - Would require removing all `@Input()`, `@Output()`, `@ViewChild()` decorators
- ⚠️ **HostBinding/HostListener Removal** - These decorators would not work

### Current State

- ✅ **No benefit** - Cannot adopt because feature doesn't exist
- ✅ **Alternative available** - Function-based APIs (`input()`, `output()`) provide most benefits
- ✅ **Low risk** - Current OnPush + signals approach is stable and performant

## Benefits (If Available - Based on RFC)

The RFC outlines these potential benefits (not currently achievable):

- ✅ More explicit signal-based architecture
- ✅ Read-only inputs by design (encourages immutability)
- ✅ Simplified component lifecycle (only `ngOnInit` and `ngOnDestroy`)
- ✅ Better alignment with Angular's direction toward zoneless
- ✅ Clearer data flow
- ✅ Local change detection (no global zone.js checking)

## Alternative: Adopt Function-Based Component APIs

Instead of waiting for `signals: true`, the codebase can benefit NOW from:

### Input Function
```typescript
// Traditional decorator (still works)
@Input() title!: string;

// Modern function approach (recommended)
title = input.required<string>();
```

### Output Function
```typescript
// Traditional decorator (still works)
@Output() save = new EventEmitter<void>();

// Modern function approach (recommended)
save = output<void>();
```

### Model Function (Two-Way Binding)
```typescript
// Traditional decorator
@Input() checked!: boolean;
@Output() checkedChange = new EventEmitter<boolean>();

// Modern function approach
checked = model(false);
```

### Benefits of Function-Based APIs

- ✅ Works with standard components (no `signals: true` required)
- ✅ Better type safety with required/optional inputs
- ✅ Signals are reactive by default
- ✅ No more `ngOnChanges` - use `computed()` or `effect()` instead
- ✅ Stable and recommended by Angular team
- ✅ Backward compatible with decorator-based approach
- ✅ Can migrate incrementally

## Recommendations

### Option A: Wait and Monitor ⭐️ **RECOMMENDED**

**Rationale:**
- `signals: true` does not exist in Angular 21.0.6
- Feature is still experimental and may change significantly
- Angular team has not announced stable release timeline
- Current approach (OnPush + signals) is working well

**Action Items:**
1. Continue with current OnPush + signals approach
2. Monitor Angular release notes and RFC discussions
3. Re-evaluate in Q2 2026 or when `signals: true` is announced as stable
4. Consider adopting function-based component APIs (`input()`, `output()`) in the meantime

### Option B: Document and Defer

**Rationale:**
- Keep track of this feature for future reference
- Document the current state and limitations
- Prepare migration path if/when it becomes available

**Action Items:**
1. Document findings in AGENTS.md (completed)
2. Mark as "do not use yet" in project guidelines
3. Keep in backlog for re-evaluation

### Option C: Adopt Function-Based APIs Now (Optional Enhancement)

**Rationale:**
- Function-based APIs are stable and available
- Provide most benefits of signal-based components
- Can be adopted incrementally
- Recommended by Angular team

**Action Items:**
1. Evaluate if adopting `input()`, `output()`, `model()` would benefit the codebase
2. Update AGENTS.md if deciding to adopt
3. Create a separate Linear issue if pursuing this enhancement

## Proof-of-Concept Results

### Component Tested
- `src/app/features/home/components/home.component.ts`

### Results
- ❌ **Failed** - TypeScript compilation error
- ❌ **`signals: true` property does not exist** in Angular 21.0.6 Component decorator type

### Conclusion
The POC confirms that `signals: true` is not available in the current Angular version (21.0.6), making adoption impossible at this time.

## Comparison: Current vs. Future Approach

### Current Approach (Working)
```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  // Using signals
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
}
```

### Future Approach (Not Available Yet)
```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  signals: true,  // NOT AVAILABLE in Angular 21.0.6
})
export class HomeComponent {
  // Would use function-based APIs
  title = input.required<string>();
  save = output<void>();
}
```

### Current Approach with Function-Based APIs (Available Now)
```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  // Can use function-based APIs without signals: true
  title = input.required<string>();
  save = output<void>();

  // And standard signals
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
}
```

## Timeline and Re-evaluation

### Next Review: Q2 2026

**Checklist for re-evaluation:**
- [ ] Angular team announces stable release of `signals: true`
- [ ] API is documented in official Angular documentation (not just RFC)
- [ ] Angular team recommends adoption in best practices
- [ ] Third-party libraries (Taiga UI) confirm support
- [ ] Clear migration path documented
- [ ] Feature is tested and stable in production apps

### Indicators to Watch

1. **Angular Release Notes** - Look for announcement in v22 or v23
2. **Angular RFC Status** - Watch for RFC completion status
3. **Angular Team Blog Posts** - Monitor for stable release announcements
4. **Community Adoption** - Check if major Angular apps are using it successfully
5. **Third-party Library Updates** - Verify Taiga UI, Angular Material support

## Sources

### Official Sources
- Angular RFC #49682: Signal-based Components - https://github.com/angular/angular/discussions/49682
- Angular Signals Guide - https://angular.dev/guide/signals
- What's New in Angular 21.0 - https://blog.ninja-squad.com/2025/11/20/what-is-new-angular-21.0
- Angular 21 Release Notes - https://www.angulararchitects.io/blog/whats-new-in-angular-21-signal-forms-zone-less-vitest-angular-aria-cli-with-mcp-server/

### Community Sources
- Angular Signal Components Guide - https://blog.angular-university.io/angular-signal-components/
- Signal Inputs Guide - https://justangular.com/blog/signal-inputs-are-here-to-change-the-game/
- Angular Signals RFC Discussion - https://www.youtube.com/watch?v=N1bCLi2_OPI

## Decision Matrix

**Adoption Decision: WAIT**

| Factor | Weight | Score (1-5) | Weighted Score |
| -- | -- | -- | -- |
| API Availability | High | 1 (Not available) | 1 |
| Angular Team Recommendation | High | 1 (Not recommended) | 1 |
| Stability | High | 1 (Experimental) | 1 |
| Third-party Support | High | 1 (Unknown) | 1 |
| Migration Effort | Medium | 1 (Cannot migrate) | 1 |
| Benefits | Medium | 4 (If available) | 4 |
| **Total** | | | **9/30** |

**Threshold for Adoption:** Minimum 20/30 weighted score

**Current Score:** 9/30 - **WAIT**

## Conclusion

The experimental `signals: true` component option is **not available** in Angular 21.0.6. The TypeScript compiler explicitly rejects this option, and it is not mentioned in the Angular 21.0 release notes.

**Recommendation:** WAIT and monitor.

- Do not attempt adoption - feature is unavailable
- Continue with current OnPush + signals approach (working well)
- Consider adopting function-based component APIs (`input()`, `output()`, `model()`) for immediate benefits
- Re-evaluate in Q2 2026 or when Angular team announces stable release

The codebase is already following Angular best practices for signals and is well-positioned for future migration when the feature becomes stable and available.

---

**Issue:** STAF-119
**Date:** January 4, 2026
**Angular Version:** 21.0.6
**Recommendation:** Wait and monitor (do not adopt)
