import { TestBed } from '@angular/core/testing';

import { ChatExtendService } from './chat-extend.service';

describe('ChatExtendService', () => {
  let service: ChatExtendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatExtendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
