import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersDatatableComponent } from './users-datatable/users-datatable.component';
import { TemDatatableComponent } from './tem-datatable/tem-datatable.component';
import { VendorProductsDatatableComponent } from './vendor-products-datatable/vendor-products-datatable.component';
import { VendorsDatatableComponent } from '../vendors/vendors-datatable/vendors-datatable.component';
import { ProductsDatatableComponent } from './products-datatable/products-datatable.component';
import { ChargeCodesDatatableComponent } from './charge-codes-datatable/charge-codes-datatable.component';
import { ProductStructureDatatableComponent } from './product-structure-datatable/product-structure-datatable.component';
import { BillingAliasComponent } from './billing-alias/billing-alias.component';
import { ServiceTypeAttributesComponent } from './service-type-attributes/service-type-attributes.component';
import { VendorChargeCodeGroupTableComponent } from './vendor-charge-code-group-table/vendor-charge-code-group-table.component';
import { ChargeTypeDatatableComponent } from './charge-type-datatable/charge-type-datatable.component';


const routes: Routes = [
  {
    path: 'tem',
    component: TemDatatableComponent
  },
  {
    path: 'tem/users',
    component: UsersDatatableComponent
  },
  {
    path: 'vendors/vendor-products',
    component: VendorProductsDatatableComponent
  },
  {
    path: 'vendors/vendors',
    component: VendorsDatatableComponent
  },
  {
    path: 'vendors/charge-codes',
    component: ChargeCodesDatatableComponent
  },
  {
    path: 'vendors/charge-codes-group',
    component: VendorChargeCodeGroupTableComponent,
  },
  {
    path: 'products/products',
    component: ProductsDatatableComponent
  },
  {
    path: 'products/structure',
    component: ProductStructureDatatableComponent
  },
  {
    path: 'products/charge-types',
    component: ChargeTypeDatatableComponent
  },
  {
    path: 'products/service-type-attributes',
    component: ServiceTypeAttributesComponent
  },
  {
    path: 'vendors/billing-alias',
    component: BillingAliasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
