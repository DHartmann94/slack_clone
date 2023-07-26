import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatExtendComponent } from './chat-extend.component';

describe('ChatExtendComponent', () => {
  let component: ChatExtendComponent;
  let fixture: ComponentFixture<ChatExtendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatExtendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatExtendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
