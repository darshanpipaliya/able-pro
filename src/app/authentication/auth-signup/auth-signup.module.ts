import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthSignupRoutingModule } from './auth-signup-routing.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AuthSignupRoutingModule,
    SharedModule
  ],
  declarations: []
})
export class AuthSignupModule { }
