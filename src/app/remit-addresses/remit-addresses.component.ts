import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from '../services/location.service';
import { isValueExist, rolePermission } from '../services/helper';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { ClientSideRowModelModule, ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);
@Component({
  selector: 'app-remit-addresses',
  templateUrl: './remit-addresses.component.html',
  styleUrls: ['./remit-addresses.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule],
})
export class RemitAddressesComponent implements OnInit {

  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() onAgGridReadyRemitAddressEmit: EventEmitter<any> = new EventEmitter();
  @Output() exportExcelRemitData: EventEmitter<any> = new EventEmitter();
  @Output() isRemitAddressExist: EventEmitter<any> = new EventEmitter();
  public exportRemitData: any;
  public exportRemitDetail: any;
  girdDataCount = 0;


  columnDefs: any = [
    {
      headerName: 'Address',
      children: [
        {
          headerName: 'Address One',
          field: 'AddressLine1',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 170,
          flex: 0,
        },
        {
          headerName: 'Address Two',
          field: 'AddressLine2',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 170,
          flex: 0,
        },
        {
          headerName: 'City',
          field: 'AddressCity',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          headerName: 'Country',
          field: 'CountryName',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
          editable: false,
        },
        {
          headerName: 'State/Province/Region',
          field: 'StateName',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 220,
          flex: 0,
          editable: false,
        },
        {
          headerName: 'Zip/Postal Code',
          field: 'PostalCode',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 170,
          flex: 0,
        },
        {
          headerName: 'Remit ID',
          field: 'RemitAddressId',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 125,
          flex: 0,
          editable: false
        }
      ]
    },
    {
      headerName: 'Status',
      children: [
        {
          headerName: 'Status',
          field: 'RemitAddressStatus',
          columnGroupShow: 'close',
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: {
            values: ['Active', 'Inactive']
          },
          filter: 'agTextColumnFilter',
          minWidth: 130,
          flex: 0
        }
      ]
    },
  ];
  rowSelection: any = 'multiple';
  sideBar: any = {
    toolPanels: ['columns', 'filters']/* ,
      defaultToolPanel: 'columns', */
  };
  rowData: any = [];
  stopSpinner: boolean = false;
  gridApi: any;
  remitaddressSub: any;
  remitAddressesList: any;
  action: string;
  billingAccountData: any;
  isSuperTEMUsers: boolean = false;

  defaultColDef: any = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  addRemitAddressHide = true;
  isTEMUser = false;
  isCompanyUser = false
  isSuperTEMManager
  isSuperTEMAdmin
  constructor(private locationService: LocationService, public dialog: MatDialog) {
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
  }
  addressResponse = {
    Line1: 'Line1',
    Line2: 'Line2',
    Line3: 'Line3',
    Line4: 'Line4',
    City: 'City',
    Active: 'Active',
    LocationCode: 'LocationCode',
    PostalCode: 'PostalCode',
    StateId: 'StateId',
    Name: 'Name'
  }

  ngOnInit(): void {
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.addRemitAddressHide = rolePermission(['SuperTEMUser', 'CompanyManager', 'CompanyAdmin', 'CustomerAdmin']);
    let headerData: any = [];
    let ChildHeaderData: any = [];
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

    this.exportRemitDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Remit Addresses"
      },
      ExportToExcel: true
    };
    this.exportRemitData = this.exportRemitDetail;
    // this.getRemitaddresses();
  }

  onCellDoubleClicked($event: any) {
  }
  onCellValueChangedEventFor($event: any) {
    // if (this.addRemitAddressHide) {
    //   return;
    // }
    let data = {
      line1: $event.data.AddressLine1,
      line2: $event.data.AddressLine2,
      city: $event.data.AddressCity,
      stateId: $event.data.StateId,
      countryId: $event.data.CountryId,
      postalCode: $event.data.PostalCode,
      active: ($event.data.RemitAddressStatus == 'Active') ? true : false,
    }

    this.locationService.updateRemitaddresses(data, $event.data.RemitAddressId).subscribe(
      (data) => {

      },
      (error) => {
        let errorMessage: any = '';

        if (error.status === 400) {
          this.errorObjectEntries(error.error.errors)
            .map(([key, value]) => {
              if (this.addressResponse.hasOwnProperty(key)) {
                errorMessage += `${value}`
              }
            });
          errorMessage = error.error.errors ? errorMessage : error.error;

          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: this.tooltip(errorMessage.replace(/\./g, '<br>')),
            innerHtml: true
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            window.scrollTo(0, 0);
          });
        }
      });
  }
  tooltip(data: any) {
    return `<span >${data} </span>`;
  }
  onSelectionChanged(event: any) {
    let selectedRows = event;
  }

  getRemitaddresses() {
    this.onAgGridReady(this.gridApi);
  }

  errorObjectEntries<K>(object: any) {
    return (Object.keys(object) as (keyof K)[])
      .filter((key) => object[key] !== undefined && object[key] !== null)
      .map(
        key => ([
          key,
          object[key],
        ] as [keyof K, Required<K>[keyof K]]),
      );
  }

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScrollOptions: {
      storeType: 'partial',
      cacheBlockSize: 100
    },
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray: any = [];
        const filterArrayDate: any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'StartDate' || key === 'EndDate') {
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

        if (paramsRequest?.sortModel?.length > 0) {
          const sortModel = paramsRequest.sortModel;
          data['OrderBy'] = sortModel[0].colId;
          data['SortOrder'] = sortModel[0].sort;
        }
        this.exportRemitData = { ...this.exportRemitDetail, ...data };
        this.exportExcelRemitData.emit(this.exportRemitData);
        this._unsubscribeGRid.next(null);
        this.locationService
          .getRemitaddressesGrid(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.girdDataCount = _.cloneDeep(data?.TotalCount);
              if (data && data.Data.$values.length > 0) {
                data.Data.$values.length > 0 ? this.isRemitAddressExist.emit(true) : this.isRemitAddressExist.emit(false);
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
    this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
  }
  onChangeRemitAddress(arg0: any) {
    throw new Error('Method not implemented.');
  }

  onAgGridReadyEmit(data: any) {
    this.onAgGridReadyRemitAddressEmit.emit(data);
  }
  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

}
