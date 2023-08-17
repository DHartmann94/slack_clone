import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadDirectComponent } from './thread-direct.component';

describe('ThreadDirectComponent', () => {
  let component: ThreadDirectComponent;
  let fixture: ComponentFixture<ThreadDirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreadDirectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
