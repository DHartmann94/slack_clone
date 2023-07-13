import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { getAuth, fetchSignInMethodsForEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /*------ Validator-Functions ------*/
  async checkEmailExists(emailLowerCase: string) {
    const auth = getAuth();

    try {
      const emailResult = await fetchSignInMethodsForEmail(auth, emailLowerCase);

      if (emailResult.length > 0) {
        return true;
      }

      return false;;

    } catch (error) {
      console.log('Error: ', error);
      return true;
    }
  }

  matchPassword(control: AbstractControl): ValidationErrors | null {
    const passwordControl = control.get("password");
    const confirmPasswordControl = control.get("confirmPassword");

    if (passwordControl && confirmPasswordControl) {
      const password: string = passwordControl.value;
      const confirmPassword: string = confirmPasswordControl.value;

      if (password !== confirmPassword) {
        return { mismatch: true };
      }
    }

    return null;
  }
}
