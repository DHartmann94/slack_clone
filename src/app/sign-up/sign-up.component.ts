import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  isSignUp: boolean = false; 
  submitted: boolean = false;

  signUpForm = new FormGroup({
    name: new FormControl('', [
    Validators.required, 
    Validators.minLength(3), 
    Validators.maxLength(25),
    Validators.pattern(/^[a-zA-Z]+\s[a-zA-Z]+$/),
  ]),

    email: new FormControl('', [
    Validators.required, 
    Validators.email
  ]),

    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(8)
    ]),
  });

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
  }

  signUp() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
    this.isSignUp = true;
    this.signUpForm.disable();

    let data = {
      name: this.signUpForm.value.name,
      email: this.signUpForm.value.email,
      password: this.signUpForm.value.password,
    }
    
    console.log('Daten: ', data);

    setTimeout(() => {
      this.signUpForm.reset();
      this.signUpForm.enable();
      this.isSignUp = false;
      this.submitted = false;
    }, 3000);
  }

}
