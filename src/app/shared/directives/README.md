# Shared Directives

Reusable attribute directives used across the application.

## Directives

### AutoFitTextDirective

**Location:** `src/app/shared/directives/auto-fit-text.directive.ts`

Automatically adjusts font size to fit text within container bounds using binary search algorithm.

**Features:**
- Signal-based reactive directive
- Binary search algorithm for optimal font size calculation
- Only recalculates on actual content changes (not every render)
- Debounced window resize handling (300ms)
- Configurable min/max font size constraints
- Compatible with OnPush change detection strategy
- Standalone directive

**Use Cases:**
- Team names in scoreboards that vary in length
- Dynamic text content that must fit within fixed-width containers
- Indicators (TOUCHDOWN, TIMEOUT) that need consistent sizing
- Any text that should scale to fit available space

**Usage Example:**

```typescript
import { AutoFitTextDirective } from '../../../../shared/directives/auto-fit-text.directive';

@Component({
  selector: 'app-scoreboard-display',
  standalone: true,
  imports: [AutoFitTextDirective],
  template: `
    <!-- Team name with auto-fit text -->
    <span 
      class="team-name" 
      [appAutoFitText]="true" 
      [maxFontSize]="32"
      [minFontSize]="12"
    >{{ teamName() }}</span>

    <!-- Indicator with auto-fit text -->
    <div 
      class="goal-indicator" 
      [appAutoFitText]="true" 
      [maxFontSize]="35"
    >TOUCHDOWN</div>
  `,
})
export class ScoreboardDisplayComponent {}
```

**Inputs:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `appAutoFitText` | `boolean` | No | `true` | Enable/disable directive |
| `maxFontSize` | `number` | No | `32` | Maximum font size in pixels |
| `minFontSize` | `number` | No | `8` | Minimum font size in pixels |
| `containerPadding` | `number` | No | `5` | Padding offset in pixels to account for in width calculations |

**How It Works:**

1. Measures parent container width on initialization
2. Uses binary search to find largest font size where text fits
3. Applies font size dynamically via `element.style.fontSize`
4. Monitors text content changes via signals
5. Recalculates only when content actually changes
6. Handles window resize with 300ms debounce

**Performance Optimizations:**

- **Content change detection**: Stores previous content in signal, only recalculates when content actually changes
- **Debounced resize**: Window resize events are debounced to 300ms to prevent excessive recalculations
- **Binary search**: O(log n) complexity for finding optimal font size
- **OnPush compatible**: Works seamlessly with OnPush change detection

**Examples Used In:**

- Scoreboard display component (team names, TOUCHDOWN/TIMEOUT indicators)

**Best Practices:**

1. **Set appropriate max/min constraints** based on your design:
   ```html
   <!-- Team names: 12-32px -->
   <span [appAutoFitText]="true" [maxFontSize]="32" [minFontSize]="12">{{ name }}</span>
   
   <!-- Large indicators: 20-40px -->
   <div [appAutoFitText]="true" [maxFontSize]="40" [minFontSize]="20">TOUCHDOWN</div>
   ```

2. **Account for container padding** if text container has padding:
   ```html
   <!-- Container has 10px padding on each side -->
   <span [appAutoFitText]="true" [containerPadding]="10">{{ text }}</span>
   ```

3. **Disable when not needed** to avoid unnecessary calculations:
   ```html
   <span [appAutoFitText]="false">{{ staticText }}</span>
   ```

4. **Use with fixed-height containers** to prevent layout shifts:
   ```css
   .team-name-block {
     height: 35px; /* Fixed height prevents other elements from moving */
     display: flex;
     align-items: center; /* Center text vertically */
   }
   ```

5. **Set line-height: 1** on text elements to prevent vertical shifts:
   ```css
   .team-name {
     line-height: 1; /* Consistent line height prevents vertical jumps */
   }
   ```

**Layout Stability:**

To prevent layout shifts when font size changes:

```less
// Parent container - fixed height
.team-name-block {
  height: 35px; // Fixed height prevents movement of elements below
  display: flex;
  align-items: center; // Center text vertically
  justify-content: flex-end;
}

// Text element - consistent line height
.team-name {
  line-height: 1; // Prevents vertical shifts
  white-space: nowrap; // Prevents wrapping
  // Font size set dynamically by directive
}
```

**Edge Cases Handled:**

- Empty text content (skips calculation)
- Container width = 0 (not rendered yet, skips calculation)
- Very long text (scales down to minimum font size)
- Same content set multiple times (skips unnecessary recalculation)
- Window resize (debounced to 300ms)
- Dynamic content updates from WebSocket (reactive via signals)

**Technical Details:**

- Uses `afterNextRender()` for initial measurement (ensures DOM is ready)
- Uses `effect()` to react to content changes (signal-based reactivity)
- Uses temporary DOM element for accurate text width measurement
- Copies computed styles (font-family, font-weight, letter-spacing, text-transform) for accurate measurements
- Compatible with Angular animations (e.g., breathing animation on TOUCHDOWN indicator)
