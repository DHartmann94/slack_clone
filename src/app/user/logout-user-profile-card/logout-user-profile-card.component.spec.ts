import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutUserProfileCardComponent } from './logout-user-profile-card.component';

describe('LogoutUserProfileCardComponent', () => {
  let component: LogoutUserProfileCardComponent;
  let fixture: ComponentFixture<LogoutUserProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogoutUserProfileCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutUserProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
