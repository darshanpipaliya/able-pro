import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { AssignLocationsTooltipDialogComponent } from '../assign-location-recon/assign-locations-tooltip-dialog/assign-locations-tooltip-dialog.component';
import { TreeNode } from 'primeng/api';
import { ReconService } from 'src/app/services/recon.service';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist, isValuesUndefined } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
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
  selector: 'app-assign-people-recon',
  templateUrl: './assign-people-recon.component.html',
  styleUrls: ['./assign-people-recon.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewIComponent ]
})
export class AssignPeopleReconComponent implements OnInit {

  public sideBar;
  sbInvoiceId: any;
  stopSpinner: boolean = false;

  @Input() selectedRow: any;
  @Input() gridRowData: any;
  @Input() isSelectAll: any;

  private _unsubscribeReconPeople: Subject<any> = new Subject<any>();
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribePrimary: Subject<any> = new Subject<any>();
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  @Output() onReload: EventEmitter<any> = new EventEmitter<any>();
  saveButtonLoader = false;
  isAssignAllChecked = false;
  disabledAssignAllCheckbox = true;
  setRedColorAllCheckbox = false;
  public columnDefsAP: any;
  rowDataAP: any = [];
  peoplesList: any = [];
  formatUser: any = [];
  patchData: any = [];
  frameworkComponents: any;
  userId: any;
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  selectedFiles!: any[];

  loading: boolean = true;
  isApiAlerdayCall: boolean = false;
  pTableContain = { first: 1 };
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  fieldsName: any;
  cols: any[];
  displaycols: any[];
  radioItems: Array<any>;
  options = [];
  isLoading = false;
  files: TreeNode[];
  finalFilterdArr: any;
  sorting: any;
  sortingType: any;
  finalAllDetailArr: any;
  filesColumns: any = []
  selectedNode: any;
  items: any[];
  colsshow: any[];
  totalRecords: number;
  originalFiles: any;
  
  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';
  sidebarVisible: boolean = false;

  constructor(private reconService: ReconService, private locationService: LocationService, public dialog: MatDialog) {
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
  setColumn() {
    this.columnDefsAP = [{
      headerName: ' ',
      headerCheckboxSelection: true,
      checkboxSelection: true,
      floatingFilter: true,
      suppressMenu: true,
      minWidth: 50,
      maxWidth: 50,
      width: 50,
      flex: 0,
      resizable: true,
      sortable: true,
      editable: false,
      filter: false,
      suppressColumnsToolPanel: true,
    },
    {
      headerName: 'Inventory',
      children: [
        // {
        //   field: 'BillingID',
        //   headerName: 'Billing ID',
        //   columnGroupShow: 'close',
        //   filter: 'agTextColumnFilter',
        //   editable: false,
        //   minWidth: 140
        // },
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
          field: 'UserName',
          headerName: 'Name on Invoice',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 168
        },
        {
          field: 'UserEmail',
          headerName: 'Email on Invoice',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 168
        },
        {
          // field: 'SelectedUser',
          headerName: 'Selected User',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agSetColumnFilter',
          minWidth: 200,
          cellStyle: {
            'display': 'flex',
            'justify-content': 'center'
          },
          cellClass: 'custom-cell-class-p-dropdown',
          cellRenderer: 'DropdownCellRendererComponent2',
          filterParams: {
            values: this.formatUser, // Example values for the dropdown
          },
          cellRendererParams: {
            onClick: this.onBtnClick1.bind(this)
          }
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
          headerName: 'Payable Account Number',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 250,
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
      headerName: 'Vendor UDLS',
      children: [
        {
          field: 'VendorUdl1',
          headerName: 'UDL1',
          filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 150,
          resizable: true
        },
        {
          field: 'VendorUdl2',
          headerName: 'UDL2',
          filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'open',
          minWidth: 110,
          resizable: true
        },
        {
          VendorUdl3: 'UDL3',
          headerName: 'UDL3',
          filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'open',
          minWidth: 110,
          resizable: true
        },
        {
          VendorUdl4: 'UDL4',
          headerName: 'UDL4',
          filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'open',
          minWidth: 110,
          resizable: true
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

    this.files = [];

    this.loading = false;
    this.getPeopleList();
    this.setColumn();
    this.loadNodes(this.pTableContain,true)
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

  dropdownOptionSelected() {
    navigator.clipboard.writeText(this.selectedNode).then(
      () => {
      },
      (err: any) => {
      }
    );

  }

  filerOutSide(event: any, column: any) {
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
          let fieldValue = node.data?.[col.field];
          const filterValue = col.valuesset;
  
          if (col.type === 'numberFilter') {
            const fieldVal = (fieldValue ?? '').toString().replace(/[^0-9.\-]/g, '');
            const filterVal = (filterValue ?? '').toString().replace(/[^0-9.\-]/g, '');
            const cleanedFieldValue = parseFloat(fieldVal);
            const cleanedFilterValue = parseFloat(filterVal);
            if (isNaN(cleanedFieldValue) || isNaN(cleanedFilterValue)) return false;
            return cleanedFieldValue.toString().includes(cleanedFilterValue.toString());
          }
          return (fieldValue ?? '').toString().toLowerCase().includes(filterValue.toString().toLowerCase());
        });
      });
  
      this.files = filtered;
      this.totalRecords = this.files.length;
    }, 100);
  }

  ngOnDestroy() {
    this._unsubscribeReconPeople.next(null);
    this._unsubscribeReconPeople.complete();
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribePrimary.next(null);
    this._unsubscribePrimary.complete();
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

  onBtnClick1(e: any) {

    if (e.userId) {
      this.disabledAssignAllCheckbox = false;
    }
    let index = this.patchData.findIndex((el: any) => el.VendorProductInventoryId == e.VendorProductInventoryId);
    this.patchData[index].userId = e.userId;

    const uniqueLocations = new Set(this.patchData.map((item: any) => isValueExist(item.userId)).filter((value: any) => value !== ''));
    if (uniqueLocations.size > 1) {
      this.disabledAssignAllCheckbox = true;
      this.isAssignAllChecked = false;
    }
  }

  invoiceOverviewDataOutput(data: any) {
  }

  getPeopleList() {
    let data: any = {};

    data['customerAccountId'] = this.selectedRow[0]['CustomerAccountId'];
    // data['vendorProductInventoryId'] = this.selectedRow[0]['VendorProductInventoryId'];
    data['StartRowIndex'] = 1;
    data['MaximumRows'] = 10000;
    data['advanceFilter'] =
      [{
        "filterKey": "PeopleStatusDisplayValue",
        "filterOptionType1": "equals",
        "filterOptionValue1": 'Active',
        "filterOperationType": "AND",
        "filterOptionType2": null,
        "filterOptionValue2": null
      }];
    this._unsubscribeLocation.next(null);
    this.locationService
      .getPeopleList(data)
      .pipe(takeUntil(this._unsubscribeLocation))
      .subscribe(
        async (data: any) => {
          if (data && data.Data.$values) {
            this.peoplesList = data.Data.$values;
            this.formatUser = _.map(this.peoplesList, (obj: any) => ({ name: obj.PeopleFirstName + ' ' + obj.PeopleLastName + '-' + obj.PeopleEmail, id: obj.PeopleId }));
            this.setColumn();
          }
        });
  }

  savePrimary() {
    const uniqueLocations = new Set(this.patchData.map((item: any) => isValueExist(item.userId)).filter((value: any) => value !== ''));
    const values = this.patchData.map((item: any) => item.userId);
    const allSame = values.every((val: any) => val === values[0]);
    const anyBlank = values.some((val: any) => !val || val === '');


    if (this.patchData.length > 0) {
      if (anyBlank) {
        this.ErrorWarningPopupOpen('Please select address of People.', false);
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
      locationId: null,
      userId: x.userId,
      VendorProductInventoryId: x.VendorProductInventoryId
    }))

    if (this.isAssignAllChecked) {
      const a = _.find(reconPrimaryLocationsAndUsers, (x: any) => x.userId)?.userId;
      reconPrimaryLocationsAndUsers = _.map(this.patchData, (x: any) => ({
        locationId: null,
        userId: a,
        VendorProductInventoryId: x.VendorProductInventoryId
      }))
    }

    let data = {
      reconPrimaryLocationsAndUsers
    }

    this.saveButtonLoader = true;
    this._unsubscribePrimary.next(null);
    this.reconService.savePeoplePrimary(data).pipe(takeUntil(this._unsubscribePrimary)).subscribe((res: any) => {
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

  }

  onchangeAllCheck() {
    this.setRedColorAllCheckbox = !this.isAssignAllChecked;

    if (this.isAssignAllChecked) {
      const a = _.find(this.patchData, (x: any) => x.userId)?.userId;
      this.patchData = _.map(this.patchData, (x: any) => ({
        locationId: null,
        userId: a,
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
      const data: any = {
        invoiceId: this.selectedRow[0]['InvoiceID'],
        vendorProductInventoryIds: (this.isSelectAll?.value) ? null : this.selectedRow.map((obj: any) => obj.VendorProductInventoryId).join(',')
      };
      if(this.isSelectAll?.value) {
        data['fromSelectAllInvAssStep1'] = true
        data['fromInvAssStep1ReconFilter'] = this.isSelectAll?.data
      }
      
      this._unsubscribeGRid.next(null);

      // Clear files if needed
      if (allOptionsClear) this.files = [];

      this.reconService
        .getReconPeople(data)
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
    this.patchData[index].userId = data.value;

    const uniqueLocations = new Set(this.patchData.map((item: any) => isValueExist(item.userId)).filter((value: any) => value !== ''));
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
      const createColumn = (parent: any, width: any, isChildren: any, type: any, header: any, field: any, childHeader: any, columnGroupShow = 'close', colspan = 1, parentWidth = 150, isParentVisible = true, displayCheckboxColumns = true, isToggle = true) => ({
        parent,
        isicon: 1,
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
        createColumn(1, '190px', true, 'text', 'Inventory', 'ServiceNumber', 'Service Number'),
  
        createColumn(2, '180px', true, 'text', 'Assignment', 'UserName', 'Name on Invoice', 'close', 1, 150, true, true, false),
        createColumn(2, '180px', false, 'text', '', 'UserEmail', 'Email on Invoice', 'close', 1, 150, true, true, false),
        createColumn(2, '400px', false, 'select', '', '', 'Selected User', 'close', 1, 150, true, true, false),
  
  
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
  

        createColumn(9, '160px', true, 'text', 'Vendor UDLS', 'VendorUdl1', 'UDL1', 'close'),
        createColumn(9, '155px', false, 'text', '', 'VendorUdl2', 'UDL2', 'open'),
        createColumn(9, '155px', false, 'text', '', 'VendorUdl3', 'UDL3', 'open'),
        createColumn(9, '155px', false, 'text', '', 'VendorUdl4', 'UDL4', 'open'),
  
  
        createColumn(10, '215px', true, 'text', 'Invoice Info', 'ChargeDetailDescription1', 'Charge Description 1', 'close'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription2', 'Charge Description 2', 'open'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription3', 'Charge Description 3', 'open'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription4', 'Charge Description 4', 'open'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription5', 'Charge Description 5', 'open'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription6', 'Charge Description 6', 'open'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription7', 'Charge Description 7', 'open'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription8', 'Charge Description 8', 'open'),
        createColumn(10, '220px', false, 'text', '', 'ChargeDetailDescription9', 'Charge Description 9', 'open'),
        createColumn(10, '225px', false, 'text', '', 'ChargeDetailDescription10', 'Charge Description 10', 'open'),
  
      
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
    this.stopSpinner = true;


    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));

      this.files = allOptionsClear ? resData : [...this.files, ...resData];
      this.originalFiles = JSON.parse(JSON.stringify(resData)); 

      this.patchData = this.files.map((entry: any) => {
        const data = entry.data;
      
        return {
            ...data,
            userId: null
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
