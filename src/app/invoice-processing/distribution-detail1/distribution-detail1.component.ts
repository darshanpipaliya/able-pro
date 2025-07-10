import { Component, OnInit } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-distribution-detail1',
  templateUrl: './distribution-detail1.component.html',
  styleUrls: ['./distribution-detail1.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, NgbTooltipModule]
})
export class DistributionDetail1Component implements OnInit {
  public sideBar: any;
  sbInvoiceId: any;
  columnSubAccount: any;

  public columnDefs: any;
  rowData: any = [];
  rowSelection = 'multiple';
  rowData2: any = [];
  defaultColDef: any = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  constructor() {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs = [
      {
        // headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'BillingID',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Billing Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 250
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 201
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          }
        ],
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'charge',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          }
        ]
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
            minWidth: 190
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'ChargeLocation',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          }
        ]
      }
    ];

    this.rowData = [{ BillingID: "8135426587", MainBillingAccountNumber: "12341526", SubAccountNumber: "", PayableAccountNumber: "12341526", CountofBillingIDs: "6", charge: "$XX.XX", ChargeCodeName: "B-channel", ChargeCode: "", ChargeCodeType: "", ChargeType: "", ChargeLocation: ""}];

    this.columnSubAccount = [
      {
        headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 201
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 250
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          },
          {
            field: 'CountofBillingIDs',
            headerName: 'Count of Billing IDs',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          }
        ],
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'Vendor',
            headerName: 'Vendor',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          }
        ]
      }
    ];

    this.rowData2 = [{ SubAccountNumber: "48949849-1", MainAccountNumber: "12341526", PayableAccountNumber: "12341526", CountofBillingIDs: "6", Vendor: "Verizon"}];
  }

  ngOnInit(): void {
  }

}
