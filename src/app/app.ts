import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { TUI_DARK_MODE } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  providers: [
    {
      provide: TUI_DARK_MODE,
      useValue: Object.assign(signal(true), { reset: () => {} }),
    },
  ],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {}
