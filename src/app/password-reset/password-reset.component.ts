import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { ValidationService } from '../service-moduls/validation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
  isSendMail: boolean = false;
  submitted: boolean = false;
  showSlideInNotification: boolean = false;
  emailExists: boolean = true;

  resetPasswortForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
  });


  constructor(private firestore: Firestore, private router: Router, public validation: ValidationService) { }

  /*------ Send-Mail ------*/
  async sendMail() {
    this.submitted = true;
    if (this.resetPasswortForm.invalid) {
      return;
    }
    this.disableForm();

    const emailLowerCase: string = this.resetPasswortForm.value.email?.toLowerCase() || '';
    this.emailExists = await this.validation.checkEmailExists(emailLowerCase);
    if (!this.emailExists) {
      this.resetPasswortForm.enable();
      this.isSendMail = false;
      this.resetEmailExistsError();
      return;
    }

    await this.sendChangePasswordMail(emailLowerCase);

    this.showsNotificationAnimation();
    this.resetForm();
    //this.router.navigateByUrl("/sign-in");
  }

  /**
   * 
   * Use: http://localhost:4200/confirm-password for testing.
   * @param emailLowerCase 
   */
  async sendChangePasswordMail(emailLowerCase: string) {
    const auth = getAuth();

    sendPasswordResetEmail(auth, emailLowerCase)
      .then(() => {
        // Sending Mail (Standard: https://slag-clone.firebaseapp.com/__/auth/action?mode=action&oobCode=code)
      })
      .catch((error) => {
        console.log('ERROR sending Mail:', error);
      });
  }

  showsNotificationAnimation() {
    this.showSlideInNotification = true;
    setTimeout(() => {
      this.showSlideInNotification = false;
    }, 3000);
  }

  resetEmailExistsError() {
    setTimeout(() => {
      this.emailExists = false;
    }, 3000);
  }

  disableForm() {
    this.resetPasswortForm.disable();
    this.isSendMail = true;
  }

  resetForm() {
    setTimeout(() => {
      this.resetPasswortForm.reset();
      this.resetPasswortForm.enable();
      this.isSendMail = false;
      this.submitted = false;
    }, 3500);
  }
}
