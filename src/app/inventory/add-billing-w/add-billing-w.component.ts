import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { WirelineService } from 'src/app/services/wireline.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { BillingLPTableComponent } from 'src/app/common/billing-l-p-table/billing-l-p-table.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-add-billing-w',
  templateUrl: './add-billing-w.component.html',
  styleUrls: ['./add-billing-w.component.scss'],
  imports: [SharedModule, PrimgModule,BillingLPTableComponent, AgGridModule, AgGridTableComponent],
})
export class AddBillingWComponent implements OnInit {

  @Input() rowData: any;
  @Input() pagename: any;

  @ViewChild('ccStructure') ccStructure!: TemplateRef<any>;
  
  public sideBar;
  public columnDefs1;
  public columnDefs2;
  public exportInvoiceSummaryData: any;
  public getDataPath: any = (data: any) => data.dataPath;

  stopSpinner: boolean = false;
  stopSpinner1: boolean = false;
  isDisabledExport: boolean = false;
  submitted = false;

  sbInvoiceId: any;
  columnSubAccount: any;
  gridApi: any;
  gridColumnApi: any;
  matchRecord:any = [];
  displayRule = undefined;
  responseData: any;

  rowDataForInvoiceSummary: any = [];
  rowDataCCS: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  public autoGroupColumnDef: any = {
    headerName: 'Service Number',
    editable: false,
    field: 'BillingId',
    cellRendererParams: {
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 185,
    width: 185,
    resizable: true,
  };

  private readonly _unsubscribeGRid: Subject<any> = new Subject<any>();
  private readonly _unsubscribeGRidCCS: Subject<any> = new Subject<any>();

  @Output() getIdsArray: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();

  @Output() setCustomerDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  temRoles = false;
  constructor(private wirelineService: WirelineService, private router: Router, public dialog: MatDialog) {

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs1 = [
      {
        headerName: 'Account',
        children: [
          // {
          //   field: 'BillingId',
          //   headerName: 'Service Number',
          //   columnGroupShow: 'close',
          //   filter: 'agTextColumnFilter',
          //   editable: false,
          //   minWidth: 165
          // },
          // {
          //   field: 'ChildServiceNumber',
          //   headerName: 'Child Service Number',
          //   columnGroupShow: 'open',
          //   filter: 'agTextColumnFilter',
          //   editable: false,
          //   minWidth: 205
          // },
          {
            field: 'PayableAccount',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'Subaccount',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          }
        ],
      },
      {
        headerName: 'Invoice',
        children: [
          {
            field: 'InvoiceDate',
            headerName: 'Invoice Date',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            valueGetter(params: any) {
              if (params.data && params.data?.InvoiceDate) {
                return moment(params.data.InvoiceDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'InvoiceNumber',
            headerName: 'Invoice Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          }
        ]
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125
          }
        ]
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type ',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ServiceName',
            headerName: 'Service ',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 110
          }
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Occurrence',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ]
      },
      {
        headerName: 'Charges',
        children: [
          {
            field: 'TotalChargeDisplay',
            headerName: 'Product Total',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
          },
          {
            field: 'ChargeDisplay',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 195
          }
        ]
      }
    ];

    this.columnDefs2 = [
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'TEMAccountName',
            headerName: 'TEM',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105
          }
        ],
      },
      {
        headerName: 'Cost Center',
        children: [
          {
            field: 'CostCenterGLCodeFormatted',
            headerName: 'Cost Center',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155
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
            headerName: 'Service Type ',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135
          },
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
            minWidth: 155
          },
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 115
          },
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'LocationName',
            headerName: 'Location name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'LocationAddress1',
            headerName: 'Address',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          },
          {
            field: 'LocationCity',
            headerName: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105
          },
          {
            field: 'StateName',
            headerName: 'State',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'InvoiceDate',
            headerName: 'Invoice Date',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 156,
            valueGetter(params: any) {
              if (params.data && params.data?.InvoiceDate) {
                return moment(params.data.InvoiceDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'CCStructureStatusDisplay',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 110
          }
        ]
      }
    ];
  }

  ngOnInit(): void {
    // this.getInvoiceSummryBillingMobility();
    this.getCostCenterStructure();
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs1, (x: any) => {
      if (isValueExist(x.headerName)) {
        if (i == 0) {
          headerData.push({
            "Position": 1,
            "Title": "Service Number"
          });
          i = i + 1;
        }
        i = i + 1;

        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            if (childIndex == 0) {
              ChildHeaderData.push({
                "Position": 1,
                "Title": "Service Number",
                "FieldName": "BillingId",
                "HeaderPosition": 1
              })
              childIndex = childIndex + 1;
            }
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
          })
        }
      }
    });

    this.exportInvoiceSummaryData = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Invoice Summary"
      },
      ExportToExcel: true
    };

    if (this.rowData) {
      this.setCustomerDDValueEvent.emit(this.rowData.CustomerAccountId);
      this.setTemDDValueEvent.emit(this.rowData.TEMAccountId);
    }
  }

  openTooltip() {
    this.dialog.open(this.ccStructure, {
      width: '900px'
    });
  }

  getInvoiceSummryBillingMobility() {
    let data = {
      VendorProductInventoryId: this.rowData.VendorProductInventoryId
    }
    this.rowDataForInvoiceSummary = [];
    this.stopSpinner = false;

    this._unsubscribeGRid.next(null);
    this.wirelineService.getInvoiceSummryBillingMobility(data)
      .pipe(takeUntil(this._unsubscribeGRid)).subscribe((res: any) => {
        if (res.Success) {
          this.rowDataForInvoiceSummary = this.processData(res.Data.$values);
          this.stopSpinner = true;
        }
      }, error => {
        this.rowDataForInvoiceSummary = [];
        this.stopSpinner = true;
      })
  }

  getCostCenterStructure() {
    let data = {
      VendorProductInventoryId: this.rowData.VendorProductInventoryId
    }
    this.rowDataCCS = [];
    this.stopSpinner1 = false;

    this._unsubscribeGRidCCS.next(null);
    this.wirelineService.getCostCenterStructure(data)
      .pipe(takeUntil(this._unsubscribeGRidCCS)).subscribe((res: any) => {
        if (res.Success) {
          this.rowDataCCS = res.Data.$values;
          this.sendPaylod(res.Data.$values);
          this.stopSpinner1 = true;
        } else {
          this.rowDataCCS = [];
          this.stopSpinner1 = true;
        }
      }, error => {
        this.rowDataCCS = [];
        this.stopSpinner1 = true;
      })
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  sendPaylod(obj: any) {
    let a:any = [];
    let b:any = [];
    let c:any = [];

    _.forEach(obj, (data: any) => {
      a.push(data.CostCenterStructureId);
      b.push(data.CCSXServiceServiceTypeId);
      c.push(data.CCAllocationId);
    });

    const payload = {
      CostCenterStructureId: a,
      CCStructureServiceXServiceTypeIds: b,
      CCAllocationAssignmentIds: c
    }

    this.getIdsArray.emit(payload);
  }


  export() {
    this.isDisabledExport = true;
    let rowData:any = [];
    this.gridApi.forEachNodeAfterFilter((node: any) => {
      rowData.push(node.data.InvoiceChargeDetailsId);
    });
    this.exportInvoiceSummaryData['ParentRecordIds'] = rowData;
    this.exportInvoiceSummaryData['VendorProductInventoryId'] = this.rowData.VendorProductInventoryId;
    this.wirelineService
      .getInvoiceSummryBillingMobilityExport(this.exportInvoiceSummaryData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Invoice Summary.xlsx");
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

  ngOnDestroy(): any {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeGRidCCS.next(null);
    this._unsubscribeGRidCCS.complete();
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.SubInformationData && row.SubInformationData.$values.length > 0) {
        row.SubInformationData.$values.forEach((underling: any) => {
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }

  redirectToCCS() {
    this.redirectTab.emit({ redirectIndex: 10 });
  }

}
