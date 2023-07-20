import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailVerificationConfirmComponent } from './email-verification-confirm.component';

describe('EmailVerificationConfirmComponent', () => {
  let component: EmailVerificationConfirmComponent;
  let fixture: ComponentFixture<EmailVerificationConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailVerificationConfirmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailVerificationConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
