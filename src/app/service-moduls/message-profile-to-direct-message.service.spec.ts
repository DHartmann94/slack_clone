import { TestBed } from '@angular/core/testing';

import { MessageProfileToDirectMessageService } from './message-profile-to-direct-message.service';

describe('MessageProfileToDirectMessageService', () => {
  let service: MessageProfileToDirectMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageProfileToDirectMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
