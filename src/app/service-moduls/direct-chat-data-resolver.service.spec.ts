import { TestBed } from '@angular/core/testing';

import { DirectChatDataResolverService } from './direct-chat-data-resolver.service';

describe('DirectChatDataResolverService', () => {
  let service: DirectChatDataResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectChatDataResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
