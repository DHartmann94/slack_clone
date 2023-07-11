import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { GoogleAuthProvider, getAuth, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { User } from 'src/models/user.class';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  isSignIn: boolean = false;
  submitted: boolean = false;
  userNotFound: boolean = false;
  authUID: string = '';

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

    const emailLowerCase: string = this.signInForm.value.email?.toLowerCase() || '';
    const password = this.signInForm.value.password ?? '';
    await this.loginWithEmail(emailLowerCase, password);

    this.resetForm();
  }

  async signInGuest(email: string, password: string) {
    this.isSignIn = true;
    this.signInForm.disable();

    await this.loginWithEmail(email, password);

    this.resetForm();
  }

  async loginWithEmail(email: string, password: string) {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential: any) => {
        // Signed in 
        const user = userCredential.user;
        //WEITERLEITEN MIT UID?
        console.log('Login'); // TEST !!!!!!!!!!!!!!!
      })
      .catch((error: any) => {
        this.showUserError();
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('ERROR: ', errorCode, errorMessage);
      });
  }

  async loginWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider)
      .then(async (result) => {
        //const credential = GoogleAuthProvider.credentialFromResult(result);

        console.log(result); // TEST !!!!!!!!!!!!!!!
        this.authUID = result.user.uid;
        const emailLowerCase: string = result.user.email?.toLowerCase() || '';
        await this.sendGoogleUserToFirebase(result.user.displayName, emailLowerCase)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error('ERROR login with Google: ', error);
      });
  }

  // Gleiche Funktion wie in sign up.
  async sendGoogleUserToFirebase(name: any, emailLowerCase: any) {
    // Zuerst Prüfen ob der User existiert, geht auch ohne?
    let data = {
      name: name,
      email: emailLowerCase,
    }
    const user = new User(data);

    const usersCollection = collection(this.firestore, 'users');
    const docRef = doc(usersCollection, this.authUID);
    console.log(this.authUID)
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

  showUserError() {
    this.userNotFound = true;
    setTimeout(() => {
      this.userNotFound = false;
    }, 3000);
  }

  // Gleiche Funktion wie in sign up.
  resetForm() {
    setTimeout(() => {
      this.signInForm.enable();
      this.isSignIn = false;
      this.submitted = false;
    }, 3500);
  }


}
