import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { AssignLocationsTooltipDialogComponent } from './assign-locations-tooltip-dialog/assign-locations-tooltip-dialog.component';
import moment from 'moment';
import { TreeNode } from 'primeng/api';
import { ReconService } from 'src/app/services/recon.service';
import { LocationService } from 'src/app/services/location.service';
import { onChangeEndDate } from 'src/app/services/common-p-table';
import { createColumn } from 'src/app/utils/column-utils';
import { isValueExist, isValuesUndefined } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewIComponent } from 'src/app/common/invoice-overview-i/invoice-overview-i.component';

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
  selector: 'app-assign-location-recon',
  templateUrl: './assign-location-recon.component.html',
  styleUrls: ['./assign-location-recon.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewIComponent ]
})
export class AssignLocationReconComponent implements OnInit {
  frameworkComponents: any;
  originalFiles: any;

  @Input() selectedRow: any;
  @Input() gridRowData: any;
  @Input() isSelectAll: any;

  loading: boolean = true;
  isApiAlerdayCall: boolean = false;
  pTableContain = { first: 1 };
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  fieldsName: any;
  cols: any[];
  displaycols: any[];
  radioItems: Array<any>;
  options: any = [];
  isLoading = false;
  public sideBar: any;
  sbInvoiceId: any;
  locationId: any;
  patchData: any = [];

  saveButtonLoader = false;
  public columnDefsAL: any;
  rowData: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  locationRowData: any;
  passLocation: any = [];
  isAssignAllChecked = false;
  disabledAssignAllCheckbox = true;
  stopSpinner: boolean = false;
  setRedColorAllCheckbox = false;
  files: TreeNode[];
  finalFilterdArr: any;
  sorting: any;
  sortingType: any;
  finalAllDetailArr: any;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  totalRecords: number;
  filterArray: arrDate[];
  filterArrayDate: arrDate[];
  filterArrayNumber: arrDate[];
  selectedFiles!: any[];
  filesColumns: any = []
  items: any[];
  selectedNode: any;
  public exportAccounts: any;

  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';
  sidebarVisible: boolean = false;

  colsshow: any[];

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
  model = { option: 'AND' };
  displayModal: boolean = false;
  displayModal1: boolean = false;

  selectedOption1: any = this.countries[0].name;
  selectedOption2: any = this.countries[0].name;

  private _unsubscribeRecon: Subject<any> = new Subject<any>();
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribePrimary: Subject<any> = new Subject<any>();
  @Output() callGridAPI: EventEmitter<any> = new EventEmitter<any>();
  @Output() onReload: EventEmitter<any> = new EventEmitter<any>();

  constructor(private reconService: ReconService, public dialog: MatDialog, private locationService: LocationService) {
    this.setColumn();

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

  }

  AssignLocationsTooltip() {
    const dialogRef = this.dialog.open(AssignLocationsTooltipDialogComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        colseButton: true,
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
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

      this.countries = [
        { id: 1, name: 'contains', display: 'Contains' },
        { id: 2, name: 'notContains', display: 'Not contains' },
        { id: 3, name: 'equals', display: 'Equals' },
        { id: 4, name: 'notEqual', display: 'Not equal' },
        { id: 5, name: 'startsWith', display: 'Starts with' },
        { id: 6, name: 'endsWith', display: 'Ends with' },
      ];

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

      this.countries = [
        { id: 1, name: 'contains', display: 'Contains' },
        { id: 2, name: 'notContains', display: 'Not contains' },
        { id: 3, name: 'equals', display: 'Equals' },
        { id: 4, name: 'notequal', display: 'Not equal' },
        { id: 5, name: 'lessthan', display: 'Less than' },
        { id: 6, name: 'greaterthan', display: 'Greater than' },
        { id: 7, name: 'lessthanorequal', display: 'Less than or equals' },
        { id: 8, name: 'greaterthanorequal', display: 'Greater than or equals' },
        { id: 9, name: 'inrange', display: 'In range' },
      ];

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

      this.countries = [
        { id: 1, name: 'equals', display: 'Equals' },
        { id: 2, name: 'greaterthan', display: 'Greater than' },
        { id: 3, name: 'lessthan', display: 'Less than' },
        { id: 4, name: 'Notequal', display: 'Not equal' },
        { id: 5, name: 'inrange', display: 'In range' },
      ];
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

  setColumn() {
    this.columnDefsAL = [
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
          }
        ],
      },
      {
        headerName: 'Assignment',
        children: [
          {
            field: 'ChargeDetailAddress1',
            headerName: 'Address on Invoice',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 205,
            cellRenderer: this.customCellRenderer
          },
          {
            // field: 'locationId',
            headerName: 'Selected Address',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 400,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellClass: 'custom-cell-class-p-dropdown',
            filter: 'agSetColumnFilter',
            filterParams: {
              values: this.passLocation,
            },
            cellRenderer: 'DropdownCellRendererComponent',
            cellRendererParams: {
              onClick: this.onBtnClick1.bind(this)
            }
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
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'TEMAccountName',
            headerName: 'TEM',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
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
            minWidth: 130
          }
        ],
      },
      {
        headerName: 'Account',
        children: [
          {
            field: 'PayableAccount',
            headerName: 'Payable Account',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 225
          }
        ],
      },
      {
        headerName: 'Invoice',
        children: [
          {
            field: 'InvoiceNumber',
            headerName: 'Invoice Number',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 185
          }
        ],
      },
      {
        headerName: 'Charges',
        children: [
          {
            field: 'Charge',
            headerName: 'Total Current Charges',
            filter: 'agNumberColumnFilter',
            editable: false,
            columnGroupShow: 'close',
            minWidth: 225,
            resizable: true,
            valueFormatter: (params: any) => this.currencyFormatter(params.data?.Charge, params.data?.CurrencySymbol),
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' },
          }
        ],
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 182,
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 125,
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 160,
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 130,
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 165,
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 165,
          }
        ],
      },
      {
        headerName: 'Invoice Info',
        children: [
          {
            field: 'ChargeDetailDescription1',
            headerName: 'Charge Description 1',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 215,
          },
          {
            field: 'ChargeDetailDescription2',
            headerName: 'Charge Description 2',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription3',
            headerName: 'Charge Description 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription4',
            headerName: 'Charge Description 4',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription5',
            headerName: 'Charge Description 5',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription6',
            headerName: 'Charge Description 6',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription7',
            headerName: 'Charge Description 7',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription8',
            headerName: 'Charge Description 8',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription9',
            headerName: 'Charge Description 9',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
          },
          {
            field: 'ChargeDetailDescription10',
            headerName: 'Charge Description 10',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 225,
          }
        ],
      },
      {
        headerName: 'Inventory Info',
        children: [
          {
            field: 'Inventory1',
            headerName: 'Inventory 1',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 150,
          },
          {
            field: 'Inventory2',
            headerName: 'Inventory 2',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 155,
          },
          {
            field: 'Inventory3',
            headerName: 'Inventory 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 155,
          },
          {
            field: 'Inventory4',
            headerName: 'Inventory 4',
            columnGroupShow: 'open;',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
          },
          {
            field: 'Inventory5',
            headerName: 'Inventory 5',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
          },
          {
            field: 'Inventory6',
            headerName: 'Inventory 6',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
          },
          {
            field: 'Inventory7',
            headerName: 'Inventory 7',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
          },
          {
            field: 'Inventory8',
            headerName: 'Inventory 8',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
          },
          {
            field: 'Inventory9',
            headerName: 'Inventory 9',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
          },
          {
            field: 'Inventory10',
            headerName: 'Inventory 10',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
          }
        ],
      }
    ];
  }
  ngOnInit(): void {
    this.setCols();
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

    this.loading = false;

    // this.getReconLocation();
    this.getLocations();
    this.loadNodes(this.pTableContain,true)

  }
  onSearch(event: any, rowData: any) {
    const query = event.filter?.trim();
    if (!query || query.length < 1) {
      rowData.locationRowData = [];
      return;
    }

    const advanceFilter = [{
      filterKey: 'LocationDisplayValue',
      filterOptionType1: 'contains',
      filterOptionValue1: query,
      filterOperationType: 'AND'
    }];

    const requestData = {
      customerAccountId: this.selectedRow[0]['CustomerAccountId'],
      advanceFilter: advanceFilter,
      forDropDown: true
    };

    rowData.isLoading = true;
    this._unsubscribeLocation.next(null);
    this.locationService.getCompanylocationsURL(requestData)   .pipe(takeUntil(this._unsubscribeLocation))
    .subscribe((res: any) => {
      rowData.isLoading = false;
      rowData.locationRowData = res?._companyLocationDto?.$values || [];
    });
  }
  // onSearch(value) {
  //   const query = value.filter?.trim()
  //   const existingFilterIndex = this.options['advanceFilter'].findIndex(
  //     (filter) => filter.filterKey === "LocationDisplayValue"
  //   );

  //   if ((query?.length === 1 || query?.length === 2) && query >= 0 ) {
  //     this.search(query, existingFilterIndex)
  //   } else if (query?.length >= 3) {
  //     this.search(query, existingFilterIndex)
  //   } else {
  //     this.locationRowData = [];
  //   }
  // }


  filerOutSide(event: any, column: any, i: any) {
    setTimeout(() => {
      const activeFilters = this.displaycols.filter(col => !!col.valuesset?.toString().trim());
  
      // Always start from original source
      const sourceData = JSON.parse(JSON.stringify(this.originalFiles));
  
      if (activeFilters.length === 0) {
        this.files = sourceData;
        this.totalRecords = this.files.length;
        return;
      }
  
      const filtered = sourceData.filter((node: any) => {
        return activeFilters.every((col: any) => {
          let fieldValue;
  
          // Handle computed field
          if (col.field === 'AddressonInvoice') {
            fieldValue = this.customCellRenderer(node.data);
          } else {
            fieldValue = node.data?.[col.field];
          }
  
          const filterValue = col.valuesset;
  
          if (col.type === 'numberFilter') {
            const fieldVal = (fieldValue ?? '').toString().replace(/[^0-9.\-]/g, '');
            const filterVal = (filterValue ?? '').toString().replace(/[^0-9.\-]/g, '');
            const cleanedFieldValue = parseFloat(fieldVal);
            const cleanedFilterValue = parseFloat(filterVal);
            if (isNaN(cleanedFieldValue) || isNaN(cleanedFilterValue)) return false;
            return cleanedFieldValue.toString().includes(cleanedFilterValue.toString());
          }
  
          // Default: text
          return (fieldValue ?? '').toString().toLowerCase().includes(filterValue.toString().toLowerCase());
        });
      });
  
      this.files = filtered;
      this.totalRecords = this.files.length;
    }, 100);
  }
  
  
  onFilterChangedValue() {

    let txtVal1 = this.textboxValue1;
    let txtVal2 = this.textboxValue2;
    if (this.fieldsName.type === 'dateFilter') {
      txtVal1 = txtVal1 ? onChangeEndDate(this.textboxValue1, false) : null;
      txtVal2 = txtVal2 ? onChangeEndDate(this.textboxValue2, false) : null;
    }

    this.displayModal1 = false;
    let arrDate: any = {
      filterKey: this.fieldsName.field,
      filterOptionType1: this.selectedOption1,
      filterOptionValue1: txtVal1,
      filterOperationType: this.model.option,
      filterOptionType2: txtVal2 ? (this.selectedOption2) ? this.selectedOption2 : 'contains' : null,
      filterOptionValue2: txtVal2 ? txtVal2 : null,

    };

    if (arrDate.filterOptionType1 === 'inrange' && (this.textboxValue1_1 != null && this.textboxValue1_1 !== '')) {
      if (this.fieldsName.type === 'dateFilter') {
        arrDate['filterOptionValue1_2'] = onChangeEndDate(this.textboxValue1_1, false);
      } else {
        arrDate['filterOptionValue1_2'] = this.textboxValue1_1;
      }
    }

    if (arrDate.filterOptionType2 === 'inrange' && (this.textboxValue2_1 != null && this.textboxValue2_1 !== '')) {
      if (this.fieldsName.type === 'dateFilter') {
        arrDate['filterOptionValue2_2'] = onChangeEndDate(this.textboxValue2_1, false);
      } else {
        arrDate['filterOptionValue2_2'] = this.textboxValue2_1 ? this.textboxValue2_1 : null;
      }
    }

    if (this.fieldsName.type === 'text') {
      const index = this.filterArray.findIndex(
        (user) => user.filterKey === this.fieldsName.field
      );

      if (index !== -1) {
        this.filterArray[index] = arrDate;
      } else {
        this.filterArray.push(arrDate);
      }
    } else if (this.fieldsName.type === 'numberFilter') {
      const index = this.filterArrayNumber.findIndex(
        (user) => user.filterKey === this.fieldsName.field
      );

      if (index !== -1) {
        this.filterArrayNumber[index] = arrDate;
      } else {
        this.filterArrayNumber.push(arrDate);
      }
    } else {
      const index = this.filterArrayDate.findIndex(
        (user) => user.filterKey === this.fieldsName.field
      );

      if (index !== -1) {
        this.filterArrayDate[index] = arrDate;
      } else {
        this.filterArrayDate.push(arrDate);
      }
    }

    this.displayModal = false;

    let data: any = [];

    this.filterArray = this.filterArray.filter(f => f.filterOptionValue1 !== '')
    this.filterArrayDate = this.filterArrayDate.filter(f => f.filterOptionValue1 !== '')
    this.filterArrayNumber = this.filterArrayNumber.filter(f => f.filterOptionValue1 !== '')
    if (this.filterArray && this.filterArray.length > 0) {
      data['advanceFilter'] = this.filterArray;
    }
    if (this.filterArrayDate && this.filterArrayDate.length > 0) {
      data['advanceDateFilter'] = this.filterArrayDate;
    }
    if (this.filterArrayNumber && this.filterArrayNumber.length > 0) {
      data['advanceNumberFilter'] = this.filterArrayNumber;
    }

    this.finalFilterdArr = data;

    if (this.textboxValue1 !== null && this.textboxValue1 !== '') {
      this.cols.forEach((item) => {
        if (item.field === this.fieldsName.field) {

          if (this.textboxValue2 !== null && this.textboxValue2 !== '') {

            if (this.selectedOption2 === 'inrange') {
              item.valuesset = this.textboxValue1 + '-' + this.textboxValue1_1 + ' ' + this.model.option + ' ' + this.textboxValue2 + '-' + this.textboxValue2_1;
              item.isenable = true;
            } else if (this.selectedOption1 === 'inrange') {
              item.valuesset = this.textboxValue1 + '-' + this.textboxValue1_1 + ' ' + this.model.option + ' ' + this.textboxValue2;
              item.isenable = true;
            } else {
              item.valuesset = this.textboxValue1 + ' ' + this.model.option + ' ' + this.textboxValue2;
              item.isenable = true;
            }

          } else {
            if (this.selectedOption1 === 'inrange') {
              item.valuesset = this.textboxValue1 + '-' + this.textboxValue1_1;
              item.isenable = true;
            } else {
              item.valuesset = this.textboxValue1;
              item.isenable = false;
            }

          }
        }
      });
    }
    if ((this.textboxValue1 === null || this.textboxValue1 === '') && (this.textboxValue2 === null || this.textboxValue2 === '')) {
      this.cols.forEach((item) => {
        if (item.field === this.fieldsName.field) {
          item.valuesset = null;
          item.isenable = false;
        }
      });
    }
    this.loadNodes(this.pTableContain, true);
  }

  validateNumberInput(value: string, allowNegative: boolean): boolean {
    if (value === "") {
      return true;
    }
    const onlyNumberRegex = /^[0-9]*\.?[0-9]*$/;
    const onlyNumberWithNegativeRegex = /^-?[0-9]+(\.[0-9]*)?$/;
    const regex = allowNegative ? onlyNumberWithNegativeRegex : onlyNumberRegex;
    return regex.test(value);
  }

  search(query: any, existingFilterIndex: any) {
    this.isLoading = true;

    if (existingFilterIndex !== -1) {
      this.options['advanceFilter'][existingFilterIndex].filterOptionValue1 = query;
    } else {
      this.options['advanceFilter'].push({
        "filterKey": "LocationDisplayValue",
        "filterOptionType1": "contains",
        "filterOptionValue1": query,
        "filterOperationType": "AND",
        "filterOptionType2": null,
        "filterOptionValue2": null
      });
    }
    this.getLocations()
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
  setCols() {


    this.cols = [
      createColumn(1, '190px', true, 'text', 'Inventory', 'ServiceNumber', 'Service Number'),

      createColumn(2, '180px', true, 'text', 'Assignment', 'AddressonInvoice', 'Address on Invoice', 'close', 1, 150, true, true, false),
      createColumn(2, '400px', false, 'select', '', '', 'Selected Address', 'close', 1, 150, true, true, false),


      createColumn(3, '150px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer', 'close'),
      createColumn(3, '140px', false, 'text', '', 'TEMAccountName', 'TEM', 'open'),

      createColumn(4, '130px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor', 'close'),

      createColumn(5, '190px', true, 'text', 'Account', 'PayableAccount', 'Payable Account', 'close'),
      createColumn(5, '230px', false, 'text', '', 'MainAccountNumber', 'Main Account Number', 'open'),
      createColumn(5, '225px', false, 'text', '', 'SubAccountNumber', 'Sub Account Number', 'open'),

      createColumn(6, '185px', true, 'text', 'Invoice', 'InvoiceNumber', 'Invoice Number', 'close'),

      createColumn(7, '225px', true, 'numberFilter', 'Charges', 'Charge', 'Total Current Charges', 'close'),

      createColumn(8, '182px', true, 'text', 'Product', 'VendorProductName', 'Vendor Product', 'close'),
      createColumn(8, '125px', false, 'text', '', 'ServiceName', 'Service', 'open'),
      createColumn(8, '160px', false, 'text', '', 'ServiceType', 'Service Type', 'open'),
      createColumn(8, '130px', false, 'text', '', 'ProductName', 'Product', 'open'),
      createColumn(8, '165px', false, 'text', '', 'ProductType', 'Product Type', 'open'),
      createColumn(8, '165px', false, 'text', '', 'IndustryName', 'Industry', 'open'),

      createColumn(9, '215px', true, 'text', 'Invoice Info', 'ChargeDetailDescription1', 'Charge Description 1', 'close'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription2', 'Charge Description 2', 'open'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription3', 'Charge Description 3', 'open'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription4', 'Charge Description 4', 'open'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription5', 'Charge Description 5', 'open'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription6', 'Charge Description 6', 'open'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription7', 'Charge Description 7', 'open'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription8', 'Charge Description 8', 'open'),
      createColumn(9, '220px', false, 'text', '', 'ChargeDetailDescription9', 'Charge Description 9', 'open'),
      createColumn(9, '225px', false, 'text', '', 'ChargeDetailDescription10', 'Charge Description 10', 'open'),

      createColumn(10, '160px', true, 'text', 'Inventory Info', 'Inventory1', 'Inventory 1', 'close'),
      createColumn(10, '155px', false, 'text', '', 'Inventory2', 'Inventory 2', 'open'),
      createColumn(10, '155px', false, 'text', '', 'Inventory3', 'Inventory 3', 'open'),
      createColumn(10, '155px', false, 'text', '', 'Inventory4', 'Inventory 4', 'open'),
      createColumn(10, '155px', false, 'text', '', 'Inventory5', 'Inventory 5', 'open'),
      createColumn(10, '155px', false, 'text', '', 'Inventory6', 'Inventory 6', 'open'),
      createColumn(10, '155px', false, 'text', '', 'Inventory7', 'Inventory 7', 'open'),
      createColumn(10, '155px', false, 'text', '', 'Inventory8', 'Inventory 8', 'open'),
      createColumn(10, '155px', false, 'text', '', 'Inventory9', 'Inventory 9', 'open'),
      createColumn(10, '180px', false, 'text', '', 'Inventory10', 'Inventory 10', 'open'),


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
    this.commonColumnsFn();
  }
  
  dropdownOptionSelected() {
    navigator.clipboard.writeText(this.selectedNode).then(
      () => {
      },
      (err) => {
      }
    );

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
  currencyFormatter(currency: any, sign: any) {
    if (currency !== null) {
      var sansDec = currency.toFixed(2);
      // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // formatted = formatted ? parseFloat(formatted).toFixed(2) : 0.00;
      return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } else {
      return '';
    }
  }

  getLocations() {
    let data: any = {};

    data['customerAccountId'] = this.selectedRow[0]['CustomerAccountId'];
    data['advanceFilter'] = [{
      "filterKey": "DisplayText",
      "filterOptionType1": "equals",
      "filterOptionValue1": 'Active',
      "filterOperationType": "AND",
      "filterOptionType2": null,
      "filterOptionValue2": null
    }];
    data['forDropDown'] = true;

    this.passLocation.push(data);

    // this._unsubscribeLocation.next();
    // this.locationService
    //   .getCompanylocationsURL(data)
    //   .pipe(takeUntil(this._unsubscribeLocation))
    //   .subscribe(
    //     async (data: any) => {
    //       if (data && data._companyLocationDto.$values) {
    //         this.locationRowData = data._companyLocationDto.$values;

    //         // this.passLocation = _.map(this.locationRowData, (obj: any) => ({ name: obj.LocationName + ',' + obj.Address1 + ',' + obj.Address2 + ',' + obj.City + ',' + obj.StateName + ',' + obj.PostalCode, id: obj.LocationId }));
    //         this.passLocation = _.map(this.locationRowData, (obj: any) => ({
    //           name: obj.LocationDisplayValue,  // Join the values with a comma
    //           id: obj.LocationId
    //         }));
    //         this.setColumn();
    //         this.stopSpinner = true;
    //       }
    //     });
  }

  invoiceOverviewDataOutput(data: any) {
  }

  customCellRenderer(params: any) {
    return isValueExist(params.ChargeDetailAddress1) ? params.ChargeDetailAddress1 : '' + isValueExist(params.ChargeDetailAddress2) ? ' ' + params.ChargeDetailAddress2 : '' +
     isValueExist(params.ChargeDetailAddress3) ? ' ' + params.ChargeDetailAddress3 : '' + isValueExist(params.ChargeDetailAddress4) ? ' ' + params.ChargeDetailAddress4 : '' + 
     isValueExist(params.LocationCountry) ? ' ' + params.LocationCountry : '' + isValueExist(params.LocationCountryCode) ? ' ' + 
     params.LocationCountryCode : '' + isValueExist(params.LocationCity) ? ' ' + params?.LocationCity : '' +
      isValueExist(params.LocationStateProvinceName) ? ' ' + params.LocationStateProvinceName : ''
  }

  onBtnClick1(e: any) {
    if (e.locationId) {
      this.disabledAssignAllCheckbox = false;
    }

    let index = this.patchData.findIndex((el: any) => el.VendorProductInventoryId == e.VendorProductInventoryId);
    this.patchData[index].locationId = e.locationId;

    const uniqueLocations = new Set(this.patchData.map((item: any) => isValueExist(item.locationId)).filter((value: any) => value !== ''));
    if (uniqueLocations.size > 1) {
      this.disabledAssignAllCheckbox = true;
      this.isAssignAllChecked = false;
    }
  }

  savePrimary() {

    const uniqueLocations = new Set(this.patchData.map((item: any) => isValueExist(item.locationId)).filter((value: any) => value !== ''));
    const values = this.patchData.map((item: any) => item.locationId);

    const allSame = values.every((val: any) => val === values[0]);
    const anyBlank = values.some((val: any) => !val || val === '');
    if (this.patchData.length > 0) {
      if (anyBlank) {
        this.ErrorWarningPopupOpen('Please select address of location.', false);
      } else {
        if (this.isAssignAllChecked) {
          this.setRedColorAllCheckbox = false;
          let errorData: any = {
            messgeType: 'error',
            closeBtnName: 'Do it!',
            okBtnName: 'Close & Review',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-question-circle',
            iconClass: 'text-c-blue f-70',
            message: 'The Assign All option applies the selected Person or Location from a single record to all records on this page',
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result == false) {
              this.save();
            }
          });
        } else {
          this.save();
        }
      }
    }
  }

  save() {
    let reconPrimaryLocationsAndUsers: any = _.map(this.patchData, (x: any) => ({
      locationId: x.locationId,
      userId: null,
      VendorProductInventoryId: x.VendorProductInventoryId
    }))

    if (this.isAssignAllChecked) {
      const a :any = _.find(reconPrimaryLocationsAndUsers, (x: any) => x.locationId)?.locationId;
      reconPrimaryLocationsAndUsers = _.map(this.patchData, (x: any) => ({
        locationId: a,
        userId: null,
        VendorProductInventoryId: x.VendorProductInventoryId
      }))
    }

    let data = {
      reconPrimaryLocationsAndUsers
    }

    this.saveButtonLoader = true;
    this._unsubscribePrimary.next(null);

    this.reconService.setReconLocationPrimary(data).pipe(takeUntil(this._unsubscribePrimary)).subscribe((res: any) => {
      this.ErrorWarningPopupOpen(res.Message);
      this.saveButtonLoader = false;
    });

  }
  ErrorWarningPopupOpen(message: any, redirect = true) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    dialogRef.afterClosed().subscribe((result) => {
      if (redirect) {
        if (!isValuesUndefined(result)) {
          this.onReload.emit(true);
        }
      }
    })
    return
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeRecon.next(null);
    this._unsubscribeRecon.complete();
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribePrimary.next(null);
    this._unsubscribePrimary.complete();
  }

  onchangeAllCheck() {
    this.setRedColorAllCheckbox = !this.isAssignAllChecked;

    if (this.isAssignAllChecked) {
      const a = _.find(this.patchData, (x: any) => x.locationId)?.locationId;
      this.patchData = _.map(this.patchData, (x: any) => ({
        locationId: a,
        userId: null,
        VendorProductInventoryId: x.VendorProductInventoryId
      }))

    }
  }

  loadNodes(event: any, allOptionsClear = false) {
    setTimeout(() => {
      this.loading = true;


      // Initialize pagination if not set
      this.isApiAlerdayCall = true;
      this.pTableContain.first = this.pTableContain?.first || 1;
      if (allOptionsClear) {
        this.pTableContain.first = 1;
      }
      const data : any= {
        invoiceId: this.selectedRow[0]['InvoiceID'],
        vendorProductInventoryIds: (this.isSelectAll?.value) ? null : this.selectedRow.map((obj: any) => obj.VendorProductInventoryId).join(',')
      };

      if(this.isSelectAll?.value) {
        data['fromSelectAllInvAssStep1'] = true
        data['fromInvAssStep1ReconFilter'] = this.isSelectAll?.data
      }

      this.finalAllDetailArr = data;
      this._unsubscribeGRid.next(null);

      // Clear files if needed
      if (allOptionsClear) this.files = [];

      this.reconService
        .getReconLocation(data)
        .pipe(takeUntil(this._unsubscribeGRid))
        .subscribe(
          (response: any) => this.handleResponse(response, allOptionsClear),
          () => this.handleError()
        );
      // }
    }, 100);
  }

  onValueChange(data: any, rowData: any) {

    if (data.value) {
      this.disabledAssignAllCheckbox = false;
    }
    let index = this.patchData.findIndex((el: any) => el.VendorProductInventoryId == rowData.VendorProductInventoryId);
    this.patchData[index].locationId = data.value;

    const uniqueLocations = new Set(this.patchData.map((item: any) => isValueExist(item.locationId)).filter((value: any) => value !== ''));
    if (uniqueLocations.size > 1) {
      this.disabledAssignAllCheckbox = true;
      this.isAssignAllChecked = false;
    }
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
        if (!e.node.isparent && !item.isChildren && e.node.parentid === item.parent ) {
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
                let i = this.cols.findIndex((k: any) => k.parent === e.node.parentid && k.childHeader === child.label)
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
      let i = this.displaycols.findIndex((k: any) => k.isChildren && k.parent === parentId)
      let column = this.displaycols[i];
      column.width = (parseInt(column.width.replace('px', '')) + event.delta) + 'px';

      let column1 = this.displaycols[resizedElement];
      column1.width = (parseInt(column.width.replace('px', '')) - event.delta) + 'px';
      return;
    }
  }
  openSidebar() {
    this.sidebarVisible = this.sidebarVisible ? false : true;
    this.selectAllNodes(this.filesColumns);
  }
  private selectAllNodes(nodes: TreeNode[]) {


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
  // Handle the response for loadNodes
  handleResponse(response: any, allOptionsClear: any) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));

      this.files = allOptionsClear ? resData : [...this.files, ...resData];
    
      this.originalFiles = JSON.parse(JSON.stringify(resData)); 
      this.patchData = this.files.map(entry => {
        const data = entry.data;
      
        return {
            ...data,
            locationId: null
          }
      });
    } else {
      this.files = [];
      this.isApiAlerdayCall = false;
    }

    // this.files.length > 0 ? this.isBillingAccountExist.emit(true) : this.isBillingAccountExist.emit(false);
  }

  // Handle error case
  handleError() {
    this.loading = false;
    this.files = [];
  }
  extractDataAndLeaf = (item: any) => {
    return {
      data: this.extractData(item),
      leaf: !item.HasParent,
    };
  }
  extractData(item: any) {
    const fields = Object.keys(item);

    return fields.reduce((acc: any, field: any) => {
      acc[field] = item[field];
      return acc;
    }, {});
  }
}
