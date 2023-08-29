import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  constructor() { }


  scrollToBottom(element: HTMLElement) {
    element.scrollTop = element.scrollHeight;
  }
}

