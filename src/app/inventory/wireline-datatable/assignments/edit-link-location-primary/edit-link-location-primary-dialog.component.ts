import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { WirelineService } from 'src/app/services/wireline.service';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { CommanHtmlRendererComponent } from 'src/app/common/ag-grid-cell-renderer-element/comman-html-renderer.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-edit-link-location-primary',
  templateUrl: './edit-link-location-primary-dialog.component.html',
  styleUrls: ['./edit-link-location-primary-dialog.component.scss'],
  imports : [SharedModule, AgGridModule, AgGridTableComponent],
  providers: [WirelineService]
})
export class EditLinkLocationPrimaryComponent implements OnInit {

  gridApi: any;
  gridColumnApi: any;
  stopSpinner: any = true;
  saveButtonLoader = false;

  public locationRowData: any = [];
  public locationAssignData: any;
  public columnDefs: any;
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribeLocationAssign: Subject<any> = new Subject<any>();
  private _unsubscribeInventoryLocation: Subject<any> = new Subject<any>();
  saveButtonDisabled = false;
  rowData: any;
  public lastSelected: any;
  public totalSelected: any;
  public isExisting: any;

  gridOptions = {
    rowModelType: 'serverSide',
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
  };
  primaryPeopleId;
  closeTooltip: any;
  @ViewChild('IIconTooltip') IIconTooltip!: TemplateRef<any>;
  @ViewChild('locationCell', { static: false }) locationCell!: TemplateRef<any>;

  sideBar = {
    toolPanels: ['columns', 'filters']
  };


  constructor(private wirelineService: WirelineService, public dialog: MatDialog, private locationService: LocationService,
    public dialogRef: MatDialogRef<EditLinkLocationPrimaryComponent>, public dialogRefTooltip: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.rowData = data.data;
    this.primaryPeopleId = data.primaryPeopleId;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.setColumnDef();
  }

  public defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }
  onAgGridReady($event: any) {
    this.stopSpinner = true;
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
          MaximumRows: 100,
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
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        data['customerAccountId'] = this.rowData['CustomerAccountId'];
        data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
        if (data['advanceFilter'] == undefined) {
          data['advanceFilter'] = [{
            "filterKey": "DisplayText",
            "filterOptionType1": "equals",
            "filterOptionValue1": 'Active',
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          }];
        } else {
          data['advanceFilter'].push({
            "filterKey": "DisplayText",
            "filterOptionType1": "equals",
            "filterOptionValue1": 'Active',
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          });
        }
        this._unsubscribeLocation.next(null);
        this.locationService
          .getCompanylocationsURL(data)
          .pipe(takeUntil(this._unsubscribeLocation))
          .subscribe(
            async (data: any) => {
              if (data && data._companyLocationDto.$values.length > 0) {
                this.locationRowData = data._companyLocationDto.$values;

                let lastRow = -1;
                if (data.TotalRecordCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalRecordCount;
                }

                params.success({
                  rowData: this.locationRowData,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }
              params.api.forEachNode(function (node: any) {
                node.setSelected(node.data.IsSelected);
              });

            },
            (error) => {
              this.locationRowData = [];
              this.stopSpinner = true;

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
  onSelectionChanged(event: any) {
    this.totalSelected = event.length;
    this.lastSelected = event.filter((e: any) => e.IsSelected === false);
    this.isExisting = event.filter((e: any) => e.IsSelected === true);

    let data: any = {};
    data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
    let locationIds: any = [];
    event.forEach((element: any) => {
      data['primaryLocationId'] = element.PrimaryLocationId ? element.PrimaryLocationId : null;
      locationIds.push(element.LocationId)
    });
    data['locationIds'] = locationIds;
    this.locationAssignData = data;
  }

  saveLocation() {

    if (!this.primaryPeopleId && (this.totalSelected == 0 || this.totalSelected == undefined)) {

      const msg = 'The system requires at least one primary Location or Person. This action will remove the current primary inventory assignment. Please review and designate a new primary inventory assignment.';

      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: msg,
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((result) => {
      });

    } else {

      let locationData;
      if (this.locationAssignData) {
        locationData = this.locationAssignData
      } else {
        let data: any = {}
        data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
        data['locationIds'] = [];
        locationData = data;
      }
      this._unsubscribeLocationAssign.next(null);
      this.saveButtonLoader = true;

      this.wirelineService.inventorylocationsAssign(locationData).pipe(takeUntil(this._unsubscribeLocationAssign))
        .subscribe((response) => {
          this.saveButtonLoader = false;

          if (response.Success) {
            this.errorPopup(response);
            // this.getInventoryMatched();
          } else {
            this.errorPopup(response);
          }
        }, error => {
          this.saveButtonLoader = false;
          this.errorPopup(error);
        });

    }
  }

  saveLocationPrimary() {
    if (this.totalSelected == 0 || this.totalSelected == undefined) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'At least one Location must be selected to set as Primary. Please select a Location.'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    } else if (this.totalSelected > 1) {
      if (this.lastSelected.length > 1) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Only one location may be set as the Primary Location.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else if (this.lastSelected.length == 0) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'At least one Location must be selected to set as Primary. Please select a Location.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {
        this.locationAssignData['primaryLocationId'] = this.lastSelected[0].LocationId;
        this.saveLinkedLocation(this.locationAssignData)
      }
    }
    else {
      this.locationAssignData['primaryLocationId'] = this.locationAssignData['locationIds'][0];
      this.saveLinkedLocation(this.locationAssignData);
    }
  }

  saveLinkedLocation(data: any) {
    if (this.primaryPeopleId) {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: 'This inventory item already has a Primary assignment. Continuing with this action will change the Primary assignment.',
        okBtnName: 'Close & Review',
        closeBtnName: 'Change the Assignment!',
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          data['primaryContactId'] = this.primaryPeopleId;
          this.callLocationApi(data);
        }
      });
    } else {
      this.callLocationApi(data);
    }

  }

  callLocationApi(data: any) {
    this.saveButtonDisabled = true;
    this._unsubscribeLocationAssign.next(null);
    this.wirelineService.inventorylocationsAssign(data).pipe(takeUntil(this._unsubscribeLocationAssign))
      .subscribe((response) => {
        this.saveButtonDisabled = false;
        if (response.Success) {
          this.errorPopup(response);
        } else {
          this.errorPopup(response);
        }
      }, error => {
        this.saveButtonDisabled = false;
        this.errorPopup(error);
      });
  }

  setColumnDef() {
    this.columnDefs = [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Location Name',
        children: [
          {
            headerName: 'Name',
            field: 'LocationName',
            sortingField: 'Name',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            minWidth: 200,
            flex: 0,
            tooltipField: 'LocationName',
            tooltipComponentParams: { color: '#ececec' },
            cellRendererFramework: CommanHtmlRendererComponent,
            cellRendererParams: {
              ngTemplate: this.locationCell
            }
          },
          {
            headerName: 'Code',
            field: 'LocationCode',
            sortingField: 'LocationCode',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
          },
          {
            headerName: 'Alias',
            field: 'Alias',
            columnGroupShow: 'open',
            sortingField: 'Alias',
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
          },
          {
            field: 'LocationCustomField11',
            headerName: 'Location Custom 1',
            columnGroupShow: 'open',
            sortingField: 'LocationCustomField1',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'LocationCustomField12',
            headerName: 'Location Custom 2',
            columnGroupShow: 'open',
            sortingField: 'LocationCustomField2',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'LocationCustomField13',
            headerName: 'Location Custom 3',
            columnGroupShow: 'open',
            sortingField: 'LocationCustomField3',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'LocationCustomField14',
            headerName: 'Location Custom 4',
            columnGroupShow: 'open',
            sortingField: 'LocationCustomField4',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
        ],
      },
      {
        headerName: 'Location Type',
        children: [
          {
            field: 'DisplayText',
            headerName: 'Status',
            sortingField: 'DisplayText',
            columnGroupShow: 'close', filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
            cellRenderer: 'statusCellRenderer',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: ['Active', 'Inactive'],
              cellRenderer: 'statusCellRenderer',
            },
          },
          {
            field: 'DisplayName',
            headerName: 'Type',
            columnGroupShow: 'open',
            sortingField: 'DisplayName',
            filter: 'agTextColumnFilter',
            minWidth: 100,
            flex: 0,
            cellRenderer: 'locationTypeCellRenderer',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: [
                'Office',
                'Vendor',
                'Residential',
                'Job Site',
                'Datacenter',
              ],
              cellRenderer: 'locationTypeCellRenderer',
            },
          },
        ],
      },
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CompanyName',
            headerName: 'Company',
            sortingField: 'CompanyName',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0
          },
          {
            field: 'AccountName',
            headerName: 'Customer',
            sortingField: 'AccountName',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
          },
        ],
      },
      {
        headerName: 'Address',
        children: [
          {
            field: 'Address1',
            headerName: 'Address One',
            sortingField: 'Address1',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          },
          {
            field: 'Address2',
            headerName: 'Address Two',
            sortingField: 'Address2',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          },
          {
            field: 'City',
            headerName: 'City',
            sortingField: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'StateName',
            headerName: 'State/Province/Region',
            columnGroupShow: 'open',
            sortingField: 'StateName',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'CountryName',
            headerName: 'Country',
            sortingField: 'CountryName',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            sortingField: 'PostalCode',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 100,
            flex: 0,
          },
          {
            field: 'Map',
            headerName: 'Map',
            editable: false,
            sortingField: 'Map',
            columnGroupShow: 'open',
            minWidth: 100,
            flex: 0,
            filter: 'agTextColumnFilter',
            filterParams: {
              values: ['Yes', 'No'],
            },
          },
          {
            headerName: 'Coordinates',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 120,
            flex: 0,
            filter: 'agTextColumnFilter',
            field: 'LocationCoordinates',
            sortingField: 'locationCoordinates'
          },
        ],
      },
      {
        headerName: 'Date',
        children: [
          {
            field: 'StartDate',
            headerName: 'Start Date',
            // editable: false,
            cellEditor: 'datePicker',
            sortingField: 'StartDate',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            minWidth: 150,
            flex: 0,
            valueFormatter: this.startDateFormatter,
          },
          {
            field: 'EndDate',
            headerName: 'End Date',
            editable: false,
            sortingField: 'EndDate',
            columnGroupShow: 'open',
            filter: 'agDateColumnFilter',
            scellEditor: 'datePicker',
            minWidth: 152,
            flex: 0,
            valueFormatter: this.endDateFormatter,
          },
        ],
      },
    ]
  }

  getInventoryMatched() {
    this._unsubscribeInventoryLocation.next(null);
    let data: any = {};
    this.wirelineService
      .getInventoryLocations(data, this.rowData['VendorProductInventoryId'])
      .pipe(takeUntil(this._unsubscribeInventoryLocation))
      .subscribe(
        async (data: any) => {
          if (data && data.Data.$values) {
            this.onAgGridReady(this.gridApi);
          }
        });
  }

  ngOnDestroy(): void {
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribeLocationAssign.next(null);
    this._unsubscribeLocationAssign.complete();
    this._unsubscribeInventoryLocation.next(null);
    this._unsubscribeInventoryLocation.complete();
  }

  startDateFormatter(params: any) {
    if (params && params.data && params.data.StartDate) {
      let date = new Date(params.data.StartDate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }

  endDateFormatter(params: any) {
    if (params && params.data && params.data.EndDate) {
      let date = new Date(params.data.EndDate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }

  errorPopup(data: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: data.Message,
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.dialogRef.close(result);
    });
  }

  openDialog(): void {
    this.closeTooltip = this.dialogRefTooltip.open(this.IIconTooltip, {
      width: '700px',
      data: {
        colseButton: true,
      }
    });
  }

  closeModal() {
    this.closeTooltip.close();
  }

  closeModal1() {
    this.dialogRef.close();

  }
}
