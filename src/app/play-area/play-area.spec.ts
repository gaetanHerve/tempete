import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayArea } from './play-area';

describe('PlayArea', () => {
  let component: PlayArea;
  let fixture: ComponentFixture<PlayArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayArea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
