import { Routes } from '@angular/router';
import { SportListComponent } from './features/sports/components/list/sport-list.component';
import { SportDetailComponent } from './features/sports/components/detail/sport-detail.component';
import { SportEditComponent } from './features/sports/components/edit/sport-edit.component';
import { SportParseEeslComponent } from './features/sports/components/parse-eesl/sport-parse-eesl.component';
import { TournamentListComponent } from './features/tournaments/components/list/tournament-list.component';
import { TournamentDetailComponent } from './features/tournaments/components/detail/tournament-detail.component';
import { TournamentCreateComponent } from './features/tournaments/components/create/tournament-create.component';
import { TournamentEditComponent } from './features/tournaments/components/edit/tournament-edit.component';
import { TeamDetailComponent } from './features/teams/components/detail/team-detail.component';
import { TeamEditComponent } from './features/teams/components/edit/team-edit.component';
import { TeamCreateComponent } from './features/teams/components/create/team-create.component';
import { MatchCreateComponent } from './features/matches/components/create/match-create.component';
import { Error404Component } from './shared/components/error404/error404.component';
import { PersonListComponent } from './features/persons/components/list/person-list.component';
import { PersonDetailComponent } from './features/persons/components/detail/person-detail.component';
import { PersonCreateComponent } from './features/persons/components/create/person-create.component';
import { PersonEditComponent } from './features/persons/components/edit/person-edit.component';
import { PlayerDetailComponent } from './features/players/components/detail/player-detail.component';
import { HomeComponent } from './features/home/components/home.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
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
        path: ':sportId/seasons/:year/tournaments/:id/edit',
        component: TournamentEditComponent,
      },
      {
        path: ':sportId/seasons/:year/tournaments/:id',
        component: TournamentDetailComponent,
      },
      {
        path: ':sportId/seasons/:year/tournaments/:id/teams/:teamId',
        component: TeamDetailComponent,
      },
      {
        path: ':sportId/teams/new',
        component: TeamCreateComponent,
      },
      {
        path: ':sportId/teams/:teamId/edit',
        component: TeamEditComponent,
      },
      {
        path: ':sportId/teams/:teamId',
        component: TeamDetailComponent,
      },
      {
        path: ':sportId/matches/new',
        component: MatchCreateComponent,
      },
      {
        path: ':sportId/players/:playerId',
        component: PlayerDetailComponent,
      },
      {
        path: ':id',
        component: SportDetailComponent,
      },
      {
        path: ':id/edit',
        component: SportEditComponent,
      },
      {
        path: ':sportId/parse-eesl',
        component: SportParseEeslComponent,
      },
    ],
  },
  {
    path: 'persons',
    children: [
      {
        path: '',
        component: PersonListComponent,
      },
      {
        path: 'new',
        component: PersonCreateComponent,
      },
      {
        path: ':id',
        component: PersonDetailComponent,
      },
      {
        path: ':id/edit',
        component: PersonEditComponent,
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
