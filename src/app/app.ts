import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { TuiRoot } from '@taiga-ui/core';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, TuiRoot],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Track current URL for fullscreen detection
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // HD scoreboard view should be fullscreen without navbar
  isFullscreen = computed(() => {
    const url = this.currentUrl();
    return url.includes('/scoreboard/match/') && url.endsWith('/hd');
  });

  showNavbar = computed(() => !this.isFullscreen());

  constructor() {
    this.authService.initialize();
  }
}
