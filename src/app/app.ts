import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { TuiRoot } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, TuiRoot],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {}
