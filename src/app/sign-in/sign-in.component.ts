import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { GoogleAuthProvider, getAuth, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  isSignIn: boolean = false;
  submitted: boolean = false;
  userNotFound: boolean = false;
  emailNotVerify: boolean = false;

  user: any = null;

  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  constructor(private firestore: Firestore, private router: Router, public authentication: AuthenticationService) { }

  ngOnInit(): void {
  }

  /*------ SIGN-IN ------*/
  async signIn() {
    this.submitted = true;
    if (this.signInForm.invalid) {
      return;
    }
    this.disableForm();

    const emailLowerCase: string = this.signInForm.value.email?.toLowerCase() || '';
    const password = this.signInForm.value.password ?? '';
    await this.loginWithEmail(emailLowerCase, password);
    this.checkLoginUser();

    this.resetForm();
  }

  async signInGuest(email: string, password: string) {
    this.disableForm();

    await this.loginWithEmail(email, password);

    this.resetForm();
  }

  async loginWithEmail(email: string, password: string) {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential: any) => {
        // Signed in 
        this.user = userCredential.user;
        if (this.user.emailVerified !== true) {
          this.authentication.sendVerificationMail(this.user);
        }
        console.log('Login with: ', this.user); // TEST !!!!!!!!!!!!!!!
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
          this.showError('userNotFound')
        }
        console.log('ERROR loginWithEmail: ', error);
      });
  }

  async loginWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider)
      .then(async (result) => {
        //const credential = GoogleAuthProvider.credentialFromResult(result);

        const authUID = result.user.uid;
        const emailLowerCase: string = result.user.email?.toLowerCase() || '';
        const name: string = result.user.displayName || '';
        await this.authentication.sendUserToFirebase(name, emailLowerCase, authUID);
        console.log('Login with: ', result); // TEST !!!!!!!!!!!!!!!
        //WEITERLEITEN MIT UID
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }

  checkLoginUser() {
    if (this.user.emailVerified) {
      this.emailNotVerify = false;
      //WEITERLEITEN MIT UID
    } else {
      this.router.navigateByUrl('/sign-in');
      this.showError('emailNotVerify');
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

  resetForm() {
    setTimeout(() => {
      this.signInForm.enable();
      this.isSignIn = false;
      this.submitted = false;
    }, 3500);
  }


}
