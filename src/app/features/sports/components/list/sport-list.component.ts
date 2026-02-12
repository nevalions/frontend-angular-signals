import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SportStoreService } from '../../services/sport-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-sport-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, TuiCardLarge, TuiCell, TuiLoader, TuiTitle],
  templateUrl: './sport-list.component.html',
  styleUrl: './sport-list.component.less',
})
export class SportListComponent {
  private sportStore = inject(SportStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private authService = inject(AuthService);

  sports = this.sportStore.sports;
  loading = this.sportStore.loading;
  error = this.sportStore.error;
  isAdmin = computed(() => this.authService.currentUser()?.roles?.includes('admin') ?? false);

  navigateToCreate(): void {
    this.navigationHelper.toSportCreate();
  }

  navigateToDetail(id: number): void {
    this.navigationHelper.toSportDetail(id);
  }
}
