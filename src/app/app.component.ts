import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'slack_clone';
  isLogoutContainerOpen: boolean = false;
  isProfileCardOpen: boolean = false;
  isEditProfileCardOpen: boolean = false;

  onlyLogo = false;

  ngOnInit(): void {
    setTimeout(() => {
        this.onlyLogo = true;
    }, 3000);
  }
}
