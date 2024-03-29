import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthService } from './auth.service';
import { TokenStorage } from './token.storage';
import { AuthRoutingModule } from './auth-routing.module';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastrService, ToastrModule } from 'ngx-toastr';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AuthRoutingModule,
    InputSwitchModule,
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
  ],
  providers: [
    AuthService,
    TokenStorage,
    ToastrService
  ]
})
export class AuthModule { }
