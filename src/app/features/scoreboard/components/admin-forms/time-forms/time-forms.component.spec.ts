import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimeFormsComponent } from './time-forms.component';
import { GameClock } from '../../../../matches/models/gameclock.model';

describe('TimeFormsComponent', () => {
  let component: TimeFormsComponent;
  let fixture: ComponentFixture<TimeFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeFormsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeFormsComponent);
    component = fixture.componentInstance;
  });

  it('emits edited clock max minutes on save', () => {
    const gameClock: GameClock = {
      id: 10,
      match_id: 5,
      gameclock: 2700,
      gameclock_max: 2700,
      direction: 'down',
      gameclock_status: 'stopped',
    };

    fixture.componentRef.setInput('gameClock', gameClock);
    fixture.detectChanges();

    component.onMaxMinutesChange(90);

    const emitSpy = vi.spyOn(component.gameClockAction, 'emit');
    component.onSaveQuarterLength();

    expect(emitSpy).toHaveBeenCalledWith({
      action: 'update',
      data: { gameclock_max: 5400 },
    });
  });

  it('normalizes invalid max minutes to minimum one minute', () => {
    component.onMaxMinutesChange(0);
    expect(component['maxMinutes']()).toBe(1);

    component.onMaxMinutesChange(null);
    expect(component['maxMinutes']()).toBe(1);
  });
});
