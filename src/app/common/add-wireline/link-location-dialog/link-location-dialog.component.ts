import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import moment from 'moment';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from '../../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../../ag-grid-table/ag-grid-table.component';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { DatePipe } from '@angular/common';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { ManageService } from 'src/app/services/manage.service';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-link-location-dialog',
  templateUrl: './link-location-dialog.component.html',
  styleUrls: ['./link-location-dialog.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    AgGridModule,
    AgGridTableComponent
  ],
  providers: [CustomPipe, DatePipe, LocationService, WirelineService]
})
export class LinkLocationDialogComponent implements OnInit {

  private readonly getLocationAPIDestroy = new Subject<void>();
  rowData = [];
  rowSelection = 'multiple';
  gridApi: any;
  gridColumnApi: any;
  saveButtonLoader = false;
  public locationAssignData: any;
  private _unsubscribeLocationAssign: Subject<any> = new Subject<any>();
  saveButtonDisabled = false;
  public lastSelected: any;
  isUserAccess: boolean = false;

  public isExisting: any;
  public totalSelected: any;
  primaryLocationId: any;

  @ViewChild('IIconTooltip') IIconTooltip!: TemplateRef<any>;
  
  public columnDefs: any;
  existingLocation: any;
  invenotryData: any;
  action: any;
  customerId: any;
  checkedData: any;
  isPrimaryExist = false;
  primaryPeopleId : any;
  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
    cellStyle: {
      display: "flex",
      alignItems: "center"
    }
  };

  sideBar = {
    toolPanels: ['columns', 'filters']
  };

  constructor(private locationService: LocationService,
    public dialogRef: MatDialogRef<LinkLocationDialogComponent>,
    public dialog: MatDialog, private wirelineService: WirelineService,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.existingLocation = data.linkLocation;
    this.primaryPeopleId = data.primaryPeopleId;
    this.invenotryData = data.inventoryData;
    this.action = data.action;
    this.customerId = data.customerId;
    this.isPrimaryExist = data.isPrimaryExist;
    this.primaryLocationId = data.primaryLocationId;

    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.isUserAccess = rolePermission(['CompanyUser', 'TEMUser']);

    this.setColumnDef();
  }

  saveLocation() {
   if(this.totalSelected == 0 || this.totalSelected == undefined) {
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
    } else if (this.action == 'Edit') {
      if (_.cloneDeep(this.invenotryData['CustomerAccountId']) == this.customerId) {
        this._unsubscribeLocationAssign.next(null);
        this.saveButtonLoader = true;
        this.wirelineService.inventorylocationsAssign(this.locationAssignData).pipe(takeUntil(this._unsubscribeLocationAssign))
          .subscribe((response) => {
            this.saveButtonLoader = false;
            if (response.Success) {
              this.errorPopup(response);
              this.dialogRef.close(true)
            } else {
              this.errorPopup(response);
            }
          }, error => {
            this.saveButtonLoader = false;
            this.errorPopup(error);
          });
      } else {
        let data: any = {
          checkedData: this.checkedData,
          locationIds: this.locationAssignData.locationIds,
          primaryLocationId: this.locationAssignData.primaryLocationId
        }
        this.dialogRef.close(data)
      }

    } else {
      let data: any = {
        checkedData: this.checkedData,
        locationIds: this.locationAssignData.locationIds,
        primaryData: null
      }
      this.dialogRef.close(data)
    }
  }

  setColumnDef() {
    
    this.columnDefs = [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        showDisabledCheckboxes: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        filter: false,
      },
      {
        headerName: 'Location',
        children: [
          {
            editable: false,
            headerName: 'Location Name',
            field: 'LocationName',
            sortingFiled: 'LocationName',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            minWidth: 180,
            flex: 0,
            tooltipField: 'LocationName',
            tooltipComponentParams: { color: '#ececec' },
          },
          {
            headerName: 'Location Code',
            field: 'LocationCode',
            sortingFiled: 'LocationCode',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
          },
          {
            headerName: 'Location Alias',
            field: 'Alias',
            columnGroupShow: 'open',
            sortingFiled: 'Alias',
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
          },
          {
            field: 'LocationCustomField1',
            headerName: 'Location Custom 1',
            columnGroupShow: 'open',
            sortingFiled: 'LocationCustomField1',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'LocationCustomField2',
            headerName: 'Location Custom 2',
            columnGroupShow: 'open',
            sortingFiled: 'LocationCustomField2',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'LocationCustomField3',
            headerName: 'Location Custom 3',
            columnGroupShow: 'open',
            sortingFiled: 'LocationCustomField3',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'LocationCustomField4',
            headerName: 'Location Custom 4',
            columnGroupShow: 'open',
            sortingFiled: 'LocationCustomField4',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'DisplayText',
            headerName: 'Location Status',
            sortingFiled: 'DisplayText',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0
          },
          {
            field: 'DisplayName',
            headerName: 'Location Type',
            columnGroupShow: 'open',
            sortingFiled: 'DisplayName',
            filter: 'agTextColumnFilter',
            minWidth: 100,
            flex: 0,
          },
          {
            field: 'LocationTermName',
            headerName: 'Location Term',
            columnGroupShow: 'open',
            sortingFiled: 'LocationTermName',
            filter: 'agTextColumnFilter',
            minWidth: 100,
            flex: 0,
          },
        ],
      },
      {
        headerName: 'Organization',
        children: [
          {
            field: 'AccountName',
            headerName: 'Customer',
            sortingFiled: 'AccountName',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            sortingFiled: 'CompanyName',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Address',
        children: [
          {
            field: 'Address1',
            headerName: 'Street Address One',
            sortingFiled: 'Address1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'Address2',
            headerName: 'Street Address Two',
            sortingFiled: 'Address2',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'City',
            headerName: 'City',
            sortingFiled: 'City',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          },
          {
            field: 'StateName',
            headerName: 'State/Province/Region',
            columnGroupShow: 'close',
            sortingFiled: 'StateName',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            sortingFiled: 'PostalCode',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            minWidth: 100,
            flex: 0
          },
          {
            field: 'CountryName',
            headerName: 'Country',
            sortingFiled: 'CountryName',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: undefined,
            },
          },
          {
            field: 'SameMailAddressDisplayValue',
            headerName: 'Same as Location Address',
            sortingFiled: 'SameMailAddressDisplayValue',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 100,
            flex: 0,
           
          },
          {
            field: 'MailingAddress1',
            headerName: 'Mailing Street Address One',
            sortingFiled: 'MailingAddress1',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: undefined,
            },
          },
          {
            field: 'MailingAddress2',
            headerName: 'Mailing Street Address Two',
            sortingFiled: 'MailingAddress2',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: undefined,
            },
          },
          {
            field: 'MailingAddressCity',
            headerName: 'Mailing City',
            sortingFiled: 'MailingAddressCity',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: undefined,
            },
          },
          {
            field: 'MailingAddressStateName',
            headerName: 'Mailing State/Province/Region',
            sortingFiled: 'MailingAddressStateName',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: undefined,
            },
          },
          {
            field: 'MailingAddressPostalCode',
            headerName: 'Mailing Zip/Postal Code',
            sortingFiled: 'MailingAddressPostalCode',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: undefined,
            },
          },
          {
            field: 'MailingAddressCountryName',
            headerName: 'Mailing Country',
            sortingFiled: 'MailingAddressCountryName',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: undefined,
            },
          },
        ],
      },
      {
        headerName: 'Date',
        children: [
          {
            field: 'StartDate',
            headerName: 'Location Start Date',
            editable: false,
            cellEditor: 'datePicker',
            sortingFiled: 'StartDate',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            minWidth: 120,
            flex: 0,
            valueFormatter: this.startDateFormatter,
          },
          {
            field: 'EndDate',
            headerName: 'Location End Date',
            editable: false,
            sortingFiled: 'EndDate',
            columnGroupShow: 'open',
            filter: 'agDateColumnFilter',
            scellEditor: 'datePicker',
            minWidth: 120,
            flex: 0,
            valueFormatter: this.endDateFormatter,
          },
        ],
      },
    ];
  }

  startDateFormatter(params: any) {
    if (params && params.data && params.data.StartDate) {
      let date = new Date(params.data.StartDate);
      return moment(date).format('MM/DD/YYYY');
    }
    else {
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
  onAgGridReadyEmit($event: any) {
    this.gridApi = $event;
    this.gridColumnApi = $event.columnApi;
  }

  onSelectionChanged(event: any) {
    this.checkedData = event;

    this.totalSelected = event.length;
    this.lastSelected = event.filter( (e: any) => e.isChecked === false);
    this.isExisting = event.filter( (e: any) => e.isChecked === true);

    let data: any = {};
    if (this.invenotryData) {
      data['vendorProductInventoryId'] = this.invenotryData['VendorProductInventoryId'];
    }
    let locationIds:any = [];
    event.forEach((element: any) => {
      data['primaryLocationId'] = element.PrimaryLocationId ? element.PrimaryLocationId : null;
      locationIds.push(element.LocationId)
    });
    data['locationIds'] = locationIds;
    this.locationAssignData = data;
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

        if (this.invenotryData && this.action == 'Edit') {
          if (this.invenotryData['CustomerAccountId'] !== this.customerId) {
            data['CustomerAccountId'] = this.customerId;
          } else {
            data['customerAccountId'] = this.invenotryData['CustomerAccountId'];
            data['vendorProductInventoryId'] = this.invenotryData['VendorProductInventoryId'];
          }
        } else {
          data['customerAccountId'] = this.customerId;
        }
        if(data['advanceFilter'] == undefined) {
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
        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingFiled'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }

        this.getLocationAPIDestroy.next();

        this.locationService
          .getCompanylocationsURL(data)
          .pipe(takeUntil(this.getLocationAPIDestroy))
          .subscribe(
            async (data: any) => {
              if (data && data._companyLocationDto.$values.length > 0) {
                this.rowData = data._companyLocationDto.$values;
                let lastRow = -1;
                if (data.TotalRecordCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalRecordCount;
                }
               
                params.success({
                  rowData: data._companyLocationDto.$values,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.api.showNoRowsOverlay();
              }
              this.rowData.forEach((node: any) => {
                const d = this.existingLocation?.some((r: any) => r.LocationId === node.LocationId);
                node['isChecked'] = d;
              })
              params.api.forEachNode(function (node: any) {
                node.setSelected(node.data.isChecked);
              });
            },
            (error) => {
              params.successCallback([], 0 );
              this.gridApi.api?.showNoRowsOverlay();
            }
          );
      },
    };
    // this.gridApi.setServerSideDatasource(dataSource);
    this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
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
    }
    else if (this.totalSelected > 1) {
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
        this.saveLinkedLocation(this.locationAssignData, true)
      }
    }
    else {
      this.locationAssignData['primaryLocationId'] = this.locationAssignData['locationIds'][0];
      this.saveLinkedLocation(this.locationAssignData, true);
    }
  }

  saveLinkedLocation(data: any, primaryBtnclick = false) {
    if (this.action == 'Edit') {
      if (this.invenotryData['CustomerAccountId'] == this.customerId) {
        this.saveButtonDisabled = true;
        
        if (this.isPrimaryExist && this.primaryPeopleId && primaryBtnclick && !this.primaryLocationId) {
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
            if (res == false) {
              data['primaryContactId'] = this.primaryPeopleId;
              this.callSaveAPI(data);
            } else {
              this.saveButtonDisabled = false;
            }
          })  
        } else {
          this.callSaveAPI(data);
        }

      } else {
        
        if (this.isPrimaryExist && this.primaryPeopleId) {
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
            if (res == false) {
              let data = {
                checkedData: this.checkedData,
                locationIds: this.locationAssignData.locationIds,
                primaryLocationId: this.locationAssignData.primaryLocationId
              }
              this.dialogRef.close(data)
            }
          });
        } else {
          let data = {
            checkedData: this.checkedData,
            locationIds: this.locationAssignData.locationIds,
            primaryLocationId: this.locationAssignData.primaryLocationId
          }
          this.dialogRef.close(data)
        }
        
      }
    } else {
      let data = {
        checkedData: this.checkedData,
        locationIds: this.locationAssignData.locationIds,
        primaryLocationId: this.locationAssignData.primaryLocationId
      }
      this.dialogRef.close(data)
    }
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.IIconTooltip, {
      width: '850px',
      data: {
        colseButton: true,
      }
    });
  }
  closeModal() {
    this.dialog.closeAll();
  }
  callSaveAPI(data: any) {
    this._unsubscribeLocationAssign.next(null);
    this.wirelineService.inventorylocationsAssign(data).pipe(takeUntil(this._unsubscribeLocationAssign))
      .subscribe((response) => {
        this.saveButtonDisabled = false;
        if (response.Success) {
          this.errorPopup(response);
          this.dialogRef.close(true)
        } else {
          this.errorPopup(response);
        }
      }, error => {
        this.saveButtonDisabled = false;
        this.errorPopup(error);
      });
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

      if (this.checkedData && this.locationAssignData.locationIds && this.locationAssignData.primaryLocationId) {
        let data = {
          checkedData: this.checkedData,
          locationIds: this.locationAssignData.locationIds,
          primaryLocationId: this.locationAssignData.primaryLocationId
        }
        this.dialogRef.close(data);
      }
    });
  }


}
