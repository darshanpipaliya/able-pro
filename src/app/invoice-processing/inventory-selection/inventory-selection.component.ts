import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { checkIsValueExists } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ClientSideRowModelModule, ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);

@Component({
  selector: 'app-inventory-selection',
  templateUrl: './inventory-selection.component.html',
  styleUrls: ['./inventory-selection.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent],
})
export class InventorySelectionComponent implements OnInit {
  public columnDefs1;
  public gridApi: any;
  rowData: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  chargeValidation: any;
  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();


  @Input() sandBoxGridRowData: any;
  @Input() isShowAddButton: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() reloadGrid: boolean = false;

  showNext: any;
  @ViewChild('InventorySelection') InventorySelection!: TemplateRef<any>;

  constructor(public dialog: MatDialog, public sandBoxService: SandBoxService) {
    this.columnDefs1 = [
      {
        headerName: 'Status',
        children: [
          {
            field: 'VendorProductAssignmentStatus',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 111,
            flex: 0
          }
        ],
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
            minWidth: 117,
            flex: 0
          }
        ]
      },
      {
        headerName: 'Account',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 209,
            flex: 0,
            cellRenderer: function (params: { data: { MainAccountNumber: any; }; value: string; }) {
              if (params && params.data.MainAccountNumber) {
                return '<a href="javascript:void(0);" style="text-decoration: underline;">' + params.value + '</a>';
              } else {
                return params.value;
              }
            }
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 201,
            flex: 0,
            cellRenderer: function (params: { data: { SubAccountNumber: any; }; value: string; }) {
              if (params && params.data.SubAccountNumber) {
                return '<a href="javascript:void(0);" style="text-decoration: underline;">' + params.value + '</a>';
              } else {
                return params.value;
              }
            }
          }
        ],
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 128,
            flex: 0,
            cellRenderer: function (params: { data: { BillingId: any; }; value: string; }) {
              if (params && params.data.BillingId) {
                return '<a href="javascript:void(0);" style="text-decoration: underline;">' + params.value + '</a>'
              } else {
                return params.value;
              }
            }
          },
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 169,
            minWidth: 169,
            flex: 0
          },
          {
            field: 'ParentVendorProductInventoryNumber',
            headerName: 'Parent',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 167,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'HideVendorProductAssignmentStatus',
            filter: 'agTextColumnFilter',
            hide: true,
            suppressColumnsToolPanel: true,
            suppressFiltersToolPanel: true
          }
        ],
      },
    ];
  }
  private _unsubscribeAssignment: Subject<any> = new Subject<any>();
  private _unsubscribeAssignment1: Subject<any> = new Subject<any>();

  changeEvent(event: any) {

  }
  redirectNext() {
    this.redirectTab.emit(7)
  }
  onAgGridReady(params: any) {
    this.gridApi = params;
    const filtersToolPanel = this.gridApi.getToolPanelInstance?.('filters');
    if (filtersToolPanel?.expandFilters) {
      filtersToolPanel.expandFilters();
    }
  }
  ngOnInit(): void {
    this.getvendorProductAssignment();
    this.getChargeValidation();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['isShowAddButton'] && changes['isShowAddButton']['currentValue'] && changes['isShowAddButton']['currentValue'] !== changes['isShowAddButton']['previousValue']) {
      this.isShowAddButton = changes['isShowAddButton']['currentValue'];
    }

    if (changes && changes['reloadGrid'] && changes['reloadGrid'].currentValue) {
      this.getvendorProductAssignment();
    }
  }

  addVendorProduct() {
    this.switchTab.emit(4);
  }

  getChargeValidation() {
    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }
    this._unsubscribeAssignment.next(null)
    this.sandBoxService.getChargeValidation(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeAssignment))
      .subscribe((data: any) => {
        if (data.Success) {
          this.chargeValidation = data.Data.$values;
        }
      });
  }
  getvendorProductAssignment(refresh = false) {
    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }

    if (refresh) {
      const stepData = {
        SBInvoiceId: this.sandBoxGridRowData.SBInvoiceId
      }
    this.sandBoxService.invoiceProcesingStep(stepData).subscribe((res: any) => {
      this.callVPAssign();
    });
    } else {
      this.callVPAssign();
    }
  }

  callVPAssign() {
    this._unsubscribeAssignment1.next(null)
    this.sandBoxService.vendorProductAssignment(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeAssignment1))
      .subscribe((data: any) => {
        if (data.Success) {
          this.rowData = data.Data.$values;

          let matchData = _.map(this.rowData, (x: any) => x.VendorProductAssignmentStatus);
          this.showNext = _.every(matchData, (x) => x == 'Complete');
        }
      });
  }
  onCellDoubleClicked(event: { value: any; colDef: { field: string; }; data: any; }) {
    if (event.value) {
      if (event.colDef.field == "BillingId" || event.colDef.field == "MainAccountNumber" || event.colDef.field == "SubAccountNumber") {
        const rowData = event.data;
        this.onCellClicked.emit({ rowData: rowData, index: 1, field: event.colDef.field })
      }
    }
  }

  openDialog(): void {
    this.dialog.open(this.InventorySelection, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeAssignment.next(null);
    this._unsubscribeAssignment.complete();
    this._unsubscribeAssignment1.next(null);
    this._unsubscribeAssignment1.complete();
  }
}
