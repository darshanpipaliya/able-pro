import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthSignupComponent} from './auth-signup.component';
import { LogoutComponent } from './logout/logout.component';

const routes: Routes = [
  {
    path: '',
    component: AuthSignupComponent
  },
  {
    path: 'logout',
    component: LogoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthSignupRoutingModule { }
