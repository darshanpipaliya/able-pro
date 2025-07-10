import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ContractService } from 'src/app/services/contract.service';
import { InventorySelectionDialogMComponent } from '../inventory-selection-dialog-m/inventory-selection-dialog-m.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-contracts-m',
  templateUrl: './contracts-m.component.html',
  styleUrls: ['./contracts-m.component.scss'],
  providers: [ContractService],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent]
})
export class ContractsMComponent implements OnInit {

  @Input() rowData: any;
  @Input() isEditClicked: any;
  @Input() fromTab: any;

  @Output() dialogOpenValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() isOpenContainerTab: EventEmitter<any> = new EventEmitter<any>();

  @Output() setCustomerDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private contractService: ContractService, public dialog: MatDialog) { }
  private _unsubscribeContract: Subject<any> = new Subject<any>();
  public rowSelection = 'single';
  public contractData: any;

  sideBar: any = {
    toolPanels: ['columns', 'filters']
  };
  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  ngOnInit(): void {
    this.getContracts();

    if (this.rowData) {
      this.setCustomerDDValueEvent.emit(this.rowData.CustomerAccountId);
      this.setTemDDValueEvent.emit(this.rowData.TEMAccountId);
    }

  }

  ngOnChanges(changes: any) {
    if (changes?.isEditClicked?.currentValue == true) {
      if (this.rowData.ContractId == null) {
        const dialog = this.dialog.open(InventorySelectionDialogMComponent, { width: '800px', data: { rowData: this.rowData }, disableClose: true });
        dialog.afterClosed().subscribe(result => {
          this.rowData.ContractId = result?.Data?.ContractId;
          this.getContracts(true, result?.Data?.ContractId);
          this.dialogOpenValue.emit({ resetId: result?.Data?.ContractId, value: false })
        })
      } else {
        this.dialogOpenValue.emit({ value: false, redirectTab: true })
      }
    }
  }

  public columnDefs = [
    {
      headerName: 'Internal Contract Number',
      field: 'DocumentNumber',
      filter: 'agTextColumnFilter',
      editable: false,
      maxWidth: 250,
      flex: 0
    },
    {
      headerName: 'Type of Document',
      field: 'Type',
      columnGroupShow: 'close',
      filter: 'agTextColumnFilter',
      editable: false,
      minWidth: 200,
      maxWidth: 210,
      flex: 0,
      resizable: true
    },
    {
      headerName: 'Document Name',
      field: 'Name',
      editable: false,
      filter: 'agTextColumnFilter',
      minWidth: 180,
      flex: 0,
    },
    // {
    //   headerName: 'Internal Contract Number',
    //   field: 'NoteText',
    //   filter: 'agTextColumnFilter',
    //   editable: false,
    //   minWidth: 450,
    //   width: 450,
    // },
    {
      headerName: 'Status',
      field: 'StatusDisplay',
      filter: 'agTextColumnFilter',
      editable: false,
      minWidth: 150,
      maxWidth: 150,
      flex: 0
    }
  ];
  getContracts(afterAdded = false, ContractId?: any) {
    if (!this.rowData.ContractId && !afterAdded) {
      this.contractData = []
      return
    }
    let id = afterAdded == false ? this.rowData.ContractId : ContractId;
    if (id !== null && id !== undefined) {
      this._unsubscribeContract.next(null);
      this.contractService.getContractContainerbyId(id, 'DESC').pipe(takeUntil(this._unsubscribeContract)).subscribe((data: any) => {
        if (data.Success) {
          this.contractData = data.Data.$values;
        } else {
          this.contractData = [];
        }
      })
    }
  }
  cellDoubleClicked(data: any) {
    this.isOpenContainerTab.emit({ data: data })
  }

  ngOnDestroy() {
    this._unsubscribeContract.next(null);
    this._unsubscribeContract.complete();
  }
}

