import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';
 
import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';
import { AddProductDialogComponent } from '../add-product-dialog/add-product-dialog.component';
import { AddVendorProductDialogComponent } from '../add-vendor-product-dialog/add-vendor-product-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
@Component({
  selector: 'app-billing-accounts-datatable',
  templateUrl: './billing-accounts-datatable.component.html',
  styleUrls: ['./billing-accounts-datatable.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent]
})
export class BillingAccountsDatatableComponent implements OnInit {
  selectedButton: any = 'users';
  buttonOptions: any = [
    { 'label': 'Billing-Accounts', value: 'billing' },
    { 'label': "Users", value: 'users' },
    { 'label': 'Products', value: 'products' },
    { 'label': "Charge Codes", value: 'charge' }
  ];
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  selected: any = 0;
  editProductsArray: any = [];
  addProductsArray: any = [];
  uploadProductsArray: any = [];
  chargeCodeGroupArray: any = [];
  sourceLeft = true;
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  filter = true;
  userAdd = '';
  disabled = false;
  users: any;
  customers: any;
  isUserSuperTemOrAdmin: any = false;
  isCompanyAdmin: any = false;
  isTEMManager: any = false;
  isSuperTEMAdmin: boolean = false;
  stopSpinner: any = false;
  private userState: any;
  private userId: any;
  isSuperTEMManager: boolean = false;
  private _unsubscribeForgetPwd: Subject<any> = new Subject<any>();
  private _unsubscribeUnlockUser: Subject<any> = new Subject<any>();
  private _unsubscribeVerificationSend: Subject<any> = new Subject<any>();
  private _unsubscribeAssumeIdentity: Subject<any> = new Subject<any>();
  private _unsubscribeLogginUser: Subject<any> = new Subject<any>();
  private _unsubscribeUserRoles: Subject<any> = new Subject<any>();
  private _unsubscribeVendorProducts: Subject<any> = new Subject<any>();


  constructor(private router: Router,
    private primengConfig: PrimeNGConfig,
    private locationService: LocationService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog) {

    this.userState = this.activatedRoute.paramMap.subscribe((data: any) => {
      this.userId = window.history.state && window.history.state.id ? window.history.state.id : null;
    });


    function CreatedDateFormatter(params: any) {
      if (params.data.CreationDate) {
        let date = new Date(params.data.CreationDate);
        return moment(date).format('MM/DD/YYYY');
      } else {
        return '';
      }
    }

    function modDateFormatter(params: any) {
      if (params.data.ModificationDate) {
        let date = new Date(params.data.ModificationDate);
        return moment(date).format('MM/DD/YYYY');
      }
      else {
        return '';
      }
    }


    this.columnDefs = [
      {
        //headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: true,
        filter: true,
        //autoHeight: true,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccount.AccountName',
            headerName: 'Vendor',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 140,
          },
        ],
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'Name',
            headerName: 'Vendor Product',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 140,
          },
          {
            field: 'Description',
            headerName: 'Description',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
          },

        ],
      },
      {
        headerName: 'Products Structure',
        children: [
          {
            field: 'ProductType.Name',
            headerName: 'Product Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          },
          {
            field: 'ProductType.Product.Name',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },

          {
            field: 'ProductType.Product.ServiceType.Name',
            headerName: 'Service Type',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'ProductType.Product.ServiceType.Service.Nmae',
            headerName: 'Service',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'ProductType.Product.ServiceType.Service.Industry.Name',
            headerName: 'Industry',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },

        ],
      },

      {
        headerName: 'Status',
        children: [
          {
            field: 'StatusValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
        ],
      },
      {
        headerName: 'History',
        children: [
          {
            valueGetter(params: any) {
              return params.data.CreatedByUser.FirstName + ' ' + params.data.CreatedByUser.LastName;
            }, suppressMenu: true,
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'CreationDate',
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 120,
            flex: 0,
            valueFormatter: CreatedDateFormatter,
          },
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
            cellRenderer: (params: any) => {
              return params.value ? params.value.FirstName + " " + params.value.LastName : '';
            }
          },
          {
            field: 'ModificationDate',
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 180,
            flex: 0,
            valueFormatter: modDateFormatter
          },
        ],
      },


    ];

    this.rowSelection = 'multiple';
    this.defaultColDef = {
      editable: true,
      sortable: true,
      minWidth: 100,
      filter: true,
      resizable: true,
      floatingFilter: true,
      flex: 1,
    };
    this.sideBar = {
      toolPanels: ['columns', 'filters']/* ,
      defaultToolPanel: 'columns', */
    };
  }

  ngOnInit(): void {
    this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();
    this.isTEMManager = this.locationService.isUserHasTEMManagerRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();

    this.primengConfig.ripple = true;
    this.getVendorProduct();

  }

  getVendorProduct() {
    this.stopSpinner = false;
    this._unsubscribeVendorProducts.next(null);
    this.locationService.getVendorProducts().pipe(takeUntil(this._unsubscribeVendorProducts)).subscribe((data) => {
      if (data) {
        this.rowData = data.Data.$values;
        this.stopSpinner = true;
      }
    }, error => {
      this.rowData = [];
      this.stopSpinner = true;
    });
  }




  addProduct() {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '450px',
      height: '450px',
      data: { name: 'Test', animal: 'Animal' }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  addVendorProduct() {
    const dialogRef = this.dialog.open(AddVendorProductDialogComponent, {
      panelClass: 'width-665',
      data: { name: 'Test', animal: 'Animal' }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onCellEditingStoppedEventForCL($event: any) {
    if ($event && $event.Email) {
      let user: any = {};
      user.Email = $event.Email;
      user.FirstName = $event.FirstName;
      user.LastName = $event.LastName;
      user.PrimaryLandline = $event.PrimaryLandline ? $event.PrimaryLandline : '';
      user.PrimaryMobile = $event.PrimaryMobile ? $event.PrimaryMobile : '';
      user.Active = $event.Active;
      user.BlockEmail = $event.BlockEmail;
      user.AccountId = $event.AccountId;
      user.MiddleInitial = $event.MiddleInitial;
      user.RolesToAssign = $event.Roles ? $event.Roles.$values : [];
      user.UserDefaultCompanyID = $event.CompanyID;
      this.locationService.editUser(user).subscribe((result) => {
      });
    }
  }


  onCellClicked($event: any) {
    // return false;
  }

  onCellDoubleClicked($event: any) {
    if ($event.data) {
      this.editProductsArray.push($event.data);
      this.setSelectedTab('editProducts');
    }
  }

  removeTab(index: any) {
    this.editProductsArray.splice(index, 1);
    this.editProductsArray = _.cloneDeep(this.editProductsArray);
  }

  removeUser(index: any) {
    this.addProductsArray.splice(index, 1);
    this.addProductsArray = _.cloneDeep(this.addProductsArray);
  }


  forgotPassword(email: any) {
    const data = { 'email': email }
    this._unsubscribeForgetPwd.next(null);
    this.locationService.forgetPwd(data).pipe(takeUntil(this._unsubscribeForgetPwd)).subscribe({
      next: data => {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Reset password link sent successfully' //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
      },
      error: error => {
        if (error.status === 200) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Something Wrong' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        }
      }
    });
  }

  unlockUser(email: any) {
    this._unsubscribeUnlockUser.next(null);
    this.locationService.unlockUser(email).pipe(takeUntil(this._unsubscribeUnlockUser)).subscribe((result) => {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: result //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
    })
  }


  sendEmailVerification(email: any) {
    this._unsubscribeVerificationSend.next(null);
    this.locationService.emailVerficiationSend(email).pipe(takeUntil(this._unsubscribeVerificationSend)).subscribe(() => {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'Email verification sent successfully' //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
    });
  }

  assumeIdentity(email: any) {
    this._unsubscribeAssumeIdentity.next(null);
    this.locationService.assumeIdentity(email).pipe(takeUntil(this._unsubscribeAssumeIdentity)).subscribe({
      next: data => {
        this.locationService.loginUser = data;
        this.sessionStorageService.setObjectValue('user', data);
        this.sessionStorageService.setObjectValue('token', data.Token);
        this.localStorageService.setObjectValue('user', data);
        this.localStorageService.setObjectValue('token', data.Token);
        this.getLoggedinUserInfo().then((allow) => {
          if (allow) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: 'User loggedin successfully' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning',  data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.router.navigate(['/dashboard/analytics']).then(() => {
                window.location.reload();
              });
            });
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: 'Please assign roles to the user' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          }
        });
      },
      error: error => {
        let errorMessage: any = '';
        if (error.status === 400) {
          errorMessage = "Bad request please try again later ";
        } else if (error.status === 401) {
          errorMessage = error.error.ErrorMessage;
        }
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: errorMessage//if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
      }
    });
  }

  getLoggedinUserInfo(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this._unsubscribeLogginUser.next(null);
      this.locationService.getLoggedinUserInfo().pipe(takeUntil(this._unsubscribeLogginUser)).subscribe((result) => {
        if (result && result.Roles && result.Roles.$values && result.Roles.$values.length > 0) {
          const userRoles = result.Roles.$values;
          const userInfo = {
            id: result.Id,
            email: result.Email,
            name: result.FullName,
            mobile: result.PrimaryMobile,
            landline: result.PrimaryLandline,
            userImage: result.UserProfileImage ? result.UserProfileImage : '',
            headerLogo: (result.CompanyLogo && result.CompanyLogo.ImageData) ? result.CompanyLogo.ImageData : (result.AccountLogo && result.AccountLogo.ImageData) ? result.AccountLogo.ImageData : '',
            VendorAccountName: result.VendorAccountName,
            VendorUser:result.VendorUser
          }
          this.sessionStorageService.setObjectValue('userInfo', userInfo);
          this.localStorageService.setObjectValue('userInfo', userInfo);
          this.sessionStorageService.setObjectValue('userRoles', userRoles);
          this.localStorageService.setObjectValue('userRoles', userRoles);
          return resolve(true);
        } else {
          return resolve(false);
        }
      });
    });
    return promise;
  }

  getUserRoles(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this._unsubscribeUserRoles.next(null);
      this.locationService.getUserRoles().pipe(takeUntil(this._unsubscribeUserRoles)).subscribe((roles) => {
        if (roles && roles.$values.length > 0) {
          const userRoles = roles.$values;
          this.sessionStorageService.setObjectValue('userRoles', userRoles);
          return resolve(true);
        } else {
          return resolve(false);
        }
      });
    });
    return promise;
  }

  setSelectedTab(from: any) {

    if (from === 'editProducts') {
      this.selected = this.editProductsArray.length;
    } else if (from === 'addProducts') {
      this.selected = this.editProductsArray.length + this.addProductsArray.length;
    } else if (from === 'uploadProducts') {
      this.selected = this.editProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length;
    } else if (from === 'chargeCode') {
      this.selected = this.editProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length + this.chargeCodeGroupArray.length;
    }
    // setTimeout(() => {
    //   $("div.listbox").find("button").removeClass('btn-primary');
    //   $("div.listbox").find("button").css("background-color", "rgb(207 207 207)");
    // }, 800);
  }

  goToPage(to: any) {
    if (to === 'charge') {
      this.router.navigate(['/management/vendors/charge-codes']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'vendors') {
      this.router.navigate(['/management/vendors/vendors']);
    }
  }

  addChargeCodeGroup() {
    this.chargeCodeGroupArray.push({ name: 'New', });
    this.setSelectedTab('chargeCode');
  }

  uploadProductsData() {
    this.uploadProductsArray.push({ name: 'New' });
    this.setSelectedTab('uploadProducts');
  }

  removeUploadPage(index: any) {
    this.uploadProductsArray.splice(index, 1);
    this.uploadProductsArray = _.cloneDeep(this.uploadProductsArray);
  }

  removeChargePage(index: any) {
    this.chargeCodeGroupArray.splice(index, 1);
    this.chargeCodeGroupArray = _.cloneDeep(this.chargeCodeGroupArray);
  }
  swapDirection() {
    this.sourceLeft = !this.sourceLeft;
    this.format.direction = this.sourceLeft ? DualListComponent.LTR : DualListComponent.RTL;
  }

  /*swapDirection() {
    this.sourceLeft = !this.sourceLeft;
    this.format.direction = this.sourceLeft ? DualListComponent.LTR : DualListComponent.RTL;
  }*/

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }


  onUserAddEvent(event: any, index: any) {
    if (event) {
      this.addProductsArray.splice(index, 1);
      this.addProductsArray = _.cloneDeep(this.addProductsArray);
    }
  }

  ngOnDestroy() {
    this._unsubscribeForgetPwd.next(null);
    this._unsubscribeForgetPwd.complete();
    this._unsubscribeUnlockUser.next(null);
    this._unsubscribeUnlockUser.complete();
    this._unsubscribeVerificationSend.next(null);
    this._unsubscribeVerificationSend.complete();
    this._unsubscribeAssumeIdentity.next(null);
    this._unsubscribeAssumeIdentity.complete();
    this._unsubscribeLogginUser.next(null);
    this._unsubscribeLogginUser.complete();
    this._unsubscribeUserRoles.next(null);
    this._unsubscribeUserRoles.complete();
    this._unsubscribeVendorProducts.next(null);
    this._unsubscribeVendorProducts.complete();
  }

}

var filterParams = {
  comparator: function (filterLocalDateAtMidnight: any, cellValue: any) {
    if (cellValue == null) return -1;

    let cellDate = moment(new Date(cellValue)).format('MM/DD/YYYY');
    let filterDate = moment(new Date(filterLocalDateAtMidnight)).format('MM/DD/YYYY');

    if (filterDate === cellDate) {
      return 0;
    }
    if (cellDate < filterDate) {
      return -1;
    }
    if (cellDate > filterDate) {
      return 1;
    }

    return 0;
  },
  browserDatePicker: true,
};