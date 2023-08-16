import { TestBed } from '@angular/core/testing';

import { DirectMessageToUserService } from './direct-message-to-user.service';

describe('DirectMessageToUserService', () => {
  let service: DirectMessageToUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectMessageToUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
