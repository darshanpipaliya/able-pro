import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthProfileSettingsRoutingModule } from './auth-profile-settings-routing.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AuthProfileSettingsRoutingModule,
    SharedModule
  ],
  declarations: []
})
export class AuthProfileSettingsModule { }
