import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EntityHeaderComponent } from '../../../shared/components/entity-header/entity-header.component';
import { UsersTabComponent } from './tabs/users-tab.component';
import { RolesTabComponent } from './tabs/roles-tab.component';
import { GlobalSettingsTabComponent } from './tabs/global-settings-tab.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EntityHeaderComponent,
    UsersTabComponent,
    RolesTabComponent,
    GlobalSettingsTabComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.less',
})
export class SettingsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('tab') || 'users')),
    { initialValue: 'users' }
  );

  onTabChange(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  navigateBack(): void {
    this.router.navigate(['/home']);
  }
}
