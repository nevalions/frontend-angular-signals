import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SportStoreService } from '../../services/sport-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiLoader, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-sport-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiCardLarge, TuiCell, TuiLoader, TuiTitle],
  templateUrl: './sport-list.component.html',
  styleUrl: './sport-list.component.less',
})
export class SportListComponent {
  private sportStore = inject(SportStoreService);
  private navigationHelper = inject(NavigationHelperService);

  sports = this.sportStore.sports;
  loading = this.sportStore.loading;
  error = this.sportStore.error;

  navigateToDetail(id: number): void {
    this.navigationHelper.toSportDetail(id);
  }
}
