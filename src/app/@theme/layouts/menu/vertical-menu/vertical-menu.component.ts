// Angular import
import { Component, effect, inject, input } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// project import
import { NavigationItem } from 'src/app/@theme/types/navigation';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { HORIZONTAL, VERTICAL, COMPACT } from 'src/app/@theme/const';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MenuGroupVerticalComponent } from './menu-group/menu-group.component';
import { MenuItemVerticalComponent } from './menu-item/menu-item.component';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { MenuCollapseComponent } from './menu-collapse/menu-collapse.component';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from 'src/app/profile-dialog/profile-dialog.component';
import { rolePermission } from 'src/app/services/helper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-vertical-menu',
  imports: [SharedModule, MenuGroupVerticalComponent, MenuItemVerticalComponent, MenuCollapseComponent, RouterModule],
  templateUrl: './vertical-menu.component.html',
  styleUrls: ['./vertical-menu.component.scss']
})
export class VerticalMenuComponent {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private themeService = inject(ThemeLayoutService);
  authenticationService = inject(AuthenticationService);
  userInfo: any;
  userRole: any = 'No role';
  profileImageSrc: any = '';
  public windowWidth: number;
  // public props
  readonly menus = input<NavigationItem[]>();
  showUser: false;
  showContent = true;
  direction: string = 'ltr';

  // Constructor
  constructor(private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private variableManageService: VariableManageService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router) {
    effect(() => {
      this.updateThemeLayout(this.themeService.layout());
    });
    effect(() => {
      this.isRtlTheme(this.themeService.directionChange());
    });

    this.windowWidth = window.innerWidth;
  }

  // public method
  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  private updateThemeLayout(layout: string) {
    if (layout == VERTICAL) {
      this.showContent = true;
    }
    if (layout == HORIZONTAL) {
      this.showContent = false;
    }
    if (layout == COMPACT) {
      this.showContent = false;
    }
  }

  private isRtlTheme(direction: string) {
    this.direction = direction;
  }

  // user Logout
  logout() {
    this.sessionStorageService.clearSessionObjects();
    this.localStorageService.clearSessionObjects();
    this.router.navigate(['/auth/signin']);
  }


  openProfileDialog() {

    if (!this.variableManageService.profileDialog) {
      this.variableManageService.profileDialog = true;
      const dialogRef = this.dialog.open(ProfileDialogComponent, {
        panelClass: 'width-665',
        data: { name: 'Test', animal: 'Animal' }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.variableManageService.profileDialog = false;
      });
    }

  }

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

  ngOnInit() {

    this.userInfo = this.sessionStorageService.getObjectValue('userInfo') ? this.sessionStorageService.getObjectValue('userInfo') : this.localStorageService.getObjectValue('userInfo') ? this.localStorageService.getObjectValue('userInfo') : null;
    const userRoles = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : null;
    userRoles.forEach((role: any) => {
      switch (role) {
        case 'SuperTEM':
          this.userRole = 'Super TEM';
          break;
        case 'SuperTEMAdmin':
          this.userRole = 'Super TEM Admin';
          break;
        case 'SuperTEMManager':
          this.userRole = 'Super TEM Manager';
          break;
        case 'SuperTEMUser':
          this.userRole = 'Super TEM User';
          break;
        case 'CompanyUser':
          this.userRole = 'Company User';
          break;
        case 'CompanyManager':
          this.userRole = 'Company Manager';
          break;
        case 'CompanyAdmin':
          this.userRole = 'Company Admin';
          break;
        case 'CustomerAdmin':
          this.userRole = 'Customer Admin';
          break;
        case 'VendorUser':
          this.userRole = 'Vendor User';
          break;
        case 'TEMAdmin':
          this.userRole = 'TEM Admin';
          break;
        case 'TEMManager':
          this.userRole = 'TEM Manager';
          break;
        case 'TEMUser':
          this.userRole = 'TEM User';
          break;
        default:
          break;
      }
    });
    if (this.userInfo.userImage && this.userInfo.userImage.ImageData) {
      const imageData = this.userInfo.userImage.ImageData;
      let objectURL = 'data:image/png;base64,' + imageData;
      this.profileImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    } else {
      this.profileImageSrc = 'assets/images/addu2.png';
    }

  }


}
