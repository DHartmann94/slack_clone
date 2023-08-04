import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../service-moduls/validation.service';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  isSignUp: boolean = false;
  submitted: boolean = false;
  showSlideInNotification: boolean = false;
  emailExists: boolean = false;
  usernameExists: boolean = false;

  signUpForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(25),
      Validators.pattern(/^[a-zA-Z-]+\s[a-zA-Z-]+$/),
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),

    confirmPassword: new FormControl('', [
      Validators.required
    ]),
  }, { validators: this.validation.matchPassword.bind(this) });

  constructor(
    private router: Router, 
    public validation: ValidationService, 
    public authentication: AuthenticationService) { }

  /*------ SIGN-UP ------*/

  /**
   * Asynchronously signs up a new user using the data provided in the 'signUpForm'.
   * If the email is new, it proceeds to create the user account.
   */
  async signUp() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
    this.disableForm();

    this.checkSignUp();
  }

  /**
   * Asynchronous function that performs checks before user signup and creates a new user if checks pass.
   * Checks email and the desire name in the 'users' collection.
   * @return
   */
  async checkSignUp() {
    const emailLowerCase: string = this.signUpForm.value.email?.toLowerCase() || '';
    this.emailExists = await this.validation.checkEmailExists(emailLowerCase);
    if (this.emailExists) {
      this.signUpForm.enable();
      this.isSignUp = false;
      this.resetExistsError('emailExists');
      return;
    }

    const nameLowerCase = this.signUpForm.value.name?.toLowerCase() || '';
    this.usernameExists = await this.validation.checkUsernameExists(nameLowerCase);
    if (this.usernameExists) {
      this.signUpForm.enable();
      this.isSignUp = false;
      this.resetExistsError('usernameExists');
      return;
    }

    await this.createUser(emailLowerCase);
  }

  /**
   * Asynchronously creates a new user using the provided email address and other sign-up data.
   * It uses the given email and password to create an account in the authentication service, and then sends additional user data (name, email, authUID, picturePath) to Firebase.
   * @param emailLowerCase - The email address of the new user.
   */
  async createUser(emailLowerCase: string) {
    const name: string = this.signUpForm.value.name ?? '';
    const password: string = this.signUpForm.value.password ?? '';
    const picturePath = this.randomPicture();
    const authUID = await this.authentication.sendUserToAuthenticator(emailLowerCase, password);
    await this.authentication.sendUserToFirebase(name,emailLowerCase, authUID, picturePath);

    this.showsNotificationAnimation();
    this.resetForm();
    this.router.navigateByUrl("/sign-in");
  }

  /**
   * Generates a random picture path from a set of profile pictures.
   * @returns {string} A randomly chosen picture path.
   */
  randomPicture() {
    const numberOfPictures = 5; 
    const randomIndex = Math.floor(Math.random() * numberOfPictures) + 1;
    const randomPicture = `./assets/profile-pictures/avatar${randomIndex}.png`;
    return randomPicture;
  }

  /*------ Help functions ------*/
  showsNotificationAnimation() {
    this.showSlideInNotification = true;
    setTimeout(() => {
      this.showSlideInNotification = false;
    }, 3000);
  }

  resetExistsError(errorType: 'usernameExists' | 'emailExists') {
    setTimeout(() => {
      this[errorType] = false;
    }, 3000);
  }

  disableForm() {
    this.signUpForm.disable();
    this.isSignUp = true;
  }

  resetForm() {
    setTimeout(() => {
      this.signUpForm.reset();
      this.signUpForm.enable();
      this.isSignUp = false;
      this.submitted = false;
    }, 3500);
  }


}