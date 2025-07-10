import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryComponent } from './inventory/inventory.component';
import {MatTabsModule} from '@angular/material/tabs';


const routes: Routes = [
  {
    path: 'inventory',
    component: InventoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule,MatTabsModule]
})
export class ReconsiliationRoutingModule { }
