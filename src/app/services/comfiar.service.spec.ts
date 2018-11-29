import { TestBed } from '@angular/core/testing';

import { ComfiarService } from './comfiar.service';

describe('ComfiarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComfiarService = TestBed.get(ComfiarService);
    expect(service).toBeTruthy();
  });
});
