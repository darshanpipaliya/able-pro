import { Component, OnInit } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-link-people-dialog-mobility',
  templateUrl: './link-people-dialog-mobility.component.html',
  styleUrls: ['./link-people-dialog-mobility.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent,AgGridModule]
})
export class LinkPeopleDialogMobilityComponent implements OnInit {
  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  rowSelection = 'multiple';
  gridApi: any;
  gridColumnApi: any;
  saveButtonLoader = false;
  columnDefs: any;
  public linkInventory: any;
  public rowData: any;
  public inventoryData: any;
  public customerId: any;
  checkedData: any;
  public getDataPath: any = (data: any) => data.dataPath;

  constructor() { }
  setColumnDef() {
    this.columnDefs = [
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true
          },
          {
            field: 'InventoryCustomField1',
            headerName: 'Service Custom 1',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true
          },
          {
            field: 'InventoryCustomField2',
            headerName: 'Service Custom 2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true
          },
          {
            field: 'InventoryCustomField3',
            headerName: 'Service Custom 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true
          },
          {
            field: 'InventoryCustomField4',
            headerName: 'Service Custom 4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true
          },
        ],
      },
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
            resizable: true
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
            resizable: true
          },
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
            minWidth: 120,
            flex: 0,
            resizable: true
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 230,
            flex: 0,
            resizable: true
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 230,
            flex: 0,
            resizable: true
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
            resizable: true
          },
        ],
      },
      {
        headerName: 'Product',
        children: [

          {
            headerName: 'Vendor Product',
            field: 'VendorProductName',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Service',
            field: 'ServiceName',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Service Type',
            field: 'ServiceType',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Product',
            field: 'ProductName',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'open',
            minWidth: 200,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Product Type',
            field: 'ProductType',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'open',
            minWidth: 200,
            flex: 0,
            resizable: true
          },
        ],
      },
      {
        headerName: 'Cost',
        children: [
          {
            headerName: 'Total Current Charges',
            field: 'TotalCurrentCharges',
            filter: 'agNumberColumnFilter',
            editable: false,
            columnGroupShow: 'close',
            minWidth: 260,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Previous Charges',
            field: 'PreviousBillBalance',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true
          },
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            headerName: 'Status',
            field: 'InventoryStatusDisplayText',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'close',
            minWidth: 200,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Contract Start Date',
            field: 'StartDate',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
          },
          {
            headerName: 'Contract End Date',
            field: 'EndDate',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
          },
        ],
      },
      {
        headerName: 'Location',
        children: [
          {
            headerName: 'Name',
            field: 'LocationName',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'close',
            minWidth: 200,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Address One',
            field: 'Address1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Address Two',
            field: 'Address2',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'City',
            field: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'State/Province/Region',
            field: 'StateName',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 260,
            flex: 0,
            resizable: true
          },
          {
            headerName: 'Zip/Postal Code',
            field: 'PostalCode',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true
          },
        ],
      }
    ];
  }
  ngOnInit(): void {
    this.setColumnDef();
  }

}
