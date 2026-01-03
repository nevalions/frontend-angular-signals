import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-empty-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-page.component.html',
  styleUrl: './empty-page.component.less',
})
export class EmptyPageComponent {}
