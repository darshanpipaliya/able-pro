import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { InputNumberModule } from 'primeng/inputnumber';
import { SharedModule } from '../demo/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    SharedModule,
    MatDialogModule,
    InputNumberModule
  ],
  declarations: []
})
export class AuthenticationModule { }
