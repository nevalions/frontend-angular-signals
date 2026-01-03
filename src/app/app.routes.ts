import { Routes } from '@angular/router';
import { SeasonListComponent } from './features/seasons/components/list/season-list.component';
import { SeasonDetailComponent } from './features/seasons/components/detail/season-detail.component';
import { SeasonCreateComponent } from './features/seasons/components/create/season-create.component';
import { SeasonEditComponent } from './features/seasons/components/edit/season-edit.component';
import { Error404Component } from './shared/components/error404/error404.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/seasons',
    pathMatch: 'full',
  },
  {
    path: 'seasons',
    children: [
      {
        path: '',
        component: SeasonListComponent,
      },
      {
        path: 'new',
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
  {
    path: 'error404',
    component: Error404Component,
  },
  {
    path: '**',
    redirectTo: '/error404',
  },
];
