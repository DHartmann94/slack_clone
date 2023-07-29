import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, doc, getDoc, getDocs, query } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface UserDataInterface {
  id: string;
  name: string;
  email: string;
  picture: string;
  createdAt?: any;
  status: any;
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

  /*------ Current-User / Chat-Card ------*/
  currentUser: string = '';
  userName = '';
  userEmail = '';
  userStatus = '';
  userPicture = '';

  chatUserName = '';
  chatUserEmail = '';
  chatUserStatus = '';
  chatUserPicture = '';

  async getCurrentUserData(userID: string) {
    try {
      const userDocRef = doc(this.firestore, 'users', userID);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (this.currentUser === userID) {
          this.currentUserData(userData)
          console.log('User data:', userData);
        }
        this.chatUserData(userData);
        //this.colorStatus(); 
      } else {
        console.log('The document does not exist.');
      }
    } catch (error) {
      console.log('Error retrieving user data:', error);
    }
  }

  currentUserData(userData: any) {
    this.userName = userData['name'];
    this.userEmail = userData['email'];
    this.userStatus = userData['status'];
    this.userPicture = userData['picture'];
  }

  chatUserData(userData: any) {
    this.chatUserName = userData['name'];
    this.chatUserEmail = userData['email'];
    this.chatUserStatus = userData['status'];
    this.chatUserPicture = userData['picture'];
  }

}
