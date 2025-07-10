import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from '../services/location.service';
import { isValueExist } from '../services/helper';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '../demo/shared/shared.module';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-cost-centers',
  templateUrl: './cost-centers.component.html',
  styleUrls: ['./cost-centers.component.scss'],
  imports: [AgGridModule, SharedModule, AgGridTableComponent],
})
export class CostCentersComponent implements OnInit {

  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() onSelectedRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAgGridReadyCostCenterEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()
  @Output() selectedTemCC: EventEmitter<any> = new EventEmitter<any>();
  @Output() exportCCExcelData: EventEmitter<any> = new EventEmitter<any>();
  @Output() isCCDataExist: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('ccText') ccText!: TemplateRef<any>;

  @Input() selectedTem: any;
  @Input() selectedCompany: any;

  costCenterIds: any = [];
  public exportCCData: any;
  public exportCCDetail: any;
  girdDataCount = 0;


  columnDefs: any = [
    {
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
      suppressColumnsToolPanel: true,
      // pinned: true
      // cellStyle: params => {
      //   return params?.data?.AllowCCManualEdits == 'No' ? {'pointer-events': 'none', opacity: '0.4' } : '';
      // },
      isRowSelectable: (rowNode: any) => {
        return rowNode?.data?.AllowCCManualEdits == 'Yes';
      }
    },
    {
      headerName: 'Status',
      children: [
        {
          headerName: 'Status',
          field: 'ActiveStatus',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
          editable: false,
        },

      ]
    },
    {
      headerName: 'Organization',
      children: [
        {
          headerName: 'Customer',
          field: 'CustomerAccountName',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 130,
          flex: 0
        },
        {
          headerName: 'Company',
          field: 'CompanyName',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 130,
          flex: 0
        }
      ]
    },
    {
      headerName: 'GL Codes',
      children: [
        {
          field: 'GLCodeFormatted',
          headerName: 'GL Code',
          resizable: true,
          editable: false,
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 140
        },
        {
          headerName: 'Description',
          field: 'Description',
          resizable: true,
          editable: false,
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          minWidth: 140
        }
      ]
    },
    {
      headerName: 'GL Code Structure',
      children: [
        {
          field: 'GLCode1Formatted',
          headerName: 'GL Code 1',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'GLCode2Formatted',
          headerName: 'GL Code 2',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'GLCode3Formatted',
          headerName: 'GL Code 3',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },

        {
          field: 'GLCode4Formatted',
          headerName: 'GL Code 4',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'GLCode5Formatted',
          headerName: 'GL Code 5',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'GLCode6Formatted',
          headerName: 'GL Code 6',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'Type',
          headerName: 'GL Code Type',
          resizable: true,
          editable: false,
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: {
            values: ['Job', 'GL']
          },
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          minWidth: 170
        }
      ]
    }
  ];

  rowSelection: any = 'multiple';
  defaultColDef: any = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  sideBar: any = {
    toolPanels: ['columns', 'filters']/* ,
      defaultToolPanel: 'columns', */
  };
  rowData: any = [];
  stopSpinner: boolean = false;
  gridApi: any;

  isCustomerAdmin: boolean = false;
  isCompanyAdmin: boolean = false;
  gridOptions: any;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  constructor(private locationService: LocationService, public dialog: MatDialog) {
    this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();

    if (this.isCustomerAdmin || this.isCompanyAdmin) {
      this.gridOptions = {
        rowModelType: 'serverSide',
        rowSelectionCheckboxes: true,
        rowSelection: {
          type: 'multiple',
          enableClickSelection: true
        },
        enableFiltering: true,
        headerHeight: 35,
        groupHeaderHeight: 37,
        floatingFiltersHeight: 35,
        serverSideInfiniteScrollOptions: {
          storeType: 'partial',
          cacheBlockSize: 100
        },
        isRowSelectable: (rowNode: any) => {
          return rowNode?.data?.AllowCCManualEdits == 'Yes';
        }
      }
    } else {
      this.gridOptions = {
        rowModelType: 'serverSide',
        rowSelection: {
          type: 'multiple',
          enableClickSelection: true
        },
        rowSelectionCheckboxes: true,
        serverSideInfiniteScrollOptions: {
          storeType: 'partial',
          cacheBlockSize: 100
        },
        enableFiltering: true,
        headerHeight: 35,
        groupHeaderHeight: 37,
        floatingFiltersHeight: 35
      }
    }

  }

  ngOnInit(): void {
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

    this.exportCCDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Cost Centers"
      },
      ExportToExcel: true
    };
    this.exportCCData = this.exportCCDetail;
  }

  openPopup() {
    this.dialog.open(this.ccText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  getCostCentersData(selectedComp = null) {
    this.selectedCompany = selectedComp;
    const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
    this.onAgGridReady(a);
  }

  onAgGridReady($event?: any) {
    this.costCenterIds = [];
    this.onSelectedRow.emit(this.costCenterIds);
    this.gridApi = $event;
    
    if (this.gridApi.api) {
      this.gridApi.api.deselectAll();  
    } else {
      this.gridApi.deselectAll();
    }
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

        if (this.selectedTem != 'all') {
          data['TemAccountId'] = parseInt(this.selectedTem);
        }

        if (this.selectedCompany != 'all') {
          data['customerAccountId'] = parseInt(this.selectedCompany);
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
        this.exportCCData = { ...this.exportCCDetail, ...data };
        this.exportCCExcelData.emit(this.exportCCData);
        this.locationService
          .getCostCenters(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.girdDataCount = _.cloneDeep(data?.TotalCount);
              if (data && data.Data.$values.length > 0) {
                data.Data.$values.length > 0 ? this.isCCDataExist.emit(true) : this.isCCDataExist.emit(false);
                this.selectedTemCC.emit(this.selectedTem);
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
      this.gridApi.api.setGridOption('serverSideDatasource', dataSource);
    } else {
      this.gridApi.setGridOption('serverSideDatasource', dataSource);
    }
  }
  onCellDoubleClicked($event: any) {
    this.rowCellDoubleClicked.emit($event.data);
  }

  onSelectionChanged(event: any) {
    this.costCenterIds = [];
    event.forEach((element: any) => {
      this.costCenterIds.push(element.CostCenterId)
    });
    this.onSelectedRow.emit(this.costCenterIds);
  }

  onAgGridReadyEmit(data: any) {
    this.onAgGridReadyCostCenterEmit.emit(data);
  }
  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }
}
