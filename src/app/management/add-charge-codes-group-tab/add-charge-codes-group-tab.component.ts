import { Component, OnInit } from '@angular/core';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-add-charge-codes-group-tab',
  templateUrl: './add-charge-codes-group-tab.component.html',
  styleUrls: ['./add-charge-codes-group-tab.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class AddChargeCodesGroupTabComponent implements OnInit {


  columnDefs: any = [
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
      headerName: 'Charge Code',
      children: [
        {
          field: 'ChargeCodeName',
          headerName: 'Charge Code',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'Description',
          headerName: 'Description',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
      ],
    },
    {
      headerName: 'Charge Types',
      children: [
        {
          field: 'ChargeCodeType.Name',
          headerName: 'Charge Type',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'ChargeType.Name',
          headerName: 'CC Charge Type',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },

      ],
    },
    {
      headerName: 'Origin',
      children: [
        {
          field: 'StatusValue',
          headerName: 'Vendor Billing Alias',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
        {
          field: 'ChargeCodeOrigin.Name',
          headerName: 'Origin',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 120,
          flex: 0,
        },
      ],
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
  constructor() { }

  ngOnInit(): void {
  }

}
