import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly localStorageKey = 'statsboard-theme';

  private _currentTheme = signal<Theme>('light');
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    const stored = this.loadFromStorage();
    const system = this.getSystemTheme();
    this._currentTheme.set(stored || system);

    effect(() => {
      this.applyTheme(this._currentTheme());
    });
  }

  toggleTheme(): void {
    this._currentTheme.update(theme => theme === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
  }

  private loadFromStorage(): Theme | null {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.localStorageKey, theme);
    } catch {
    }
  }

  private getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    this.saveToStorage(theme);
    const tuiRoot = this.document.querySelector('tui-root');

    if (tuiRoot) {
      if (theme === 'dark') {
        tuiRoot.setAttribute('tuiTheme', 'dark');
      } else {
        tuiRoot.removeAttribute('tuiTheme');
      }
    }

    // Also set theme on html element for global styling
    const html = this.document.documentElement;
    html.setAttribute('data-theme', theme);
  }
}
