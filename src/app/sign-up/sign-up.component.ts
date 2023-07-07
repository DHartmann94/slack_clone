import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Firestore, addDoc, collection, getDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  //user: User = new User();
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
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),

    confirmPassword: new FormControl('', [
      Validators.required,
      this.matchPassword.bind(this)
    ]),
  });

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
  }

  matchPassword(control: AbstractControl): ValidationErrors | null {
    const password = control.root.get('password');
    const confirmPassword = control.value;

    if (password && confirmPassword && password.value !== confirmPassword) {
      return { mismatch: true };
    }

    return null;
  }

  async signUp() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    }
    this.isSignUp = true;
    this.signUpForm.disable();

    await this.sendUserToAuthenticator();
    await this.sendUserToFirebase();

    setTimeout(() => {
      this.signUpForm.reset();
      this.signUpForm.enable();
      this.isSignUp = false;
      this.submitted = false;
    }, 3000);
  }

  async sendUserToAuthenticator() {

  }

  async sendUserToFirebase() {
    let data = {
      name: this.signUpForm.value.name,
      email: this.signUpForm.value.email,
    }
    const user = new User(data);

    const usersCollection = collection(this.firestore, 'users');
    addDoc(usersCollection, user.toJSON()).then(async (result) => {
      await getDoc(result);
    });
  }

}
