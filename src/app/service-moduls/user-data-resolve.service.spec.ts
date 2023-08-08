import { TestBed } from '@angular/core/testing';

import { UserDataResolveService } from './user-data-resolve.service';

describe('UserDataResolveService', () => {
  let service: UserDataResolveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDataResolveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
