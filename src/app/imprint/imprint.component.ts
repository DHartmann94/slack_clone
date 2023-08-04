import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent {
  
    constructor(
      private location: Location
    ) { }
  
    navigateBack() {
      this.location.back();
    }
}
