import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from '@angular/fire/auth';
import { User } from 'src/models/user.class';
import { ValidationService } from '../service-moduls/validation.service';
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

  constructor(private firestore: Firestore, private router: Router, public validation: ValidationService) { }

  ngOnInit(): void {
  }

  /*------ SIGN-UP ------*/
  async signUp() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
    this.disableForm();

    const name: string = this.signUpForm.value.name?.toLowerCase() || '';
    const emailLowerCase: string = this.signUpForm.value.email?.toLowerCase() || '';
    this.emailExists = await this.validation.checkEmailExists(emailLowerCase);
    if (this.emailExists) {
      this.signUpForm.enable();
      this.isSignUp = false;
      this.resetEmailExistsError();
      return;
    }

    const authUID = await this.sendUserToAuthenticator(emailLowerCase);
    await this.sendUserToFirebase(name,emailLowerCase, authUID);

    this.showsNotificationAnimation();
    this.resetForm();
    //this.router.navigateByUrl("/sign-in");
  }

  async sendUserToAuthenticator(emailLowerCase: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const auth = getAuth();
      const password: string = this.signUpForm.value.password ?? '';

      await createUserWithEmailAndPassword(auth, emailLowerCase, password)
        .then(async (userCredential: any) => {
          const user = userCredential.user;
          const authUID = userCredential.user.uid;
          await this.sendEmailVerification(user);
          resolve(authUID);
        })
        .catch((error: any) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log('ERROR create user Auth.: ', errorCode, errorMessage);
          reject(null);
        });
    });
  }

  async sendEmailVerification(user: any) {
    await sendEmailVerification(user)
      .then(() => {
        // Email verification sent!
      })
      .catch((error) => {
        console.error('Error email verification:', error);
      });
  }

  async sendUserToFirebase(name: string, emailLowerCase: string, authUID: any) {
    let data = {
      name: name,
      email: emailLowerCase,
    }
    const user = new User(data);

    const usersCollection = collection(this.firestore, 'users');
    const docRef = doc(usersCollection, authUID);
    setDoc(docRef, user.toJSON()).then((result: any) => {
    })
      .catch((error: any) => {
        console.error('ERROR user send to Firebase: ', error);
      });
    /*
    addDoc(usersCollection, user.toJSON()).then(async (result) => {
      await getDoc(result);
    });*/
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