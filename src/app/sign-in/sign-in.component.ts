import { Component } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  allUsers: any = [];

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
    this.getUsersFromFirebase();
  }

  /**
   * Retrieves user data from Firebase Firestore and onSnapshot() listens for real-time changes.
   * map; Converts the documents in the snapshot into an array of user objects.
   * id: doc.id, ...doc.data(); Find the ID in the Firebase object using the spread operator.
   * allUsers = []; Updates the local variable with the new user data.
   */
  getUsersFromFirebase() {
    let changes;
    const collectionUsersRef = collection(this.firestore, 'user');
    onSnapshot(collectionUsersRef, (snapshot) => {
      changes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // ...doc.data = Spread Operator
      this.allUsers = changes;
      console.log('Users:', this.allUsers);
    });
  }

}
