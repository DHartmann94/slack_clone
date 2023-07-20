import { TestBed } from '@angular/core/testing';

import { ChannelDataResolverService } from './channel-data-resolver.service';

describe('ChannelDataResolverService', () => {
  let service: ChannelDataResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelDataResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
