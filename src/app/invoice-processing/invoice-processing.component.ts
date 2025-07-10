import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { ActionButtonRender } from './sandbox-grid/action-button.component';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SandboxGridCTooltipComponent } from './sandbox-grid-c-tooltip/sandbox-grid-c-tooltip.component';
import { VendorDropdownCellRenderer } from './charge-detail/vendor-dropdown-cell-renderer';
import { RepnameCellRenderer } from './charge-detail/repname-cell-renderer';
import { SandBoxService } from '../services/sandbox.service';
import { LocationService } from '../services/location.service';
import { checkIsValueExistswithZero, isValueExist, rolePermission } from '../services/helper';
import { processDateFilter, processNumberFilter, processTextFilter } from '../common/ag-grid-filter';
import { AddProductComponent } from '../management/add-product/add-product.component';
import { AddVendorProductComponent } from '../management/add-vendor-product/add-vendor-product.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { InvoiceOverviewComponent } from './invoice-overview/invoice-overview.component';
import { SummaryTotalComponent } from './summary-total/summary-total.component';
import { ChargeDetailComponent } from './charge-detail/charge-detail.component';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ClientSideRowModelModule, ServerSideRowModelModule]);
@Component({
    selector: 'app-invoice-processing',
    templateUrl: './invoice-processing.component.html',
    styleUrls: ['./invoice-processing.component.scss'],
    imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, SummaryTotalComponent, ChargeDetailComponent, AgGridTableComponent],
})
export class InvoiceProcessingComponent implements OnInit {

    @Input() openPage: any;
    @Input() sandBoxGridRowData: any;
    @Output() onDoubleClickSandbox: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDoubleClickSandboxData: EventEmitter<any> = new EventEmitter<any>();
    @Output() invoiceOverviewDataOP: EventEmitter<any> = new EventEmitter<any>();
    @Output() clickOnSaved: EventEmitter<any> = new EventEmitter<any>();
    @Output() openInvoiceRetrieval: EventEmitter<any> = new EventEmitter<any>();
    @Output() step1Done: EventEmitter<any> = new EventEmitter<any>();
    @Output() step2Done: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRecordPublishedOrCompleted: EventEmitter<any> = new EventEmitter<any>();
    statusList: any = [];
    private _unsubscribeGRid: Subject<any> = new Subject<any>();
    userInfo: any;
    isCompanyFormSubmit = false;
    frameworkComponents: any;
    isDisableSandbox = false;
    reloadOverview = false;

    columnApi: any;
    gridApi: any;
    private gridColumnApi!: any;
    saveButtonDisabled = false;
    gridOptions = {
        rowModelType: 'serverSide',
        serverSideInfiniteScroll: true,
        enableFiltering: true,
        headerHeight: 35,
        groupHeaderHeight: 37,
        floatingFiltersHeight: 35
    };

    public columnDefs: any;
    public columnDefs1: any;
    public sideBar: any;
    rowData: any = [];
    public rowSelection: any;
    public defaultColDef: any;
    public overviewData: any;
    currentUrl = window.location.origin;

    private _unsubscribeVendor: Subject<any> = new Subject<any>();
    private _unsubscribeVendorChange: Subject<any> = new Subject<any>();
    private _unsubscribeRepName: Subject<any> = new Subject<any>();
    private _unsubscribeChargeRepChange: Subject<any> = new Subject<any>();

    public applyFilter: any;
    public exportSandboxDetail: any;
    public exportSandboxData: any;
    invoiceDataCount = 0;

    renderVendor = [];
    vendorsList: any = [];
    renderVendorId: any = [];
    changedVendor: any = [];
    renderRepName: any = [];
    repList: any = [];
    items: MenuItem[];
    columnDefs2: any;
    sandBoxGridData: any;
    isFilterData: any;
    recordPublishedOrCompleted = false;
    selectedRowData: any;
    ticketValPopup: any;
    NoteValPopup: any;
    popupForm: FormGroup;
    @ViewChild('popup1') popup1!: TemplateRef<any>;
    @ViewChild('nccText') nccText!: TemplateRef<any>;
    constructor(public sandBoxService: SandBoxService, public _formBuilder: FormBuilder, public dialog: MatDialog, private locationService: LocationService) {
        this.sideBar = {
            toolPanels: ['columns', 'filters']
        };

        this.rowSelection = 'multiple';
        this.defaultColDef = {
            editable: true,
            sortable: true,
            minWidth: 100,
            filter: true,
            resizable: true,
            floatingFilter: true,
            flex: 1,
        };

        this.setColumnDefs()
        this.isFilterData = this.sandBoxService.isSwitchValue;
    }

    applyPredefinedFilter() {
        const predefinedFilterModel = {
            RepName: {
                filterType: 'text',
                type: 'contains',
                filter: `${this.userInfo?.name}`
            }
        };

        if (this.gridApi) {
            this.gridApi.setFilterModel(predefinedFilterModel);
        }
    }

    ngOnInit(): void {
        // this.setColumnDefs();

        this.items = [{
            label: 'Summary',
            routerLink: 'summary'
        },
        {
            label: 'VBA',
            routerLink: 'vba'
        },
        {
            label: 'Charge Code',
            routerLink: 'charge-code'
        },
        {
            label: 'Vendor Product Assignm',
            routerLink: 'vendor-product-assignm'
        },
        {
            label: 'Charge Validation',
            routerLink: 'charge-validation'
        },
        {
            label: 'Final Revie',
            routerLink: 'final-revie'
        },
        {
            label: 'Complete',
            routerLink: 'complete'
        }
        ];

        this.getRepNameData();

        this.recordPublishedOrCompleted = ['Published', 'Complete'].includes(this.sandBoxGridRowData?.SandboxStatusDisplayText);

        this._unsubscribeVendor.next(null);
        this.locationService
            .getVendorDropdown()
            .pipe(takeUntil(this._unsubscribeVendor))
            .subscribe({
                next: (data) => {
                    if (data && data.Data.$values) {
                        this.vendorsList = data.Data.$values;
                        this.renderVendor = this.vendorsList.map((x: any) => x.AccountName);
                        this.renderVendorId = this.vendorsList.map((x: any) => x.Id);
                        // this.setColumnDefs();
                    }
                }
            });
        // this.getSandboxData();

        let headerData: any = [];
        let ChildHeaderData: any = [];
        let i = 0;
        let childIndex = 0;
        _.map(this.columnDefs2, (x: any) => {
            if (isValueExist(x.headerName) && x.headerName !== "Actions") {
                i = i + 1;
                headerData.push({ position: i, title: x.headerName });
                if (x.children) {
                    _.map(x.children, (y: any) => {
                        childIndex = childIndex + 1;
                        let obj: any = { Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i };
                        if (y.field == 'AmountToPayDisplay' || y.field == 'DifferencesDisplay' || y.field == 'TotalCurrentChargesDisplay' || y.field == 'PastDueAmountDisplay') {
                            obj['isCurrency'] = true;
                        }
                        ChildHeaderData.push(obj)
                    })
                }
            }
        });

        this.exportSandboxDetail = {
            ExportToExcelData: {
                HeaderData: headerData,
                ChildHeaderData: ChildHeaderData,
                fileName: "Sandbox"
            },
            ExportToExcel: true
        };

        this.exportSandboxData = this.exportSandboxDetail;
        this.getStatus();
    }

    toggle() {
        this.onAgGridReady(this.gridApi);
    }
    toggleSwitch() {
        this.sandBoxService.isSwitchValue = this.isFilterData;
        this.onAgGridReady(this.gridApi);
    }
    onFilterChanged(event: any) {
        this.sandBoxService.sandboxFilter = event.api.getFilterModel();
    }
    onAgGridReady($event: any) {
        this.gridApi = $event;

        if (this.gridApi.api) {
            this.gridApi.api.setFilterModel(this.sandBoxService.sandboxFilter);
        } else {
            this.gridApi.setFilterModel(this.sandBoxService.sandboxFilter);
        }
        let dataSource: any = {
            rowCount: null,
            getRows: (params: any) => {
                let paramsRequest = params['request'];
                const filterArray: any = [];
                const filterArrayDate: any = [];
                const filterArrayNumber: any = [];

                for (var key in paramsRequest.filterModel) {
                    let data = paramsRequest.filterModel[key];
                    let arr;
                    let arrDate;
                    let arrNumber;

                    if (key == 'AmountToPayDisplay') {
                        key = 'AmountToPay'
                    }
                    if (key == 'DifferencesDisplay') {
                        key = 'Differences'
                    }
                    if (key == 'TotalCurrentChargesDisplay') {
                        key = 'TotalCurrentCharges'
                    }
                    if (key == 'PastDueAmountDisplay') {
                        key = 'PastDueAmount'
                    }

                    if (key === 'PayByDate' || key === 'PendingDate' || key === 'InvoiceBillDate' || key === 'InvoiceRetrievalDate' || key === 'ActualInvoiceRetrievalDate' || key === 'DataRetrievalDate' || key === 'ActualDataRetrievalDate' || key == 'PublishedDate') {
                        arrDate = processDateFilter(key, data);
                        filterArrayDate.push(arrDate);
                    } else if (key == 'AmountToPay' || key == 'Differences' || key == 'TotalCurrentCharges' || key == 'PastDueAmount') {
                        arrNumber = processNumberFilter(key, data);
                        filterArrayNumber.push(arrNumber);
                    } else {
                        arr = processTextFilter(key, data);
                        filterArray.push(arr);
                    }
                }
                let data: any = {
                    StartRowIndex:
                        paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
                    MaximumRows: 100
                };

                if (filterArrayDate && filterArrayDate.length > 0) {
                    data['advanceDateFilter'] = filterArrayDate;
                }
                if (!this.isFilterData) {
                    filterArray.push({
                        "filterKey": "ToggleAll",
                        "filterOperationType": "AND",
                        "filterOptionType1": "equals",
                        "filterOptionType2": null,
                        "filterOptionValue1": "No",
                        "filterOptionValue2": null
                    })
                }
                if (filterArray && filterArray.length > 0) {
                    data['advanceFilter'] = filterArray;
                }
                if (filterArrayNumber && filterArrayNumber.length > 0) {
                    data['advanceNumberFilter'] = filterArrayNumber;
                }

                // if (this.selectedTem != 'all') {
                //   data['TemAccountId'] = parseInt(this.selectedTem);
                // }


                if (paramsRequest.sortModel.length > 0) {

                    Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
                        if (key['children']) {
                            Object.values(key['children']).forEach((k: any) => {
                                if (k['field'] === paramsRequest.sortModel[0].colId) {
                                    data['OrderBy'] = (k['field'] === 'AmountToPayDisplay') ? 'AmountToPay' : (k['field'] === 'DifferencesDisplay') ? 'Differences' :
                                        (k['field'] === 'TotalCurrentChargesDisplay') ? 'TotalCurrentCharges' : (k['field'] === 'PastDueAmountDisplay') ? 'PastDueAmount' :
                                            k['field'];
                                    data['SortOrder'] = paramsRequest.sortModel[0].sort;
                                }
                            });
                        }
                    });
                }
                this.exportSandboxData = { ...this.exportSandboxDetail, ...data };
                // this.selectedTemDD = this.selectedTem;
                this._unsubscribeGRid.next(null);
                this.sandBoxService
                    .getSandboxGridData(data)
                    .pipe(takeUntil(this._unsubscribeGRid))
                    .subscribe(
                        async (data: any) => {
                            this.rowData = data.Data.$values;
                            this.invoiceDataCount = _.cloneDeep(data?.TotalCount);

                            if (data && data.Data.$values.length > 0) {
                                let lastRow = -1;
                                if (data.TotalCount <= paramsRequest.startRow + 100) {
                                    lastRow = data.TotalCount;
                                }
                                params.success({
                                    rowData: data.Data.$values,
                                    rowCount: lastRow
                                });
                            } else {
                                params.success({
                                    rowData: [],
                                    rowCount: 0
                                });
                                this.gridApi.showNoRowsOverlay();
                            }
                        },
                        (error) => {
                            params.success({
                                rowData: [],
                                rowCount: 0
                            });
                            this.gridApi.showNoRowsOverlay();
                        }
                    );
            },
        };

        if (this.gridApi.api) {
            this.gridApi.api.setGridOption("serverSideDatasource", dataSource);
        } else {
            this.gridApi.setGridOption("serverSideDatasource", dataSource);
        }
    }

    exportData() {
        this.isDisableSandbox = true;

        delete this.exportSandboxData.StartRowIndex;
        delete this.exportSandboxData.MaximumRows;

        this.sandBoxService
            .sandboxDataExport(this.exportSandboxData)
            .subscribe({
                next: data => {
                    this.isDisableSandbox = false;
                    let bolbUrl = URL.createObjectURL(data);
                    var link = document.createElement("a");
                    link.setAttribute("href", bolbUrl);
                    link.setAttribute("download", "Sandbox.xlsx");
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                },
                error: error => {
                    this.isDisableSandbox = false;

                }
            }
            );
    }

    ngOnDestroy(): void {
        this.isCompanyFormSubmit = false;
        this._unsubscribeVendor.next(null);
        this._unsubscribeVendor.complete();
        this._unsubscribeVendorChange.next(null);
        this._unsubscribeVendorChange.complete();
        this._unsubscribeRepName.next(null);
        this._unsubscribeRepName.complete();
        this._unsubscribeChargeRepChange.next(null);
        this._unsubscribeChargeRepChange.complete();
    }

    onAgGridReadyEmit($event: any) {
        this.gridApi = $event.api;
        this.gridColumnApi = $event.columnApi;
    }

    getSandboxData() {
        this.sandBoxService.getSandboxGrid().subscribe((data: any) => {
            if (data.Success) {
                this.sandBoxGridData = data.Data.$values;
            } else {
                this.sandBoxGridData = [];
            }
        });
    }

    setColumnDefs() {
        this.columnDefs2 = [

            {
                headerName: 'Status',
                defaultMinWidth: 100,
                children: [
                    {
                        field: 'SandboxStatusDisplayText',
                        headerName: 'Status',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 140,
                        minWidth: 140,
                        flex: 0,
                        filter: 'agTextColumnFilter',

                    },

                    {
                        field: 'RepName',
                        headerName: 'Rep Name',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 140,
                        minWidth: 140,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        // cellEditor: 'agRichSelectCellEditor',
                        filterParams: {
                            values: this.repList
                        },
                        cellClass: 'custom-cell-class-p-dropdown',
                        cellStyle: (params: any) => { return params.data?.SandboxStatusDisplayText === 'Pending' || params.data?.SandboxStatusDisplayText === 'Working' || params.data?.SandboxStatusDisplayText === 'Data Issue' || params.data?.SandboxStatusDisplayText === 'Priority Working' ? { 'line-height': 'unset' } : { 'pointer-events': 'none', opacity: '0.4', 'line-height': 'unset' }; },
                        cellRendererParams: {
                            onClick: this.onRepnameChange.bind(this)
                        },
                        cellRenderer: RepnameCellRenderer
                    },
                    // {
                    //     field: 'InvoiceNumber',
                    //     headerName: 'Invoice Number',
                    //     columnGroupShow: 'close',
                    //     editable: false,
                    //     width: 147,
                    //     minWidth: 147,
                    //     flex: 0,
                    //     filter: 'agTextColumnFilter',
                    // },
                    {
                        field: 'Step1ValidationSummaryTotal',
                        headerName: 'Invoice Total',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 127,
                        minWidth: 127,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'Step2VBAAssignment',
                        headerName: 'VBA Validation 2',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 151,
                        minWidth: 151,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'Step3ChargeCodeAssignment',
                        headerName: 'Charge Code Assignment 3',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 212,
                        minWidth: 212,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'Step4ChargeValidation',
                        headerName: 'Charge Validation 4',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 168,
                        minWidth: 168,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'Step4_3_4CostDistributionRules',
                        headerName: 'Cost Distribution 4 ¾',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 179,
                        minWidth: 179,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'Step5VendorProductAssignment',
                        headerName: 'Vendor Product Assignment 5',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 229,
                        minWidth: 229,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'Step6Distribution',
                        headerName: 'Final Distribution 6',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 165,
                        minWidth: 165,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'Step7FinalInvoiceReview',
                        headerName: 'Final Invoice Review 7',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 181,
                        minWidth: 181,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellRenderer: function (params: any) {
                            return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
                        }
                    },
                    {
                        field: 'DataRetrievalSourceName',
                        headerName: 'Source',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 135,
                        minWidth: 135,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    }
                ],
            },
            {
                headerName: 'Vendor',
                children: [
                    {
                        field: 'VendorBillingAliasName',
                        headerName: 'VBA',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 100,
                        minWidth: 100,
                        flex: 0,
                        filter: 'agTextColumnFilter'
                    },
                    {
                        field: 'VendorAccountName',
                        headerName: 'Vendor',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 180,
                        minWidth: 180,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        cellClass: 'custom-cell-class-p-dropdown',
                        filterParams: {
                            values: this.vendorsList,
                        },
                        cellRenderer: VendorDropdownCellRenderer,
                        cellStyle: (params: any) => { return params.data?.SandboxStatus !== 'No Vendor' ? { 'pointer-events': 'none', opacity: '0.4', 'line-height': 'unset' } : { 'line-height': 'unset' }; },
                        cellRendererParams: {
                            onClick: this.onBtnClick2.bind(this)
                        }
                    },
                    {
                        field: 'PayableVendorAccountName',
                        headerName: 'Account Vendor',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 149,
                        minWidth: 149,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },
                ],
            },
            {
                headerName: 'Account',
                children: [
                    {
                        field: 'PayableBillingAccountNumber',
                        headerName: 'Payable Account Number',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 210,
                        minWidth: 210,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },
                    {
                        field: 'MainBillingAccountNumber',
                        headerName: 'Main Account Number',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 200,
                        minWidth: 200,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },
                    {
                        field: 'InvoiceNumber',
                        headerName: 'Invoice Number',
                        columnGroupShow: 'open',
                        // columnGroupShow: 'close',
                        editable: false,
                        width: 147,
                        minWidth: 147,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },
                    {
                        field: 'PayableAccountStatus',
                        headerName: 'Account Status',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 141,
                        minWidth: 141,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },

                ],
            },
            {
                headerName: 'Dates',
                children: [
                    {
                        field: 'InvoiceBillDate',
                        headerName: 'Invoice Date',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 126,
                        minWidth: 126,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.InvoiceBillDate) {
                                return moment(params?.data?.InvoiceBillDate).format('MM/DD/YYYY');
                            }
                            return '';
                        },
                    },
                    {
                        field: 'PayByDate',
                        headerName: 'Pay By Date',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 122,
                        minWidth: 122,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.PayByDate) {
                                return moment(params?.data?.PayByDate).format('MM/DD/YYYY');
                            }
                            return '';
                        },
                    },
                    {
                        field: 'DaysInSandbox',
                        headerName: 'Days in SB',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 114,
                        minWidth: 114,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },
                    {
                        field: 'SBSLADaysRemaining',
                        headerName: 'SLA Left',
                        columnGroupShow: 'close',
                        editable: false,
                        minWidth: 105,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                        // valueGetter(params) {
                        //     if (params.data.SBSLADaysRemaining > 0) {
                        //         return params.data.SBSLADaysRemaining;
                        //     }
                        //     return 0;
                        // }
                    },


                    {
                        field: 'PendingDate',
                        headerName: 'Pending Date',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 160,
                        minWidth: 160,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.PendingDate) {
                                return moment(params?.data?.PendingDate).format('MM/DD/YYYY HH:MM:SS');
                            }
                            return '';
                        },
                    },
                    {
                        field: 'SandboxProcessDays',
                        headerName: 'Sandbox Process Days',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 183,
                        minWidth: 183,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },

                    {
                        field: 'InvoiceRetrievalDate',
                        headerName: 'Invoice Retrieval Date',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 180,
                        minWidth: 180,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.InvoiceRetrievalDate) {
                                return moment(params?.data?.InvoiceRetrievalDate).format('MM/DD/YYYY');
                            }
                            return '';
                        },
                    },
                    {
                        field: 'ActualInvoiceRetrievalDate',
                        headerName: 'Actual Invoice Retrieval Date',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 221,
                        minWidth: 221,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.ActualInvoiceRetrievalDate) {
                                return moment(params?.data?.ActualInvoiceRetrievalDate).format('MM/DD/YYYY');
                            }
                            return '';
                        },
                    },
                    {
                        field: 'DataRetrievalDate',
                        headerName: 'Data Retrieval Date',
                        columnGroupShow: 'open',
                        editable: false,
                        minWidth: 166,
                        width: 166,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.DataRetrievalDate) {
                                return moment(params?.data?.DataRetrievalDate).format('MM/DD/YYYY');
                            }
                            return '';
                        },
                    },
                    {
                        field: 'ActualDataRetrievalDate',
                        headerName: 'Actual Data Retrieval Date',
                        columnGroupShow: 'open',
                        editable: false,
                        minWidth: 207,
                        width: 207,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.ActualDataRetrievalDate) {
                                return moment(params?.data?.ActualDataRetrievalDate).format('MM/DD/YYYY');
                            }
                            return '';
                        },
                    },
                    {
                        field: 'PublishedDate',
                        headerName: 'Published Date',
                        columnGroupShow: 'open',
                        editable: false,
                        minWidth: 143,
                        width: 143,
                        flex: 0,
                        filter: 'agDateColumnFilter',
                        valueGetter(params: any) {
                            if (params?.data?.PublishedDate) {
                                return moment(params?.data?.PublishedDate).format('MM/DD/YYYY');
                            }
                            return '';
                        },
                    }
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
                        width: 180,
                        minWidth: 180,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },
                    {
                        field: 'TEMAccountName',
                        headerName: 'TEM',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 140,
                        minWidth: 140,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    },
                    {
                        field: 'BilledCompanyName',
                        headerName: 'Billed Company Name',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 184,
                        minWidth: 184,
                        flex: 0,
                        filter: 'agTextColumnFilter',
                    }
                ],

            },
            {
                headerName: 'Charges',
                children: [
                    {
                        field: 'AmountToPayDisplay',
                        headerName: 'Amount To Pay',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 144,
                        minWidth: 144,
                        flex: 0,
                        filter: 'agNumberColumnFilter',
                        cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
                    },
                    {
                        field: 'TotalCurrentChargesDisplay',
                        headerName: 'Total Current Charges',
                        columnGroupShow: 'close',
                        editable: false,
                        width: 181,
                        minWidth: 181,
                        flex: 0,
                        filter: 'agNumberColumnFilter',
                        cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
                    },
                    {
                        field: 'PastDueAmountDisplay',
                        headerName: 'Past Due Balance',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 154,
                        minWidth: 154,
                        flex: 0,
                        filter: 'agNumberColumnFilter',
                        cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
                    },
                    {
                        field: 'DifferencesDisplay',
                        headerName: 'Difference',
                        columnGroupShow: 'open',
                        editable: false,
                        width: 120,
                        minWidth: 120,
                        flex: 0,
                        filter: 'agNumberColumnFilter',
                        cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
                    }
                ],
            },
            {
                headerName: 'Actions',
                children: [
                    {
                        headerName: 'Actions',
                        filter: false,
                        editable: false,
                        // width: 135,
                        // minWidth: 135,
                        // width: 145,
                        minWidth: 145,
                        cellStyle: {
                            'display': 'flex',
                            'justify-content': 'center'
                        },
                        cellRenderer: ActionButtonRender,
                        cellRendererParams: {
                            onClick: this.onBtnClick1.bind(this),
                            statusList: this.statusList
                        }
                    }
                ]
            }
        ];
        this.frameworkComponents = {
            ActionButtonRender: ActionButtonRender,
            VendorDropdownCellRenderer: VendorDropdownCellRenderer,
            RepnameCellRenderer: RepnameCellRenderer
        }

    }

    reloadOverviewData($event: any) {
        this.reloadOverview = true;
    }

    getStatus() {

        this.sandBoxService.statusList().subscribe((res: any) => {
            this.statusList = res.Data.$values;
        })
    }

    onBtnClick1(e: any) {
        if (e.reload) {
            this.onAgGridReady(this.gridApi)
        } else {
            this.openInvoiceRetrieval.emit(e);
        }
    }

    onBtnClick2(e: any) {
        const findSelectedVendor = _.find(this.vendorsList, (v: any) => {
            return v.Id === e.vendorAccountId
        });

        this.changedVendor.push({
            vendorAccountId: findSelectedVendor.Id, name: e.params.VendorBillingAliasName
        });
        let passData = {
            vendorBillingAliasSaveDtos: this.changedVendor,
            isNoVendor: true
        }

        this._unsubscribeVendorChange.next(null);
        if (this.changedVendor.length > 0) {
            this.sandBoxService.updateVBAbyChargeCode(e.params.SBInvoiceId, passData).pipe(takeUntil(this._unsubscribeVendorChange))
                .subscribe((data: any) => {
                    if (data.Success) {
                        const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
                        this.onAgGridReady(a);
                        this.changedVendor = []
                    }
                });
        }
    }

    onRepnameChange(event: any) {
        this._unsubscribeChargeRepChange.next(null);
        this.sandBoxService.changeSBRepName(event.params.SBInvoiceId, event.RepUserId).pipe(takeUntil(this._unsubscribeChargeRepChange)).subscribe((res: any) => {
            if (res.Success) {
                const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
                this.onAgGridReady(a)
            }
        });
    }

    addProduct() {
        const dialogRef = this.dialog.open(AddProductComponent, {
            width: '900px',
            panelClass: 'addVendorProduct',
            data: {
                colseButton: true,
                data: this.rowData,
            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe((result) => {
        });
    }

    addVendorProduct() {
        const dialogRef = this.dialog.open(AddVendorProductComponent, {
            width: '900px',
            panelClass: 'addVendorProduct',
            data: {
                colseButton: true,
                data: this.rowData,
            },
            disableClose: true
        });
        dialogRef.afterClosed().subscribe((result) => {
        });
    }

    SandboxGridTooltip() {
        const dialogRef = this.dialog.open(SandboxGridCTooltipComponent, {
            width: '900px',
            data: {
                colseButton: true,
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
        });
    }

    get f(): any {
        return this.popupForm?.controls;
    }

    closePopup() {
        this.dialog.closeAll()
    }

    openPopup($event: any) {
        this.isCompanyFormSubmit = false;
        if ($event.data.SandboxStatusDisplayText === 'Disconnected Account' || $event.data.SandboxStatusDisplayText === 'No Charges' || $event.data.SandboxStatusDisplayText === 'Do Not Process') {
            this.popupForm = this._formBuilder.group({
                ticket: new FormControl('', [Validators.required]),
                Note: new FormControl('', [Validators.required]),
            });

            this.selectedRowData = $event.data;
            this.selectedRowData['InvoiceBillDate'] = $event.data.InvoiceBillDate !== null ? moment($event.data.InvoiceBillDate).format('MM/DD/YYYY') : '';
            this.selectedRowData['PayByDate'] = $event.data.PayByDate !== null ? moment($event.data.PayByDate).format('MM/DD/YYYY') : '';

            this.sandBoxService.getValidationtotalsummary(this.selectedRowData.SBInvoiceId).subscribe((datas: any) => {
                this.selectedRowData['summary'] = datas.Data;
                const formatNumber = (value: any) =>
                    value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00";

                const checkValueOrZero = (value: any) =>
                    checkIsValueExistswithZero(value) ? value : "0.00";

                const fieldsToFormat = [
                    "PastDueAmount",
                    "PreviousBillBalance",
                    "PaymentAmount",
                    "TotalAdjustment",
                    "TotalCurrentCharges",
                    "TotalDueAmount",
                    "AmountToPay",
                ];

                fieldsToFormat.forEach((field) => {
                    let value = this.selectedRowData['summary'][field];
                    this.selectedRowData['summary'][field] = formatNumber(value);
                    this.selectedRowData['summary'][field] = checkValueOrZero(this.selectedRowData['summary'][field]);
                    this.selectedRowData['summary'][field] = this.selectedRowData['summary'][field] || "0.00";
                });

                this.selectedRowData['summary']['AmountToPay'] =
                    this.selectedRowData['summary']['AmountToPay']
                        ? (this.selectedRowData['summary']['AmountToPay']) : "0.00";
                // : this.selectedRowData['summary']['AmountToPay'] + ".00"


                this.sandBoxService.getInvoiceOverview(this.selectedRowData.SBInvoiceId).subscribe((dataa: any) => {
                    this.selectedRowData['overview'] = dataa.Data;
                    this.selectedRowData['overview']['DisconnectionDate'] = dataa.Data.DisconnectionDate !== null ? moment(dataa.Data.DisconnectionDate).format('MM/DD/YYYY') : '';
                    this.f['ticket'].setValue(isValueExist(this.selectedRowData['overview'].TicketNumber));
                    this.f['Note'].setValue(isValueExist(this.selectedRowData['overview'].Notes));

                    this.dialog.open(this.popup1, {
                        disableClose: true,
                        width: '900px',
                        data: {
                            colseButton: true,
                        }
                    });
                });
            })
        } else {
            this.onCellDoubleClicked($event);
        }
    }

    isDecimal(num: any) {
        if (num == 0) {
            return false;
        } else {
            return num.toString().includes('.');
        }
    }

    openPopupSub() {
        this.dialog.open(this.nccText, {
            width: '650px',
            data: {
                colseButton: true,
            }
        });
    }

    onCellDoubleClicked($event: any) {
        // Check role permissions
        if (!rolePermission(['SuperTEMAdmin', 'SuperTEMManager'])) {
            return;
        }

        const statusText = $event.data.SandboxStatusDisplayText;
        const validStatuses = [
            'Pending',
            'Working',
            'Processing',
            'Data Issue',
            'Published',
            'Complete',
            'Unpublished',
            'Priority Working',
        ];

        // Handle published or completed records
        this.recordPublishedOrCompleted = ['Published', 'Complete'].includes(statusText);
        this.onRecordPublishedOrCompleted.emit(this.recordPublishedOrCompleted);

        // Check if the status is valid for processing
        if (validStatuses.includes(statusText)) {
            let step = 1;

            if (!$event.data.Step1ValidationSummaryTotal) step = 1;
            else if (!$event.data.Step2VBAAssignment) step = 2;
            else if (!$event.data.Step3ChargeCodeAssignment) step = 3;
            else if (!$event.data.Step4ChargeValidation) step = 4;
            else if (!$event.data.Step4_3_4CostDistributionRules) step = 5;
            else if (!$event.data.Step5VendorProductAssignment) step = 6;
            else if (!$event.data.Step6Distribution) step = 7;
            else if (!$event.data.Step7FinalInvoiceReview) step = 8;

            // Emit events with step and data
            this.onDoubleClickSandbox.emit(step);
            this.onDoubleClickSandboxData.emit($event.data);
        }
        // Handle other statuses
        else if (['No Vendor', 'No Retrieval Record'].includes(statusText)) {
            // Add logic if needed for these statuses
        }
    }


    step1DoneFn($event: any) {
        this.step1Done.emit($event)
    }
    step2DoneFn($event: any) {
        this.step2Done.emit($event)
    }
    invoiceOverviewDataOutput($event: any) {
        this.overviewData = $event;
        this.invoiceOverviewDataOP.emit($event);
    }

    clickOnSavedfn($event: any) {
        this.clickOnSaved.emit($event);
    }

    onCellValueChangedEvent(event: any) {
    }

    getRepNameData() {
        let data: any = {
            StartRowIndex: 1,
            maximumRows: null,
            advanceFilter: [
                {
                    "filterKey": "UserStatus",
                    "filterOptionType1": "equals",
                    "filterOptionValue1": "active",
                    "filterOperationType": "AND",
                    "filterOptionType2": null,
                    "filterOptionValue2": null
                },
                {
                    "filterKey": "TEMDisplayRole",
                    "filterOperationType": "AND",
                    "filterOptionType1": "contains",
                    "filterOptionType2": null,
                    "filterOptionValue1": "super",
                    "filterOptionValue2": null
                }
            ]
        };
        this.locationService
            .getTemusers(data)
            .pipe(takeUntil(this._unsubscribeRepName))
            .subscribe(
                async (data: any) => {
                    if (data && data.Data.$values) {
                        this.repList = data.Data.$values;
                        this.renderRepName = this.repList.map((e: any) => { return e.FullName });
                        this.setColumnDefs();
                    }
                });
    }

    saveCompany() {
        this.isCompanyFormSubmit = true;
        if (!this.popupForm.valid) {
            return;
        }
        this.saveButtonDisabled = true;
        const data = {
            "ticketNumber": this.f['ticket'].value,
            "notes": this.f['Note'].value,
            "sbInvoiceId": this.selectedRowData.SBInvoiceId
        }
        this.sandBoxService.markCloseInvoiceFn(data).subscribe((dataa: any) => {
            this.saveButtonDisabled = false;
            this.toggle()
            this.closePopup();
        });
    }

    openInventory() {
        //   this.closePopup();
        const link = this.currentUrl + '/inventory/wireline?frompage=sandbox&PayableBillingAccountHierarchyId=' + this.selectedRowData.PayableBillingAccountHierarchyId
        window.open(link, '_blank');
    }

    downloadFile() {

        this.sandBoxService.downloadDataFiles(this.selectedRowData['overview'].SBInvoiceId).subscribe((res) => {
            if (res.type == 'application/json') {

            } else {
                let bolbUrl = URL.createObjectURL(res);
                var link = document.createElement("a");
                link.setAttribute("href", bolbUrl);
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            }
        });

    }

    downloadAttachment() {

        this.locationService.DownloadInvoiceAttachment(this.selectedRowData['overview'].ExpectedInvoiceId).subscribe((res) => {
            if (res.type == 'application/json') {

            } else {

                let bolbUrl = URL.createObjectURL(res);
                window.open(bolbUrl);
                var link = document.createElement("a");
                link.setAttribute("href", bolbUrl);
                link.setAttribute("download", this.selectedRowData['overview'].ExpectedInvoiceAttachmentGeneratedFileName);
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);


            }
        });
    }


    onBtnExportDataAsExcel() {
        if (!this.selectedRowData['overview'] || this.selectedRowData['overview'].length === 0) {

            return;
        }

        // Disable the export button while exporting


        // Prepare data for export
        const exportData = {
            exportFilename: 'Invoice_Overview.xlsx',
            sheetName: 'Invoice Overview',
            gridApi: this.gridApi,
            gridColumnApi: this.gridColumnApi
        };



        this.sandBoxService.downloaBDFFiles(this.selectedRowData['overview'].SBInvoiceId).subscribe({
            next: (data: Blob) => {
                const blobUrl = URL.createObjectURL(data);
                const link = document.createElement("a");
                link.setAttribute("href", blobUrl);
                link.setAttribute("download", exportData.exportFilename);
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild


            }
        });
    }

}
