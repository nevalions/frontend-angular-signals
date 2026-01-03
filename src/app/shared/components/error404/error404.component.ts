import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error404',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './error404.component.html',
  styleUrl: './error404.component.less',
})
export class Error404Component {
  private router = inject(Router);

  navigateHome(): void {
    this.router.navigate(['/seasons']);
  }
}
