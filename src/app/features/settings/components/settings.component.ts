import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityHeaderComponent } from '../../../shared/components/entity-header/entity-header.component';
import { DashboardTabComponent } from './tabs/dashboard-tab.component';
import { UsersTabComponent } from './tabs/users-tab.component';
import { RolesTabComponent } from './tabs/roles-tab.component';
import { GlobalSettingsTabComponent } from './tabs/global-settings-tab.component';
import { createStringParamSignal } from '../../../core/utils/route-param-helper.util';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EntityHeaderComponent,
    DashboardTabComponent,
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

  activeTab = createStringParamSignal(this.route, 'tab', {
    source: 'queryParamMap',
    defaultValue: 'dashboard',
  });

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
