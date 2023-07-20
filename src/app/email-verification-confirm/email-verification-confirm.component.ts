import { Component, OnInit } from '@angular/core';
import { applyActionCode, getAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-email-verification-confirm',
  templateUrl: './email-verification-confirm.component.html',
  styleUrls: ['./email-verification-confirm.component.scss']
})
export class EmailVerificationConfirmComponent implements OnInit {


  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.confirmEmail();
  }

  async confirmEmail() {
    const auth = getAuth();
    const code = this.route.snapshot.queryParams['oobCode'];

    await applyActionCode(auth, code)
      .then(() => {
        //how to update my backend based on the user's email
        console.log('Email verify?');
      })
      .catch((error: any) => {
        console.log('ERROR Email verify: ', error);
      });
  }

}
