// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import
import { AdminComponent } from './demo/layout/admin';
import { EmptyComponent } from './demo/layout/empty/empty.component';

import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: EmptyComponent,
    children: [
      {
        path: '',
        redirectTo: 'auth/signin',
        pathMatch: 'full'
      },
      {
        path: 'auth',
        loadChildren: () => import('./authentication/authentication.module').then(module => module.AuthenticationModule)
      },
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/auth/authentication-1/login/login.component').then((c) => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/auth/authentication-1/register/register.component').then((c) => c.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./demo/pages/auth/authentication-1/forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent)
      },
      {
        path: 'maintenance',
        loadChildren: () => import('./demo/pages/maintenance/maintenance.module').then((m) => m.MaintenanceModule)
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./demo/pages/maintenance/error-401/error-401.component').then((c) => c.Error401Component)
      }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./demo/pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./demo/pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'organization',
        loadChildren: () => import('./customer/customer.module').then(module => module.CustomerModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'locations',
        loadChildren: () => import('./location/location.module').then(module => module.LocationModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'people',
        loadChildren: () => import('./people/people.module').then(module => module.PeopleModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'vendors',
        loadChildren: () => import('./vendors/vendors.module').then(module => module.VendorsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'finances',
        loadChildren: () => import('./finance-dashboard/finance-dashboard.module').then(module => module.FinanceDashboardModule),
        canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./demo/pages/maintenance/error/error.component').then((c) => c.ErrorComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
