import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { SportStoreService } from '../../services/sport-store.service';

@Component({
  selector: 'app-sport-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton],
  templateUrl: './sport-list.component.html',
  styleUrl: './sport-list.component.less',
})
export class SportListComponent {
  private sportStore = inject(SportStoreService);
  private router = inject(Router);

  sports = this.sportStore.sports;
  loading = this.sportStore.loading;
  error = this.sportStore.error;

  navigateToDetail(id: number): void {
    this.router.navigate(['/sports', id]);
  }
}
