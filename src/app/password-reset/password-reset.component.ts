import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { getAuth, fetchSignInMethodsForEmail, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
  isSendMail: boolean = false;
  submitted: boolean = false;
  showAccountNotification: boolean = false;
  emailExists: boolean = true;

  resetPasswortForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
  });


  constructor(private firestore: Firestore, private router: Router) { }

  /*------ Validator-Funktions ------*/
  async checkEmailExists(emailLowerCase: string) {
    const auth = getAuth();

    try {
      const emailResult = await fetchSignInMethodsForEmail(auth, emailLowerCase);

      if (emailResult.length > 0) {
        console.log('Email existiert');
        return this.emailExists = true;
      }

      console.log('Email existiert NICHT');
      return this.emailExists = false;;

    } catch (error) {
      console.log('Error: ', error);
      return this.emailExists = true;;
    }
  }

  /*------ Send-Mail ------*/
  async sendMail() {
    this.submitted = true;
    if (this.resetPasswortForm.invalid) {
      return;
    }
    this.disableForm();

    const emailLowerCase: string = this.resetPasswortForm.value.email?.toLowerCase() || '';
    await this.checkEmailExists(emailLowerCase);
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
    this.showAccountNotification = true;
    setTimeout(() => {
      this.showAccountNotification = false;
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