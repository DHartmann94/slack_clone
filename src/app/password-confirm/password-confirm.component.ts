import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { getAuth, fetchSignInMethodsForEmail, sendPasswordResetEmail } from '@angular/fire/auth';
import { ValidationService } from '../service-moduls/validation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-confirm',
  templateUrl: './password-confirm.component.html',
  styleUrls: ['./password-confirm.component.scss']
})
export class PasswordConfirmComponent {
  isChangePassword: boolean = false;
  submitted: boolean = false;
  showAccountNotification: boolean = false;

  confirmPasswortForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),

    confirmPassword: new FormControl('', [
      Validators.required,
    ]),
  }, { validators: this.validation.matchPassword.bind(this) });

  constructor(private firestore: Firestore, private router: Router, public validation: ValidationService) { }

  /*------ Change-Password ------*/
  async changePassword() {
    this.submitted = true;
    if (this.confirmPasswortForm.invalid) {
      return;
    }
    this.disableForm();

    // Funktion...

    this.showsNotificationAnimation();
    this.resetForm();
    //this.router.navigateByUrl("/sign-in");
  }

  showsNotificationAnimation() {
    this.showAccountNotification = true;
    setTimeout(() => {
      this.showAccountNotification = false;
    }, 3000);
  }

  disableForm() {
    this.confirmPasswortForm.disable();
    this.isChangePassword = true;
  }

  resetForm() {
    setTimeout(() => {
      this.confirmPasswortForm.reset();
      this.confirmPasswortForm.enable();
      this.isChangePassword = false;
      this.submitted = false;
    }, 3500);
  }
}
