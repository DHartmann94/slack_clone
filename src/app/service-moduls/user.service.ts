import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, doc, getDoc, getDocs, query } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface UserDataInterface {
  id: string;
  name: string;
  email: string;
  picture?: string;
  createdAt?: any;
  status?: any;
}

@Injectable({
  providedIn: 'root'
})

export class UserDataService {

  userData: UserDataInterface[] = [];

  constructor(
    public firestore: Firestore
  ) { }

  getUserData(): Observable<UserDataInterface[]> {
    const userCollection = collection(this.firestore, 'users');
    const q = query(userCollection);

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const storedUserData: UserDataInterface[] = [];

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const { name, email, picture, status } = data;
          const user: UserDataInterface = {
            id: doc.id,
            name: name,
            email: email,
            picture: picture,
            status: status
          };
          storedUserData.push(user);
        });
        this.userData = storedUserData;
        return storedUserData;
      })
    );
  }

  /*------ Current-User / Users ------*/
  currentUser: string = '';
  userName: string = '';
  userEmail: string = '';
  userStatus: string = '';
  userPicture: string = '';

  /**
   * Asynchronously retrieves the current user's data based on the provided userID.
   * @param {string} userID - The ID of the user whose data is to be retrieved in the 'users' collection.
   */
  async getCurrentUserData(userID: string) {
    try {
      const userDocRef = doc(this.firestore, 'users', userID);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (this.currentUser === userID) {
          this.currentUserData(userData);
        }
      }
    } catch (error) {
      console.log('ERROR retrieving user data:', error);
    }
  }

  /**
   * Asynchronously retrieves user data from the backend based on the provided userID.
   * @param {string} userID - The ID of the user whose data is to be retrieved in the 'users' collection. 
   * @returns {Promise<Object|null>} - A promise that resolves with the retrieved user data object if it exists, or null if not found.
   */
  async usersDataBackend(userID: string) {
    try {
      const userDocRef = doc(this.firestore, 'users', userID);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        return userData;
      } else {
        return null;
      }
    } catch (error) {
      console.log('ERROR retrieving user data:', error);
      return null;
    }
  }

  /*------ Help functions ------*/
  currentUserData(userData: any) {
    this.userName = userData['name'];
    this.userEmail = userData['email'];
    this.userStatus = userData['status'];
    this.userPicture = userData['picture'];
  }

}
