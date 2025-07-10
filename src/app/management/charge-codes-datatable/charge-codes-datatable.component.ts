import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';0
import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';
import { AddVendorProductDialogComponent } from '../add-vendor-product-dialog/add-vendor-product-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { AddChargeCodeComponent } from '../add-charge-code/add-charge-code.component';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { EditChargeCodeComponent } from '../edit-charge-code/edit-charge-code.component';
import { ChargeCodesGroupDatatableComponent } from '../charge-codes-group-datatable/charge-codes-group-datatable.component';
import { AddChargeCodesGroupTabComponent } from '../add-charge-codes-group-tab/add-charge-codes-group-tab.component';
import { AddTemUserComponent } from '../add-tem-user/add-tem-user.component';
import { FilesUploadComponent } from 'src/app/common/files-upload/files-upload.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-charge-codes-datatable',
  templateUrl: './charge-codes-datatable.component.html',
  styleUrls: ['./charge-codes-datatable.component.scss'],
  standalone: true,
  imports : [SharedModule, PrimgModule, AddChargeCodeComponent, AgGridModule, AgGridTableComponent, EditChargeCodeComponent, ChargeCodesGroupDatatableComponent, AddChargeCodesGroupTabComponent, AddTemUserComponent, FilesUploadComponent]
})
export class ChargeCodesDatatableComponent implements OnInit {
  selectedButton: any = 'users';
  buttonOptions: any = [
    { 'label': 'Products', value: 'products', icon: "fa-box-open" },
    { 'label': "Charge Codes", value: 'charge', icon: "fa-copyright" },
    { 'label': 'Charge Codes Group', value: 'codegroup', icon: "fa-layer-group" },
  ];
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  selected: any = 0;
  girdDataCount = 0;
  userData: any;
  editProductsArray: any = [];
  addProductsArray: any = [];
  uploadProductsArray: any = [];
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
  editChargeCodeArray: any = [];
  addChargeCodeArray: any = [];
  addChargeCodeGroupTabArr: any = [];
  isSuperTEMManager: boolean = false;
  isShowCCG: boolean = false;
  public exportChargeCode: any;
  public exportChargeCodeDetail: any;
  saveButtonLoader = false;

  isDisabledExport = false;
  selectedVBA = '';
  selectedVBAs = [];
  vbaList = [];

  currentOpenEditPagevar = 'Table';

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeForgetPwd: Subject<any> = new Subject<any>();
  private _unsubscribeUnlockUser: Subject<any> = new Subject<any>();
  private _unsubscribeVerificationSend: Subject<any> = new Subject<any>();
  private _unsubscribeAssumeIdentity: Subject<any> = new Subject<any>();
  private _unsubscribeLogginUser: Subject<any> = new Subject<any>();
  private _unsubscribeVBACopy: Subject<any> = new Subject<any>();
  private _unsubscribeVBA: Subject<any> = new Subject<any>();

  gridApi: any;
  gridColumnApi: any;

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

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
        editable: false,
        filter: false,
        //autoHeight: true,
        suppressColumnsToolPanel: true,
      },


      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
            sortingField: 'VendorAccountName'
          },
          {
            field: 'VendorBillingAliasName',
            headerName: 'VBA',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            sortingField: 'VendorBillingAliasName'
          },
          {
            field: 'ParentVendorAccountName',
            headerName: 'Parent Vendor',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
            sortingField: 'ParentVendorAccountName'
          }
        ],
      },

      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeNm',
            headerName: 'Charge Code',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 203,
            flex: 0,
          },
          // {
          //   field: 'ChargeCodeDisplayName',
          //   headerName: 'Charge Code Display Name',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 250,
          //   flex: 0,
          // },

          {
            field: 'ChargeCodeDescription',
            headerName: 'Charge Code Description',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'ParentChargeCodeNm',
            headerName: 'Parent Charge Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
          },
          {
            field: 'ParentChargeCodeName',
            headerName: 'Parent Charge Code Name',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 256,
            flex: 0,
          }

        ],
      },
      {
        headerName: 'Types',
        children: [
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          },

          {
            field: 'ChargeCodeOccurrenceName',
            headerName: 'Charge Code Occurence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },

        ],
      },
      {
        headerName: 'Charge Code Groups',
        children: [
          {
            field: 'CountGroupId',
            headerName: 'Group Count',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 145,
            flex: 0,
          }]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'StatusValue',
            headerName: 'Charge Code Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 192,
            flex: 0,
          },
          {
            field: 'ChargeCodeOriginName',
            headerName: 'Origin',
            columnGroupShow: 'open',
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
            headerName: 'Created By',
            field: 'CreatedByUser',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'CreationDate', valueGetter(params: any) {
              return moment(params.data && params.data.CreationDate).format('MM/DD/YYYY');
            },
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 173,
            width: 173,
            flex: 0,
          },
          {
            headerName: 'Modified By',
            field: 'ModifiedByUser',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
          },
          {
            field: 'ModificationDate', valueGetter(params: any) {
              if (params.data && params.data.ModificationDate) {
                return moment(params.data.ModificationDate).format('MM/DD/YYYY');
              }
              return '';
            },
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 173,
            width: 173,
            flex: 0,
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
    //this.getTemuser();

    // this.getChargecode();
    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
          })
        }
      }
    });

    this.exportChargeCodeDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Charge Code"
      },
      ExportToExcel: true
    };
    this.exportChargeCode = this.exportChargeCodeDetail;

    this.getVBAlist();
  }

  getVBAlist() {

    let data: any = {}
    data['advanceFilter'] = [{
         "filterKey": "StatusDisplayValue",
         "filterOptionType1": "equals",
         "filterOptionValue1": 'Active',
         "filterOperationType": "AND",
         "filterOptionType2": null,
         "filterOptionValue2": null
     }];
     this.locationService
     .getVendorBillingAliasList(data)
     .pipe(takeUntil(this._unsubscribeVBA))
     .subscribe(
       async (data: any) => {
         this.vbaList = data.Data.$values;
       }
     );
   }


  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  copyChargeCode() {
    let data: any = {
     vendorBillingAliasId: this.selectedVBA,
     toVendorBillingAliasIds: this.selectedVBAs
    }
    this.saveButtonLoader = true;
    this.locationService.copyChargeCodeData(data).pipe(takeUntil(this._unsubscribeVBACopy))
    .subscribe(
      async (res: any) => {
       this.saveButtonLoader = false;
       if(!res.Success) {
         let errorData: any = {
           messgeType: 'error',
           title: 'Attention',
           titleClass: 'text-c-blue',
           icon: 'fas fa-exclamation-circle',
           iconClass: 'text-c-blue f-70',
           message: res.Message,
         };
         const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
           panelClass: 'error-warning',
           data: errorData,
         });
       } else {
        this.selectedVBA = '';
        this.selectedVBAs = [];
       }
     }
    );
 }


  onBtnExportDataAsExcel(): void {
    this.isDisabledExport = true;
    this.locationService
      .getChargecodesExcelData(this.exportChargeCode)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Charge Codes.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
       
        },
        error: error => {
          this.isDisabledExport = false;
        }
      });
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray :any= [];
        const filterArrayDate :any= [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'CreationDate' || key === 'ModificationDate') {
            arrDate = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.dateFrom) ? data.dateFrom.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateFrom']) ? data['condition1'].dateFrom.split(' ')[0].toString() : null,
              filterOptionValue1_2: (data && data.dateTo) ? data.dateTo.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateTo']) ? data['condition1']?.dateTo.split(' ')[0].toString() : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].dateFrom) ? data['condition2']?.dateFrom.split(' ')[0].toString() : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].dateTo) ? data['condition2']?.dateTo.split(' ')[0].toString() : null
            }
            filterArrayDate.push(arrDate);
          } else {
            arr = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: data['filter'] ? data['filter'] : data['condition1'].filter ? data['condition1'].filter : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: data['condition2']?.filter ? data['condition2']?.filter : null
            }
            filterArray.push(arr);
          }
        }
        let data: any = {
          StartRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          MaximumRows: 100
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k: any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this.exportChargeCode = { ...this.exportChargeCodeDetail, ...data };
        this.locationService
          .getChargecodesLogged(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
              this.girdDataCount = _.cloneDeep(data?.TotalCount);
              if (data && data.Data.$values.length > 0) {
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.success({
                  rowData: data.Data.$values,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }
            },
            (error) => {
              params.success({
                rowData: [],
                rowCount: 0
              });
              this.gridApi.showNoRowsOverlay();
            }
          );
      },
    };
    if (this.gridApi.api) {
      this.gridApi.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }

  // getChargecode() {
  //   this.rowData = [];
  //   this.stopSpinner = false;
  //   this.locationService.getChargecodes().subscribe((data) => {
  //     if(!data.$values.length){
  //       this.stopSpinner = true;
  //       let errorData: any = {
  //         messgeType: "error",
  //         title: "Attention",
  //         titleClass: "text-c-blue",
  //         icon: "fas fa-exclamation-circle",
  //         iconClass: "text-c-blue f-70",
  //         message: "There is no records found for the charge codes"
  //       }
  //       const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
  //       dialogRef.afterClosed().subscribe(result => {
  //       });
  //     }
  //     if (data && data.$values) {
  //       this.rowData = data.$values;
  //       this.stopSpinner = true;
  //     }
  //   }, error => {
  //     this.stopSpinner = true;
  //     if (error.status === 404) {
  //       let errorData: any = {
  //         messgeType: "error",
  //         title: "Attention",
  //         titleClass: "text-c-blue",
  //         icon: "fas fa-exclamation-circle",
  //         iconClass: "text-c-blue f-70",
  //         message: "There is no records found for the charge codes"
  //       }
  //       const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
  //       dialogRef.afterClosed().subscribe(result => {
  //       });
  //     }
  //   });
  // }

  changeTab(event: any) {
    this.selected = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  addChargeCode() {
    this.addChargeCodeArray.push({ name: 'New', chargeCodeData: '' });
    this.setSelectedTab('addChargeCode');
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
      let user :any = {};
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

  onChargeCodeCellDoubleClickedEmit($event: any) {
    if ($event) {
      this.isShowCCG = true;
      this.userData = $event;
      // setTimeout(() => {
        this.selected = this.editChargeCodeArray.length ? this.editChargeCodeArray.length + 1 : 1;
      // }, 0);
    }
  }

  removeChargeCodeTab1(){
    this.selected = 0;
    this.isShowCCG = false;
  }

  onChargeCodeCellDoubleClicked($event: any) {
    if ($event.data) {
      this.editChargeCodeArray.push($event.data);
      setTimeout(() => {
        this.selected = this.editChargeCodeArray.length;
      }, 0);
    }
  }
  removeChargeCodeTab(index: any) {
    this.editChargeCodeArray.splice(index, 1);
    this.editChargeCodeArray = _.cloneDeep(this.editChargeCodeArray);
  }
  removeAddChargeCodeTab(index: any) {
    this.addChargeCodeArray.splice(index, 1);
    this.addChargeCodeArray = _.cloneDeep(this.addChargeCodeArray);
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
    const data: any = { 'email': email }
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
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      },
      error: error => {
        // if (error.status === 200) {
        // this.locationService.showToster({ type: 'error', message: 'Something Wrong' });
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: error.error.text //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        // }
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
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
              message: 'Email verification sent successfully' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
            VendorUser: result.VendorUser
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
      this.locationService.getUserRoles().subscribe((roles) => {
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
      this.selected = this.uploadProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length;
    } else if (from === 'addChargeCodeGroup') {
      this.selected = this.uploadProductsArray.length + this.editChargeCodeArray.length + this.addProductsArray.length + this.addChargeCodeGroupTabArr.length;
    } else if (from === 'addChargeCode') {
      this.selected = this.editChargeCodeArray.length + this.addChargeCodeArray.length;
    }
  }

  goToPage(to: any) {
    if (to === 'products') {
      this.router.navigate(['/management/vendors/vendor-products']);
    } else if (to === 'charge') {
      this.router.navigate(['/management/vendors/charge-codes']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'vendors') {
      this.router.navigate(['/management/vendors/vendors']);
    } else if (to === 'billing-alias') {
      this.router.navigate(['/management/vendors/billing-alias']);
    } else if (to === 'codegroup') {
      this.router.navigate(['/management/vendors/charge-codes-group']);
    }
  }

  uploadProductsData() {
    this.uploadProductsArray.push({ name: 'New' });
    this.setSelectedTab('uploadProducts');
  }

  removeUploadPage(index: any) {
    this.uploadProductsArray.splice(index, 1);
    this.uploadProductsArray = _.cloneDeep(this.uploadProductsArray);
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
      //this.getTemuser();
      this.onAgGridReady(this.gridApi);
    }
  }

  onUserAddEventChargeCode($event: any, index: any, bool: any) {

    if ($event) {
      if (bool === 'add') {
        this.addProductsArray.splice(index, 1);
        this.addProductsArray = _.cloneDeep(this.addProductsArray);
      } else {
        this.editChargeCodeArray.splice(index, 1);
        this.editChargeCodeArray = _.cloneDeep(this.editChargeCodeArray);
      }
      this.onAgGridReady(this.gridApi);
    }
  }

  onAddChargeCodeComponentDestroy(data: any, i: any) {
    this.addChargeCodeArray[i].chargeCodeData = data;
  }

  addChargeCodeGroupTab(chargeCodeData: any, i: any) {
    this.addChargeCodeGroupTabArr.push({ chargeCodeData: chargeCodeData });
    this.setSelectedTab('addChargeCodeGroup');
  }
  removeChargeCodeGroupTab(index: any ) {
    this.addChargeCodeGroupTabArr.splice(index, 1);
    this.addChargeCodeGroupTabArr = _.cloneDeep(this.addChargeCodeGroupTabArr);
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
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
    this._unsubscribeVBACopy.next(null);
    this._unsubscribeVBACopy.complete();
    this._unsubscribeVBA.next(null);
    this._unsubscribeVBA.complete();
  }

}

