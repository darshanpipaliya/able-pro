import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ChangeParentComponent } from './change-parent/change-parent.component';
import { IndividualPopupComponent } from './individual-popup/individual-popup.component';
import moment from 'moment';
import { ChildInventoryLinkCellComponent } from './child-inventory-link-cell.component';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { rolePermission } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { ClientSideRowModelModule, ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);
@Component({
  selector: 'app-child-inventory-datatable',
  templateUrl: './child-inventory-datatable.component.html',
  styleUrls: ['./child-inventory-datatable.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule],
  providers: [WirelineService]
})
export class ChildInventoryDatatableComponent implements OnInit, OnDestroy {

  @Input() rowData: any;
  @Input() buttonAction: any;
  @Input() selectedButton: any;
  @Input() isChildInventory: any;
  @Input() tabIndex: any;
  @Input() serviceIds: any;
  frameworkComponents: any;

  @Output() onChildInventory: EventEmitter<any> = new EventEmitter<any>();
  @Output() onEditedChildInventory: EventEmitter<any> = new EventEmitter<any>();
  @Output() wirelinePageName: EventEmitter<any> = new EventEmitter<any>();
  @Output() isSetAction: EventEmitter<any> = new EventEmitter<any>();

  @Output() setCustomerDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() childClicked: EventEmitter<any> = new EventEmitter<any>();

  inventoryForm: FormGroup;
  submitted: boolean = false;
  isSuperTEMRole: boolean = false;
  tems: any = [];
  customerList: any = [];
  MainBillingAccountDD: any = [];
  varPayableAccount = null;
  vendorsList: any = [];
  inventoryStatusList: any = [];
  inventoryOriginList: any = [];
  vendorProductDetails: any = [];
  isRoleAccess = false;
  stopSpinner = false;
  public columnDefs: any;

  isRowSelected: boolean = false;

  gridApi: any;
  gridColumnApi: any;

  childinventoryRowData = [];
  public selectedInventory: any;

  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private _unsubscribeChildInventory: Subject<any> = new Subject<any>();

  constructor(public dialog: MatDialog, private fb: FormBuilder, private locationService: LocationService,
    private wirelineService: WirelineService, private variableManageService: VariableManageService) { }
  public defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['buttonAction']?.currentValue == 'change-parent') {
      this.changeParentPopup();
    } else if (changes['buttonAction']?.currentValue == 'make-individual') {
      this.individualPopup();
    }
  }


  onCellClicked(data: any){
    this.childClicked.emit(data)
  }

  createDateFormatter(params: any) {
    if (params && params.data && params.data.CreationDate) {
      let date = new Date(params.data.CreationDate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }
  onSelectionChanged(event: any) {
    event.length > 0 ? this.isRowSelected = true : this.isRowSelected = false;
    event.length > 0 ? this.onChildInventory.emit(true) : this.onChildInventory.emit(false)
    event.forEach((e: any) => {
      this.selectedInventory = e;
    });
  }

  gridOptions = {
    rowModelType: 'serverSide',
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'single',
      enableClickSelection: true
    },
  };

  onAgGridReady($event: any) {
    this.stopSpinner = true;
    this.gridApi = $event;

    if(this.gridApi.api){
      this.gridApi.api.forEachNode((node: any) => {
        node.setSelected(false);
      });
    } else {
      this.gridApi.forEachNode((node: any) => {
        node.setSelected(false);
      });
    }
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'CreationDate') {
            arrDate = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.dateFrom) ? data.dateFrom.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateFrom']) ? data['condition1'].dateFrom.split(' ')[0].toString() : null,
              filterOptionValue1_2: (data && data.dateTo) ? data.dateTo.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateTo']) ? data['condition1']?.dateTo.split(' ')[0].toString() : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].dateFrom) ? data['condition2']?.dateFrom.split(' ')[0].toString() : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].dateTo) ? data['condition2']?.dateTo.split(' ')[0].toString() : null
            }
            filterArrayDate.push(arrDate);
          } else {
            arr = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: data['filter'] ? data['filter'] : data['condition1'].filter ? data['condition1'].filter : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: data['condition2']?.filter ? data['condition2']?.filter : null
            }
            filterArray.push(arr);
          }
        }
        let data: any = {
          startRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          maximumRows: 100,
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        data['CustomerAccountId'] = this.rowData['CustomerAccountId'];
        data['ParentVendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort.toUpperCase();
                }
              });
            }
          });
        }
        this._unsubscribeInventory.next(null);

        this.wirelineService.getInventoryData(data)
          .pipe(takeUntil(this._unsubscribeInventory))
          .subscribe(
            async (data: any) => {

              if (data && data.Data.$values.length > 0) {
                this.childinventoryRowData = data.Data.$values;
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
              this.childinventoryRowData = [];
              this.stopSpinner = true;
              params.success({
                rowData: [],
                rowCount: 0
              });
              this.gridApi.showNoRowsOverlay();
            }
          );
      },
    };
    if(this.gridApi.api){
      this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  }

  sideBar = {
    toolPanels: ['columns', 'filters']/* ,
    defaultToolPanel: 'columns', */
  };
  ngOnInit(): void {

    this.wirelinePageName.emit('ChildInventoryNotes');
    this.setInventoryForm();
    this.isSuperTEMRole = this.locationService.isUserHasSuperTEMUsersRole();
    this.isRoleAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager', 'TEMAdmin', 'TEMManager', 'TEMUser'])


    if (this.rowData) {
      this.setCustomerDDValueEvent.emit(this.rowData.CustomerAccountId);
      this.setTemDDValueEvent.emit(this.rowData.TEMAccountId);
    }

    this.columnDefs = [
      {
        headerName: ' ',
        headerCheckboxSelection: false,
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
        //pinned: 'left',
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'ServiceNumber',
            cellRendererParams: {
              rowData: this.rowData,
              onClick: this.onCellClicked.bind(this)
            },
            cellRenderer: 'ChildInventoryLinkCellComponent'
          },
          // {
          //   field: 'BillingId',
          //   headerName: 'Billing ID',
          //   columnGroupShow: 'open',
          //   filter: 'agTextColumnFilter',
          //   minWidth: 140,
          //   flex: 0,
          //   resizable: true,
          //   editable: false,
          //   sortingField: 'BillingId'
          // },
        ],
      },
      {
        headerName: 'Vendor',
        children: [
          {
            headerName: 'Vendor',
            field: 'VendorAccountName',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            minWidth: 140,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'VendorAccountName'
          },
          {
            headerName: 'VBA',
            field: 'VendorBillingAliasName',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 140,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'VendorBillingAliasName'
          },
  
        ],
      },
      {
        headerName: 'Account',
        children: [
          {
            headerName: 'Main Account Number',
            field: 'MainAccountNumber',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            minWidth: 250,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'MainAccountNumber'
          },
          {
            headerName: 'Sub Account Number',
            field: 'SubAccountNumber',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 220,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'SubAccountNumber'
          },
          {
            headerName: 'Payable Account Number',
            field: 'PayableAccountNumber',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 250,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'PayableAccountNumber'
          },
        ]
      },
      {
        headerName: 'Custom Fields',
        children: [
          {
            headerName: 'Service Custom 1',
            field: 'InventoryCustomField1',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            minWidth: 200,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'InventoryCustomField1'
          },
          {
            headerName: 'Service Custom 2',
            field: 'InventoryCustomField2',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 200,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'InventoryCustomField2'
          },
          {
            headerName: 'Service Custom 3',
            field: 'InventoryCustomField3',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 200,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'InventoryCustomField3'
          },
          {
            headerName: 'Service Custom 4',
            field: 'InventoryCustomField4',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 200,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'InventoryCustomField4'
          },
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            headerName: 'Status',
            field: 'InventoryStatusDisplayText',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            minWidth: 140,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'InventoryStatusDisplayText'
          },
          {
            headerName: 'Origin',
            field: 'InventoryOriginName',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 140,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'InventoryOriginName'
          },
          {
            headerName: 'Created Date',
            field: 'CreationDate',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'open',
            minWidth: 180,
            flex: 0,
            resizable: true,
            editable: false,
            valueFormatter: this.createDateFormatter,
            sortingField: 'CreationDate'
          },
        ]
      }
    ];

     this.frameworkComponents = {
      ChildInventoryLinkCellComponent: ChildInventoryLinkCellComponent
     }
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }


  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  setInventoryForm() {
    this.inventoryForm = this.fb.group({
      TEM: new FormControl('', [Validators.required]),
      customerId: new FormControl('', [Validators.required]),
      VendorId: new FormControl('', [Validators.required]),
      billingAccountHierarchyId: new FormControl(''),
      parentBillingAccountHierarchyId: new FormControl(''),
      subAccountNumber: new FormControl('', [Validators.required]),
      payableAccountNumber: new FormControl('', [Validators.required]),
      isPhoneNumber: new FormControl(null, [Validators.required]),
      serviceNumber: new FormControl('', [Validators.required]),
      billingId: new FormControl('', [Validators.required]),
      vendorProductInventoryOriginId: new FormControl({ value: '', disabled: true }, [Validators.required]),
      statusId: new FormControl('', [Validators.required]),
      service: new FormControl({ value: '', disabled: true }, [Validators.required]),
      serviceType: new FormControl({ value: '', disabled: true }, [Validators.required]),
      product: new FormControl({ value: '', disabled: true }, [Validators.required]),
      productType: new FormControl({ value: '', disabled: true }, [Validators.required]),
      vendorProductTypeId: new FormControl('', [Validators.required]),
      vendorProductInventoryDescription: new FormControl('', [Validators.required]),
      inventoryCustomField1: new FormControl('', [Validators.required]),
      inventoryCustomField2: new FormControl('', [Validators.required]),
      inventoryCustomField3: new FormControl('', [Validators.required]),
      inventoryCustomField4: new FormControl('', [Validators.required]),
    })
  }

  get f() {
    return this.inventoryForm.controls;
  }

  changeParentPopup() {
    const dialogRef = this.dialog.open(ChangeParentComponent, {
      width: '1100px',
      data: {
        data: this.selectedInventory,
        serviceIds: this.serviceIds
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.isSetAction.emit('');
      if (result) {
        this.onAgGridReady(this.gridApi);
        if (this.selectedInventory.ServiceNumber == this.rowData.ServiceNumber) {
          this.onEditedChildInventory.emit('');
        } else {
          this.onEditedChildInventory.emit(true);
        }
      }
    });
  }

  individualPopup() {
    const dialogRef = this.dialog.open(IndividualPopupComponent, {
      width: '900px',
      data: { data: this.selectedInventory },
      disableClose: true
    })
    dialogRef.afterClosed().subscribe((result) => {
      this.isSetAction.emit('');
      if (result) {
        this.onAgGridReady(this.gridApi);
        this.onEditedChildInventory.emit(true);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeChildInventory.next(null);
    this._unsubscribeChildInventory.complete();
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
  }
}
