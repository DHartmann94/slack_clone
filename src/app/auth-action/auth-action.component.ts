import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth-action',
  templateUrl: './auth-action.component.html',
  styleUrls: ['./auth-action.component.scss']
})
export class AuthActionComponent implements OnInit {
  mode: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = '';
      this.mode = params['mode'];
      
      if (this.mode === 'verifyEmail') {
      } else if (this.mode === 'resetPassword') {
      } else {
        this.mode = 'ERROR';
        console.log('ERROR read email mode!', this.mode);
      }
    });
  }

}
