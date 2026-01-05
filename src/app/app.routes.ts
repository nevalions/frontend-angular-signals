import { Routes } from '@angular/router';
import { EmptyPageComponent } from './shared/components/empty-page/empty-page.component';
import { SportListComponent } from './features/sports/components/list/sport-list.component';
import { SportDetailComponent } from './features/sports/components/detail/sport-detail.component';
import { TournamentListComponent } from './features/tournaments/components/list/tournament-list.component';
import { TournamentDetailComponent } from './features/tournaments/components/detail/tournament-detail.component';
import { TournamentCreateComponent } from './features/tournaments/components/create/tournament-create.component';
import { TournamentEditComponent } from './features/tournaments/components/edit/tournament-edit.component';
import { PersonListComponent } from './features/persons/components/list/person-list.component';
import { Error404Component } from './shared/components/error404/error404.component';

export const routes: Routes = [
  {
    path: '',
    component: EmptyPageComponent,
    pathMatch: 'full',
  },
  {
    path: 'sports',
    children: [
      {
        path: '',
        component: SportListComponent,
      },
      {
        path: ':sportId/seasons/:year/tournaments',
        component: TournamentListComponent,
      },
      {
        path: ':sportId/seasons/:year/tournaments/new',
        component: TournamentCreateComponent,
      },
      {
        path: ':sportId/seasons/:year/tournaments/:id',
        component: TournamentDetailComponent,
      },
  {
      path: ':sportId/seasons/:year/tournaments/:id',
      children: [
        {
          path: 'edit',
          component: TournamentEditComponent,
        },
        {
          path: '',
          component: TournamentDetailComponent,
        },
      ],
    },
    {
      path: ':sportId/seasons/:year/tournaments/:id',
      component: TournamentDetailComponent,
    },
      {
        path: ':id',
        component: SportDetailComponent,
      },
    ],
  },
  {
    path: 'persons',
    component: PersonListComponent,
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
