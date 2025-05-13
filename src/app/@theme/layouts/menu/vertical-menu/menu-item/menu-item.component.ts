// Angular import
import { Component, OnInit, inject, input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Project import
import { NavigationItem } from 'src/app/@theme/types/navigation';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { rolePermission } from 'src/app/services/helper';


@Component({
  selector: 'app-menu-item',
  imports: [RouterModule, SharedModule, CommonModule],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemVerticalComponent implements OnInit {
  private themeService = inject(ThemeLayoutService);

  // public props
  readonly item = input.required<NavigationItem>();
  readonly parentRole = input<string[]>();

  isEnabled: boolean = true;

  setHiddenFn(data: any) {
    if (data) {
      data.map((n: any) => {
        const a = n;
        a['hidden'] = !rolePermission(n.role);
        if (n.children) {
          this.setHiddenFn(n.children);
        }
        return a;
      });
    }
  }

  constructor(public router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // this.setHiddenFn(this.item.children);
        if (!event.url.includes('/finances/remit-addresses') && (this.item()['url'] === '/finances/accounting' || this.item()['url'] === '/finances/remit-addresses')) {
          this.item()['url'] = '/finances/accounting';
        }
        if (!event.url.includes('/management/tem') && this.item()['url'] === 'management/tem/users') {
          this.item()['url'] = 'management/tem';
        }

        if (!event.url.includes('/management/products/products') && (
          this.item()['url'] === '/management/products/products' ||
          this.item()['url'] === '/management/products/structure' ||
          this.item()['url'] === '/management/products/service-type-attributes')) {
          this.item()['url'] = '/management/products/products';
        }


        if (event.url.includes('/invoices/remit-addresses') && this.item()['url'] === '/invoices/billing-account') {
          this.item()['url'] = '/invoices/remit-addresses';
        }
        if (event.url.includes('/invoices/billing-account') && this.item()['url'] === '/invoices/remit-addresses') {
          this.item()['url'] = '/invoices/billing-account';
        }

        if ((!event.url.includes('/invoices/remit-addresses') && !event.url.includes('/invoices/billing-account')) && (this.item()['url'] === '/invoices/billing-account' || this.item()['url'] === '/invoices/remit-addresses')) {
          this.item()['url'] = '/invoices/billing-account';
        }

        // organization
        if (!event.url.includes('organization') && this.item()['url'] === '/organization/company') {
          this.item()['url'] = '/organization/customer';
        }
        // people
        // if (!event.url.includes('people') && this.item()['url'] === '/people/users') {
        //     this.item()['url'] = '/people/contacts';
        // }
        // finances
        if (!event.url.includes('finances/cost-centers') && this.item()['url'] === '/finances/cost-center-repository') {
          this.item()['url'] = '/finances/cost-centers';
        }

        // invoice retrival
        if (!event.url.includes('invoices/invoice-retrieval') && this.item()['url'] === '/invoices/invoice-proccessing') {
          this.item()['url'] = '/invoices/invoice-retrieval';
        }
        // management
        if (!event.url.includes('management/vendors/vendors') && this.item()['url'] === '/management/vendors/billing-alias') {
          this.item()['url'] = '/management/vendors/vendors';
        }
        // Vendor - vendor
        if (!event.url.includes('vendors/vendors') && this.item()['url'] === '/vendors/billing-alias') {
          this.item()['url'] = '/vendors/vendors';
        }
        // Invoice
        if (!event.url.includes('invoices') && this.item()['url'] === 'invoices/cost-center-repository') {
          this.item()['url'] = 'invoices/cost-centers';
        }

        // ====================================================================//
        // organization
        if (event.url === '/organization/company' && this.item()['url'] === '/organization/customer') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/organization/customer' && this.item()['url'] === '/organization/company') {
          this.item()['url'] = event.url;
        }

        // people
        // if (event.url === '/people/users' && this.item()['url'] === '/people/contacts') {
        //     this.item()['url'] = event.url;
        // }
        // if (event.url === '/people/contacts' && this.item()['url'] === '/people/users') {
        //     this.item()['url'] = event.url;
        // }

        // finances
        if (event.url === '/finances/cost-center-repository' && this.item()['url'] === '/finances/cost-centers') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/finances/cost-centers' && this.item()['url'] === '/finances/cost-center-repository') {
          this.item()['url'] = event.url;
        }

        // Invoice Processing
        if (event.url === '/invoices/invoice-proccessing' && this.item()['url'] === '/invoices/invoice-retrieval') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/invoices/invoice-retrieval' && this.item()['url'] === '/invoices/invoice-proccessing') {
          this.item()['url'] = event.url;
        }

        // if (event.url === '/invoices/file-monitor' && this.item()['url'] === '/invoices/invoice-retrieval') {
        //     this.item()['url'] = event.url;
        // }

        // management
        if (event.url === '/management/vendors/billing-alias' && this.item()['url'] === '/management/vendors/vendors') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/management/vendors/vendors' && this.item()['url'] === '/management/vendors/billing-alias') {
          this.item()['url'] = event.url;
        }

        // Vendor > Vendor
        if (event.url === '/vendors/billing-alias' && this.item()['url'] === '/vendors/vendors') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/vendors/vendors' && this.item()['url'] === '/vendors/billing-alias') {
          this.item()['url'] = event.url;
        }

        // Invoice
        if (event.url === '/invoices/cost-center-repository' && this.item()['url'] === '/invoices/cost-centers') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/invoices/cost-centers' && this.item()['url'] === '/invoices/cost-center-repository') {
          this.item()['url'] = event.url;
        }

        // finance Accountitng
        if (event.url === '/finances/accounting' && this.item()['url'] === '/finances/remit-addresses') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/finances/remit-addresses' && this.item()['url'] === '/finances/accounting') {
          this.item()['url'] = event.url;
        }

        // Invoice Billing Acconunt
        if (event.url === '/invoices/billing-account' && this.item()['url'] === '/invoices/remit-addresses') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/invoices/remit-addresses' && this.item()['url'] === '/invoices/billing-account') {
          this.item()['url'] = event.url;
        }

        if (event.url === 'management/tem/users' && this.item()['url'] === '/management/tem') {
          this.item()['url'] = event.url;
        }
        if (event.url === '/management/tem' && this.item()['url'] === 'management/tem/users') {
          this.item()['url'] = event.url;
        }

        if (event.url === '/invoices/invoice-retrieval' && (this.item()['url'] === '/invoices/billing-account' || this.item()['url'] === '/invoices/remit-addresses')) {
          this.item()['url'] = '/invoices/billing-account';
        }


        // Product Section
        if ((event.url.includes('/management/products/products') || event.url.includes('/management/products/structure') || event.url.includes('/management/products/service-type-attributes')) &&
          (this.item()['url'] === '/management/products/products' ||
            this.item()['url'] === '/management/products/structure' ||
            this.item()['url'] === '/management/products/service-type-attributes')) {
          this.item()['url'] = event.url;
        }

        if (
          (
            !event.url.includes('/invoices/cost-center-repository') &&
            !event.url.includes('/invoices/cost-centers')) &&
          (this.item()['url'] === '/invoices/cost-center-repository' ||
            this.item()['url'] === '/invoices/cost-centers'
          )) {
          this.item()['url'] = '/invoices/cost-centers';
        }

        // manangement - vendor - vendor prodcut
        if (
          (event.url.includes('/management/vendors/vendor-products') ||
            event.url.includes('/management/vendors/charge-codes') ||
            event.url.includes('/management/vendors/charge-codes-group')
          ) &&
          (this.item()['url'] === '/management/vendors/vendor-products' ||
            this.item()['url'] === '/management/vendors/charge-codes' ||
            this.item()['url'] === '/management/vendors/charge-codes-group')
        ) {
          this.item()['url'] = event.url;
        }
        if (
          (event.url.includes('/finances/cost-centers') ||
            event.url.includes('/finances/cost-center-repository') ||
            event.url.includes('/finances/cost-center-structure')
          ) &&
          (this.item()['url'] === '/finances/cost-centers' ||
            this.item()['url'] === '/finances/cost-center-repository' ||
            this.item()['url'] === '/finances/cost-center-structure')
        ) {
          this.item()['url'] = event.url;
        }


        // Management - vendor - products
        if (
          (
            !event.url.includes('/management/vendors/charge-codes-group') &&
            !event.url.includes('/management/vendors/vendor-products') &&
            !event.url.includes('/management/vendors/charge-codes')
          ) &&
          (
            this.item()['url'] === '/management/vendors/charge-codes-group' ||
            this.item()['url'] === '/management/vendors/charge-codes' ||
            this.item()['url'] === '/management/vendors/vendor-products'
          )
        ) {
          this.item()['url'] = '/management/vendors/vendor-products';
        }
        // cost center
        if (
          (
            !event.url.includes('/finances/cost-centers') &&
            !event.url.includes('/finances/cost-center-repository') &&
            !event.url.includes('/finances/cost-center-structure')
          ) &&
          (
            this.item()['url'] === '/finances/cost-centers' ||
            this.item()['url'] === '/finances/cost-center-structure' ||
            this.item()['url'] === '/finances/cost-center-repository'
          )
        ) {
          this.item()['url'] = '/finances/cost-centers';
        }
      }

    });
  }

  ngOnInit() {
    if (this.router.url === '/finances/remit-addresses' && this.item()['url'] === '/finances/accounting') {
      this.item()['url'] = this.router.url;
    }
    if (this.router.url === '/invoices/remit-addresses' && this.item()['url'] === '/invoices/billing-account') {
      this.item()['url'] = this.router.url;
    }
    if (this.router.url === '/organization/company' && this.item()['url'] === '/organization/customer') {
      this.item()['url'] = this.router.url;
    }
    // if (this.router.url === '/people/users' && this.item.url === '/people/contacts') {
    //     this.item['url'] = this.router.url;
    // }
    if (this.router.url === '/finances/cost-center-repository' && this.item()['url'] === '/finances/cost-centers') {
      this.item()['url'] = this.router.url;
    }
    if (this.router.url === '/invoices/invoice-proccessing' && this.item()['url'] === '/invoices/invoice-retrieval') {
      this.item()['url'] = this.router.url;
    }
    if (this.router.url === '/management/vendors/billing-alias' && this.item()['url'] === '/management/vendors/vendors') {
      this.item()['url'] = this.router.url;
    }
    if (this.router.url === '/vendors/billing-alias' && this.item()['url'] === '/vendors/vendors') {
      this.item()['url'] = this.router.url;
    }
    if (this.router.url === '/invoices/cost-center-repository' && this.item()['url'] === '/invoices/cost-centers') {
      this.item()['url'] = this.router.url;
    }
    if (this.router.url === '/management/tem/users' && this.item()['url'] === '/management/tem') {
      this.item()['url'] = this.router.url;
    }

    if (
      (this.router.url === '/management/vendors/charge-codes' ||
        this.router.url === '/management/vendors/vendor-products' ||
        this.router.url === '/management/vendors/charge-codes-group') &&
      this.item()['url'] === '/management/vendors/vendor-products'
    ) {
      this.item()['url'] = this.router.url;
    }
    if (
      (this.router.url === '/finances/cost-center-repository' ||
        this.router.url === '/finances/cost-centers' ||
        this.router.url === '/finances/cost-center-structure') &&
      this.item()['url'] === '/finances/cost-centers'
    ) {
      this.item()['url'] = this.router.url;
    }

    if ((
      this.router.url === '/management/products/products' ||
      this.router.url === '/management/products/structure' ||
      this.router.url === '/management/products/service-type-attributes')
      &&
      (this.item()['url'] === '/management/products/products' ||
        this.item()['url'] === '/management/products/structure' ||
        this.item()['url'] === '/management/products/service-type-attributes')) {
      this.item()['url'] = this.router.url;
    }
  }

  // public method
  toggleMenu(event: MouseEvent) {
    if (window.innerWidth < 1025) {
      this.themeService.toggleSideDrawer();
    }

    const ele = event.target as HTMLElement;
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement as HTMLElement;
      const up_parent = ((parent.parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      const last_parent = (up_parent.parentElement as HTMLElement).parentElement as HTMLElement;
      if (last_parent.classList.contains('coded-submenu')) {
        up_parent.classList.remove('coded-trigger');
        up_parent.classList.remove('active');
      } else {
        const sections = document.querySelectorAll('.coded-hasmenu');
        for (let i = 0; i < sections.length; i++) {
          sections[i].classList.remove('active');
          sections[i].classList.remove('coded-trigger');
        }
      }

      if (parent.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}
