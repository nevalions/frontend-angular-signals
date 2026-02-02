import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { ScoreboardDisplayComponent } from '../../components/display/scoreboard-display.component';
import { ScoreFormsComponent, ScoreChangeEvent, TimeoutChangeEvent, QuarterChangeEvent } from '../../components/admin-forms/score-forms/score-forms.component';
import { TimeFormsComponent, GameClockActionEvent, PlayClockActionEvent } from '../../components/admin-forms/time-forms/time-forms.component';
import { DownDistanceFormsComponent, DownDistanceChangeEvent } from '../../components/admin-forms/down-distance-forms/down-distance-forms.component';
import { ScoreboardSettingsFormsComponent } from '../../components/admin-forms/scoreboard-settings-forms/scoreboard-settings-forms.component';
import { EventsFormsComponent } from '../../components/admin-forms/events-forms/events-forms.component';
import { ConnectionIndicatorComponent } from '../../../../shared/components/connection-indicator/connection-indicator.component';
import { FootballEventCreate, FootballEventUpdate } from '../../../matches/models/football-event.model';
import { PlayerMatchUpdate } from '../../../matches/models/player-match.model';
import { ScoreboardUpdate } from '../../../matches/models/scoreboard.model';
import { ScoreboardAdminFacade } from './scoreboard-admin.facade';

@Component({
  selector: 'app-scoreboard-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiButton,
    TuiIcon,
    ScoreboardDisplayComponent,
    ScoreFormsComponent,
    TimeFormsComponent,
    DownDistanceFormsComponent,
    ScoreboardSettingsFormsComponent,
    EventsFormsComponent,
    ConnectionIndicatorComponent,
  ],
  providers: [ScoreboardAdminFacade],
  templateUrl: './scoreboard-admin.component.html',
  styleUrl: './scoreboard-admin.component.less',
})
export class ScoreboardAdminComponent implements OnInit {
  private readonly facade = inject(ScoreboardAdminFacade);

  protected readonly data = this.facade.data;
  protected readonly scoreboard = this.facade.scoreboard;
  protected readonly matchStats = this.facade.matchStats;
  protected readonly loading = this.facade.loading;
  protected readonly error = this.facade.error;

  protected readonly gameClock = this.facade.gameClock;
  protected readonly playClock = this.facade.playClock;
  protected readonly gameClockLocked = this.facade.gameClockLocked;
  protected readonly playClockLocked = this.facade.playClockLocked;
  protected readonly gameClockWithPredictedValue = this.facade.gameClockWithPredictedValue;
  protected readonly playClockWithPredictedValue = this.facade.playClockWithPredictedValue;

  protected readonly hideAllForms = this.facade.hideAllForms;

  protected readonly gameClockSeconds = this.facade.gameClockSeconds;
  protected readonly playClockDisplay = this.facade.playClockDisplay;

  ngOnInit(): void {
    this.facade.init();
  }

  navigateBack(): void {
    this.facade.navigateBack();
  }

  openHdView(): void {
    this.facade.openHdView();
  }

  onScoreChange(event: ScoreChangeEvent): void {
    this.facade.onScoreChange(event);
  }

  onQtrChange(event: QuarterChangeEvent): void {
    this.facade.onQtrChange(event);
  }

  onDownDistanceChange(event: DownDistanceChangeEvent): void {
    this.facade.onDownDistanceChange(event);
  }

  onFlagToggle(isFlag: boolean): void {
    this.facade.onFlagToggle(isFlag);
  }

  onGameClockAction(event: GameClockActionEvent): void {
    this.facade.onGameClockAction(event);
  }

  onPlayClockAction(event: PlayClockActionEvent): void {
    this.facade.onPlayClockAction(event);
  }

  onTimeoutChange(event: TimeoutChangeEvent): void {
    this.facade.onTimeoutChange(event);
  }

  onScoreboardSettingsChange(update: Partial<ScoreboardUpdate>): void {
    this.facade.onScoreboardSettingsChange(update);
  }

  onPlayerUpdate(update: PlayerMatchUpdate): void {
    this.facade.onPlayerUpdate(update);
  }

  toggleHideAllForms(): void {
    this.facade.toggleHideAllForms();
  }

  onEventCreate(event: FootballEventCreate): void {
    this.facade.onEventCreate(event);
  }

  onEventUpdate(payload: { id: number; data: FootballEventUpdate }): void {
    this.facade.onEventUpdate(payload);
  }

  onEventDelete(eventId: number): void {
    this.facade.onEventDelete(eventId);
  }
}
