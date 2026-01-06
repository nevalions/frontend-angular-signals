import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { PersonStoreService } from '../../services/person-store.service';
import { PersonCreate } from '../../models/person.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-person-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './person-create.component.html',
  styleUrl: './person-create.component.less',
})
export class PersonCreateComponent {
  private navigationHelper = inject(NavigationHelperService);
  private personStore = inject(PersonStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  personForm = this.fb.group({
    first_name: ['', [Validators.required]],
    second_name: [''],
    person_photo: [null as File | null],
  });

  onSubmit(): void {
    if (this.personForm.valid) {
      const formData = this.personForm.value;
      const data: PersonCreate = {
        first_name: formData.first_name as string,
        second_name: (formData.second_name as string) || '',
      };
      withCreateAlert(
        this.alerts,
        () => this.personStore.createPerson(data),
        () => this.cancel(),
        'Person'
      );
    }
  }

  cancel(): void {
    this.navigationHelper.toPersonsList();
  }
}
