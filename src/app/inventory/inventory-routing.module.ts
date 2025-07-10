import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WirelineDatatableComponent } from './wireline-datatable/wireline-datatable.component';
import { MobilityComponent } from '../mobility/mobility.component';


const routes: Routes = [
  {
    path: 'wireline',
    component: WirelineDatatableComponent
  },
  {
    path: 'mobility',
    component: MobilityComponent
  },
  {
    path: 'allinventory',
    component: WirelineDatatableComponent
  },
  {
    path: 'cloud',
    component: WirelineDatatableComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class InventoryRoutingModule { }
