import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  isSignIn: boolean = false;
  submitted: boolean = false;
  userNotFound: boolean = false;
  emailNotVerify: boolean = false;


  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]),
    password: new FormControl('', Validators.required),
  });

  constructor(private router: Router, public authentication: AuthenticationService) { }

  /*------ SIGN-IN ------*/

  /**
   * Asynchronously signs in the user with the provided credentials from the 'signInForm'.
   * It retrieves data from the form, performs error checks in the user if valid.
   */
  async signIn() {
    this.submitted = true;
    if (this.signInForm.invalid) {
      return;
    }
    this.disableForm();

    await this.getDataFromForm();

    this.checkError();
    if (this.authentication.user === null) {
      this.signInForm.enable();
      this.isSignIn = false;
      return;
    }

    this.checkLoginUser();
    this.enableForm();
  }

  /**
   * Asynchronously retrieves the email and password data from the 'signInForm' and uses it to log in the user.
   */
  async getDataFromForm() {
    const emailLowerCase: string = this.signInForm.value.email?.toLowerCase() || '';
    const password = this.signInForm.value.password ?? '';
    await this.authentication.loginWithEmail(emailLowerCase, password);
  }

  /**
   * Asynchronously signs in a guest user with the provided email and password.
   * @param email {string} email - The email address of the guest user.
   * @param password {string} password - The password of the guest user.
   */
  async signInGuest(email: string, password: string) {
    this.disableForm();

    await this.authentication.loginWithEmail(email, password);
    await this.authentication.getUserData();

    this.enableForm();
  }

  /**
   * If the email is verified, it fetches user data using the 'getUserData' method from the 'authentication' service.
   */
  async checkLoginUser() {
    if (this.authentication.user.emailVerified) {
      this.emailNotVerify = false;
      await this.authentication.getUserData();
    } else {
      this.router.navigateByUrl('/sign-in');
      this.showError('emailNotVerify');
    }
  }

  /*------ Help functions ------*/
  checkError() {
    if (this.authentication.errorMessage === 'auth/wrong-password' || this.authentication.errorMessage === 'auth/user-not-found') {
      this.showError('userNotFound')
    }
  }

  showError(errorType: 'userNotFound' | 'emailNotVerify') {
    this[errorType] = true;
    setTimeout(() => {
      this[errorType] = false;
    }, 5000);
  }

  disableForm() {
    this.signInForm.disable();
    this.isSignIn = true;
  }

  enableForm() {
    setTimeout(() => {
      this.signInForm.enable();
      this.isSignIn = false;
      this.submitted = false;
    }, 3500);
  }


}