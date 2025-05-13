import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { InventoryDashboardComponent } from './inventory-dashboard/inventory-dashboard.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
  
      {
        path: 'inventory',
        component: InventoryDashboardComponent
      },
      // {
      //   path: 'default',
      //   loadComponent: () => import('./default/default.component').then((c) => c.DefaultComponent),
      //   data: { roles: [Role.Admin, Role.User] }
      // },
      // {
      //   path: 'analytics',
      //   loadComponent: () => import('./analytics/analytics.component').then((c) => c.AnalyticsComponent),
      //   data: { roles: [Role.Admin] }
      // },
      // {
      //   path: 'finance',
      //   loadComponent: () => import('./finance/finance.component').then((c) => c.FinanceComponent),
      //   data: { roles: [Role.Admin] }
      // },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
