import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent, RouterLink],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display welcome message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.home__title');
    expect(title?.textContent).toContain('Welcome to Statsboard');
  });

  it('should display subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('.home__subtitle');
    expect(subtitle?.textContent).toContain('Your comprehensive sports statistics management system');
  });

  it('should have sports link card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sportsCard = compiled.querySelector('.home__link-card');
    const sportsTitle = sportsCard?.querySelector('.home__link-card-title');
    expect(sportsTitle?.textContent).toContain('Sports');
  });

  it('should have correct router link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a[routerLink]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('routerLink')).toBe('/sports');
  });
});
