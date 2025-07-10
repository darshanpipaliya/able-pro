import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { DistributionActionButtonRender } from './distribution-action-button.component';
import { EditRuleActionButtonRender } from './edit-rule-action-button.component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { isValueExist } from 'src/app/services/helper';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../ag-grid-table/ag-grid-table.component';
import { InvoiceOverviewIComponent } from '../invoice-overview-i/invoice-overview-i.component';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);

@Component({
    selector: 'app-invoice-main',
    templateUrl: './invoice-main.component.html',
    styleUrls: ['./invoice-main.component.scss'],
    imports: [SharedModule, AgGridModule, AgGridTableComponent, InvoiceOverviewIComponent],
    providers: [SandBoxService]
})
export class InvoiceMainComponent implements OnInit {
    @Input() gridRowData: any;
    @Input() refeshGrid: any;
    @Input() fromTab: any;

    @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
    @Output() refeshGridOutput: EventEmitter<any> = new EventEmitter<any>();
    @Output() isDistributionCompleted: EventEmitter<any> = new EventEmitter<any>();

    frameworkComponents: any;
    dataRefresh = false;
    overviewData: any;

    public sideBar;
    sbInvoiceId: any;
    private _unsubscribeChargeCode: Subject<any> = new Subject<any>();
    private _unsubscribeDistributionEvent: Subject<any> = new Subject<any>();
    public columnDefs: any;
    public columnDefsEv: any;
    rowData: any = [];
    rowDataEv: any = [];
    rowSelection = 'multiple';
    defaultColDef = {
        editable: true,
        sortable: true,
        minWidth: 100,
        resizable: true,
        floatingFilter: true,
        flex: 1,
    };
    onBtnClick1: any;
    isShowGrid = false;
    isEnableNext: boolean = false;
    @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
    @ViewChild('tooltipText1') tooltipText1!: TemplateRef<any>;

    gridOptions = {
        rowSelection: {
          type: 'multiple',
          enableClickSelection: true
        },
      };
    ngOnChanges(changes: SimpleChanges) {

        if (this.overviewData?.IsDistribution) {
            this.isEnableNext = true;
        } else {
            this.isEnableNext = false;
        }

        if (changes['refeshGrid']?.currentValue) {
            let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: '<p><strong>Reprocess Invoice</strong> will review both open and completed invoices to ensure that all Distributions and Allocations are consistent. If discrepancies are found, the system will either update them automatically or notify you of any that need to be created.</p><p>Before using this action, make sure to add any necessary Distributions or Cost Allocation Rules, or deactivate any that should no longer apply. This ensures that the system can accurately identify and notify you of any required corrections when a rule is no longer available.</p>',
                innerHtml: true
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
                if(isValueExist(result)) {
                let data = {
                    isReRunDistribution: true
                }
                this.dataRefresh = false;

                this.sandBoxService.invoiceRuleApply(this.gridRowData.InvoiceId, data).subscribe((res: any) => {
                    this.dataRefresh = true;
                    if(res.Success) {
                        this.refresh();
                    }
                });
                
            }
            this.refeshGridOutput.emit(false);
           
        });

          
        }
    }
    constructor(private invoiceService: InvoiceService, private renderer: Renderer2, public dialog: MatDialog, private sandBoxService: SandBoxService) {
        this.sideBar = {
            toolPanels: ['columns', 'filters']
        };

      
        this.columnDefsEv = [
            {
                headerName: 'Action',
                children: [
                    {
                        headerName: 'Action',
                        filter: false,
                        editable: false,
                        width: 100,
                        minWidth: 100,
                        flex: 0,
                        cellStyle: {
                            'display': 'flex',
                            'justify-content': 'center'
                        },
                        cellRenderer: DistributionActionButtonRender,
                        cellRendererParams: {
                            onClick: this.onBtnClick2.bind(this)
                        }
                    }
                ]
            },
            {
                headerName: 'Status',
                children: [
                    {
                        field: 'DistributionStatus',
                        headerName: 'Distribution Status',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 179
                    },
                ],
            },
            {
                headerName: 'Distribution Details',
                children: [
                    {
                        field: 'DistributionEventId',
                        headerName: 'Distribution Event',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 170
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
                        minWidth: 165
                    },
                    {
                        field: 'ChargeCodeType',
                        headerName: 'Charge Code Type',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 200
                    },
                    {
                        field: 'ChargeType',
                        headerName: 'Charge Type',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 165
                    },
                    {
                        field: 'ChargeLocationType',
                        headerName: 'Charge Location',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 185
                    },
                    {
                        field: 'Quantity',
                        headerName: 'Quantity',
                        filter: 'agTextColumnFilter',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 150,
                        minWidth: 150
                    }
                ],
            },
            {
                headerName: 'Distribution Rule',
                children: [
                    {
                        field: 'DistributionRuleType',
                        headerName: 'Rule Type',
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 210,
                        flex: 0
                    },
                    {
                        field: 'DistributionLevel',
                        headerName: 'Distribution Level',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 195
                    },
                    {
                        field: 'DistributionOriginLevelType',
                        headerName: 'Distribution Origin',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 205
                    },
                    {
                        field: 'DistributionMethodType',
                        headerName: 'Distribution Method',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 215
                    },
                    {
                        field: 'DistributionRuleOption',
                        headerName: 'Rule Option',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 180
                    },
                    {
                        field: 'DistributionRuleName',
                        headerName: 'Distribution Rule',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 190,
                        tooltipField: 'DistributionRuleName',
                        tooltipComponentParams: { color: '#ececec' },
                    }
                ],
            }
        ];

        this.frameworkComponents = {
            DistributionActionButtonRender: DistributionActionButtonRender,
            EditRuleActionButtonRender: EditRuleActionButtonRender
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

    openDialog2() {
        this.dialog.open(this.tooltipText1, {
            width: '900px',
                data: {
                colseButton: true,
                }
        });
    }
    
    onBtnClick2(data: any) {
        this.redirectTab.emit(data);
    }
    addDistribution() {
        let data: any = {
            type: 'add-distribution'
        }
        this.redirectTab.emit(data);
    }

    ngOnInit(): void {
        this.refresh();
        this.columnDefs = [
            {
                headerName: 'Action',
                children: [
                    {
                        headerName: 'Action',
                        filter: false,
                        editable: false,
                        width: 97,
                        minWidth: 97,
                        flex: 0,
                        cellStyle: {
                            'display': 'flex',
                            'justify-content': 'center'
                        },
                        
                        cellRenderer: EditRuleActionButtonRender,
                        cellRendererParams: {
                            onClick: this.onBtnClick2.bind(this)
                        }
                    }
                ]
            },
            {
                headerName: 'Status',
                children: [
                    {
                        field: 'DistributionStatusDisplay',
                        headerName: 'Distribution Status',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 205,
                    },
                ],
            },
            {
                headerName: 'Distribution Details',
                children: [
                    {
                        field: 'DistributionTotalCharge',
                        headerName: 'Distribution Total',
                        columnGroupShow: 'open',
                        filter: 'agNumberColumnFilter',
                        editable: false,
                        minWidth: 174,
                        cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
                        valueFormatter: (params: any) => this.currencyFormatter(params.data.DistributionTotalCharge, this.overviewData?.CurrencySymbol),
                    },
                ],
            },
            {
                headerName: 'Account',
                children: [
                    {
                        field: 'MainAccountNumber',
                        headerName: 'Main Account',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 170,
                    },
                    {
                        field: 'SubAccountNumber',
                        headerName: 'Sub Account',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 165,
                    },
                    {
                        field: 'PayableAccountNumber',
                        headerName: 'Payable Account',
                        filter: 'agTextColumnFilter',
                        columnGroupShow: 'close',
                        editable: false,
                        minWidth: 165,
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
                        minWidth: 185,
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
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 176,
                    },
                    {
                        field: 'ChargeType',
                        headerName: 'Charge Type',
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 137,
                    },
                    {
                        field: 'ChargeLocationType',
                        headerName: 'Charge Location',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 190,
                    }
                ],
            }
        ];

    }

    invoiceOverviewDataOutput($event: any) {
        this.overviewData = $event;
        if (this.overviewData?.IsDistribution) {
            this.isEnableNext = true;
        } else {
            this.isEnableNext = false;
        }
    }

    next() {
        this.isDistributionCompleted.emit(true);
    }

    refresh() {
        this.getChargeCodeRules();
    }

    getChargeCodeRules() {
        this.dataRefresh = false;
        this._unsubscribeChargeCode.next(true);
        this.invoiceService.chargeCodeNeedRules(this.gridRowData.InvoiceId).pipe(takeUntil(this._unsubscribeChargeCode)).subscribe((response: any) => {
            if (response.Success) {
                this.rowData = response.Data.$values;
               
                if (this.rowData.length > 0) {
                    this.isShowGrid = true
                }
                
            }
            this.getDistributionEvent();
            this.dataRefresh = true;
        });

    }

    getDistributionEvent() {
        this._unsubscribeDistributionEvent.next(true);
        this.dataRefresh = false;
        this.invoiceService.costDistributionEvent(this.gridRowData.InvoiceId).pipe(takeUntil(this._unsubscribeDistributionEvent)).subscribe((response: any) => {
            if (response.Success) {
                this.rowDataEv = response.Data.$values;
                this.dataRefresh = true;
            }
        });
    }

    currencyFormatter(currency: any, sign: any) {
        if (currency !== null && currency !== undefined) {
            const formatted = currency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return sign + formatted;
          }
    }

    ngOnDestroy() {
        this._unsubscribeChargeCode.next(true);
        this._unsubscribeChargeCode.complete();
        this._unsubscribeDistributionEvent.next(true);
        this._unsubscribeDistributionEvent.complete();
    }

}
