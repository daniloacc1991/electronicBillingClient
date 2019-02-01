import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material';

import { NoteResendComponent } from './note-resend.component';

describe('NoteResendComponent', () => {
  let component: NoteResendComponent;
  let fixture: ComponentFixture<NoteResendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteResendComponent ],
      imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteResendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
