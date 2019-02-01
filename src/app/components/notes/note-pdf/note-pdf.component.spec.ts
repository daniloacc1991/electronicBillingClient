import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material';

import { NotePdfComponent } from './note-pdf.component';

describe('NotePdfComponent', () => {
  let component: NotePdfComponent;
  let fixture: ComponentFixture<NotePdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotePdfComponent ],
      imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
