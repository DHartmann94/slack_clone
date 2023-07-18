import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, confirmPasswordReset, sendPasswordResetEmail, signOut } from '@angular/fire/auth';
import { User } from 'src/models/user.class';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user: any = null;
  errorMessage: string = '';


  constructor(private firestore: Firestore) { }

  async loginWithEmail(email: string, password: string) {
    const auth = getAuth();
    this.user = null;
    this.errorMessage = '';

    await signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential: any) => {
        // Signed in 
        this.user = userCredential.user;
        if (this.user.emailVerified !== true) {
          this.sendVerificationMail(this.user);
        }
        console.log('Login with: ', this.user); // TEST !!!!!!!!!!!!!!!
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        this.errorMessage = errorCode;
        console.log('ERROR loginWithEmail: ', error);
      });
  }

  async loginWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    this.errorMessage = '';

    await signInWithPopup(auth, provider)
      .then(async (result) => {
        //const credential = GoogleAuthProvider.credentialFromResult(result);

        const authUID = result.user.uid;
        const emailLowerCase: string = result.user.email?.toLowerCase() || '';
        const name: string = result.user.displayName || '';
        await this.sendUserToFirebase(name, emailLowerCase, authUID);
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

  async sendUserToAuthenticator(emailLowerCase: string, password: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const auth = getAuth();

      await createUserWithEmailAndPassword(auth, emailLowerCase, password)
        .then(async (userCredential: any) => {
          const user = userCredential.user;
          const authUID = userCredential.user.uid;
          await this.sendVerificationMail(user);
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

  async sendVerificationMail(user: any) {
    await sendEmailVerification(user)
      .then(() => {
        // Email verification sent!
      })
      .catch((error) => {
        console.error('ERROR email verification:', error);
      });
  }

  async logoutAuth() {
    const auth = getAuth();
    await signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      console.log('ERROR signOut: ', error);
    });
  }

  /**
 * 
 * Use: http://localhost:4200/confirm-password for testing.
 * @param {string} emailLowerCase - The e-mail address where the reset e-mail should be sent.
 */
  async sendChangePasswordMail(emailLowerCase: string) {
    const auth = getAuth();

    await sendPasswordResetEmail(auth, emailLowerCase)
      .then(() => {
        // Paswword resent mail sent!
      })
      .catch((error) => {
        console.log('ERROR sending Mail:', error);
      });
  }

  async changePassword(code: string, newPassword: string) {
    console.log('Code: ', code); // TEST
    console.log('Password: ', newPassword); // TEST
    const auth = getAuth();

    await confirmPasswordReset(auth, code, newPassword)
      .then(() => {
        // Password has been reset!
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('ERROR reset password: ', error);
      });

  }

  /*------ FIREBASE ------*/
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
  }

}
