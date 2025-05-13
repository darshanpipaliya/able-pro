import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignoutComponent } from './signout/signout.component';

const routes: Routes = [
  {
    path: '',
    component: SignoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthSignoutRoutingModule { }
