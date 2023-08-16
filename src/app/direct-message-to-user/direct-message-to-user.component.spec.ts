import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageToUserComponent } from './direct-message-to-user.component';

describe('DirectMessageToUserComponent', () => {
  let component: DirectMessageToUserComponent;
  let fixture: ComponentFixture<DirectMessageToUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectMessageToUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectMessageToUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
