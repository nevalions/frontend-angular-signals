import { Routes } from '@angular/router';
import { SportListComponent } from './features/sports/components/list/sport-list.component';
import { SportDetailComponent } from './features/sports/components/detail/sport-detail.component';
import { SportEditComponent } from './features/sports/components/edit/sport-edit.component';
import { SportParseEeslComponent } from './features/sports/components/parse-eesl/sport-parse-eesl.component';
import { TournamentListComponent } from './features/tournaments/components/list/tournament-list.component';
import { TournamentDetailComponent } from './features/tournaments/components/detail/tournament-detail.component';
import { TournamentCreateComponent } from './features/tournaments/components/create/tournament-create.component';
import { TournamentEditComponent } from './features/tournaments/components/edit/tournament-edit.component';
import { TournamentParseEeslComponent } from './features/tournaments/components/parse-eesl/tournament-parse-eesl.component';
import { TournamentParseMatchesComponent } from './features/tournaments/components/parse-matches/tournament-parse-matches.component';
import { TeamDetailComponent } from './features/teams/components/detail/team-detail.component';
import { TeamEditComponent } from './features/teams/components/edit/team-edit.component';
import { TeamCreateComponent } from './features/teams/components/create/team-create.component';
import { MatchCreateComponent } from './features/matches/components/create/match-create.component';
import { MatchEditComponent } from './features/matches/components/edit/match-edit.component';
import { MatchDetailComponent } from './features/matches/components/detail/match-detail.component';
import { Error404Component } from './shared/components/error404/error404.component';
import { PersonListComponent } from './features/persons/components/list/person-list.component';
import { PersonDetailComponent } from './features/persons/components/detail/person-detail.component';
import { PersonCreateComponent } from './features/persons/components/create/person-create.component';
import { PersonEditComponent } from './features/persons/components/edit/person-edit.component';
import { SponsorListComponent } from './features/sponsors/components/sponsor-list/sponsor-list.component';
import { SponsorLinesListComponent } from './features/sponsors/components/sponsor-lines-list/sponsor-lines-list.component';
import { PlayerDetailComponent } from './features/players/components/detail/player-detail.component';
import { HomeComponent } from './features/home/components/home.component';
import { UserProfileComponent } from './features/users/components/profile/user-profile.component';
import { SettingsComponent } from './features/settings/components/settings.component';
import { authGuard, settingsAdminGuard } from './core/guards';

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
        path: ':sportId/seasons/:year/tournaments/:id/parse-eesl',
        component: TournamentParseEeslComponent,
      },
      {
        path: ':sportId/seasons/:year/tournaments/:id/parse-matches',
        component: TournamentParseMatchesComponent,
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
        path: ':sportId/matches/:id/edit',
        component: MatchEditComponent,
      },
      {
        path: ':sportId/matches/:id',
        component: MatchDetailComponent,
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
    path: 'sponsors',
    component: SponsorListComponent,
  },
  {
    path: 'sponsor-lines',
    component: SponsorLinesListComponent,
  },
  {
    path: 'users/:userId',
    component: UserProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard, settingsAdminGuard],
  },
  {
    path: 'scoreboard/match/:matchId/admin',
    loadComponent: () =>
      import('./features/scoreboard/pages/admin/scoreboard-admin.component').then(
        (m) => m.ScoreboardAdminComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'scoreboard/match/:matchId/hd',
    loadComponent: () =>
      import('./features/scoreboard/pages/view/scoreboard-view.component').then(
        (m) => m.ScoreboardViewComponent
      ),
    data: { hideNavbar: true, fullscreen: true },
    // No auth guard - public view for broadcast
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
