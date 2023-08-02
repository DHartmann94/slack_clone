import { TestBed } from '@angular/core/testing';

import { MessageService } from './message.service';

describe('ChatService', () => {
  let chat: MessageService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    chat = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(chat).toBeTruthy();
  });
});
