import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AngularDualListBoxModule, DualListComponent } from 'angular-dual-listbox';
import moment from 'moment';
import { EditProductChargecodegroupPopupComponent } from '../edit-product-chargecodegroup-popup/edit-product-chargecodegroup-popup.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';

@Component({
  selector: 'app-add-charge-code-group',
  templateUrl: './add-charge-code-group.component.html',
  styleUrls: ['./add-charge-code-group.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent, SpaceTrimStartEndInputirective,AngularDualListBoxModule]
})
export class AddChargeCodeGroupComponent implements OnInit {

  @Input() productData: any
  vendors: any;
  industries: any;
  services: any;
  serviceTypes: any;
  products: any;
  productTypes: any;
format: any = { add: 'Unselected Charge Codes', remove: 'Selected Charge Codes', all: 'Select All', none: 'Select None',
  };
  keepSorted = true;
  key: string;
  display: any;
  filter = true;
  source: any = [];
  confirmed: any = [];
  disabled = false;
  chargeCodes: any;
  @Output() closeChargeCodeTab = new EventEmitter<any>();
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;

  statusList = [
   { Id : true, Name : 'Active'},
   { Id : false, Name : 'Inactive'},
  ];
  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  stopSpinner: any = true;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeProductById: Subject<any> = new Subject<any>();
  private _unsubscribeVendorDropdown: Subject<any> = new Subject<any>();
  private _unsubscribeIndustries: Subject<any> = new Subject<any>();
  private _unsubscribeService: Subject<any> = new Subject<any>();
  private _unsubscribeServiceType: Subject<any> = new Subject<any>();
  private _unsubscribeProductVendor: Subject<any> = new Subject<any>();
  private _unsubscribeProductType: Subject<any> = new Subject<any>();
  private _unsubscribeChargeCodes: Subject<any> = new Subject<any>();

  constructor(private locationService: LocationService, public dialog: MatDialog,
  ) {
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
          headerName: 'Group Name',
          children: [
            {
              field: 'GroupName',
              headerName: 'Group ID',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 120,
              flex: 0
            },
          ],
        },

        {
          headerName: 'Vendor',
          children: [
            {
              field: 'VendorName',
              headerName: 'Vendor',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 150,
              flex: 0,
            },
          ],
        },
        {
          headerName: 'Vendor Product',
          children: [
            {
              field: 'VendorProductName',
              headerName: 'Vendor Product Name',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 230,
              flex: 0,
            },
            {
              field: 'VendorProductDescription',
              headerName: 'Vendor Product Description',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 260,
              flex: 0,
            },

            {
              field: 'StatusValue',
              headerName: 'Status',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 250,
              flex: 0,
            },
            {
              field: 'IndustryName',
              headerName: 'Industry',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 200,
              flex: 0,
            },
            {
              field: 'ServiceName',
              headerName: 'Service',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 200,
              flex: 0,
            },

            {
              field: 'ProductName',
              headerName: 'Product',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 250,
              flex: 0,
            },
            {
              field: 'ServiceTypeName',
              headerName: 'Service Type',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 250,
              flex: 0,
            },
            {
              field: 'ProductTypeName',
              headerName: 'Product Type',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 250,
              flex: 0,
            },

          ],
        },
        {
          headerName: 'Charge Code',
          children: [
            {
              field: 'ChargeCodeName',
              headerName: 'Charge Code',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 250,
              flex: 0,
            },
            {
              field: 'ChargeCodeDisplayName',
              headerName: 'Charge Code Display Name',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 250,
              flex: 0,
            },
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
              field: 'ChargeCodeType',
              headerName: 'Charge Code Type',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 150,
              flex: 0,
            },
            {
              field: 'ChargeCodeOrigin.Name',
              headerName: 'Charge Type',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 150,
              flex: 0,
            },
            {
              field: 'ChargeCodeOccurence',
              headerName: 'Charge code Occurence',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 250,
              flex: 0,
            },

          ],
        },

        {
          headerName: 'History',
          children: [
            {
              headerName: 'Created By',
              field: 'CreatedUserName',
              suppressMenu: true,
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 120,
              flex: 0,
            },
            {
              field: 'CreatedDate', valueGetter(params: any) {
                return moment(params.data.CreatedDate).format('MM/DD/YYYY');
              }, suppressMenu: true,
              headerName: 'Created Date',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 120,
              flex: 0,
            },
            {
              headerName: 'Modified By',
              field: 'ModifiedUserName',
              suppressMenu: true,
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 180,
              flex: 0,
            },
            {
              field: 'ModificationDate', valueGetter(params: any) {
                if (params.data.ModificationDate) {
                  return moment(params.data.ModificationDate).format('MM/DD/YYYY');
                }
                return '';
              }, suppressMenu: true,
              headerName: 'Modified Date',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 120,
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
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.getAllProductData();
    this.getProductById();

    this.getChargesCodeGridData();
  }

  getChargesCodeGridData(){
    const id: any = this.productData.Id;
    this.stopSpinner = false;
    this._unsubscribeGRid.next(null);
      this.locationService.getChargeCodedetails(id).pipe(takeUntil(this._unsubscribeGRid)).subscribe((data) => {
        if (data && data.$values) {
            this.rowData = data.$values;
            this.stopSpinner = true;
        }
      }, error => {
        this.rowData = [];
        this.stopSpinner = true;
      });
  }

  getProductById() {
    if (this.productData && this.productData.Id) {
      const id: any = this.productData.Id;
      this._unsubscribeProductById.next(null);
      this.locationService.getVendorProductById(id).pipe(takeUntil(this._unsubscribeProductById)).subscribe((data) => {
        if (data && data.ChargeCodeGroupVendorProducts) {
          this.productData['VendorProductData'] = data;
        }
      });
    }
  }

  getAllProductData = () => {
    this._unsubscribeVendorDropdown.next(null);
    this.locationService.getVendorDropdown().pipe(takeUntil(this._unsubscribeVendorDropdown)).subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
      }
    });
    this._unsubscribeIndustries.next(null);
    this.locationService.getIndustries().pipe(takeUntil(this._unsubscribeIndustries)).subscribe((data: any) => {
      if (data) {
        this.industries = data.Data.$values;
      }
    });

    this._unsubscribeService.next(null);
    this.locationService.getServices().pipe(takeUntil(this._unsubscribeService)).subscribe((data: any) => {
      if (data) {
        this.services = data.Data.$values;
      }
    });
    this._unsubscribeServiceType.next(null);
    this.locationService.getServiceTypes().pipe(takeUntil(this._unsubscribeServiceType)).subscribe((data: any) => {
      if (data) {
        this.serviceTypes = data.Data.$values;
      }
    });
    this._unsubscribeProductVendor.next(null);
    this.locationService.getProductsForVendor().pipe(takeUntil(this._unsubscribeProductVendor)).subscribe((data: any) => {
      if (data) {
        this.products = data.Data.$values;
      }
    });
    this._unsubscribeProductType.next(null);
    this.locationService.getProductTypes().pipe(takeUntil(this._unsubscribeProductType)).subscribe((data: any) => {
      if (data) {
        this.productTypes = data.Data.$values;
      }
    });
    this._unsubscribeChargeCodes.next(null);
    this.locationService.getChargecodes().pipe(takeUntil(this._unsubscribeChargeCodes)).subscribe((data: any) => {
      if (data.$values) {
        this.chargeCodes = data.Data.$values;
        this.chargeCodes.forEach((element: any) => {
          element.chargeCodeFormate = element.ChargeCodeName + ' / ' + element.ChargeCodeType.Name + ' / ' + element.Description;
        });
        this.source = JSON.parse(JSON.stringify(this.chargeCodes));
        this.key = 'Id';
        this.display = 'chargeCodeFormate';
      }
    });
  }
  addChargeCodeGroup() {
    let chageCodeIds: any[] = [];
    this.confirmed.forEach((element: any) => {
      chageCodeIds.push(element.Id);
    });
    let data: any = {
      chargeCodeIds: chageCodeIds,
      vendorProductTypeId: this.productData.Id
    }
    this.locationService.addChargeCodeGroups(data).subscribe({
      next: data => {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Successfully saved' //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          this.closeChargeCodeTab.emit();
        });
      },
      error: error => {
        let errorMessage: any = '';
        if (error.status === 400) {
          errorMessage = error.error ? error.error : 'Bad request';
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: errorMessage //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });

        }
      }
    });
  }

  dateConverter(date: any) {
    if (date == '' || date == null) {
      return '';
    }
    return moment(date).format('MM/DD/YYYY');
  }

  editChargecodegroup(chargeData: any) {
    const dialogRef = this.dialog.open(EditProductChargecodegroupPopupComponent, {
      panelClass: 'width-665',
      data: {
        data: chargeData
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getProductById();
    });
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeProductById.next(null);
    this._unsubscribeProductById.complete();
    this._unsubscribeVendorDropdown.next(null);
    this._unsubscribeVendorDropdown.complete();
    this._unsubscribeIndustries.next(null);
    this._unsubscribeIndustries.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
    this._unsubscribeServiceType.next(null);
    this._unsubscribeServiceType.complete();
    this._unsubscribeProductVendor.next(null);
    this._unsubscribeProductVendor.complete();
    this._unsubscribeProductType.next(null);
    this._unsubscribeProductType.complete();
    this._unsubscribeChargeCodes.next(null);
    this._unsubscribeChargeCodes.complete();
  }
}
