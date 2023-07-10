import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserProfileCardComponent } from './edit-user-profile-card.component';

describe('EditUserProfileCardComponent', () => {
  let component: EditUserProfileCardComponent;
  let fixture: ComponentFixture<EditUserProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditUserProfileCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
