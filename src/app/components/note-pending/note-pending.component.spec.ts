import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotePendingComponent } from './note-pending.component';

describe('NotePendingComponent', () => {
  let component: NotePendingComponent;
  let fixture: ComponentFixture<NotePendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotePendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotePendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
