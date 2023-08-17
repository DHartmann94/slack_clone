import { Component, OnInit } from '@angular/core';
import {ThreadDataInterface, ThreadDataService} from "../service-moduls/thread.service";
import { ThreadDirectDataInterface, ThreadDirectService } from '../service-moduls/thread-direct.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})

export class BoardComponent implements OnInit {
  

  constructor(
    public threadDataService: ThreadDataService,
    public threadDirectDataService: ThreadDirectService,
  ) { }

  ngOnInit(): void {
    
  }
}
