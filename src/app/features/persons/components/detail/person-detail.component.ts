import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { PersonStoreService } from '../../services/person-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EntityHeaderComponent],
  templateUrl: './person-detail.component.html',
  styleUrl: './person-detail.component.less',
})
export class PersonDetailComponent {
  private route = inject(ActivatedRoute);
  private personStore = inject(PersonStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  personId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  person = computed(() => {
    const id = this.personId();
    if (!id) return null;
    return this.personStore.persons().find((p) => p.id === id) || null;
  });

  loading = this.personStore.loading;

  personName = computed(() => {
    const person = this.person();
    return person ? `${person.first_name} ${person.second_name}` : '';
  });

  photoUrl = computed(() => {
    const person = this.person();
    return person?.person_photo_url ? buildStaticUrl(person.person_photo_url) : null;
  });

  navigateBack(): void {
    this.navigationHelper.toPersonsList();
  }

  navigateToEdit(): void {
    const id = this.personId();
    if (id) {
      this.navigationHelper.toPersonEdit(id);
    }
  }

  deletePerson(): void {
    const id = this.personId();
    const person = this.person();
    if (!person || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete person "${person.first_name} ${person.second_name}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.personStore.deletePerson(id),
      () => this.navigateBack(),
      'Person'
    );
  }
}
