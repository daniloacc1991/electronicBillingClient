import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ComfiarService } from '../../services/comfiar.service';

import { LoginModel } from '../../models/login';

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

  constructor(public _dialogRef: MatDialogRef<LoginComfiarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder,
    private _cs: ComfiarService) {
      this._dialogRef.disableClose = true;
    }

  ngOnInit() {
  }

  onClick(): void {
    const loginData: LoginModel = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };
    this._cs.loginComfiar( this.loginForm.value.username, this.loginForm.value.password).subscribe(
      res => {
        console.log(res);
        localStorage.setItem('user', JSON.stringify(loginData));
        this._dialogRef.close('Echo');
      },
      err => {
        console.error(err);
      }
    );
  }

}
