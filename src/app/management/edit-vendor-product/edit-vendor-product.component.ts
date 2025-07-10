import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-edit-vendor-product',
  templateUrl: './edit-vendor-product.component.html',
  styleUrls: ['./edit-vendor-product.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective, AgGridTableComponent, AgGridModule]
})
export class EditVendorProductComponent implements OnInit, OnDestroy {
  @Input() productData: any;

  
  public columnDefs;
  public defaultColDef;
  public sideBar: any;
  public rowData: any = [];

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  dialogData: any;
  editProductForm: FormGroup;
  isProductFormSubmit: boolean = false;
  industries: any = [];
  vendors: any = [];
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  selectedTab: any = 0;
  activityDataSource: any = [];
  // activityDisplayedColumns: any = [];
  chargeLogsData: any = [];
  vendorCCGData: any = [];
  gridApi: any;
  gridColumnApi: any;
  reconList:any = [];
  reconDetails: any;

  isSuperTEMManager: any = false;
  isSuperTEMAdmin: any = false;
  productStructureId: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeRecon: Subject<any> = new Subject<any>();
  private _unsubscribeVendorproducttypesChangeLogs: Subject<any> = new Subject<any>();
  private _unsubscribeVendorproductCCG: Subject<any> = new Subject<any>();

  activityDisplayedColumns: any = ['Tab',
    'Section',
    'Field Name',
    'Action',
    'Previous Value',
    'New Value',
    'Time & Date',
    'Who'
  ];

  setDisableVendor: any = false;

  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onVendorProductById: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChargeCodeCellDoubleClickedEmit: EventEmitter<any> = new EventEmitter<any>();

  // @ViewChild('serviceTag') serviceTag: ElementRef<HTMLElement>;
  @ViewChild('serviceTag') serviceTag:ElementRef;
  saveButtonLoadder = false;
  maxChars = 100;
  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]

  constructor(
    private locationService: LocationService,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private fb: FormBuilder) {
    this.editProductForm = fb.group({
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      description: new FormControl(''),
      productTypeId: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
      vendorAccountId: new FormControl('', [Validators.required]),
      industryId: new FormControl('', [Validators.required]),
      serviceId: new FormControl('', [Validators.required]),
      serviceTypeId: new FormControl('', [Validators.required]),
      productId: new FormControl('', [Validators.required]),
      InventoryType: new FormControl(''),
      reconAssigmentId:  new FormControl('', [Validators.required]),
      keepForProduction:new FormControl(false)
    });
    // this.activityDisplayedColumns = ['vn','VPro', 'status', 'ind','Service', 'ServiceTyp','Pro','Protyp',  'crtby', 'crtdt', 'modfby', 'moddt'];
  
    this.columnDefs = [
      // {
      //   headerCheckboxSelection: true,
      //   checkboxSelection: true,
      //   floatingFilter: true,
      //   minWidth: 150,
      //   maxWidth: 50,
      //   width: 100,
      //   flex: 0,
      //   resizable: true,
      //   sortable: true,
      //   editable: false,
      //   filter: false,
      //   suppressColumnsToolPanel: true,
      // },
      {
        headerName: 'Group Name',
        children: [
          {
            field: 'GroupId',
            headerName: 'Group ID',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 140,
            flex: 0,
            filter: 'agTextColumnFilter',
          },
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 190,
            flex: 0
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 170,
            flex: 0
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'ChargeCodeOccurrence',
            filter: 'agTextColumnFilter',
            headerName: 'Charge Code Occurrence',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 225,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Group Info',
        children: [
          {
            field: 'PrimaryChargeCodeDisplay',
            filter: 'agTextColumnFilter',
            headerName: 'Primary?',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'RequiredChargeCodeDisplay',
            filter: 'agTextColumnFilter',
            headerName: 'Required?',
            columnGroupShow: 'open',
            editable: false,
            width: 140,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorBillingAliasName',
            filter: 'agTextColumnFilter',
            headerName: 'VBA',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 130,
            flex: 0
          },
          {
            field: 'VendorName',
            headerName: 'Vendor Name',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 130,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductName',
            filter: 'agTextColumnFilter',
            headerName: 'Vendor Product Name',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 210,
            flex: 0
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 140,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'GroupStatusValue',
            headerName: 'Status',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 140,
            flex: 0
          },
        ],
      }

    ];

    this.defaultColDef = {
      editable: true,
      sortable: true,
      minWidth: 100,
      filter: true,
      resizable: true,
      floatingFilter: true,
      flex: 1,
    };
    // this.sideBar = {
    //   toolPanels: ['columns', 'filters']
    // };
  }
  ngOnInit(): void {
    
    this.currentOpenEditPage.emit(true);
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.getProductById();
    this.reconAssigments();
    let id = this.productData?.VendorProductTypeId ? this.productData?.VendorProductTypeId : this.productData?.Id;
    if(id) {
      this.getVendorproducttypesChangeLogs(id);
    }
    // this.vendorProductChargeCodeGroups();
  }
  getProductById() {
    if (this.productData && (this.productData.VendorProductTypeId || this.productData?.Id)) {
      const id: any = this.productData.VendorProductTypeId ? this.productData.VendorProductTypeId : this.productData?.Id;;
      this.locationService.getVendorProductById(id).subscribe((data) => {
        if (data) {
          this.onVendorProductById.emit(data.Data);
          this.productStructureId = data.Data.ProductStructureId;
          this.getSelectedProductById(this.productStructureId);
          this.createFormInEditMode(data.Data);

          if(data.Data.IsChargeCodeGroupAttached == true || data.Data.IsInventoryAttached == true || data.Data.IsSBInvoiceAttached == true) {
            this.setDisableVendor = true;
          } 
        }
      });
    }
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'ChargeCodeCreatedDate' || key === 'ChargeCodeModificationDate') {
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

        let id = this.productData?.VendorProductTypeId ? this.productData?.VendorProductTypeId : this.productData?.Id;
        if(id) {
          data['VendorProductTypeId'] = id;
        }

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (paramsRequest.sortModel.length > 0) {
          
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }

        this._unsubscribeVendorproductCCG.next(null);
        this.locationService
          .vendorProductChargeCodeGroups(data)
          .pipe(takeUntil(this._unsubscribeVendorproductCCG))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
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

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  getVendorproducttypesChangeLogs(vendorProductTypeId: any){
    this._unsubscribeVendorproducttypesChangeLogs.next(null);
    this.locationService.getVendorproducttypesChangeLogs(vendorProductTypeId).pipe(takeUntil(this._unsubscribeVendorproducttypesChangeLogs)).subscribe((res: any) => {
      if(res.Success) {
        this.chargeLogsData = res?.Data.$values;
        _.map(this.chargeLogsData, (res: any) => {
          if (res['ModificationDate']) {
            const d = res;
            d['ModificationDate'] = moment(res['ModificationDate']).format('MM/DD/YYYY') + ' ' + this.getTime(res['ModificationDate']);
            return d;
          }
        });
      }
    })
  }

  getTime(date: any){
    let d = new Date(date);
    const timeZoneOffset = -0.5 * 60;
    const adjustedTime = new Date(d.getTime() + timeZoneOffset * 60 * 1000)
    return adjustedTime.getHours() + ':' + adjustedTime.getMinutes();
  }

  onCellDoubleClickedEvent($event: any) {
    if ($event.data) {
      this.onChargeCodeCellDoubleClickedEmit.emit($event.data)
    }
  }

  createFormInEditMode(data: any) {
    this.getAllProductData(data);
    let editProductrData: any = {};
    editProductrData.vendorAccountId = data.VendorAccountId ? data.VendorAccountId : '';
    editProductrData.productTypeId = data.ProductTypeId ? data.ProductTypeId : '';
    editProductrData.name = data.Name ? data.Name : '';
    editProductrData.description = data.Description ? data.Description : '';
    editProductrData.status = data.Status;
    editProductrData.industryId = data.IndustryId ? data.IndustryId : '';
    editProductrData.productId = data.ProductId ? data.ProductId : '';
    editProductrData.serviceId = data.ServiceId ? data.ServiceId : '';
    editProductrData.serviceTypeId = data.ServiceTypeId ? data.ServiceTypeId : '';
    editProductrData.InventoryType = data.InventoryType ? data.InventoryType : '';
    editProductrData.keepForProduction = data.KeepForProduction ? data.KeepForProduction : false;

    this.activityDataSource = data.VendorProductTypeLogs.$values;
    this.editProductForm.patchValue(editProductrData);
    if (!this.isSuperTEMAdmin) {
      this.editProductForm.disable();
    }
  }
  convertToDateTime(date: any) {
    if (date) {
      return moment(new Date(date)).format('MM/DD/YYYY h:mm a');
    } else {
      return null;
    }
  }
  getAllProductData = (data: any) => {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
      }
    });
    this.locationService.getIndustries().subscribe((data: any) => {
      if (data) {
        this.industries = data.Data.$values;
      }
    });

    this.callIndustry(data.IndustryId);
    this.callService(data.ServiceId);
    this.callServiceType(data.ServiceTypeId);
    this.callProduct(data.ProductId);
  }

  callIndustry(id: any, clear = false) {
    if (clear) {
      this.services = [];
      this.serviceTypes = [];
      this.products = [];
      this.productTypes = [];
      this.editProductForm.controls['serviceId'].setValue(null);
      this.editProductForm.controls['serviceTypeId'].setValue(null);
      this.editProductForm.controls['productId'].setValue(null);
      this.editProductForm.controls['productTypeId'].setValue(null);
    }
    // this.locationService.getServicesIndustry(id).subscribe((data) => {
    //   if (data && data.$values) {
    //     this.services = data.$values;
    //   }
    // }, error => {

    //   if(error.status === 404)
    //   {
    //     let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-circle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'No records found with the selected industry'
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
    //     dialogRef.afterClosed().subscribe(result => {
    //     });
    //   }
    // });
    let data = {
      "industryId": id,
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getServicesList(data).subscribe((data) => {
      if (data.Success) {
        this.services = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return
  }


  callService(id: any, clear = false) {
    if (clear) {
      this.serviceTypes = [];
      this.products = [];
      this.productTypes = [];
      this.editProductForm.controls['serviceTypeId'].setValue(null);
      this.editProductForm.controls['productId'].setValue(null);
      this.editProductForm.controls['productTypeId'].setValue(null);
    }
    const inddd = this.editProductForm.value.industryId ? this.editProductForm.value.industryId : this.productData.IndustryId;

    let data = {
      "industryId": inddd,
      "serviceId": id,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getServiceTypeList(data).subscribe((data) => {
      if (data.Success) {
        this.serviceTypes = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }

    });
    // this.locationService.getServiceServicetypes(id).subscribe((data) => {
    //   if (data && data.$values) {
    //     this.serviceTypes = data.$values;
    //   }
    // }, error => {

    //   if(error.status === 404)
    //   {
    //     let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-circle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'No records found with the selected service'
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
    //     dialogRef.afterClosed().subscribe(result => {
    //     });
    //   }
    // });
  }

  callServiceType(id: any, clear = false) {
    if (clear) {
      this.products = [];
      this.productTypes = [];
      this.editProductForm.controls['productId'].setValue(null);
      this.editProductForm.controls['productTypeId'].setValue(null);
    }
    const inddd = this.editProductForm.value.industryId ? this.editProductForm.value.industryId : this.productData.IndustryId;
    const sidd = this.editProductForm.value.serviceId ? this.editProductForm.value.serviceId : this.productData.ServiceId;

    let data = {
      "industryId": inddd,
      "serviceId": sidd,
      "serviceTypeId": id,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getProductList(data).subscribe((data) => {
      if (data.Success) {
        this.products = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });
    // this.locationService.getProductsServiceType(id).subscribe((data) => {
    //   if (data && data.$values) {
    //     this.products = data.$values;
    //   }
    // }, error => {
    //   if(error.status === 404)
    //   {
    //     let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-circle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'No records found with the selected service type'
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
    //     dialogRef.afterClosed().subscribe(result => {
    //     });
    //   }
    // });
  }

  reconAssigments() {
    this.locationService.ReconAssigments().pipe(takeUntil(this._unsubscribeRecon)).subscribe((res: any) => {
      if(res.Success) {
        this.reconList = res.Data.$values;
      }
    })
  }

  async getSelectedProductById(id: any) {
    this.locationService.getProductById(id).subscribe((data) => {
      if (data && data.Success) {
        this.reconDetails = data.Data;
        this.editProductForm.controls['reconAssigmentId'].setValue(this.reconDetails.ReconAssigmentsName);
      }
    });
  }

  callProductType(): void {
    let data = {
      "industryId": this.editProductForm.value.industryId,
      "serviceId": this.editProductForm.value.serviceId,
      "serviceTypeId": this.editProductForm.value.serviceTypeId,
      "productId": this.editProductForm.value.productId,
      "productTypeId": this.editProductForm.value.productTypeId
    }
    this.locationService.getproductStructureDetail(data).subscribe((res) => {
      if (res && res.Success) {
        const getReconValue:any = this.reconList.find((e: any) => {
          return e.Id == res.Data.$values[0].ReconAssigmentId;
        });
      
        this.editProductForm.controls['reconAssigmentId'].setValue(getReconValue.Assignment);
        this.productStructureId = res.Data.$values[0].Id;
      }
    });
  }

  callProduct(id: any) {
    this.productTypes = [];
    const inddd = this.editProductForm.value.industryId ? this.editProductForm.value.industryId : this.productData.IndustryId;

    const sidd = this.editProductForm.value.serviceId ? this.editProductForm.value.serviceId : this.productData.ServiceId;
    const stidd = this.editProductForm.value.serviceTypeId ? this.editProductForm.value.serviceTypeId : this.productData.ServiceTypeId;

    this.editProductForm.controls['productTypeId'].setValue(null);
    let data = {
      "industryId": inddd,
      "serviceId": sidd,
      "serviceTypeId": stidd,
      "productId": id,
      "productTypeId": null
    }
    this.locationService.getProductTypeList(data).subscribe((data) => {
      if (data.Success) {
        this.productTypes = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });
    // this.locationService.getProducttypes(id).subscribe((data) => {
    //   if (data && data.$values) {
    //     this.productTypes = data.$values;
    //   }
    // }, error => {
    //   if(error.status === 404)
    //   {
    //     let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-circle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'No records found with the selected product'
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
    //     dialogRef.afterClosed().subscribe(result => {
    //     });
    //   }
    // });
  }

  get f() : any {
    return this.editProductForm.controls;
  }
  updateProduct(): void {
    this.isProductFormSubmit = true;
    if (this.editProductForm.valid) {
      this.saveButtonLoadder = true;
      const data: any = this.editProductForm.value;
      const formData: any = {};
      formData.vendorAccountId = Number(data.vendorAccountId);
      formData.productTypeId = Number(data.productTypeId);
      formData.name = data.name;
      formData.description = data.description;
      formData.keepForProduction = data.keepForProduction;
      formData.productStructureId = this.productStructureId;
      formData.status = (data.status === 'true' || data.status === true) ? true : false;
      formData.reconAssigmentId =  this.reconList.find((f: any) => f.Assignment === data.reconAssigmentId).Id;
      let id = this.productData?.VendorProductTypeId ? this.productData?.VendorProductTypeId : this.productData?.Id;
    
      this.locationService.updateVendorProduct(id, formData).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          if(data.Success) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Successfully saved' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.onUserAddEvent.emit(true);
            });
          } else {
            this.ErrorWarningPopupOpen(data.Message);
          }
         
        }
      });
    }
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this._unsubscribeRecon.next(null);
    this._unsubscribeRecon.complete();
    this._unsubscribeVendorproducttypesChangeLogs.next(null);
    this._unsubscribeVendorproducttypesChangeLogs.complete();
    this._unsubscribeVendorproductCCG.next(null);
    this._unsubscribeVendorproductCCG.complete();
  }
}
