import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InvoicesModuleComponent } from "./invoices-module.component";
import { InvoiceRetrievalsComponent } from "../invoice-retrievals/invoice-retrievals.component";
import { InvoiceProccessingModuleComponent } from "../invoice-proccessing/invoice-proccessing-module.component";

const routes: Routes = [
  {
    path: 'invoice',
    component: InvoicesModuleComponent
  },
  {
    path: 'invoice-retrievals',
    component: InvoiceRetrievalsComponent
  },
  {
    path: 'invoice-retrieval',
    component: InvoiceRetrievalsComponent
  },
  {
    path: 'invoice-proccessing',
    component: InvoiceProccessingModuleComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
