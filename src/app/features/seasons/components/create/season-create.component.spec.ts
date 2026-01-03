import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SeasonCreateComponent } from './season-create.component';
import { SeasonStoreService } from '../../services/season-store.service';

describe('SeasonCreateComponent', () => {
  let component: SeasonCreateComponent;
  let fixture: ComponentFixture<SeasonCreateComponent>;
  let routerMock: any;
  let storeMock: any;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    storeMock = {
      createSeason: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: FormBuilder, useValue: TestBed.inject(FormBuilder) },
        { provide: Router, useValue: routerMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
      imports: [ReactiveFormsModule, FormsModule],
    });

    fixture = TestBed.createComponent(SeasonCreateComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.seasonForm.invalid).toBe(true);
  });

  it('should navigate to list on cancel', () => {
    component.navigateToList();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('should call createSeason on valid form submit', () => {
    component.seasonForm.setValue({
      year: 2024,
      description: 'Test season',
    });

    component.onSubmit();

    expect(storeMock.createSeason).toHaveBeenCalledWith({
      year: 2024,
      description: 'Test season',
    });
  });

  it('should not call createSeason on invalid form submit', () => {
    component.seasonForm.setValue({
      year: 1800,
      description: 'Invalid year',
    });

    component.onSubmit();

    expect(storeMock.createSeason).not.toHaveBeenCalled();
  });
});
