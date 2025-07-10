import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import 'ag-grid-enterprise';
import moment from 'moment';
import { ClientSideRowModelModule, FirstDataRenderedEvent } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';

import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ServerSideRowModelModule,
} from 'ag-grid-enterprise';
import { ModuleRegistry } from 'ag-grid-enterprise';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ServerSideRowModelModule]);

@Component({
  selector: 'app-ag-grid-table',
  templateUrl: './ag-grid-table.component.html',
  styleUrls: ['./ag-grid-table.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, AgGridAngular]
})
export class AgGridTableComponent implements OnInit {
  @Input() rowData: any;
  @Input() rowSelection: any;
  @Input() defaultColDef: any;
  @Input() sideBar: any;
  @Input() tableHeight: any = '600px';
  @Input() columnDefs: any;
  @Input() singleClickEdit: any;
  @Input() components: any;
  @Input() excelBtnEnable: boolean = true;
  @Input() frameworkComponents: any;
  @Input() spaceBetweenHeaderAndTable: boolean = false;
  @Input() isRelodButtonVisible: boolean = false;
  @Input() gridOptions: any;
  @Input() sheetName: any = 'Sheet1';
  @Input() exportFilename: any = 'export.xlsx';
  @Input() autoGroupColumnDef: any;
  @Input() treeData: any;
  @Input() groupDefaultExpanded: any;
  @Input() getDataPath: any;
  @Input() pageName: any = [];
  @Input() rowHeight = 35;
  @Input() isRowSelectable: any;
  @Input() rowModelType: any = 'clientSide';

  tooltipShowDelay = 100;
  public gridApi: GridApi | undefined;
  public modules: any[] = [ClientSideRowModelModule, ServerSideRowModelModule];
  private gridColumnApi: any;

  @Output() onCellClickedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCellDoubleClickedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCellEditingStoppedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCellValueChangedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSelectionChangedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRefreshGrid: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAgGridReady = new EventEmitter<AgGridAngular>();
  @Output() onAgGridReadyEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() filterChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRowClickedEmit: EventEmitter<any> = new EventEmitter<any>();

  excelStyles = [
    {
      id: 'header',
      interior: {
        color: '#C6C6C6',
        pattern: 'Solid',
      },
      font: {
        color: '#000000',
        size: 13,
        bold: true,
      },
    },
    {
      id: 'export-cell-aling-left',
      font: {
        color: '#000000',
        size: 12,
      },
    },
  ];

  constructor() { 
    if (!this.gridOptions) {
      this.gridOptions = {
        headerHeight: 48,
        groupHeaderHeight: 48,
        floatingFiltersHeight: 48,
        suppressFloatingFilter: false,
        defaultColDef: {
          flex: 1,
          minWidth: 100,
          sortable: true,
          resizable: true,
          filter: true,
          floatingFilter: true
        }
      }
    }
  }

  ngOnInit(): void {
    // Merge any incoming defaultColDef with our base settings
    this.defaultColDef = {
      floatingFilter: true,
      cellClass: 'export-cell-aling-left',
      cellStyle: {
        display: "flex",
        alignItems: "center"
      },
      ...this.defaultColDef
    };

    this.gridOptions = {
      ...this.gridOptions,
      suppressFloatingFilter: false,
      defaultColDef: {
        ...this.gridOptions.defaultColDef,
        floatingFilter: true
      }
    };
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = (params as any).columnApi;
    this.onAgGridReady.emit(params as any);
    this.onAgGridReadyEmit.emit(params);
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.sizeColumnsToFit();
  }

  onCellClicked(event: any) {
    this.onCellClickedEvent.emit(event);
  }

  onCellDoubleClicked(event: any) {
    this.onCellDoubleClickedEvent.emit(event);
  }

  onCellEditingStopped(event: any) {
    this.onCellEditingStoppedEvent.emit(event);
  }

  onCellValueChanged(event: any) {
    this.onCellValueChangedEvent.emit(event);
  }

  onSelectionChanged(event: any) {
    this.onSelectionChangedEvent.emit(event.api.getSelectedRows());
  }

  onRowClicked(params: any) {
    if (this.gridApi) {
      this.gridApi.deselectAll();
      params.node.setSelected(true);
      this.onRowClickedEmit.emit(params.data);
    }
  }

  onfilterChanged(event: any) {
    this.filterChanged.emit(event);
  }

  onSortChanged(event: any) {
    this.sortChanged.emit(event);
  }

  resetGrid() {
    if (this.gridColumnApi) {
      this.gridColumnApi.resetColumnState();
    }
  }

  getParams() {
    return {
      allColumns: true,
      columnGroups: true,
      columnKeys: [],
      columnWidth: 100,
      fileName: this.exportFilename,
      sheetName: this.sheetName,
      onlySelected: false,
      onlySelectedAllPages: false,
      shouldRowBeSkipped: false,
      skipFooters: false,
      skipGroups: false,
      skipHeader: false,
      skipPinnedTop: true,
      skipPinnedBottom: true,
    };
  }

  modelUpdated(params: any) {
    // Handle model updates if needed
  }

  componentStateChanged(params: any) {
    // Handle component state changes if needed
  }

  refreshGrid() {
    this.onRefreshGrid.emit();
  }
}
