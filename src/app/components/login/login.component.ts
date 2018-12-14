import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from 'src/app/auth/auth.service';
import { ErrorComponent } from '../shared/error/error.component';
import { LoginModel } from '../../models/login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.compose([
      Validators.required, Validators.minLength(5)
    ])]
  });
  _messageError: string;

  constructor(private fb: FormBuilder,
    private _as: AuthService, private router: Router,
    public _dialogError: MatDialog) { }

  onSubmit() {
    const loginData: LoginModel = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };
    this._as.login(loginData.username, loginData.password)
      .subscribe(
        res => {
          if (!res.msj) {
            localStorage.setItem('token', JSON.stringify(res.data.rows));
            localStorage.setItem('user', JSON.stringify(loginData));
            this.router.navigate(['/']);
          } else {
              this._messageError = res.msj;
              console.log(this._messageError);
              this.openDialog();
              return;

          }
        },
        err => {
          console.error(err);
          this._messageError = err.error.message;
        }
      );
  }

  openDialog(): void {
    const dialogRef = this._dialogError.open(ErrorComponent, {
      data: {
        Message: this._messageError
      }
    });
  }
}
