import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Discard } from './discard';

describe('Discard', () => {
  let component: Discard;
  let fixture: ComponentFixture<Discard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Discard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Discard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
