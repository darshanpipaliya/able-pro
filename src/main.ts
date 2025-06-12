import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { BasicAuthInterceptor } from 'src/app/@theme/helpers/basic-auth.interceptor';
import { ErrorInterceptor } from 'src/app/@theme/helpers/error.interceptor';
import { AppRoutingModule } from './app/app-routing.module';
import { SharedModule } from './app/demo/shared/shared.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { GuestModule } from './app/demo/layout/front';
import { AppComponent } from './app/app.component';
import { TokenInterceptor } from './app/services/token.interceptor';
import { PrimgModule } from './app/demo/shared/primeng.module';
import { LicenseManager } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey("Using_this_{AG_Grid}_Enterprise_key_{AG-054556}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{errata}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{errata}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{errata}_need_to_be_licensed___{errata}_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{4_February_2025}____[v3]_[01]_MTczODYyNzIwMDAwMA==1a1d8226fb72c992f0edf4966a83c05f");

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    importProvidersFrom(AppRoutingModule, SharedModule, BrowserModule, GuestModule, PrimgModule),
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    [provideHttpClient(withInterceptorsFromDi())],
    provideAnimations()
  ]
}).catch((err) => console.error(err));
