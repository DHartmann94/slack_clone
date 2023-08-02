import { TestBed } from '@angular/core/testing';

import { ChatsServiceService } from './chats-service.service';

describe('ChatsServiceService', () => {
  let service: ChatsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
