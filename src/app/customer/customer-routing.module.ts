import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyDatatableComponent } from './company-datatable/company-datatable.component';
import { CustomerDatatableComponent } from './customer-datatable/customer-datatable.component';
import { ContractComponent } from './contracts/contracts.component';


const routes: Routes = [
  {
    path: 'company',
    component: CompanyDatatableComponent
  },
  {
    path: 'customer',
    component: CustomerDatatableComponent
  },
  {
    path: 'contracts',
    component: ContractComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
