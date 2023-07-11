import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { User } from 'src/models/user.class';
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
  showAccountNotification: boolean = false;
  emailExists: boolean = false;
  authUID: string = '';

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

  constructor(private firestore: Firestore, private router: Router) { }

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

  /*------ SIGN-UP ------*/
  async signUp() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
    this.disableForm();

    const emailLowerCase: string = this.signUpForm.value.email?.toLowerCase() || '';
    await this.checkEmailExists(emailLowerCase);
    if (this.emailExists) {
      this.signUpForm.enable();
      this.isSignUp = false;
      this.resetEmailExistsError();
      return;
    }

    await this.sendUserToAuthenticator(emailLowerCase);
    await this.sendUserToFirebase(emailLowerCase, this.authUID);

    this.showsCreateAccountAnimation();
    this.resetForm();
    //this.router.navigateByUrl("/sign-in");
  }

  async sendUserToAuthenticator(emailLowerCase: string) {
    const auth = getAuth();
    const password: string = this.signUpForm.value.password ?? '';

    await createUserWithEmailAndPassword(auth, emailLowerCase, password)
      .then(async (userCredential: any) => {
        // Signed up 
        this.authUID = userCredential.user.uid;
        // Send EMAIL_VERIFICATION!
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('ERROR create user Auth.: ', errorCode, errorMessage);
      });
  }

  async sendUserToFirebase(emailLowerCase: string, authUID: any) {
    let data = {
      name: this.signUpForm.value.name,
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

  showsCreateAccountAnimation() {
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