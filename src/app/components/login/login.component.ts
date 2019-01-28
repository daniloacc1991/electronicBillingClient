import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from 'src/app/auth/auth.service';
import { ErrorComponent } from '../shared/error/error.component';
import { UserComfiarModel } from '../../models/userComfiar';
import { delay } from 'rxjs/operators';

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
  _isLoading = false;

  constructor(private fb: FormBuilder,
    private _as: AuthService, private router: Router,
    public _dialogError: MatDialog) { }

  onSubmit() {
    this._isLoading = !this._isLoading;
    const loginData: UserComfiarModel = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };
    this._as.login(loginData.username, loginData.password)
      .pipe(
        delay(2000)
      )
      .subscribe(
        res => {
          const data = res.data;
          this._as.setToken(data);
          this.router.navigate(['/home']);
          this._isLoading = !this._isLoading;
        },
        err => {
          this._isLoading = !this._isLoading;
          console.error(err);
          this._messageError = 'Usuario y Contraseña Incorrectos.';
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
