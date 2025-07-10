import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../services/invoice.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isValueExist } from '../services/helper';
import _ from 'lodash';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { InvoiceOverviewIComponent } from '../common/invoice-overview-i/invoice-overview-i.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { SandBoxService } from '../services/sandbox.service';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-allocations-by-structure',
  templateUrl: './allocations-by-structure.component.html',
  styleUrls: ['./allocations-by-structure.component.scss'],
  standalone: true,
  providers: [SandBoxService],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent, InvoiceOverviewIComponent]
})
export class AllocationsByStructureComponent implements OnInit {
  @Input() gridRowData: any;

  public sideBar;
  gridApi: any;
  public exportCCSData: any;
  @Output() exportCCSExcelData: EventEmitter<any> = new EventEmitter<any>();
  @Output() isCCSDataExits: EventEmitter<any> = new EventEmitter<any>();
  refreshDatas = false;
  public columnDefs1;
  rowData1: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
  };
  private _unsubscribeGRidStructure: Subject<any> = new Subject<any>();
  public exportCCSDetail: any;

  @ViewChild('CostCenterStructureDetail') CostCenterStructureDetail!: TemplateRef<any>;
  constructor(public dialog: MatDialog, private invoiceService: InvoiceService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs1 = [
      {
        headerName: 'Cost Center',
        children: [
          {
            field: 'CostCenterGLCodeFormatted',
            headerName: 'Cost Center',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostCenterGLCodeFormatted'
          }
        ]
      },
      {
        headerName: 'Approver',
        children: [
          {
            field: 'PeopleApproverName',
            headerName: 'Approver Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'PeopleApproverName'
          },
          {
            field: 'PeopleApproverEmail',
            headerName: 'Approver Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'PeopleApproverEmail'
          }
        ]
      },
      {
        headerName: 'Service',
        children: [
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'ServiceTypeName'
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160,
            sortingField: 'ProductName'
          }
        ],
      },
      {
        headerName: 'Allocation',
        children: [
          {
            field: 'PercentageDisplay',
            headerName: '%',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 110,
            sortingField: 'Percentage'
          }
        ]
      },
      {
        headerName: 'Assignment',
        children: [
          {
            field: 'CostCenterStructureType',
            headerName: 'Assignment',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostCenterStructureType'
          },
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'ServiceNumber',
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: any) {
              return  params.data.AccrossInventory == true ? params.data.ServiceNumber + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.ServiceNumber
            }
          },
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'VendorProductTypeName'
          },
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 115,
            sortingField: 'PeopleName'
          },
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'PeopleEmail'
          },
          {
            field: 'LocationName',
            headerName: 'Location Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'LocationName'
          },
          {
            field: 'LocationAddress1',
            headerName: 'Address1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'LocationAddress1'
          },
          {
            field: 'LocationCity',
            headerName: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105,
            sortingField: 'LocationCity'
          },
          {
            field: 'StateName',
            headerName: 'State/Province',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175,
            sortingField: 'StateName'
          },
          {
            field: 'LocationPostalCode',
            headerName: 'Zip/Postal Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165,
            sortingField: 'LocationPostalCode'
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'CCStructureStatusDisplay',
            headerName: 'Rule Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130,
            sortingField: 'CCStructureStatusDisplay'
          }
        ]
      }
    ];
  }
  onAgGridReady($event: any, reloadOveview = false) {

    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayNumber:any = [];
        let arr;
        let arrNumber;
        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          
          if (key == 'PercentageDisplay') {
            key = 'Percentage'
          }
          if(key == 'Percentage') {
            arrNumber = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
              filterOptionValue1_2 : (data && data.filterTo) ? data.filterTo : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
            }
            filterArrayNumber.push(arrNumber);
          }else {
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

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }
        // if (this.selectedTem != 'all') {
        //   data['TemAccountId'] = parseInt(this.selectedTem);
        // }

        // if (this.selectedCustomer != 'all') {
        //   data['customerAccountId'] = parseInt(this.selectedCustomer);
        // }
        
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this.exportCCSData = { ...this.exportCCSDetail, ...data };
        this.refreshDatas = false;
        this.exportCCSExcelData.emit(this.exportCCSData);
        this.invoiceService.getcostAllocationStructure(this.gridRowData.InvoiceId, data)
          .pipe(takeUntil(this._unsubscribeGRidStructure))
          .subscribe(
            async (data: any) => {

              if(reloadOveview) {
                this.refreshDatas = true;
              }
              data?.TotalCount > 0 ? this.isCCSDataExits.emit(true) : this.isCCSDataExits.emit(false);
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

  ngOnInit(): void {
    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs1, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            let obj: any = {
              Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i
            }
            if(y.field == 'PercentageDisplay') {
              obj['isPercentage'] = true
            }
            ChildHeaderData.push(obj)
          })
        }
      }
    });

    this.exportCCSDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Cost Center Structures"
      },
      ExportToExcel: true
    };
    this.exportCCSData = this.exportCCSDetail;
  }
  TooltipDialog1(): void {
    this.dialog.open(this.CostCenterStructureDetail, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeGRidStructure.next(true);
    this._unsubscribeGRidStructure.complete();
  }
}
