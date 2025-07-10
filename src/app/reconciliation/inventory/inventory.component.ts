import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { ReconMainComponent } from './recon-main/recon-main.component';
import { ReconVpSelectOnlyOneComponent } from './recon-vp-select-only-one/recon-vp-select-only-one.component';
import { ReconService } from 'src/app/services/recon.service';
import { LocationService } from 'src/app/services/location.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AllocationsByProductComponent } from 'src/app/common/allocations-by-product/allocations-by-product.component';
import { AllocationsByStructureComponent } from 'src/app/allocations-by-structure/allocations-by-structure.component';
import { CostCenterStructureEngineComponent } from 'src/app/cost-center-structure-engine/cost-center-structure-engine.component';
import { InvoiceOverviewIComponent } from 'src/app/common/invoice-overview-i/invoice-overview-i.component';
import { InventoryAssignmentPTableComponent } from './inventory-assignment-p-table/inventory-assignment-p-table.component';
import { AssignLocationReconComponent } from './assign-location-recon/assign-location-recon.component';
import { AssignPeopleReconComponent } from './assign-people-recon/assign-people-recon.component';
import { InvoiceMainComponent } from 'src/app/common/invoice-main/invoice-main.component';
import { NewDistributionInvoiceComponent } from 'src/app/new-distribution-invoice/new-distribution-invoice.component';
import { DistributionEngineCIComponent } from 'src/app/distribution-engine-c-i/distribution-engine-c-i.component';
import { DistributionDetailDIComponent } from 'src/app/common/distribution-detail-d-i/distribution-detail-d-i.component';
import { WirelineService } from 'src/app/services/wireline.service';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  providers: [ReconService, InvoiceService, WirelineService],
  imports: [SharedModule, PrimgModule, AllocationsByProductComponent, AllocationsByStructureComponent, CostCenterStructureEngineComponent,
    ReconMainComponent, InvoiceOverviewIComponent, InventoryAssignmentPTableComponent, AssignLocationReconComponent, AssignPeopleReconComponent,InvoiceMainComponent, NewDistributionInvoiceComponent, DistributionEngineCIComponent,
    DistributionDetailDIComponent, 
  ]
})
export class InventoryComponent implements OnInit {

  selectedTem: any = 'all';
  selectedTab: any = 0;
  selectedChild: any = 0;
  selectedCustomer: string = 'all';
  clickOnSearchButton = false;
  stopSpinner: boolean = false;
  public buttonAction: any;
  disableTemSearch: any;
  disableTemSearchDD: any;
  hasSuperTemUsers: boolean = false;
  hasTemUsers: boolean = false;
  isShowSearch = true;
  customers: any = [];
  selectedTemTabWise: any = [];
  tems: any = [];
  filterdTems: any = [];
  summaryData: any;
  latestInvoiceData: any;
  loadingCustomerAPI = false;
  isSuperTem = false;
  isFilterData = false;
  CustomerAdmin = false;
  isSelectAll: any;

  selectedTemDD: any;
  isForEditDistribution: any;
  clickedRowData: any;
  allocationTypeValue = '';
  isShowInvoiceSummaryExportDisable: boolean = false;
  isDisableExportAllocation: boolean = false;
  isAddClicked: boolean = false;
  isccsDataExist: boolean = false;
  isccsDataDisabled: boolean = false;
  refeshGrid: boolean = false;
  isDisable: boolean = true;
  disableCheck: boolean = false;
  isShowNext: boolean = false;
  isRerunAccess = false;

  public editRecord: any;
  public exportCCsData: any;

  @ViewChild('reconTooltip') reconTooltip!: TemplateRef<any>;
  @ViewChild(ReconMainComponent) private reconMainComponent: ReconMainComponent;

  selected = 0;
  selectedTabChildrenAllow = 0;
  selectedTabChildren: any = 0;
  selectedTabChildrenDist = 0;
  selectedChildrenOfStep1 = 0;

  gridApi: any;
  gridColumnApi: any;
  rowData: any = [];
  private _unsubscribeRecon: Subject<any> = new Subject<any>();
  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  private readonly getTemListsDestroy = new Subject<void>();
  private readonly getCustomerUser = new Subject<void>();

  public sideBar: any;
  sbInvoiceId: any;

  public columnDefs;
  rowDataGrid: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  buttonOptions: any = [
    { label: 'Recon', value: 'Recon', url: '/reconciliation/inventory', icon: 'fa fa-smile' }
  ];

  selectedTabOption = this.buttonOptions[0].value;

  selectedRow: any = [];
  temRoles = false;
  goToPage(to: any) {
    // this.selectedButton = to.value;
    this.selectedTabOption = to.value;
    // this.router.navigate([to.url]);
  }

  constructor(public locationService: LocationService,
    public dialog: MatDialog,
    private reconService: ReconService,
    private invoiceService: InvoiceService,
    private sessionStorageService: SessionStorageService
  ) {

    this.columnDefs = [
      {
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
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 162,
            width: 162
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
            minWidth: 140
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
            minWidth: 101,
            width: 101
          }
        ],
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ],
      },
      {
        headerName: 'Assignment Info',
        children: [
          {
            field: 'ChargeDetailAddress1',
            headerName: 'Address on Invoice',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 205
          },
          {
            field: 'UserName',
            headerName: 'Name on Bill',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'UserEmail',
            headerName: 'Email on Bill',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          }
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
            minWidth: 230
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 225
          },
          {
            field: 'PayableAccount',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 225,
            width: 225,
          }
        ],
      }
    ];

  }

  items = [{
    label: 'Inventory Assignment step 1',
    styleClass: 'danger-step'
  },
  {
    label: 'Cost Distribution step 2',
    styleClass: 'danger-step'
  },
  {
    label: 'Cost Allocation step 3',
    styleClass: 'danger-step'
  },
  {
    label: 'Finished',
    styleClass: 'danger-step'
  }];

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event;
    this.gridColumnApi = $event.columnApi;
  }

  selectedChildrenOfStep1Emit(e: any) {
    this.selectedChildrenOfStep1 = e.index;
    this.selectedRow = e.selectedRow;
    this.isSelectAll = e.isSelectAll;
  }
  ngOnInit(): void {
    this.selectedRow = [];
    this.selectedChildrenOfStep1 == 0 ? this.disableCheck = true : this.disableCheck = false;

    this.getTemLists();
    this.getCustomerForUser();
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isRerunAccess = rolePermission(['SuperTEMAdmin', 'TEMAdmin']);

    this.isSuperTem = this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMAdmin") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMManager") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMUser");

    this.CustomerAdmin = this.sessionStorageService.getObjectValue('userRoles').includes("CustomerAdmin");

  }
  searchInvoice() {
    this.reconMainComponent.searchInvoice(this.selectedTem, this.selectedCustomer);
  }
  callGridAPI(data: any) {
    if (data) {
      const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
      this.onAgGridReady(a);
    }
  }

  redirectTab() {
    const customerId = this.selectedRow[0].CustomerAccountId;
    const invoiceId = this.selectedRow[0].InvoiceID;

    let isPeople = this.selectedRow.every((x: any) => x.ReconAssigments == 'People');
    let isLocation = this.selectedRow.every((x: any) => x.ReconAssigments == 'Locations');

    let data1 = this.selectedRow.every((x: any) => x.CustomerAccountId == customerId);
    let data2 = this.selectedRow.every((x: any) => x.InvoiceID == invoiceId);

    if (!isLocation && !isPeople) {
      this.ErrorWarningPopupOpen('Please select Service Numbers to be assigned with the same product designation.');
      return
    }

    if (isPeople || isLocation) {
      let vendorProduct = this.selectedRow[0].VendorProductId;
      let matchPeoplePVendor = this.selectedRow.every((x: any) => x.VendorProductId == vendorProduct);
      if (!matchPeoplePVendor) {
        let errorData: any = {
          messgeType: 'error',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-exclamation-circle',
          iconClass: 'text-c-blue f-70',
          okBtnName: 'Close & Review',
          closeBtnName: 'Yup, please do this!',
          message: 'Please select Service Numbers to be assigned with the same product designation. Select a single Vendor Product to continue. ',
        };
        const dialogRef = this.dialog.open(ReconVpSelectOnlyOneComponent, {
          panelClass: 'error-warning',
          data: {errorData: errorData, selectedRow: this.selectedRow}
          // data: {errorData, selectedRow: this.selectedRow}
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (Number.isInteger(result)) {
            const g = _.filter(this.selectedRow, (x: any) => x.VendorProductId === result);
          }
        });

        return
      }
    }

    if (!data1) {
      this.ErrorWarningPopupOpen('Please select records from within a single customer.');
      return
    }

    // if (!data2) {
    //   this.ErrorWarningPopupOpen('Please select records from within a single invoice.');
    //   return
    // }

    if (isPeople) {
      this.selectedChildrenOfStep1 = 2;
    }

    if (isLocation) {
      this.selectedChildrenOfStep1 = 1;
    }
  }

  clickToSubTab(e: any) {
    this.selectedTabChildren = e;
  }

  addInvoiceSummary() {
    this.selectedTab = 2;
    this.selectedTabChildrenDist = 1;
  }

  clickToSubTabDist(e: any) {
    this.selectedTabChildrenDist = e;
  }
  clickToSubTabAllow(e: any) {
    this.selectedTabChildrenAllow = e;
  }

  clickToSubtabOfStep1(e: any) {
    if (e == 0) {
      this.disableCheck = true;
    }
    this.selectedChildrenOfStep1 = e;
  }

  addDistribution() {
    this.selectedTabChildrenDist = 1;
  }

  onExportDisableEvent($event: any) {
    this.isShowInvoiceSummaryExportDisable = $event;
  }

  onExportDisableAllocation($event: any) {
    this.isDisableExportAllocation = $event
  }

  clickMainTab(e: any, isDisabled: boolean = false) {

    if (isDisabled) {
      return;
    }

    this.selected = e;
    if (e === 0) {
      this.selectedRow = [];
      this.selectedChildrenOfStep1 = 0;
      this.selectedTabChildrenDist = 0;
      this.selectedTabChildrenAllow = 0;
      this.selectedTem = 'all';
      this.selectedCustomer = 'all';
    }

    if (e === 1) {
      this.selectedChildrenOfStep1 = 0;
    }
    if (e === 2) {
      this.selectedTabChildrenDist = 0;
    }
    if (e === 3) {
      this.selectedTabChildrenAllow = 0;
    }
  }

  redirectTab2(value: any) {
    if (value.type == 'add-distribution') {
      this.selectedTabChildrenDist = 1;
    } else if (value.type == 'distribution-rule-engine') {
      this.selectedTab = 2;
      this.selectedTabChildrenDist = 2;
    } else if (value.type == 'distribution-detail') {
      this.selectedTab = 2;
      this.selectedTabChildrenDist = 3;
    } else if (value.type == 'grid') {
      this.selectedTabChildrenDist = 0;
    }
    this.isForEditDistribution = value.redirect;
    this.clickedRowData = value.data;
  }

  isRecordFinished($event: any) {
    if ($event) {
      this.selected = 0;
    }
  }

  isDistributionCompleted($event: any) {
    if ($event) {
      this.selected = 3;
    }
  }

  refresh() {
    this.refeshGrid = true;
  }

  refeshGridOutput($event: any) {
    this.refeshGrid = $event;
  }

  invoiceOverviewDataOutput(data: any) {
  }

  next(e?:any) {
    if (this.latestInvoiceData) {
      if (this.latestInvoiceData.IsDistribution !== true) {
        this.selected = 2;
      } else if (this.latestInvoiceData.IsDistribution == true && this.latestInvoiceData.IsAllocation !== true) {
        this.selected = 3;
      } else if (this.latestInvoiceData.IsRecondone == true && this.latestInvoiceData.IsDistribution == true && this.latestInvoiceData.IsAllocation == true) {
        this.selected = 0;
      }
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.reconTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent , { panelClass: 'error-warning', data: errorData });
    return
  }

  onSelectionChanged($event: any) {
    if ($event.length > 0) {
      this.disableCheck = false;
    }
    this.selectedRow = $event;
  }

  toggle() {
    const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
    this.onAgGridReady(a);
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray: any = [];
        const filterArrayDate: any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'InvoiceBillDate' || key === 'InvoicePayByDate') {
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
          StartRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          MaximumRows: 100
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (this.summaryData) {
          data['InvoiceId'] = this.summaryData.InvoiceId;
        }

        // if (this.isSuperTem && !this.isFilterData) {

        //   filterArray.push({
        //     "filterKey": "ReconValue",
        //     "filterOptionType1": "equals",
        //     "filterOptionValue1": "SuperTEM",
        //     "filterOperationType": "AND",
        //     "filterOptionType2": null,
        //     "filterOptionValue2": null
        //   })
        // }
        // if (this.CustomerAdmin && !this.isFilterData) {

        //   filterArray.push({
        //     "filterKey": "ReconValue",
        //     "filterOptionType1": "equals",
        //     "filterOptionValue1": "Customer",
        //     "filterOperationType": "AND",
        //     "filterOptionType2": null,
        //     "filterOptionValue2": null
        //   })
        // }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if (this.selectedTem != 'all') {
          data['TemAccountId'] = parseInt(this.selectedTem);
        }
        if (this.selectedCustomer != 'all') {
          data['customerAccountId'] = parseInt(this.selectedCustomer);
        }
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k: any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingFiled'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this.stopSpinner = false;
        this.reconService
          .getReconGrid(data)
          .pipe(takeUntil(this._unsubscribeRecon))
          .subscribe(
            async (data: any) => {
              this.stopSpinner = true;
              if (data && data.Data.$values.length > 0) {
                this.rowData = data.Data.$values;
                // if(data.Data.$values.length){
                //   this.isDisable = true;
                // } else {
                //   this.isDisable = false;
                // }
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
    if (this.gridApi.api) {
      this.gridApi.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }

  costAllocationStructureExport() {

    this.isccsDataDisabled = true;
    this.invoiceService.costAllocationStructureExport(this.summaryData.InvoiceId, this.exportCCsData).subscribe({
      next: data => {
        this.isccsDataDisabled = false;
        let bolbUrl = URL.createObjectURL(data);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", `Cost Center Structure.xlsx`);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      error: error => {
        this.isccsDataDisabled = false;
      }
    })
  }

  rowCellDoubleClicked($event: any) {
    this.selectedChildrenOfStep1 = 0;
    if ($event) {
      this.selected = $event.redirectTo;
      this.summaryData = $event.rowData;
      this.summaryData?.IsCostAllocationStatus;

      this.locationService.stepValue$.subscribe((res: any) => {
        this.latestInvoiceData = res;
        console.log('latestInvoiceData', this.latestInvoiceData);
        if (res?.IsRecondone) {
          // this.isDisable = false;
          this.isShowNext = true;
        } else {
          // this.isDisable = true;
          this.isShowNext = false;
        }
        if (this.summaryData?.IsCostAllocationStatus) {
          this.items = [{
            label: 'Inventory Assignment',
            styleClass: res?.IsRecondone ? 'success-step' : 'danger-step',
          },
          {
            label: 'Cost Distribution',
            styleClass: res?.IsDistribution ? 'success-step' : 'danger-step',
          },
          {
            label: 'Cost Allocation',
            styleClass: res?.IsAllocation ? 'success-step' : 'danger-step',
          },
          {
            label: 'Finished',
            styleClass: res?.IsFinished ? 'success-step' : 'danger-step',
          }];
        } else {
          this.items = [{
            label: 'Inventory Assignment',
            styleClass: res?.IsRecondone ? 'success-step' : 'danger-step',
          },
          {
            label: 'Cost Distribution',
            styleClass: res?.IsDistribution ? 'success-step' : 'danger-step',
          },
          {
            label: 'Finished',
            styleClass: res?.IsFinished ? 'success-step' : 'danger-step',
          }];
        }
      });
      // this.items = [{
      //   label: 'Inventory Assignment step 1',
      //   styleClass: this.summaryData.StatusInventoryAssignment ? 'success-step' : 'danger-step',
      // },
      // {
      //   label: 'Cost Distribution step 2',
      //   styleClass: this.summaryData.StatusCostDistribution ? 'success-step' : 'danger-step',
      // },
      // {
      //   label: 'Cost Allocation step 3',
      //   styleClass: this.summaryData.StatusCostAllocation ? 'success-step' : 'danger-step',
      // },
      // {
      //   label: 'Finished',
      //   styleClass: 'danger-step'
      // }];
    }
  }

  redirectAllocationTab(data: any) {
    if (data.type == 'engine') {
      this.selectedTabChildrenAllow = 2;
      this.editRecord = data.rowData;
    } else if (data.type == 'grid') {
      this.selectedTabChildrenAllow = 0;
    }
  }

  redirectToRuleTab($event: any) {
    this.selectedTabChildrenAllow = 2;
    this.editRecord = $event;
  }

  CCSDataExist(data: any) {
    this.isccsDataExist = data;
  }

  exportCCSExcelData(data: any) {
    this.exportCCsData = data;
  }

  callReconMainGrid($event: any) {
    if ($event) {
      this.reconMainComponent.getLatestData();
    }
  }

  allocationType(type: any) {
    this.allocationTypeValue = type;
  }

  resetVariables() {
    this.allocationTypeValue = '';
  }

  getInvoiceOverview() {
    this.reconService.getInvoiceOverview(this.summaryData.InvoiceId).subscribe((res: any) => {
    });
  }

  addRuleClicked() {
    this.isAddClicked = true;
  }
  addClickedEmit(value: any) {
    this.isAddClicked = value
  }

  getTemLists() {
    this.getTemListsDestroy.next();
    this.locationService
      .getTemLists()
      .pipe(takeUntil(this.getTemListsDestroy))
      .subscribe(
        (response: any) => {
          if (response) {
            this.tems = this.filterdTems = response.$values;

            // if (this.hasSuperTemUsers) {
            let id = sessionStorage.getItem("LoggedAccountId");
            const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
            this.tems.unshift(found);

            this.tems = this.tems.filter((object: any, index: number): boolean => {
              return object && this.tems.indexOf(object) === index;
            });
            // }
          }
        },
        (error) => { }
      );
  }

  onChangeTem(event: any) {
    if (event.target.value !== 'all') {
      this.customers = [];
      this.loadingCustomerAPI = true;
      this.selectedTemDD = event.target.value;
      this.getCustomerUser.next();
      this.locationService.getCustomerDropdownByNewTEM(event.target.value).pipe(takeUntil(this.getCustomerUser)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
          this.selectedCustomer = 'all';
          this.loadingCustomerAPI = false;
        } else {
          this.loadingCustomerAPI = false;
        }
      }, error => {
        this.loadingCustomerAPI = false;
      });
    }  else {
      this.customers = [];
      this.selectedCustomer = 'all';
      this.getCustomerForUser();
    }
  }


  getCustomerForUser() {
    this.getCustomerUser.next();
    this.customers = [];
    this.locationService.getCustomerDropDown().pipe(takeUntil(this.getCustomerUser)).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
      }
    });
  }


  ngOnDestroy() {
    this._unsubscribeRecon.next(null);
    this._unsubscribeRecon.complete();
    this.getTemListsDestroy.next();
    this.getTemListsDestroy.complete();
  }

  onReload($event: any) {
    if ($event) {
      this.selectedChildrenOfStep1 = 0;
      this.onAgGridReady(this.gridApi);

    }
  }
}
