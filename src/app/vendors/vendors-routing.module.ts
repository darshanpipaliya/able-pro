import { RouterModule, Routes } from "@angular/router";
import { VendorsDatatableComponent } from "./vendors-datatable/vendors-datatable.component";
import { NgModule } from "@angular/core";
import { BillingAliasComponent } from "../billing-alias/billing-alias.component";

const routes: Routes = [
  {
    path: 'vendors',
    component: VendorsDatatableComponent
  },
  {
    path: 'billing-alias',
    component: BillingAliasComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class VendorsRoutingModule { }
