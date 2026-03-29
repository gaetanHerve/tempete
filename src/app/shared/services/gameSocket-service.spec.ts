import { TestBed } from '@angular/core/testing';

import { GameSocketService } from './gameSocket-service';

describe('WebsocketService', () => {
  let service: GameSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
