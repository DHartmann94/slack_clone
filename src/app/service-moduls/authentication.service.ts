import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, confirmPasswordReset, sendPasswordResetEmail, signOut, onAuthStateChanged, updateEmail, reauthenticateWithCredential, EmailAuthProvider, applyActionCode } from '@angular/fire/auth';
import { User } from 'src/models/user.class';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user: any = null;
  errorMessage: string = '';
  guestUID: string = 'VkLP7dYflLeKFtjvyqmZbPltJy13';


  constructor(
    private firestore: Firestore,
    private router: Router,
    private route: ActivatedRoute,
    private userDataService: UserDataService,
  ) { }

  async loginWithEmail(email: string, password: string) {
    const auth = getAuth();
    this.user = null;
    this.errorMessage = '';

    await signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential: any) => {
        // Signed in 
        this.user = userCredential.user;
        if (this.user.uid != this.guestUID) { // Guest-Login
          if (this.user.emailVerified !== true) {
            this.sendVerificationMail(this.user);
          }
        }
      })
      .catch((error: any) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        this.errorMessage = errorCode;
        console.log('ERROR loginWithEmail: ', error);
      });
  }

  /*
  async loginWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    this.user = null;
    this.errorMessage = '';

    signInWithRedirect(auth, provider);
    const userCred = await getRedirectResult(auth);
    console.log(userCred);
  }*/

  async loginWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    this.user = null;
    this.errorMessage = '';

    await signInWithPopup(auth, provider)
      .then(async (result) => {
        //const credential = GoogleAuthProvider.credentialFromResult(result);

        this.user = result.user;
        const authUID = result.user.uid;
        const emailLowerCase: string = result.user.email?.toLowerCase() || '';
        const name: string = result.user.displayName || '';
        await this.sendUserToFirebase(name, emailLowerCase, authUID, './assets/profile-pictures/avatar1.png');
        this.getUserData()
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

  /**
   * In firebase-auth, change the link to the correct route.
   * Use: http://localhost:4200/auth-action for testing.
   * @param {object} user - User Data
   */
  async sendVerificationMail(user: any) {
    console.log(typeof(user));
    await sendEmailVerification(user)
      .then(() => {
        // Email verification sent!
      })
      .catch((error) => {
        console.error('ERROR email verification:', error);
      });
  }

  /**
 * In firebase-auth, change the link to the correct route.
 * Use: http://localhost:4200/auth-action for testing.
 * @param {string} emailLowerCase - The email address where the reset e-mail should be sent.
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

  async changeMail(newEmail: string, password: string) {
    const auth = getAuth();
    const user: any = auth.currentUser;
    if (user) {
      try {
        await updateEmail(user, newEmail);
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          try {
            const emailCredential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, emailCredential);

            try {
              await updateEmail(user, newEmail);
            } catch (error) {
              console.log('ERROR changing email');
            }

          } catch (error) {
            console.log('ERROR updating email:', error);
          }
        } else {
          console.log('ERROR updating email:', error);
        }
      }
    }
  }

  async handleVerifyEmail() {
    const auth = getAuth();
    const actionCode = this.route.snapshot.queryParams['oobCode'];

    await applyActionCode(auth, actionCode)
      .then((resp) => {
        // Email address has been verified.
      }).catch((error) => {
        console.log('ERROR verify EMail: ', error);
      });
  }

  async logoutAuth() {
    await this.setUserInactive();

    const auth = getAuth();
    await signOut(auth).then(async () => {
      // Sign-out successful.
      await this.router.navigateByUrl("/sign-in");
      window.location.reload();
    }).catch((error) => {
      console.log('ERROR signOut: ', error);
    });
  }

  async setUserInactive() {
    //const currentUserUID = localStorage.getItem('currentUser');

    if (this.userDataService.currentUser) {
      const userRef = doc(this.firestore, 'users', this.userDataService.currentUser);
      await updateDoc(userRef, { status: 'Inactive' }).catch((error) => {
        console.log('ERROR setUserInactive:', error);
      });

      // localStorage.setItem('currentUser', ''); // TEST
    }
  }

  async getUserData() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        //localStorage.setItem('currentUser', this.user.uid); // TEST
        await setDoc(doc(collection(this.firestore, 'users'), this.user.uid), { status: 'Active' }, { merge: true }).then(() => {
          this.router.navigateByUrl('/board/' + this.user.uid).then(() => {

          });
        });
      }
    });
  }

  /*------ FIREBASE ------*/
  async sendUserToFirebase(name: string, emailLowerCase: string, authUID: any, avatar: string) {
    let data = {
      name: name,
      email: emailLowerCase,
      picture: avatar,
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
