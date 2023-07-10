import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent implements OnInit {

  closeFiller: boolean = true;

  constructor() {

  }

  ngOnInit(): void {
    
  }

  close() {
    this.closeFiller = false;
  }

}
