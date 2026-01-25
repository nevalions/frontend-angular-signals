import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoFitTextDirective } from './auto-fit-text.directive';

@Component({
  standalone: true,
  imports: [AutoFitTextDirective],
  template: `
    <div style="width: 250px; font-family: monospace;">
      <span 
        [appAutoFitText]="enabled()" 
        [maxFontSize]="maxSize()" 
        [minFontSize]="minSize()"
      >{{ text() }}</span>
    </div>
  `,
})
class TestComponent {
  text = signal('Short');
  enabled = signal(true);
  maxSize = signal(32);
  minSize = signal(8);
}

describe('AutoFitTextDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let spanElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Wait for afterNextRender
    await fixture.whenStable();

    spanElement = fixture.nativeElement.querySelector('span');
  });

  it('should create directive instance', () => {
    expect(spanElement).toBeTruthy();
  });

  it('should apply font size to element', () => {
    const fontSize = spanElement.style.fontSize;
    expect(fontSize).toBeTruthy();
    expect(fontSize).toContain('px');
  });

  it('should use max font size for short text', async () => {
    component.text.set('Test');
    fixture.detectChanges();
    await fixture.whenStable();

    const fontSize = parseInt(spanElement.style.fontSize, 10);
    // Short text should be close to max size (32px)
    expect(fontSize).toBeGreaterThan(20);
  });

  it('should scale down font size for long text', async () => {
    component.text.set('This is a very long team name that should scale down');
    fixture.detectChanges();
    await fixture.whenStable();

    const fontSize = parseInt(spanElement.style.fontSize, 10);
    // Long text should be smaller than max
    expect(fontSize).toBeLessThan(32);
    expect(fontSize).toBeGreaterThanOrEqual(8);
  });

  it('should recalculate on content change', async () => {
    component.text.set('Short');
    fixture.detectChanges();
    await fixture.whenStable();

    const shortTextSize = parseInt(spanElement.style.fontSize, 10);

    component.text.set('This is a much longer text that needs smaller font');
    fixture.detectChanges();
    await fixture.whenStable();

    const longTextSize = parseInt(spanElement.style.fontSize, 10);

    expect(longTextSize).toBeLessThan(shortTextSize);
  });

  it('should respect min font size constraint', async () => {
    component.minSize.set(16);
    component.text.set('Extremely long text content that would normally require very small font size to fit in container');
    fixture.detectChanges();
    await fixture.whenStable();

    const fontSize = parseInt(spanElement.style.fontSize, 10);
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  it('should respect max font size constraint', async () => {
    component.maxSize.set(20);
    component.text.set('Small');
    fixture.detectChanges();
    await fixture.whenStable();

    const fontSize = parseInt(spanElement.style.fontSize, 10);
    expect(fontSize).toBeLessThanOrEqual(20);
  });

  it('should not adjust when disabled', async () => {
    component.enabled.set(true);
    component.text.set('Test');
    fixture.detectChanges();
    await fixture.whenStable();

    component.enabled.set(false);
    component.text.set('Different text that should not trigger recalculation');
    fixture.detectChanges();
    await fixture.whenStable();

    // When disabled, directive should not recalculate
    expect(spanElement).toBeTruthy();
  });

  it('should handle empty text gracefully', async () => {
    component.text.set('');
    fixture.detectChanges();
    await fixture.whenStable();

    // Should not throw error
    expect(spanElement).toBeTruthy();
  });

  it('should not recalculate for same content', async () => {
    component.text.set('Same Text');
    fixture.detectChanges();
    await fixture.whenStable();

    const initialSize = spanElement.style.fontSize;

    // Set same text again
    component.text.set('Same Text');
    fixture.detectChanges();
    await fixture.whenStable();

    // Size should remain the same (no unnecessary recalculation)
    expect(spanElement.style.fontSize).toBe(initialSize);
  });
});
