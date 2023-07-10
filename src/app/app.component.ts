import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'slack_clone';

  hideStartscreen = false;

  // ngOnInit(): void {
  //   setTimeout(() => {
  //       this.hideStartscreen = true;
  //   }, 3000);
  // }
}
