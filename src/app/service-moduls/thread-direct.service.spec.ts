import { TestBed } from '@angular/core/testing';

import { ThreadDirectService } from './thread-direct.service';

describe('ThreadDirectService', () => {
  let service: ThreadDirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreadDirectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
