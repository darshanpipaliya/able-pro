import { RouterModule, Routes } from "@angular/router";
import { VendorsDatatableComponent } from "./vendors-datatable/vendors-datatable.component";
import { NgModule } from "@angular/core";



const routes: Routes = [
  {
    path: 'vendors',
    component: VendorsDatatableComponent
  },
  // {
  //   path: 'users',
  //   component: UserDatatableComponent
  // },
  // {
  //   path: 'billing-alias',
  //   component: BillingAliasComponent
  // }

];

@NgModule({
  imports: [RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class VendorsRoutingModule { }
