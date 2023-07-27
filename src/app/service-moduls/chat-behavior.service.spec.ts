import { TestBed } from '@angular/core/testing';

import { ChatBehaviorService } from './chat-behavior.service';

describe('ChatBehaviorService', () => {
  let service: ChatBehaviorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatBehaviorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
