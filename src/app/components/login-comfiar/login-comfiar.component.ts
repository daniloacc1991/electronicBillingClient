import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ComfiarService } from '../../services/comfiar.service';

import { UserComfiarModel } from '../../models';
import { delay } from 'rxjs/operators';

export interface DialogData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-comfiar',
  templateUrl: './login-comfiar.component.html',
  styleUrls: ['./login-comfiar.component.scss']
})
export class LoginComfiarComponent implements OnInit {
  loginForm = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.compose([
      Validators.required, Validators.minLength(5)
    ])]
  });
  _messageError: string;
  _isLoading = false;

  constructor(public _dialogRef: MatDialogRef<LoginComfiarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder,
    private _cs: ComfiarService) {
    this._dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  onSubmit() {

  }

  onClick(): void {
    this._isLoading = !this._isLoading;
    const loginData: UserComfiarModel = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };
    this._cs.loginComfiar(this.loginForm.value.username, this.loginForm.value.password)
      .pipe(
        delay(1000)
      )
      .subscribe(
        res => {
          this._isLoading = !this._isLoading;
          localStorage.setItem('userComfiar', JSON.stringify(loginData));
          localStorage.setItem('tokenComfiar', JSON.stringify(res.data.rows));
          this._dialogRef.close('Credenciales de COMFIAR Correctas!');
        },
        err => {
          this._isLoading = !this._isLoading;
          this._messageError = 'Usuario y Contraseña Incorrectos.';
          console.error(err);
        }
      );
  }

}
