import { Routes } from '@angular/router';
import { SeasonListComponent } from './features/seasons/components/list/season-list.component';
import { SeasonDetailComponent } from './features/seasons/components/detail/season-detail.component';
import { SeasonCreateComponent } from './features/seasons/components/create/season-create.component';
import { SeasonEditComponent } from './features/seasons/components/edit/season-edit.component';

export const routes: Routes = [
  {
    path: 'seasons',
    children: [
      {
        path: '',
        component: SeasonListComponent,
      },
      {
        path: 'create',
        component: SeasonCreateComponent,
      },
      {
        path: ':id',
        component: SeasonDetailComponent,
      },
      {
        path: ':id/edit',
        component: SeasonEditComponent,
      },
    ],
  },
];
