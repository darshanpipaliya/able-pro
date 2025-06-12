import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FinanceDashboardComponent } from "./finance-dashboard.component";
import { FinanceAccountingComponent } from "../finance-accounting/finance-accounting.component";
import { RemitAddressComponent } from "../remit-address/remit-address.component";

const routes: Routes = [
  {
    path: 'dashboard',
    component: FinanceDashboardComponent
  },
  {
    path: 'accounting',
    component: FinanceAccountingComponent
  },
  {
    path: 'remit-addresses',
    component: RemitAddressComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceDashboardRoutingModule { }
