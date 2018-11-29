import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/auth.service';
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

  constructor(private fb: FormBuilder, private _as: AuthService, private router: Router) {}

  onSubmit() {
    const loginData: LoginModel = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    }
    this._as.login(loginData.username, loginData.password)
      .subscribe(
        res => {
          localStorage.setItem('token', JSON.stringify(res.data));
          localStorage.setItem('user', JSON.stringify(loginData));
          this.router.navigate(['/']);
        },
        err => {
          console.error(err);
        }
      )
  }
}
