import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectChatComponent } from './direct-chat.component';

describe('NewChatComponent', () => {
  let component: DirectChatComponent;
  let fixture: ComponentFixture<DirectChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
