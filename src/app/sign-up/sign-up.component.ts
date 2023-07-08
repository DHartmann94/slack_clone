import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Firestore, addDoc, collection, getDoc } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { User } from 'src/models/user.class';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  //user: User = new User(); // TEST
  isSignUp: boolean = false;
  submitted: boolean = false;
  showAccountNotification: boolean = false;
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
      Validators.required,
      this.matchPassword.bind(this)
    ]),
  });

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
  }

  /*------ Validator-Funktions ------*/
  matchPassword(control: AbstractControl): ValidationErrors | null {
    const password = control.root.get('password');
    const confirmPassword = control.value;

    if (password && confirmPassword && password.value !== confirmPassword) {
      return { mismatch: true };
    }

    return null;
  }

  async checkEmailExist(emailLowerCase: string) {
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

  /*------ SIGN-UP ------*/
  async signUp() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
    const emailLowerCase: string = this.signUpForm.value.email?.toLowerCase() || '';
    this.checkEmailExist(emailLowerCase);

    this.isSignUp = true;
    this.signUpForm.disable();

    await this.sendUserToAuthenticator(emailLowerCase);
    await this.sendUserToFirebase(emailLowerCase);

    this.showsCreateAccountAnimation();
    setTimeout(() => {
      this.signUpForm.reset();
      this.signUpForm.enable();
      this.isSignUp = false;
      this.submitted = false;
    }, 3000);
  }

  async sendUserToAuthenticator(emailLowerCase: string) {
    const auth = getAuth();
    const password: string = this.signUpForm.value.password ?? '';

    createUserWithEmailAndPassword(auth, emailLowerCase, password)
      .then((userCredential: any) => {
        // Signed up 
        const user = userCredential.user;
        // ...
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('ERROR: ', errorCode, errorMessage);
        // ..
      });
  }

  async sendUserToFirebase(emailLowerCase: string) {
    let data = {
      name: this.signUpForm.value.name,
      email: emailLowerCase,
    }
    const user = new User(data);

    const usersCollection = collection(this.firestore, 'users');
    addDoc(usersCollection, user.toJSON()).then(async (result) => {
      await getDoc(result);
    });
  }

  showsCreateAccountAnimation() {
    this.showAccountNotification = true;
    setTimeout(() => {
      this.showAccountNotification = false;
    }, 3000);
  }

}
