import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../services/invoice.service';
import { rolePermission } from '../services/helper';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { InvoiceOverviewIComponent } from '../common/invoice-overview-i/invoice-overview-i.component';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';

@Component({
    selector: 'app-new-distribution-invoice',
    templateUrl: './new-distribution-invoice.component.html',
    styleUrls: ['./new-distribution-invoice.component.scss'],
    imports: [SharedModule, PrimgModule, InvoiceOverviewIComponent, AgGridModule, AgGridTableComponent]
})
export class NewDistributionInvoiceComponent implements OnInit {
    private _unsubscribeChargeCode: Subject<any> = new Subject<any>();
    @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();

    public sideBar;
    sbInvoiceId: any;
    @Input() gridRowData: any;

    selectedRow: any;
    gridOptions = {
        rowSelection: {
          type: 'multiple',
          enableClickSelection: true
        },
      };
    public columnDefs;
    rowData: any = [];
    defaultColDef = {
        editable: true,
        sortable: true,
        minWidth: 100,
        resizable: true,
        floatingFilter: true,
        flex: 1,
    };
    onBtnClick1: any;
    isViewAccess: boolean = false;
    @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

    constructor(private invoiceService: InvoiceService, public dialog: MatDialog) {
        this.sideBar = {
            toolPanels: ['columns', 'filters']
        };

        this.columnDefs = [
            {
                headerName: 'Inventory',
                children: [
                    {
                        field: 'ServiceNumber',
                        headerName: 'Service Number',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 185,
                    },
                ],
            },
            {
                headerName: 'Account',
                children: [
                    {
                        field: 'MainAccountNumber',
                        headerName: 'Main Account Number',
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 230,
                    },
                    {
                        field: 'SubAccountNumber',
                        headerName: 'Sub Account Number',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 225,
                    },
                    {
                        field: 'PayableAccountNumber',
                        headerName: 'Payable Account',
                        filter: 'agTextColumnFilter',
                        columnGroupShow: 'open',
                        editable: false,
                        minWidth: 190,
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
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 125,
                    },
                    {
                        field: 'ParentVendorAccountName',
                        headerName: 'Parent Vendor',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 175,
                    },
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
                        minWidth: 210,
                    },
                    {
                        field: 'ChargeCode',
                        headerName: 'Charge Code',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 165,
                    },
                    {
                        field: 'ChargeCodeType',
                        headerName: 'Charge Code Type',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 200,
                    },
                    {
                        field: 'ChargeType',
                        headerName: 'Charge Type',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 160,
                    },
                    {
                        field: 'ChargeCodeOccurrence',
                        headerName: 'Charge Occurrence',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 210,
                    }
                ],
            },
            {
                headerName: 'Charges',
                children: [
                    {
                        field: 'DistributionTotalChargeDisplay',
                        headerName: 'Charges',
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 130,
                        cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' },
                    },
                    {
                        field: 'ChargeLocationType',
                        headerName: 'Charge Location',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 185,
                    },
                ],
            },
            {
                headerName: 'Charge Descriptions',
                children: [
                    {
                        field: 'ChargeDescription1',
                        headerName: 'Charge Description 1',
                        filter: 'agTextColumnFilter',
                        columnGroupShow: 'close',
                        editable: false,
                        minWidth: 215,
                    },
                    {
                        field: 'ChargeDescription2',
                        headerName: 'Charge Description 2',
                        filter: 'agTextColumnFilter',
                        columnGroupShow: 'open',
                        editable: false,
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription3',
                        headerName: 'Charge Description 3',
                        columnGroupShow: 'open',
                        editable: false,
                        filter: 'agTextColumnFilter',
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription4',
                        headerName: 'Charge Description 4',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription5',
                        headerName: 'Charge Description 5',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription6',
                        headerName: 'Charge Description 6',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription7',
                        headerName: 'Charge Description 7',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription8',
                        headerName: 'Charge Description 8',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription9',
                        headerName: 'Charge Description 9',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 220,
                    },
                    {
                        field: 'ChargeDescription10',
                        headerName: 'Charge Description 10',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 225,
                    }
                ],
            }
        ];
    }
    onCellDoubleClicked(event: any) {
        if (!this.isViewAccess) {
            const params = {
                redirect: false,
                type: 'distribution-rule-engine',
                data: event.data
            }
            this.redirectTab.emit(params);
        }
    }
    openDialog() {
        const dialogRef = this.dialog.open(this.tooltipText, {
          width: '900px',
              data: {
                colseButton: true,
              }
        });
      }
    
    ngOnInit(): void {
        this.getChargeCodeRules();
        this.isViewAccess = rolePermission(['CompanyAdmin']);
    }

    getChargeCodeRules() {
        this._unsubscribeChargeCode.next(true);
        let data: any = {
            IsFromNewRule: true
        }
        this.invoiceService.chargeCodeNeedRules(this.gridRowData.InvoiceId, data).pipe(takeUntil(this._unsubscribeChargeCode)).subscribe((response: any) => {
            if (response.Success) {
                this.rowData = response.Data.$values;
            }
        });

    }
    ngOnDestroy() {
        this._unsubscribeChargeCode.next(true)
        this._unsubscribeChargeCode.complete()
    }
}
