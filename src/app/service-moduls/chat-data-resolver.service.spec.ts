import { TestBed } from '@angular/core/testing';

import { ChatDataResolverService } from './chat-data-resolver.service';

describe('ChatDataResolverService', () => {
  let service: ChatDataResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatDataResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
