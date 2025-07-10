import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportFilterPopupComponent } from '../report-filter-popup/report-filter-popup.component';
import _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { rolePermission } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ManageService } from 'src/app/services/manage.service';
import { DatePipe } from '@angular/common';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';

ModuleRegistry.registerModules([ClientSideRowModelModule]);
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule],
  providers: [
    ManageService,DatePipe,CustomPipe
  ]
})
export class ReportsComponent implements OnInit {

  public columnDefs;
  public rowData: any;
  public allRowData: any;
  public rowSelection: any;
  girdDataCount = 0;
  clickTofilterBtn = '';
  public defaultColDef: any = {
    filter: "agTextColumnFilter",
    floatingFilter: true,
  };
  isClickedSave = false;
  tooltipShowDelay = 500;
  gridOptions: any = {
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };
  filteredRowData:any = [];
  tems:any = [];
  selectedTem: any = 'all';
  temRoles = false;
  gridApi: any;
  constructor(public dialog: MatDialog,
    public locationService: LocationService
  ) {
    this.columnDefs = [
      {
        headerName: 'Category',
        field: 'Category',
        columnGroupShow: 'close',
        filter: 'agTextColumnFilter',
        resizable: true,
        editable: false,
        minWidth: 115,
        maxWidth: 137,
        sortable: true,
        flex: 0,
      },
      {
        headerName: 'Report Name',
        field: 'Name',
        columnGroupShow: 'close',
        filter: 'agTextColumnFilter',
        resizable: true,
        editable: false,
        minWidth: 120,
        maxWidth: 500,
        sortable: true,
      },
      {
        headerName: 'Description',
        field: 'Description',
        columnGroupShow: 'close',
        filter: 'agTextColumnFilter',
        resizable: true,
        editable: false,
        minWidth: 180,
        sortable: true,
        tooltipValueGetter: (p: any) => p.value,
      },
    ];
  }

  onCellDoubleClickedEvent(data: any) {

    // this.selectedTem = sessionStorage.getItem("LoggedAccountId");
    this.dialog.open(ReportFilterPopupComponent, {
      panelClass: 'width-600',
      data: {'data' : data, 'selectedTem' : this.selectedTem, 'isClickedSave': this.isClickedSave},
      disableClose: true
    })
  }

  onValueChange() {
    this.isClickedSave = false;
  }
  ngOnInit(): void {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.getTemLists();
    this.getReportFn();
    
  }

  getReportFn() {
    this.locationService.getReports().subscribe({
      next: (data: any) => {
        this.rowData = data.Data.$values;
        this.allRowData = this.rowData;
      }
    });
  }

  clickTofilter(e: any) {
    console.log('1144', this.gridOptions);
    
    // Use the stored grid API
    if (this.gridApi) {
      // Use the new filter API for ag-grid v33+
      const filterModel = {
        Category: {
          type: 'startsWith',
          filter: e
        }
      };
      
      // Apply the filter model
      this.gridApi.setFilterModel(filterModel);
      
      this.clickTofilterBtn = e;
      this.filteredRowData = _.filter(this.allRowData, (c: any) => c.Category === e);
    }
  }

  onFilterChanged(e: any){
    if (this.gridApi) {
      const filterModel = this.gridApi.getFilterModel();
      if (Object.keys(filterModel).length === 0) {
        this.clickTofilterBtn = '';
      }
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridOptions.api = params.api;
  }

  getTemLists() {
    this.locationService.getTemLists().pipe().subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;
      }
    }, error => {
      this.tems = [];
    });
  }

  filterCustomerByTEMId() {
    this.isClickedSave = true;
  }
}

