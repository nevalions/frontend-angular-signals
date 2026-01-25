import {
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  afterNextRender,
  Injector,
  DestroyRef,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Directive that automatically adjusts font size to fit text within container bounds.
 * 
 * Uses binary search algorithm to find optimal font size based on:
 * - Container width
 * - Text content length
 * - Min/max font size constraints
 * 
 * Performance optimizations:
 * - Only recalculates on actual content changes
 * - Debounces window resize events (300ms)
 * - Uses afterNextRender for initial measurement
 * - Compatible with OnPush change detection
 * 
 * @example
 * ```html
 * <span [appAutoFitText]="true" [maxFontSize]="32">{{ teamName() }}</span>
 * ```
 */
@Directive({
  selector: '[appAutoFitText]',
  standalone: true,
})
export class AutoFitTextDirective {
  private elementRef = inject(ElementRef<HTMLElement>);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  /** Minimum font size in pixels (default: 8px) */
  minFontSize = input<number>(8);

  /** Maximum font size in pixels (default: 32px) */
  maxFontSize = input<number>(32);

  /** Container padding to account for in width calculations (default: 5px) */
  containerPadding = input<number>(5);

  /** Enable/disable directive (default: true) */
  appAutoFitText = input<boolean>(true);

  // Internal state
  private previousContent = signal<string>('');
  private isInitialized = signal<boolean>(false);

  constructor() {
    // Initial measurement after render
    afterNextRender(
      () => {
        this.adjustFontSize();
        this.isInitialized.set(true);
      },
      { injector: this.injector }
    );

    // React to content changes
    effect(
      () => {
        if (!this.appAutoFitText()) {
          return;
        }

        const element = this.elementRef.nativeElement;
        const currentContent = element.textContent?.trim() || '';

        // Only recalculate if content actually changed
        if (currentContent !== this.previousContent() && this.isInitialized()) {
          this.previousContent.set(currentContent);
          this.adjustFontSize();
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );

    // Handle window resize with debounce
    fromEvent(window, 'resize')
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.appAutoFitText() && this.isInitialized()) {
          this.adjustFontSize();
        }
      });
  }

  /**
   * Adjusts font size using binary search to find optimal size that fits container.
   */
  private adjustFontSize(): void {
    const element = this.elementRef.nativeElement;
    const text = element.textContent?.trim();

    // Guard: skip if no text content
    if (!text || text.length === 0) {
      return;
    }

    const containerWidth = this.getContainerWidth();

    // Guard: skip if container not ready
    if (containerWidth <= 0) {
      return;
    }

    const minSize = this.minFontSize();
    const maxSize = this.maxFontSize();
    const optimalSize = this.binarySearchFontSize(element, text, containerWidth, minSize, maxSize);

    // Apply font size
    element.style.fontSize = `${optimalSize}px`;
  }

  /**
   * Gets available container width accounting for padding.
   */
  private getContainerWidth(): number {
    const element = this.elementRef.nativeElement;
    const parent = element.parentElement;

    if (!parent) {
      return 0;
    }

    // Use parent's client width minus padding
    const padding = this.containerPadding();
    return parent.clientWidth - padding * 2;
  }

  /**
   * Binary search to find largest font size where text fits in container.
   * 
   * @param element - The HTML element containing the text
   * @param text - The text content
   * @param containerWidth - Available width in pixels
   * @param minSize - Minimum font size
   * @param maxSize - Maximum font size
   * @returns Optimal font size in pixels
   */
  private binarySearchFontSize(
    element: HTMLElement,
    text: string,
    containerWidth: number,
    minSize: number,
    maxSize: number
  ): number {
    let low = minSize;
    let high = maxSize;
    let optimalSize = minSize;

    // Binary search for optimal font size
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const textWidth = this.measureTextWidth(element, text, mid);

      if (textWidth <= containerWidth) {
        // Text fits, try larger size
        optimalSize = mid;
        low = mid + 1;
      } else {
        // Text too wide, try smaller size
        high = mid - 1;
      }
    }

    return optimalSize;
  }

  /**
   * Measures text width at specific font size without affecting DOM.
   * Creates temporary element for accurate measurement.
   * 
   * @param element - Reference element for inherited styles
   * @param text - Text to measure
   * @param fontSize - Font size in pixels
   * @returns Width in pixels
   */
  private measureTextWidth(element: HTMLElement, text: string, fontSize: number): number {
    // Create temporary span for measurement
    const measureEl = document.createElement('span');
    measureEl.style.fontSize = `${fontSize}px`;
    measureEl.style.visibility = 'hidden';
    measureEl.style.position = 'absolute';
    measureEl.style.whiteSpace = 'nowrap';
    
    // Copy relevant styles from original element
    const computedStyle = window.getComputedStyle(element);
    measureEl.style.fontFamily = computedStyle.fontFamily;
    measureEl.style.fontWeight = computedStyle.fontWeight;
    measureEl.style.letterSpacing = computedStyle.letterSpacing;
    measureEl.style.textTransform = computedStyle.textTransform;
    
    measureEl.textContent = text;
    
    // Append to body, measure, then remove
    document.body.appendChild(measureEl);
    const width = measureEl.getBoundingClientRect().width;
    document.body.removeChild(measureEl);
    
    return width;
  }
}
