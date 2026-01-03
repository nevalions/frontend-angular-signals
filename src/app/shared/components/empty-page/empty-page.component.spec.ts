import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyPageComponent } from './empty-page.component';

describe('EmptyPageComponent', () => {
  let component: EmptyPageComponent;
  let fixture: ComponentFixture<EmptyPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmptyPageComponent],
    });

    fixture = TestBed.createComponent(EmptyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display welcome message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('Welcome to Statsboard');
  });

  it('should display navigation hint', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const hint = compiled.querySelector('p');
    expect(hint?.textContent).toContain('Navigate to a section');
  });
});
