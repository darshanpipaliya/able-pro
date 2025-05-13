import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthSignoutRoutingModule } from './auth-signout-routing.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AuthSignoutRoutingModule,
    SharedModule
  ],
  declarations: [ ]
})
export class AuthSignoutModule { }
