import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComfiarComponent } from './login-comfiar.component';

describe('LoginComfiarComponent', () => {
  let component: LoginComfiarComponent;
  let fixture: ComponentFixture<LoginComfiarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComfiarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComfiarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
