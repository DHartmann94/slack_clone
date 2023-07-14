import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { User } from 'src/models/user.class';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private firestore: Firestore,) { }

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
        console.error('Error email verification:', error);
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
    /*
    addDoc(usersCollection, user.toJSON()).then(async (result) => {
      await getDoc(result);
    });*/
  }

}
