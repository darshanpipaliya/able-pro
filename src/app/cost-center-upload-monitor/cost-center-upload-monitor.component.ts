import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UploadFileCcrComponent } from './upload-file-ccr/upload-file-ccr.component';
import { formatDate } from '@angular/common';
import { LocationService } from '../services/location.service';
import { checkIsValueExists, isValueExist } from '../services/helper';
import { filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from '../services/common-p-table';
import { PrimgModule } from '../demo/shared/primeng.module';
import { SharedModule } from '../demo/shared/shared.module';

interface arrDate {
    filterKey: any;
    filterOptionType1: any;
    filterOptionValue1: any;
    filterOptionValue1_2?: any;
    filterOptionValue2_2?: any;
    filterOperationType: any;
    filterOptionType2: any;
    filterOptionValue2: any;
}

@Component({
    selector: 'app-cost-center-upload-monitor',
    templateUrl: './cost-center-upload-monitor.component.html',
    styleUrls: ['./cost-center-upload-monitor.component.scss'],
    imports: [SharedModule, PrimgModule]
})
export class CostCenterUploadMonitorComponent implements OnInit {

    @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
    @Output() onSelectedRow: EventEmitter<any> = new EventEmitter<any>();
    @Output() gridTable: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAgGridReadyCostCenterRepoEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectedTemCCrValue: EventEmitter<any> = new EventEmitter<any>();
    @Output() exportCCRepoData: EventEmitter<any> = new EventEmitter<any>();
    @Output() isCCRepoExist: EventEmitter<any> = new EventEmitter<any>();

    @Input() selectedTemCCR: any;
    @Input() isReloadCCRepo: any;
    @ViewChild('ccText') ccText!: TemplateRef<any>;
    downloadFile: any = [];
    CCRepoIds: any = [];
    columnDefs: any = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            floatingFilter: true,
            suppressMenu: true,
            minWidth: 150,
            maxWidth: 50,
            width: 100,
            flex: 0,
            resizable: true,
            sortable: false,
            filter: false,
            suppressColumnsToolPanel: true
        },
        {
            headerName: 'Status',
            children: [
                {
                    headerName: 'Status',
                    field: 'StatusDisplay',
                    filter: 'agTextColumnFilter',
                    minWidth: 120,
                    flex: 0,
                    editable: false,
                    sortingField: 'StatusDisplay'
                },

            ]
        },
        {
            headerName: 'Organization',
            children: [
                {
                    headerName: 'Customer',
                    field: 'CustomerAccountName',
                    columnGroupShow: 'close',
                    filter: 'agTextColumnFilter',
                    minWidth: 130,
                    flex: 0,
                    sortingField: 'CustomerAccountName'
                },
                {
                    headerName: 'Company',
                    field: 'CompanyName',
                    columnGroupShow: 'close',
                    filter: 'agTextColumnFilter',
                    minWidth: 130,
                    flex: 0,
                    sortingField: 'CompanyName'
                }
            ]
        },
        {
            headerName: 'GL Codes',
            children: [
                {
                    field: 'GLCodeFormatted',
                    headerName: 'GL Code',
                    resizable: true,
                    columnGroupShow: 'close',
                    filter: 'agTextColumnFilter',
                    minWidth: 140,
                    sortingField: 'GLCodeFormatted'
                },
                {
                    headerName: 'Description',
                    field: 'Description',
                    resizable: true,
                    columnGroupShow: 'close',
                    filter: 'agTextColumnFilter',
                    minWidth: 140,
                    sortingField: 'Description'
                }
            ]
        },
        {
            headerName: 'GL Code Structure',
            children: [
                {
                    field: 'GLCode1Formatted',
                    headerName: 'GL Code 1',
                    columnGroupShow: 'close',
                    filter: 'agTextColumnFilter',
                    minWidth: 200,
                    flex: 0,
                    sortingField: 'GLCode1Formatted'
                },
                {
                    field: 'GLCode2Formatted',
                    headerName: 'GL Code 2',
                    columnGroupShow: 'open',
                    filter: 'agTextColumnFilter',
                    minWidth: 120,
                    flex: 0,
                    sortingField: 'GLCode2Formatted'
                },
                {
                    field: 'GLCode3Formatted',
                    headerName: 'GL Code 3',
                    columnGroupShow: 'open',
                    filter: 'agTextColumnFilter',
                    minWidth: 120,
                    flex: 0,
                    sortingField: 'GLCode3Formatted'
                },

                {
                    field: 'GLCode4Formatted',
                    headerName: 'GL Code 4',
                    columnGroupShow: 'open',
                    sortingField: 'GLCode4Formatted',
                    filter: 'agTextColumnFilter',
                    minWidth: 120,
                    flex: 0,
                },
                {
                    field: 'GLCode5Formatted',
                    headerName: 'GL Code 5',
                    columnGroupShow: 'open',
                    sortingField: 'GLCode5Formatted',
                    filter: 'agTextColumnFilter',
                    minWidth: 120,
                    flex: 0,
                },
                {
                    field: 'GLCode6Formatted',
                    headerName: 'GL Code 6',
                    columnGroupShow: 'open',
                    sortingField: 'GLCode6Formatted',
                    filter: 'agTextColumnFilter',
                    minWidth: 120,
                    flex: 0,
                },
                {
                    field: 'Type',
                    headerName: 'GL Code Type',
                    resizable: true,
                    sortingField: 'Type',
                    // cellEditor: 'agRichSelectCellEditor',
                    // cellEditorParams: {
                    //     values: ['Job', 'GL']
                    // },
                    columnGroupShow: 'open',
                    filter: 'agTextColumnFilter',
                    minWidth: 170
                }
            ]
        }
    ];
    public exportCCRepo: any;
    public exportCCRepoDetail: any;

    rowSelection: any = 'multiple';
    defaultColDef = {
        sortable: true,
        minWidth: 100,
        filter: true,
        resizable: true,
        floatingFilter: true,
        flex: 1,
        menuTabs: ['generalMenuTab', 'columnsMenuTab'],
    };
    sideBar: any = {
        toolPanels: ['columns', 'filters']/* ,
        defaultToolPanel: 'columns', */
    };
    rowData: any = [];
    stopSpinner: boolean = false;

    isCustomerAdmin: boolean = false;
    isCompanyAdmin: boolean = false;
    gridOptions: any;

    gridApi: any;
    customers: any = [];
    customersVal: any;
    companies: any = [];
    companiesVal: any;
    costcenterVal: any = '';
    filteredData: any = [];
    customersLoader = false;
    searchBtnRefresh = false;
    private _unsubscribeGetCompanies: Subject<any> = new Subject<any>();
    private _unsubscribeGetCustomer: Subject<any> = new Subject<any>();


    sidebarVisible: boolean = false;

    files: any[];
    TotalCount = 0;

    @ViewChild('myModal') myModal: any;
    filterArray: arrDate[];
    filterArrayDate: arrDate[];
    filterArrayNumber: arrDate[];

    cols: any[];
    displaycols: any[];
    items: any[];
    colsshow: any[];
    totalRecords: number;
    loading: boolean;
    radioItems: Array<any>;

    model = { option: 'AND' };
    filterText: any = '';

    displayModal: boolean = false;
    displayModal1: boolean = false;

    selectedOption: any;
    contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
    fieldsName: any;
    sorting: any;
    sortingType: any;
    expandedNode: any | null = null;
    lastNode: any | null = null;

    countries = [
        {
            id: 1,
            name: 'contains',
            display: 'Contains',
        },
        {
            id: 2,
            name: 'notContains',
            display: 'Not contains',

        },
        {
            id: 3,
            name: 'equals',
            display: 'Equals',

        },
        {
            id: 4,
            name: 'notEqual',
            display: 'Not equal',
        },
        {
            id: 5,
            name: 'startsWith',
            display: 'Starts with',
        },
        {
            id: 6,
            name: 'endsWith',
            display: 'Ends with',
        },
    ];

    selectedFiles!: any[];

    filesColumns: any = []

    selectedOption1: any = this.countries[0].name;
    selectedOption2: any = this.countries[0].name;

    textboxValue1: any = '';
    textboxValue2: any = '';

    textboxValue1_1: any = '';
    textboxValue2_1: any = '';

    radiobutton: any = '';
    finalAllDetailArr: any;

    private _unsubscribeGRid: Subject<any> = new Subject<any>();
    private _unsubscribeService: Subject<any> = new Subject<any>();

    public getDataPath: any = (data: any) => data.dataPath;

    pTableContain = { first: 1 };
    finalFilterdArr: any;
    innerLoading = false;
    @ViewChild('treeTable') treeTable!: any;
    @ViewChild('contextMenu') contextMenu: any;
    selectedNode: any;
    public exportAccounts: any;
    filters = { fileName: '', customer: '', date: '', who: '', status: '' };
    @HostListener('document:click', ['$event']) onClick(event: Event) {
        const clickedInsideMenu = this.contextMenu.el.nativeElement.contains(event.target);
        if (!clickedInsideMenu) {
            this.contextMenu.hide();
        }
    }

    isApiAlerdayCall: boolean = false;
    onScroll(event: Event) {
        const target = event.target as HTMLElement;

        // For vertical scroll
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;
        if ((scrollTop + clientHeight >= scrollHeight - 1) &&
            this.files.length < this.totalRecords && !this.isApiAlerdayCall
        ) {
            this.lastNode = this.files[this.files.length - 1];
            this.isApiAlerdayCall = true;
            this.pTableContain.first = this.pTableContain.first ? this.pTableContain.first + 100 : 101;
            this.loadNodes(true);
        }
    }


    openSidebar() {
        this.sidebarVisible = this.sidebarVisible ? false : true;
        this.selectAllNodes(this.filesColumns);
    }

    private selectAllNodes(nodes: any[]) {


        nodes.forEach((node: any) => {
            if (node.isparent && this.cols.some(e => e.header === node.label && e.displayCheckboxColumns === false) || !node.isparent && this.cols.some(e => e.childHeader === node.label && e.displayCheckboxColumns === false)) {

            } else {
                this.selectedFiles.push(node); // Select the node
                if (node.children) {

                    this.selectAllNodes(node.children); // Recursively select children
                }
            }

        });
    }

    dropdownOptionSelected() {
        navigator.clipboard.writeText(this.selectedNode).then(
            () => {
            },
            (err) => {
            }
        );

    }

    onNodeSelect(event: any) {
        this.selectedNode = event.node;
    }

    closeSidebar() {
        this.sidebarVisible = false;
    }

    ngAfterViewInit() {
        const scrollableBody = this.treeTable.el.nativeElement.querySelector(
            '.p-treetable-scrollable-body'
        );

        if (scrollableBody) {
            scrollableBody.addEventListener('scroll', this.onScroll.bind(this));
        }
    }

    constructor(private locationService: LocationService,
        public dialog: MatDialog,
        private http: HttpClient
    ) {
        this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();
        this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();

        if (this.isCustomerAdmin || this.isCompanyAdmin) {
            this.gridOptions = {
                rowModelType: 'serverSide',
                serverSideInfiniteScroll: true,
                headerHeight: 35,
                groupHeaderHeight: 37,
                floatingFiltersHeight: 35,
                isRowSelectable: (rowNode: any) => {
                    return rowNode?.data?.AllowCCManualEdits == 'Yes';
                },
                rowSelection: {
                    type: 'multiple',
                    enableClickSelection: true
                },
            }
        } else {
            this.gridOptions = {
                rowModelType: 'serverSide',
                serverSideInfiniteScroll: true,
                headerHeight: 35,
                groupHeaderHeight: 37,
                floatingFiltersHeight: 35,
                rowSelection: {
                    type: 'multiple',
                    enableClickSelection: true
                },
            };
        }
        this.getCustomerForUser();
    }

    getCompanyByCustomerId(id: any) {
        if (checkIsValueExists(id)) {
            this._unsubscribeGetCompanies.next(null);
            this.companies = [];
            const b = { CompanyName: 'All', CompanyID: 'all' };
            this.locationService.getCompanyByCustomerId(id).pipe(takeUntil(this._unsubscribeGetCompanies)).subscribe((data) => {
                if (data && data.$values && data.$values.length > 0) {
                    this.companies = data.$values;
                    this.companies.unshift(b);
                } else {
                    this.companies = [];
                }
            }, error => {
                this.companies = [];
            });
        }
    }

    getCustomerForUser() {
        this.customers = [];
        const b = { AccountName: 'All', Id: 'all' };

        if (this.selectedTemCCR && this.selectedTemCCR === "all") {
            this.customersLoader = true;
            this._unsubscribeGetCustomer.next(null);
            this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeGetCustomer)).subscribe((data) => {
                if (data && data.$values) {
                    this.customers = data.$values;
                    this.customers.unshift(b);

                    this.customersLoader = false;
                } else {
                    this.customers = [];
                    this.customersLoader = false;
                }
            }, error => {
                this.customers = [];
                this.customersLoader = false;
            });
        } else {
            this.customersLoader = true;
            this._unsubscribeGetCustomer.next(null);
            if (checkIsValueExists(this.selectedTemCCR)) {
                this.locationService.getCustomerDropdownByNewTEM(this.selectedTemCCR).pipe(takeUntil(this._unsubscribeGetCustomer)).subscribe((data) => {
                    if (data && data.Data.$values) {
                        this.customers = data.Data.$values;
                        this.customersLoader = false;
                    } else {
                        this.customers = [];
                        this.customersLoader = false;
                    }
                }, error => {
                    this.customers = [];
                    this.customersLoader = false;
                });
            }
        }
    }

    ngOnInit(): void {

        this.setCols();

        this.stopSpinner = false;

        this.items = [
            {
                label: ' Copy',
                icon: 'pi pi-copy',
                command: () => this.dropdownOptionSelected(),
            },
        ];
        this.radioItems = ['AND', 'OR'];
        this.filterArray = [];
        this.filterArrayNumber = [];
        this.filterArrayDate = [];
        this.files = [];
        this.filteredData = [];

        this.loading = false;

        let headerData: any = [];
        let ChildHeaderData: any = [];
        let i = 0;
        let childIndex = 0;
        _.map(this.columnDefs, (x: any) => {
            if (isValueExist(x.headerName)) {
                i = i + 1;
                headerData.push({ position: i, title: x.headerName });
                if (x.children) {
                    _.map(x.children, (y: any) => {
                        childIndex = childIndex + 1;
                        ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
                    })
                }
            }
        });

        this.exportCCRepoDetail = {
            ExportToExcelData: {
                HeaderData: headerData,
                ChildHeaderData: ChildHeaderData,
                fileName: "Cost Center Repository"
            },
            ExportToExcel: true
        };
        this.exportCCRepo = this.exportCCRepoDetail;
    }

    ngOnChanges(changes: any) {
        this.getCustomerForUser();
        if (changes.isReloadCCRepo.currentValue == true) {
            this.loadNodes(true);
        }
    }

    ngOnDestroy(): any {
        this._unsubscribeGetCustomer.next(null);
        this._unsubscribeGetCustomer.complete();
        this._unsubscribeGetCompanies.next(null);
        this._unsubscribeGetCompanies.complete();
        this.exportCCRepoData.next(null);
        this.exportCCRepoData.complete();
    }

    onCellDoubleClicked($event: any) {

    }

    UploadFile() {
        const dialogRef = this.dialog.open(UploadFileCcrComponent, {
            width: '650px',
            data: {
                colseButton: true,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadNodes(true);
            }
        });
    }

    openContextMenu(event: MouseEvent, value: any) {
        event.preventDefault();


        this.fieldsName = value;
        this.contextMenuPosition.x = event.clientX;
        this.contextMenuPosition.y = event.clientY;


        let selectedOption1 = this.countries[0].name;
        let selectedOption2 = this.countries[0].name;
        let textboxValue1: any = '';
        let textboxValue2: any = '';
        let model = { option: 'AND' };

        if (this.fieldsName.type === 'text') {
            const index = this.filterArray.findIndex(
                (user) => user.filterKey === this.fieldsName.field
            );
            if (index !== -1) {
                textboxValue1 = this.filterArray[index].filterOptionValue1;
                textboxValue2 = this.filterArray[index].filterOptionValue2;


                selectedOption1 = this.filterArray[index].filterOptionType1;
                selectedOption2 = this.filterArray[index].filterOptionType2;
                model = { option: this.model.option };
            }

            this.countries = filterOptionsText();

        } else if (this.fieldsName.type === 'numberFilter') {
            const index = this.filterArrayNumber.findIndex(
                (user) => user.filterKey === this.fieldsName.field
            );
            if (index !== -1) {
                textboxValue1 = this.filterArrayNumber[index].filterOptionValue1;
                textboxValue2 = this.filterArrayNumber[index].filterOptionValue2;

                selectedOption1 = this.filterArrayNumber[index].filterOptionType1;
                selectedOption2 = this.filterArrayNumber[index].filterOptionType2;

                if (selectedOption1 === 'inrange') {
                    this.textboxValue1_1 = this.filterArrayNumber[index].filterOptionValue1_2;
                }

                if (selectedOption2 === 'inrange') {
                    this.textboxValue2_1 = this.filterArrayNumber[index].filterOptionValue2_2;
                }
                model = { option: this.model.option };

            }

            this.countries = filterOptionsNumber();

        } else {
            const index = this.filterArrayDate.findIndex(
                (user) => user.filterKey === this.fieldsName.field
            );
            if (index !== -1) {

                textboxValue1 = this.filterArrayDate[index].filterOptionValue1;
                textboxValue2 = this.filterArrayDate[index].filterOptionValue2;

                textboxValue1 = onChangeEndDate(textboxValue1, false);
                textboxValue2 = textboxValue2 ? onChangeEndDate(textboxValue2, false) : null;

                selectedOption1 = this.filterArrayDate[index].filterOptionType1;
                selectedOption2 = this.filterArrayDate[index].filterOptionType2;

                model = { option: this.model.option };

                if (selectedOption1 === 'inrange') {
                    this.textboxValue1_1 = onChangeEndDate(this.filterArrayDate[index].filterOptionValue1_2, false);
                }

                if (selectedOption2 === 'inrange') {
                    this.textboxValue2_1 = onChangeEndDate(this.filterArrayDate[index].filterOptionValue2_2, false);
                }
            }

            this.countries = filterOptionsDate();
        }

        this.textboxValue1 = textboxValue1;
        this.textboxValue2 = textboxValue2;

        this.selectedOption1 = selectedOption1;
        this.selectedOption2 = selectedOption2;
        this.model = model;

        this.displayModal = true;
        this.displayModal1 = textboxValue1 ? true : false;

        if ((event.clientX + 240) > window.innerWidth) {
            this.contextMenuPosition.x = event.clientX - 240;
        }
        event.stopPropagation();
    }

    onFilterChangedValue() {
        const filterKey = this.fieldsName.field;

        const filterEntry: any = {
            filterKey,
            filterOptionType1: this.selectedOption1,
            filterOptionValue1: this.textboxValue1,
            filterOptionType2: this.selectedOption2,
            filterOptionValue2: this.textboxValue2,
            filterOptionValue1_2: this.textboxValue1_1 || null,
            filterOptionValue2_2: this.textboxValue2_1 || null,
            condition: this.model.option
        };

        // Update the appropriate filter array
        let targetFilterArray = this.filterArray;

        if (this.fieldsName.type === 'numberFilter') {
            targetFilterArray = this.filterArrayNumber;
        } else if (this.fieldsName.type === 'dateFilter') {
            targetFilterArray = this.filterArrayDate;

            // Format dates if needed
            filterEntry.filterOptionValue1 = onChangeEndDate(this.textboxValue1, true);
            filterEntry.filterOptionValue2 = onChangeEndDate(this.textboxValue2, true);
            filterEntry.filterOptionValue1_2 = this.textboxValue1_1 ? onChangeEndDate(this.textboxValue1_1, true) : null;
            filterEntry.filterOptionValue2_2 = this.textboxValue2_1 ? onChangeEndDate(this.textboxValue2_1, true) : null;
        }

        const index = targetFilterArray.findIndex(item => item.filterKey === filterKey);
        if (index !== -1) {
            targetFilterArray[index] = filterEntry;
        } else {
            targetFilterArray.push(filterEntry);
        }

        this.displayModal = false;

        // Now apply all filters to the data
        this.applyAllFilters();
    }


    applyAllFilters() {
        let result = [...this.files]; // original unfiltered data

        const allFilters = [
            ...this.filterArray,
            ...this.filterArrayNumber,
            ...this.filterArrayDate
        ];
        allFilters.forEach(filter => {
            const { filterKey, filterOptionType1, filterOptionValue1 } = filter;

            result = result.filter(item => {
                const value = item['data'][filterKey];
                if (value == null) return false;

                switch (filterOptionType1) {
                    case 'equals':
                        return onChangeEndDate(value) === filterOptionValue1;
                    case 'contains':
                        return value.toString().toLowerCase().includes(filterOptionValue1.toString().toLowerCase());
                    case 'startsWith':
                        return value.toString().toLowerCase().startsWith(filterOptionValue1.toString().toLowerCase());
                    case 'endsWith':
                        return value.toString().toLowerCase().endsWith(filterOptionValue1.toString().toLowerCase());
                    case 'greaterThan':
                        return +value > +filterOptionValue1;
                    case 'lessThan':
                        return +value < +filterOptionValue1;
                    case 'between':
                        const lower = +filter.filterOptionValue1_2;
                        const upper = +filter.filterOptionValue2_2;
                        return +value >= lower && +value <= upper;
                    default:
                        return true;
                }
            });
        });

        this.filteredData = result;
    }


    openPopup() {
        this.dialog.open(this.ccText, {
            width: '900px',
            data: {
                colseButton: true,
            }
        });
    }

    loadNodes(allOptionsClear = false) {
        this.loading = true;
        this.files = [];

        this.locationService.getCCImportGrid().pipe(takeUntil(this._unsubscribeGRid)).subscribe(response => this.handleResponse(response, allOptionsClear),
            () => this.handleError());
    }

    // Handle the response for loadNodes
    handleResponse(response: any, allOptionsClear: any) {
        this.loading = false;
        this.searchBtnRefresh = false;
        this.totalRecords = response.TotalCount;

        if (response?.Data?.$values?.length) {

            response.Data.$values = response?.Data?.$values.map((element: any, i: any) => {
                let k = element;
                k['index'] = i;
                return k;
            });


            const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));
            this.files = allOptionsClear ? resData : [...this.files, ...resData];
            this.filteredData = [...this.files];

            this.isApiAlerdayCall = false;

        } else {
            this.files = [];
            this.filteredData = [];
            this.isApiAlerdayCall = false;
        }
        0
        this.files.length > 0 ? this.isCCRepoExist.emit(true) : this.isCCRepoExist.emit(false);
    }

    extractDataAndLeaf = (item: any) => {
        return {
            data: this.extractData(item),
            leaf: !item.HasParent,
        };
    }

    // Handle error case
    handleError() {
        this.loading = false;
        this.files = [];
        this.filteredData = [];
    }

    extractData(item: any) {
        const fields = Object.keys(item);

        return fields.reduce((acc: any, field: any) => {
            acc[field] = item[field];
            return acc;
        }, {});
    }


    onCellValueChangedEventFor($event: any) {
        $event.data.StatusCode = ($event.data.StatusDisplay).toUpperCase();

    }
    onSelectionChanged(event: any) {
        let selectedRows = event;
        this.CCRepoIds = [];
        event.forEach((element: any) => {
            this.CCRepoIds.push(element.RepoId)
        });
        this.onSelectedRow.emit(this.CCRepoIds);
    }
    apiService() {
        return this.http.get('http://localhost:4200/assets/olympic-winners.json')
    }

    onAgGridReadyEmit(data: any) {
        this.onAgGridReadyCostCenterRepoEmit.emit(data);
    }

    setCols() {
        const createColumn = ({
            parent = 0,
            width = '',
            isChildren = false,
            type = '',
            header = '',
            field = '',
            childHeader = '',
            columnGroupShow = 'close',
            colspan = 1,
            isicon = 1,
            parentWidth = 150,
            isParentVisible = true,
            displayCheckboxColumns = true,
            isToggle = true
        }) => ({
            parent,
            isicon,
            width,
            valuesset: null,
            isenable: false,
            isChildren,
            type,
            header,
            columnGroupShow,
            field,
            childHeader,
            colspan,
            parentWidth,
            isParentVisible,
            displayCheckboxColumns,
            isToggle
        });


        this.cols = [
            createColumn({ parent: 1, width: '200px', isChildren: true, type: 'text', header: 'File', field: 'OrigFileName', childHeader: 'File Name', isToggle: false }),

            createColumn({ parent: 2, width: '180px', isChildren: true, type: 'text', header: 'Organization', field: 'AccountName', childHeader: 'Customer', isToggle: false }),

            createColumn({ parent: 3, width: '170px', isChildren: true, type: 'dateFilter', header: 'Details', field: 'CreationDate', childHeader: 'Date', isToggle: false }),
            createColumn({ parent: 3, width: '150px', isChildren: false, type: 'text', field: 'CreatedBy', childHeader: 'Who', columnGroupShow: 'close' }),
            createColumn({ parent: 3, width: '150px', isChildren: false, type: 'text', field: 'StatusDisplayText', childHeader: 'Status', columnGroupShow: 'close' }),
            createColumn({ parent: 3, width: '70px', isChildren: false, type: '', field: 'Action', childHeader: 'Action', columnGroupShow: 'close' })
        ];

        this.cols.forEach((col) => {


            if (col.isChildren) {

                let data: any = {
                    "label": col.header,
                    "isparent": true,
                    "parentid": col.parent,
                    "expanded": true,
                    "children": []
                }
                const colParent = this.cols.filter(item => item.parent === col.parent);
                colParent.forEach(element => {
                    data['children'].push(
                        {
                            "label": element.childHeader,
                            "isparent": false,
                            "parentid": element.parent
                        }
                    )
                });
                this.filesColumns.push(data)

                const closedColumns = this.cols.filter(item => item.parent === col.parent && item.columnGroupShow === 'close');
                col.colspan = closedColumns.length;
                col.Parentwidth = closedColumns.map((value) => parseInt(value.width.replace('px', ''))).reduce(
                    (accumulator, currentValue) => accumulator + currentValue, 0) + 'px';
            }
        });
        this.selectedFiles = _.cloneDeep(this.filesColumns);
        this.colsshow = JSON.parse(JSON.stringify(this.cols));

        this.displaycols = this.cols.filter(col => col.columnGroupShow == 'close');

    }


    toggleColumn(index: number, columnGroupShow: string) {
        const closedColumns = this.colsshow.filter(item => item.parent === index && item.columnGroupShow === 'close');

        this.cols.forEach(item => {
            if (item.parent === index) {
                if (columnGroupShow === 'close') {
                    item.isicon = 0;
                }
                else {
                    item.isicon = 1;
                }
                const isHeaderClosed = closedColumns.some(closedItem => closedItem.childHeader === item.childHeader);
                if (!isHeaderClosed && item.displayCheckboxColumns) {
                    item.columnGroupShow = columnGroupShow;
                }
            }
        });

        if (!this.cols.some(it => it.parent === index && it.columnGroupShow === 'close')) {
            let children = this.cols.filter(k => k.parent === index && k.displayCheckboxColumns);
            if (children) {
                children[0].columnGroupShow = 'close';
            }
        }

        this.commonColumnsFn();
    }

    commonColumnsFn() {

        this.cols.forEach((col) => {
            if (col.isChildren) {

                const closedColumns = this.cols.filter(item => item.parent === col.parent && item.columnGroupShow === 'close');
                col.colspan = closedColumns.length;
                if (this.cols.filter(item => item.parent === col.parent && item.displayCheckboxColumns).length === 1 ||
                    this.colsshow.filter(item => item.parent === col.parent && item.columnGroupShow === 'open').length === 0) {
                    col.isToggle = false;
                } else {
                    col.isToggle = true;
                }

                if (this.cols.filter(item => item.parent === col.parent && item.displayCheckboxColumns).length === 0) {
                    col.isParentVisible = false;
                } else {
                    col.isParentVisible = true;
                }

                col.Parentwidth = closedColumns.map((value) => parseInt(value.width.replace('px', ''))).reduce(
                    (accumulator, currentValue) => accumulator + currentValue, 0) + 'px';
            }
        });
        this.displaycols = this.cols.filter(col => col.columnGroupShow == 'close');
    }
    OrderBy(columnName: any) {
        if (!this.sorting || this.sorting === '') {
            this.sorting = columnName;
            this.cols.forEach((item) => {
                if (item.field === columnName) {
                    item.sorting = 'asc';
                    this.sortingType = item.sorting;
                } else {
                    item.sorting = 'None';
                }
            });
        } else if (this.sorting === columnName) {
            this.sorting = columnName;
            this.cols.forEach((item) => {
                if (item.field === columnName) {
                    if (item.sorting === 'desc') {
                        this.sorting = '';
                        item.sorting = 'None';
                    } else {
                        item.sorting = 'desc';
                        this.sortingType = item.sorting;
                    }
                } else {
                    item.sorting = 'None';
                }
            });
        } else if (this.sorting != columnName) {
            this.sorting = columnName;
            this.cols.forEach((item) => {
                if (item.field === columnName) {
                    item.sorting = 'asc';
                    this.sortingType = item.sorting;
                } else {
                    item.sorting = 'None';
                }
            });
        }
        this.loadNodes(true);
    }

    onFilter(event: any) {
        const filters = event.filters; // Get the filters object
        for (const field in filters) {
            if (filters.hasOwnProperty(field)) {
            }
        }
    }
    onFilterChangedFirst(value: any, col: any) {
        if (value == '') {
            this.displayModal1 = false;
        } else {
            this.displayModal1 = true;
        }
    }

    filerOutSide(event: any, column: any) {

        setTimeout(() => {
            const activeFilters = this.displaycols.filter(col => col.valuesset);

            this.filteredData = this.files.filter((node: any) => {
                return activeFilters.every((col: any) => {
                    const fieldValue = node.data?.[col.field];
                    const filterValue = col.valuesset;
                    if (col.type === 'dateFilter') {
                        if (!fieldValue || !filterValue) return false;

                        // Convert both values to MM-dd-yyyy strings
                        const nodeDate =
                            formatDate(fieldValue, 'MM-dd-yyyy', 'en-US');

                        const filterDate =
                            formatDate(filterValue, 'MM-dd-yyyy', 'en-US');

                        return nodeDate === filterDate;
                    }

                    if (col.type === 'numberFilter') {
                        return fieldValue == filterValue;
                    }

                    // Default: text filter
                    const nodeText = (fieldValue ?? '').toString().toLowerCase();
                    const filterText = (filterValue ?? '').toString().toLowerCase();
                    return nodeText.includes(filterText);
                });
            });

            this.totalRecords = this.filteredData.length;
        }, 0);
    }

    showContextMenu(event: MouseEvent, menu: any, event1: any) {
        event.preventDefault(); // Prevent default context menu from showing
        this.selectedNode = event1;
        this.contextMenuPosition.x = event.clientX;
        this.contextMenuPosition.y = event.clientY;
        menu.show(event); // Show the PrimeNG context menu
    }

    nodeSelect(e: any) {
        this.cols.forEach(item => {
            if (e.node.isparent && item.parent === e.node.parentid || !e.node.isparent && item.parent === e.node.parentid && item.childHeader === e.node.label) {
                let closedColumns = false;
                if (e.node.isparent && this.cols.some(it => it.parent === e.node.parentid && it.isChildren && it.isicon === 0)) {
                    closedColumns = true;
                } else {
                    closedColumns = this.colsshow.some(it => it.parent === e.node.parentid && it.columnGroupShow === 'close' && (!item.isChildren && it.childHeader === item.childHeader) || (item.isChildren && it.header === item.header));
                }
                if (!e.node.isparent && !item.isChildren && e.node.parentid === item.parent) {
                    closedColumns = true;
                }
                if (closedColumns) {
                    item.columnGroupShow = 'close';
                    item.isParentVisible = true;
                }
                item.displayCheckboxColumns = true;
            }
        });

        if (this.cols.some(it => it.parent === e.node.parentid && it.isChildren && it.isicon === 1)) {
            this.toggleColumn(e.node.parentid, 'open')
        }
        this.commonColumnsFn();
    }

    nodeUnselect(e: any) {

        this.cols.forEach(item => {
            if (e.node.isparent && item.parent === e.node.parentid) {
                item.columnGroupShow = 'open';
                item.displayCheckboxColumns = false;
            } else if (!e.node.isparent && item.parent === e.node.parentid && item.childHeader === e.node.label) {

                item.columnGroupShow = 'open';
                item.displayCheckboxColumns = false;

                if (!this.cols.some(it => it.parent === e.node.parentid && it.displayCheckboxColumns)) {
                    item.isParentVisible = false;
                } else {
                    item.isParentVisible = true;
                    if (!this.cols.some(it => it.parent === e.node.parentid && it.columnGroupShow === 'close')) {

                        for (let child of e.node.parent.children) {
                            if (this.selectedFiles.includes(child)) {
                                let i = this.cols.findIndex(k => k.parent === e.node.parentid && k.childHeader === child.label)
                                if (i !== -1) {
                                    this.cols[i].columnGroupShow = 'close';
                                }
                                return;
                            }
                        }
                    }
                }
            }
        });

        this.commonColumnsFn();
    }

    handleColumnResize(event: any) {
        const resizedElement = event.element.cellIndex;

        if (event.element?.attributeStyleMap?.size == 1) {
            const parentId = parseInt(event.element?.dataset?.parentId || '0', 10);
            let i = this.displaycols.findIndex(k => k.isChildren && k.parent === parentId)
            let column = this.displaycols[i];
            column.width = (parseInt(column.width.replace('px', '')) + event.delta) + 'px';

            let column1 = this.displaycols[resizedElement];
            column1.width = (parseInt(column.width.replace('px', '')) - event.delta) + 'px';
            return;
        }
    }


    download(row: any, i: any) {
        this.downloadFile[i] = true;
        this.locationService.downloadCCFile(row.FileID, row.AccountID).subscribe((res) => {

            let fileName = 'cost-center-' + row.AccountName;
            const contentDisposition = res.headers.get('Content-Disposition');
            if (contentDisposition) {
                // Typically the header is formatted as: attachment; filename="report.csv"
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches.length > 1) {
                    fileName = matches[1];
                }
            }
            // Create a Blob and trigger download
            const blob = new Blob([res.body], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.downloadFile[i] = false;
        });
    }
}
