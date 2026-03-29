import { TestBed } from '@angular/core/testing';

import { CardAPIService } from './card-api-service';

describe('CardService', () => {
  let service: CardAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
