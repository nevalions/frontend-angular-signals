import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { RegisterIconComponent } from './register-icon.component';

describe('RegisterIconComponent', () => {
  let component: RegisterIconComponent;
  let fixture: ComponentFixture<RegisterIconComponent>;
  let dialogsMock: { open: typeof vi.fn };

  beforeEach(() => {
    dialogsMock = {
      open: vi.fn(() => new Observable(subscriber => {
        subscriber.next({});
        subscriber.complete();
      })),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: TuiDialogService, useValue: dialogsMock }],
    });

    fixture = TestBed.createComponent(RegisterIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open register dialog on click', () => {
    component.openRegisterDialog();
    expect(dialogsMock.open).toHaveBeenCalled();
  });
});
