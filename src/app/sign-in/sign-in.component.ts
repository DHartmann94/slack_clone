import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';

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


  signIn() {
    this. submitted = true;
    if (this.signInForm.invalid) {
      return;
    }
    this.isSignIn = true;
    this.signInForm.disable();

    let data = {
      email: this.signInForm.value.email,
      password: this.signInForm.value.password,
    }
    
    console.log('Daten: ', data);

    setTimeout(() => {
      this.signInForm.enable();
      this.isSignIn = false;
      this. submitted = false;
    }, 3000);
  }


}
