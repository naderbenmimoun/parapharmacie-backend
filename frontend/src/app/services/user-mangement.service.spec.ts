import { TestBed } from '@angular/core/testing';

import { UserMangementService } from './user-mangement.service';

describe('UserMangementService', () => {
  let service: UserMangementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserMangementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
