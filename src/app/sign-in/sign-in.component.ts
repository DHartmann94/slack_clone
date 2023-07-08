import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection } from '@angular/fire/firestore';
import { getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  isSignIn: boolean = false;
  submitted: boolean = false;

  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
  }


  async signIn() {
    this.submitted = true;
    if (this.signInForm.invalid) {
      return;
    }
    this.isSignIn = true;
    this.signInForm.disable();

    await this.loginWithEmail();
    await this.searchLoginUser();

    setTimeout(() => {
      this.signInForm.enable();
      this.isSignIn = false;
      this.submitted = false;
    }, 3000);
  }

  async loginWithEmail() {
    const auth = getAuth();
    const email: string = this.signInForm.value.email ?? '';
    const password: string = this.signInForm.value.password ?? '';
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential: any) => {
        // Signed in 
        const user = userCredential.user;
        console.log('Login'); // TEST !!!!!!!!!!!!!!!
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('ERROR: ', errorCode, errorMessage);
      });
  }

  async searchLoginUser() {

  }


}
