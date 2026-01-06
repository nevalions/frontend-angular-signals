import { ChangeDetectionStrategy, Component, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { PersonStoreService } from '../../services/person-store.service';
import { PersonUpdate } from '../../models/person.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-person-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './person-edit.component.html',
  styleUrl: './person-edit.component.less',
})
export class PersonEditComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private personStore = inject(PersonStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  personForm = this.fb.group({
    first_name: ['', [Validators.required]],
    second_name: [''],
    person_photo: [null as File | null],
  });

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

  private patchFormOnPersonChange = effect(() => {
    const person = this.person();
    if (person) {
      this.personForm.patchValue({
        first_name: person.first_name,
        second_name: person.second_name || '',
      });
    }
  });

  onSubmit(): void {
    if (this.personForm.valid) {
      const id = this.personId();
      if (!id) return;

      const formData = this.personForm.value;
      const data: PersonUpdate = {
        first_name: formData.first_name as string,
        second_name: (formData.second_name as string) || undefined,
      };
      withUpdateAlert(
        this.alerts,
        () => this.personStore.updatePerson(id, data),
        () => this.cancel(),
        'Person'
      );
    }
  }

  cancel(): void {
    this.navigationHelper.toPersonsList();
  }
}
