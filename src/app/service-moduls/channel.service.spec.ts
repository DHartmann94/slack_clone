import { TestBed } from '@angular/core/testing';

import { ChannelDataService } from './channel.service';

describe('ChannelDataService', () => {
  let service: ChannelDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
