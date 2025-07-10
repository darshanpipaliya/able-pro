import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FinanceDashboardComponent } from "./finance-dashboard.component";
import { FinanceAccountingComponent } from "../finance-accounting/finance-accounting.component";
import { RemitAddressComponent } from "../remit-address/remit-address.component";
import { CostCenterComponent } from "../cost-center/cost-center.component";
import { CostCenterRepoComponent } from "../cost-center-repo/cost-center-repo.component";
import { CostCenterStructureModuleComponent } from "../cost-center-structure-module/cost-center-structure-module.component";

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
  {
    path: 'cost-centers',
    component: CostCenterComponent
  },
  {
    path: 'cost-center-repository',
    component: CostCenterRepoComponent
  },
  {
    path: 'cost-center-structure',
    component: CostCenterStructureModuleComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceDashboardRoutingModule { }
