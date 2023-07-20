import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { ValidationService } from '../service-moduls/validation.service';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  //user: User = new User(); // TEST
  isSignUp: boolean = false;
  submitted: boolean = false;
  showSlideInNotification: boolean = false;
  emailExists: boolean = false;

  signUpForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(25),
      Validators.pattern(/^[a-zA-Z]+\s[a-zA-Z]+$/),
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email,
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

  constructor(private firestore: Firestore, private router: Router, public validation: ValidationService, public authentication: AuthenticationService) { }

  ngOnInit(): void {
  }

  /*------ SIGN-UP ------*/
  async signUp() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
    this.disableForm();

    const name: string = this.signUpForm.value.name ?? '';
    const emailLowerCase: string = this.signUpForm.value.email?.toLowerCase() || '';
    this.emailExists = await this.validation.checkEmailExists(emailLowerCase);
    if (this.emailExists) {
      this.signUpForm.enable();
      this.isSignUp = false;
      this.resetEmailExistsError();
      return;
    }

    await this.createUser(name, emailLowerCase);
  }

  async createUser(name: string, emailLowerCase: string) {
    const password: string = this.signUpForm.value.password ?? '';
    const picturePath = this.randomPicture();
    console.log(picturePath);
    const authUID = await this.authentication.sendUserToAuthenticator(emailLowerCase, password);
    await this.authentication.sendUserToFirebase(name,emailLowerCase, authUID, picturePath);

    this.showsNotificationAnimation();
    this.resetForm();
    //this.router.navigateByUrl("/sign-in");
  }

  randomPicture() {
    const numberOfPictures = 5; 
    const randomIndex = Math.floor(Math.random() * numberOfPictures) + 1;
    const randomPicture = `./assets/profile-pictures/avatar${randomIndex}.png`;
    return randomPicture;
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