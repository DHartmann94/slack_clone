import { TestBed } from '@angular/core/testing';

import { DirectMessageToUserDataResolverService } from './direct-messsage-to-user-data-resolver.service';

describe('DirectChatDataResolverService', () => {
  let service: DirectMessageToUserDataResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectMessageToUserDataResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
