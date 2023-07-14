import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat.service';

describe('ChatService', () => {
  let chat: ChatService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    chat = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(chat).toBeTruthy();
  });
});
