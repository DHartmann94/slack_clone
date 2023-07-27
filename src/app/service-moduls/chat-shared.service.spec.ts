import { TestBed } from '@angular/core/testing';
import { ChatSharedService } from './chat-shared.service';

describe('ChatDataResolverService', () => {
  let service: ChatSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
