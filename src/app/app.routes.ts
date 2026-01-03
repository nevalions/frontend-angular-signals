import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home.component';
import { SeasonListComponent } from './features/seasons/components/list/season-list.component';
import { SeasonDetailComponent } from './features/seasons/components/detail/season-detail.component';
import { SeasonCreateComponent } from './features/seasons/components/create/season-create.component';
import { SeasonEditComponent } from './features/seasons/components/edit/season-edit.component';
import { SportListComponent } from './features/sports/components/list/sport-list.component';
import { SportDetailComponent } from './features/sports/components/detail/sport-detail.component';
import { TournamentListComponent } from './features/tournaments/components/list/tournament-list.component';
import { TournamentDetailComponent } from './features/tournaments/components/detail/tournament-detail.component';
import { TournamentCreateComponent } from './features/tournaments/components/create/tournament-create.component';
import { TournamentEditComponent } from './features/tournaments/components/edit/tournament-edit.component';
import { Error404Component } from './shared/components/error404/error404.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
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
        path: ':sportId/seasons/:year/tournaments/:id/edit',
        component: TournamentEditComponent,
      },
      {
        path: ':id',
        component: SportDetailComponent,
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
