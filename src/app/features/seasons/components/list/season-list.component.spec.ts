import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SeasonListComponent } from './season-list.component';
import { SeasonStoreService } from '../../services/season-store.service';

describe('SeasonListComponent', () => {
  let component: SeasonListComponent;
  let fixture: ComponentFixture<SeasonListComponent>;
  let routerMock: any;
  let storeMock: any;

  beforeEach(() => {
    TestBed.initTestEnvironment();

    routerMock = {
      navigate: vi.fn(),
    };

    storeMock = {
      seasons: { value: () => [] },
      loading: { value: () => false },
      error: { value: () => null },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
    });

    fixture = TestBed.createComponent(SeasonListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to create on button click', () => {
    component.navigateToCreate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons/create']);
  });

  it('should navigate to detail on card click', () => {
    component.navigateToDetail(1);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 1]);
  });
});
