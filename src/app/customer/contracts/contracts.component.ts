import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReplaceContractDialogComponent } from './replace-contract-dialog/replace-contract-dialog.component';
import _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import moment from 'moment';
import { LinkInventoryCDialogComponent } from './link-inventory-c-dialog/link-inventory-c-dialog.component';
import { AddEditContractsComponent } from './add-edit-contracts/add-edit-contracts.component';
import { ContractService } from 'src/app/services/contract.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { LocationService } from 'src/app/services/location.service';
import { checkIsValueExists, isValueExist, rolePermission } from 'src/app/services/helper';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
  ]
})
export class ContractComponent implements OnInit {


  @Input() action: String;
  @ViewChild('contractMainTooltip') contractMainTooltip!: TemplateRef<any>;

  @ViewChild(AddEditContractsComponent) private editContractComponent: AddEditContractsComponent;

  public sideBar: any;
  public columnDefs: any;
  public rowSelection: any;
  public exportInvoiceSummaryData: any;
  public exportDetail: any;

  selectedTemForZero: any;
  selectedCustomerForZero: any;

  customers: any = [];
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  gridApi: any;
  gridColumnApi: any;
  selectedMainTab: any = 0;

  rowData: any = [];
  isDisabled = false;
  selectedTab: any = 0;
  tabsArray: any = [];
  childRecord = '';
  selectedChild: any = 0;
  selectedTem: any = 'all';
  stopSpinner: boolean = false;
  selectedCustomer: any = 'all';
  loadingCustomerAPI = false;
  selectedTemDD: any;
  tems: any = [];
  filterdTems: any = [];
  hasSuperTemUsers: boolean = false;
  tabsMainArray: any = [];
  tabAddemArray: any = [];
  selectedAddedm: any = 0;
  sendDataToLinkPopup: any;
  isOpenWirelineTab: boolean = false;
  isDisabledExport: boolean = false;
  isDisablLinkInventory: boolean = false;
  opentabsFromInventory_Contract: boolean = false;
  opentabsFromInventory_Inventory: boolean = false;
  isSendVendorProductInventoryId: boolean = false;
  linkedData: any;
  disablePlusOptions: boolean = false;
  temRoles = false;
  exportData: any;
  inventoryData: any;
  advanceFilter: any;
  editContractData: any;
  editContractDataFromLinkedInventory: any;

  private _unsubscribeContractGrid: Subject<any> = new Subject<any>();
  private _getCustomerUserDestroy: Subject<any> = new Subject<any>();
  private _getTemListsDestroy: Subject<any> = new Subject<any>();

  buttonOptions: any = [
    { label: 'Contracts', value: 'contracts', url: '/organization/contracts', class: 'fas-fa-file-lock' },
    // { label: "LOA's", value: 'loas', url: '/organization/abc' },
  ];

  selectedTabOption = this.buttonOptions[0].value;
  selectedButton = this.buttonOptions[0].value;

  editDetailsData: any;
  constructor(private contractService: ContractService,
    public variableManageService: VariableManageService,
    public dialog: MatDialog,
    public locationService: LocationService,
    private router: Router,
    private cd: ChangeDetectorRef) {

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs = [
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125,
            sortingField: 'VendorAccountName'
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
            minWidth: 200,
            sortingField: 'CustomerAccountName'
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            sortingField: 'CompanyName'
          }
        ],
      },
      {
        headerName: 'Overview',
        children: [
          {
            field: 'ContractDocumentType',
            headerName: 'Type of Document',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 178,
            sortingField: 'ContractDocumentType'
          },
          {
            field: 'DocumentName',
            headerName: 'Document Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            sortingField: 'DocumentName'
          },
          {
            field: 'ContractStatusDisplay',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 94,
            sortingField: 'ContractStatusDisplay'
          },
          {
            field: 'InternalDocumentNumber',
            headerName: 'Internal Contract Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 240,
            sortingField: 'InternalDocumentNumber'
          },
          {
            field: 'VendorDocumentNumber',
            headerName: 'Vendor Contract Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 240,
            sortingField: 'VendorDocumentNumber'
          }
        ],
      },
      {
        headerName: 'Terms',
        children: [
          {
            field: 'ContractTermStartDate',
            headerName: 'Start Date',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 121,
            valueGetter(params: any) {
              if (params?.data?.ContractTermStartDate) {
                return moment(params?.data && params?.data?.ContractTermStartDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'ContractTermEndDate',
            headerName: 'End Date',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 114,
            valueGetter(params: any) {
              if (params?.data?.ContractTermEndDate) {
                return moment(params?.data && params?.data?.ContractTermEndDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'ContractTermDisplay',
            headerName: 'Contract Term',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 149,
            sortingField: 'ContractTermDisplay'
          },
          {
            field: 'ContractMonthsRemainingDisplay',
            headerName: 'Months Remaining',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 181,
            sortingField: 'ContractMonthsRemaining'
          },
          {
            field: 'NoticePeriodMonthsDisplay',
            headerName: 'Notice Period',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145,
            sortingField: 'NoticePeriodMonths'
          },
          {
            field: 'ReminderDaysAlarmMonthsDisplay',
            headerName: 'Reminder Period',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175,
            sortingField: 'ReminderDaysAlarmMonths'
          },
          {
            field: 'ContractTermAutoRenualDisplay',
            headerName: 'Auto-Renewal',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 148,
            sortingField: 'ContractTermAutoRenualDisplay'
          },
          {
            field: 'ContractCustomPaymentTerms',
            headerName: 'Custom Payment Terms',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 212,
            sortingField: 'ContractCustomPaymentTerms'
          }
        ],
      },
      {
        headerName: 'Commitments',
        children: [
          {
            field: 'AnnualRevenueCommitmentAmountDisplay',
            headerName: 'Annual Revenue Amount $',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 234,
            sortingField: 'AnnualRevenueCommitmentAmount'
          },
          {
            field: 'InventoryCommitmentAmountDisplay',
            headerName: 'Inventory Commitment Amount $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 283,
            sortingField: 'InventoryCommitmentAmount'
          },
          {
            field: 'MonthlyRevenueCommitmentAmountDisplay',
            headerName: 'Monthly Revenue Amount $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 244,
            sortingField: 'MonthlyRevenueCommitmentAmount'
          },
          {
            field: 'OtherCreditAmountDisplay',
            headerName: 'Other Credits Amount $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 215,
            sortingField: 'OtherCreditAmount'
          }
        ],
      },
      {
        headerName: 'Termination',
        children: [
          {
            field: 'EarlyTerminationFeeDisplay',
            headerName: 'Early Termination Penalty',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 244,
            sortingField: 'EarlyTerminationFeeDisplay'
          },
          {
            field: 'TerminationFeesDisplay',
            headerName: 'Termination Fees $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'TerminationFees'
          }
        ],
      },
      {
        headerName: 'Discounts',
        children: [
          {
            field: 'ServiceDiscount',
            headerName: 'Service Discount',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 166,
            sortingField: 'ServiceDiscount'
          },
          {
            field: 'FeatureDiscount',
            headerName: 'Feature Discount',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 168,
            sortingField: 'FeatureDiscount'
          },
          {
            field: 'EquipmentDiscount',
            headerName: 'Equipment Discount',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 191,
            sortingField: 'EquipmentDiscount'
          },
          {
            field: 'OtherDiscount',
            headerName: 'Other Discount',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 156,
            sortingField: 'OtherDiscount'
          }
        ],
      },
      {
        headerName: 'Credits',
        children: [
          {
            field: 'ActivationCreditAmountDisplay',
            headerName: 'Activation Credits Amount $',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 245,
            sortingField: 'ActivationCreditAmount'
          },
          {
            field: 'SpendCreditAmountDisplay',
            headerName: 'Spend Credits Amount $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 219,
            sortingField: 'SpendCreditAmount'
          },
          {
            field: 'OtherCreditAmountDisplay',
            headerName: 'Other Credits Amount $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 215,
            sortingField: 'OtherCreditAmount'
          },
          {
            field: 'GuaranteedCreditAmountDisplay',
            headerName: 'Guaranteed Credits Amount $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 255,
            sortingField: 'GuaranteedCreditAmount'
          },
          {
            field: 'NumberOfActivationFees',
            headerName: 'Number of Activation Waivers',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 257,
            sortingField: 'NumberOfActivationFees',
            valueGetter(params: any) {
              if (params?.data?.NumberOfActivationFees) {
                return params?.data?.NumberOfActivationFees.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
              return '';
            }
          },
          {
            field: 'NumberOfTerminationWaivers',
            headerName: 'Number of Termination Waivers',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 269,
            sortingField: 'NumberOfTerminationWaivers',
            valueGetter(params: any) {
              if (params?.data?.NumberOfTerminationWaivers) {
                return params?.data?.NumberOfTerminationWaivers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
              return '';
            }
          },
          {
            field: 'NumberOfJointActtermFees',
            headerName: 'Number of Joint Activation/Termination Waivers',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 381,
            sortingField: 'NumberOfJointActtermFees',
            valueGetter(params: any) {
              if (params?.data?.NumberOfJointActtermFees) {
                return params?.data?.NumberOfJointActtermFees.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
              return '';
            }
          }
        ],
      },
      {
        headerName: 'Fees',
        children: [
          {
            field: 'InstallationFeesDisplay',
            headerName: 'Installation Fee $',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 168,
            sortingField: 'InstallationFees'
          },
          {
            field: 'ActivationFeesDisplay',
            headerName: 'Activation Fee $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 161,
            sortingField: 'ActivationFees'
          },
          {
            field: 'ConstructionFeesDisplay',
            headerName: 'Construction Fee $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'ConstructionFees'
          },
          {
            field: 'OtherFeesDisplay',
            headerName: 'Other Fee $',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 133,
            sortingField: 'OtherFees'
          }
        ],
      }
    ];

  }


  ngOnInit(): void {
    // this.getAllContracts();
    this.getTemLists();
    this.getCustomerForUser();
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.hasSuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            let obj:any = {Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i};
            if(y.field == 'AnnualRevenueCommitmentAmountDisplay' || y.field == 'InventoryCommitmentAmountDisplay' || y.field == 'MonthlyRevenueCommitmentAmountDisplay' || y.field == 'OtherCreditAmountDisplay' || y.field == 'InventoryCommitmentAmountDisplay' || y.field == 'TerminationFeesDisplay' || y.field == 'ActivationCreditAmountDisplay' || y.field == 'SpendCreditAmountDisplay' || y.field == 'GuaranteedCreditAmountDisplay' || y.field == 'InstallationFeesDisplay' || y.field == 'ActivationFeesDisplay' || y.field == 'OtherFeesDisplay' || y.field == 'ConstructionFeesDisplay') {
              obj['isCurrency'] = true;
            }
            ChildHeaderData.push(obj)
          })
        }
      }
    });

    this.exportDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Contracts"
      },
      ExportToExcel: true
    };
    
    this.exportData = this.exportDetail;
  }

  getAllContracts() {
    this.onAgGridReady(this.gridApi);
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];
        const filterArrayNumber:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;
          let arrNumber;


          switch (key) {
            case 'AnnualRevenueCommitmentAmountDisplay':
              key = 'AnnualRevenueCommitmentAmount';
              break;

            // case 'NoticePeriodMonthsDisplay':
            //   key = 'NoticePeriodMonths';
            //   break;

            // case 'ReminderDaysAlarmMonthsDisplay':
            //   key = 'ReminderDaysAlarmMonths';
            //   break;

            case 'InventoryCommitmentAmountDisplay':
              key = 'InventoryCommitmentAmount';
              break;

            case 'MonthlyRevenueCommitmentAmountDisplay':
              key = 'MonthlyRevenueCommitmentAmount';
              break;

            case 'OtherCreditAmountDisplay':
              key = 'OtherCreditAmount';
              break;

            case 'TerminationFeesDisplay':
              key = 'TerminationFees';
              break;

            case 'ActivationCreditAmountDisplay':
              key = 'ActivationCreditAmount';
              break;

            case 'SpendCreditAmountDisplay':
              key = 'SpendCreditAmount';
              break;

            case 'GuaranteedCreditAmountDisplay':
              key = 'GuaranteedCreditAmount';
              break;

            case 'InstallationFeesDisplay':
              key = 'InstallationFees';
              break;

            case 'ActivationFeesDisplay':
              key = 'ActivationFees';
              break;

            case 'OtherFeesDisplay':
              key = 'OtherFees';
              break;

            case 'ConstructionFeesDisplay':
              key = 'ConstructionFees';
              break;

            case 'ContractMonthsRemainingDisplay':
              key = 'ContractMonthsRemaining';
              break;

            default:
              break;
          }

          if (key === 'ContractTermStartDate' || key === 'ContractTermEndDate') {
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
          } else if (key == 'AnnualRevenueCommitmentAmount' || key == 'ContractMonthsRemaining' || key == 'InventoryCommitmentAmount' || key == 'MonthlyRevenueCommitmentAmount' || key == 'OtherCreditAmount' || key == 'TerminationFees' || key == 'ServiceDiscount' || key == 'FeatureDiscount' || key == 'OtherDiscount' || key == 'EquipmentDiscount' || key == 'ActivationCreditAmount' || key == 'SpendCreditAmount' || key == 'GuaranteedCreditAmount' || key == 'NumberOfActivationFees' || key == 'NumberOfTerminationWaivers' || key == "NumberOfJointActtermFees" || key == 'InstallationFees' || key == 'ActivationFees' || key == 'ConstructionFees' || key == 'OtherFees') {
            arrNumber = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
              filterOptionValue1_2: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
            }
            filterArrayNumber.push(arrNumber);
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

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if (filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }

        if (this.selectedTem != 'all') {
          data['TemAccountId'] = parseInt(this.selectedTem);
        }

        if (this.selectedCustomer != 'all') {
          data['customerAccountId'] = parseInt(this.selectedCustomer);
        }
        
        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this.exportData = {...data, ...this.exportDetail }
        this._unsubscribeContractGrid.next(null);
        this.contractService.getAllContracts(data)
          .pipe(takeUntil(this._unsubscribeContractGrid))
          .subscribe((res: any) => {
            this.rowData = res.Data.$values;
            if (res && res.Data && res.Data.$values.length > 0) {
              let lastRow = -1;
              if (res.TotalCount <= paramsRequest.startRow + 100) {
                lastRow = res.TotalCount;
              }
              params.successCallback(
                res.Data.$values,
                lastRow
              );
            } else {
              params.successCallback([], 0 );
              this.gridApi.showNoRowsOverlay();
            }
          },
            (error) => {
              params.successCallback([], 0 );
              this.gridApi.showNoRowsOverlay();
            }
          );
      },
    };
    this.gridApi.setServerSideDatasource(dataSource);
  }

  onChangeTem(event: any, notSetAll = true) {
    if (event.target.value !== 'all') {
      this.loadingCustomerAPI = true;
      this.selectedTemDD = event.target.value;
      this._getCustomerUserDestroy.next(null);
      this.locationService.getCustomerDropdownByNewTEM(event.target.value).pipe(takeUntil(this._getCustomerUserDestroy)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.loadingCustomerAPI = false;
          this.customers = data.Data.$values;
          if (notSetAll) {
            this.selectedCustomer = 'all';
          }
        } else {
          this.loadingCustomerAPI = false;
        }
      }, error => {
        this.loadingCustomerAPI = false;
      });
    } else {
      this.getCustomerForUser();
      this.selectedCustomer = 'all';
    }
  }

  goToPage(to: any) {
    this.selectedButton = to.value;
    this.selectedTabOption = to.value;
    this.router.navigate([to.url]);
  }

  getTemLists() {
    this._getTemListsDestroy.next(null);
    this.locationService
      .getTemLists()
      .pipe(takeUntil(this._getTemListsDestroy))
      .subscribe(
        (response: any) => {
          if (response) {
            this.tems = this.filterdTems = response.$values;

            if (this.hasSuperTemUsers) {
              let id = sessionStorage.getItem("LoggedAccountId");
              const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
              this.tems.unshift(found);

              this.tems = this.tems.filter((object: any, index: number): boolean => {
                return object && this.tems.indexOf(object) === index;
              });
            }
          }
        },
        (error) => { }
      );
  }


  getCustomerForUser() {
    this._getCustomerUserDestroy.next(null);
    this.customers = [];
    this.locationService.getCustomerDropDown().pipe(takeUntil(this._getCustomerUserDestroy)).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
      }
    });
  }

  addNewContract(tabaction: any) {
    this.tabsMainArray.push({ tabType: tabaction, rowData: '', pageName: 'new' });
    this.selectedTab = this.tabsMainArray.length;
    this.variableManageService.mobilityWhichPageEnabled = 'New';
  }

  changeParentTab(event: any) {
    this.selectedTab = event;
    this.selectedChild = 0;
    if (event === 0) {
      this.opentabsFromInventory_Contract = false;
      this.opentabsFromInventory_Inventory = false;
      this.variableManageService.mobilityWhichPageEnabled = 'Table';
      // this.getAllContracts();
      setTimeout(() => {
        this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';
        this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
        this.onAgGridReady(this.gridApi);
      }, 100);
    }
    else {
      this.variableManageService.mobilityWhichPageEnabled = this.tabsMainArray[event - 1].tabType;
    }
  }

  closeAddAddmTab($event: any, tabIndex: any) {
    if ($event) {
      this.removeAddemTab(tabIndex)
    }
  }

  closeAddContractTab($event: any, i: any) {
    if ($event) {
      this.removeTab(i);
    }
  }

  onCellDoubleClickedEventInventory($event: any) {
    this.inventoryData = $event;
    this.isOpenWirelineTab = true;
    this.selectedChild = 2;
  }

  disableLinkDialog($event: any) {
    this.isDisablLinkInventory = $event;
  }

  fromInventoryLinkDialog($event: any){
    this.isSendVendorProductInventoryId = $event;
  }

  redirectTab(value: any) {
    this.inventoryData = value.rowData;
    this.selectedChild = value.redirectIndex;
    this.isOpenWirelineTab = false;
  }

  removeWirelineTab(i: any) {
    this.selectedChild = 1;
    if (i === 'wireline') {
      this.isOpenWirelineTab = false;
    }
    if (i === 'contract') {
      this.opentabsFromInventory_Contract = false;
    }

    if (i === 'inventory') {
      this.opentabsFromInventory_Inventory = false;
    }
  }

  onCellDoubleClicked(tabType = '', rowData: any) {
    this.childRecord = (rowData && rowData.data && rowData.data.ChildInventoryId) ? rowData.data.ChildInventoryId : null;
    this.selectedChild = 0;
    this.tabsMainArray.push(
      {
        tabAddemArray: [],
        parent: this.selectedTab,
        tabType: tabType,
        rowData: rowData,
        child: 0,
        parentServiceID: rowData?.node?.parent?.data?.ServiceNumber ? rowData?.node.parent.data.ServiceNumber : ''
      });
      this.variableManageService.mobilityWhichPageEnabled = 'Edit';
      setTimeout(() => {
        this.selectedTab = this.tabsMainArray.length;
    }, 6);

  }
  contractName(name: any, i: any) {
    this.tabsMainArray[i].rowData.data.DocumentName = name;
  }

  setCustomerDDValueEvent(data: any) {
    if (this.selectedTab > 0 && data != '') {
      this.selectedCustomer = data;

    } else if (data == '' && this.selectedTab <= 0) {
      this.selectedCustomer = 'all';
    }
  }

  setTemDDValueEvent(data: any, i: any) {
    if (this.selectedTab > 0 && data != '') {
      this.selectedTem = data;
    } else if (data == '' && this.selectedTab <= 0) {
      this.selectedTem = 'all';
    }
    if (this.selectedTem) {
      const data = {
        target: {
          value: this.selectedTem
        }
      }
      // this.onChangeTem(data, false)
    }
  }

  onContractAddEvent(data: any, i: any) {
    let rowData = {
      data: {
        ContractId: data.Data.Id,
        DocumentName: data.Data.Overview.DocumentName,
        DocumentType: data?.Data?.Overview?.DocumentType,
        VendorAccountId: data?.Data?.Overview?.VendorId,
        CustomerAccountId: data?.Data?.Overview?.CustomerId,
        CompanyId: data?.Data?.Overview?.CompanyId,
        
      }
    };
    this.tabsMainArray[i] =  {
      tabAddemArray: [],
      parent: this.selectedTab,
      tabType: 'Edit',
      rowData: rowData,
      child: 0,
    };
    this.variableManageService.mobilityWhichPageEnabled = 'Edit';
  }


  childrenChange(event: any) {
    this.selectedChild = event;
  }

  onMobilityAddEvent(event: any, index: any) {
    if (event) {
      this.onCellDoubleClicked('Edit', event)
    }
  }


  AddAdemdum() {
    this.tabsMainArray[this.selectedTab-1]['tabAddemArray'].push({tabType: 'NewAddm', rowData: '', pageName : 'new' })
    this.selectedChild = null;
    this.selectedAddedm = this.tabsMainArray[this.selectedTab-1]['tabAddemArray'].length;
  }

  removeAddemTab(tabIndex: any) {
    this.tabsMainArray[this.selectedTab-1]['tabAddemArray'].splice(tabIndex, 1);
    this.tabsMainArray[this.selectedTab-1]['tabAddemArray'] = _.cloneDeep(this.tabsMainArray[this.selectedTab-1]['tabAddemArray']);
    this.selectedAddedm = this.tabsMainArray[this.selectedTab-1]['tabAddemArray'].length;

    if (this.tabsMainArray[this.selectedTab-1]['tabAddemArray'].length === 0) {
      this.selectedChild = 0;
    }
  }

  clickToSelectedAdded(event: any) {
    this.selectedAddedm = event;
  }

  removeTab(tabIndex: any) {
    this.tabsMainArray.splice(tabIndex, 1);
    this.tabsMainArray = _.cloneDeep(this.tabsMainArray);

    if (this.tabsMainArray.length === 0) {
      this.variableManageService.mobilityWhichPageEnabled = 'Table';
      setTimeout(() => {
        this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';
        this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
      }, 100);
      // this.getAllContracts();
      this.onAgGridReady(this.gridApi);
    }
    this.selectedTab = this.tabsMainArray.length;
    this.changeParentTab(tabIndex);

  }

  onLoadContractInventory($event: any) {
    this.sendDataToLinkPopup = $event;
  }

  onLoadEditContract($event: any) {
    this.editContractData = $event;
  }

  onLoadEditContractFromInventory($event: any, setUpdatedDetail = false, i: any) {
    this.editContractDataFromLinkedInventory = $event;
    if (setUpdatedDetail) {
      this.tabsMainArray[i].rowData.data.VendorAccountId = $event?.Overview?.VendorId;
      this.tabsMainArray[i].rowData.data.CustomerAccountId = $event?.Overview?.CustomerId;
      this.tabsMainArray[i].rowData.data.CompanyId = $event?.Overview?.CompanyId;    
    }
  }

  onDisablePlusButton($event: any) {
    this.disablePlusOptions = $event;
  }

  ngOnDestroy(): any {
    this.variableManageService.mobilityWhichPageEnabled = 'Table';
    this._getTemListsDestroy.next(null);
    this._getTemListsDestroy.complete();
    this._unsubscribeContractGrid.next(null);
    this._unsubscribeContractGrid.complete();
    this._getCustomerUserDestroy.next(null);
    this._getCustomerUserDestroy.complete();
    this.variableManageService.setCallAPIInventoryData('false');
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.contractMainTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

  onContractDetail(data: any) {
    this.editDetailsData = data;
  }
  ReplaceContract() {
    const dialogRef = this.dialog.open(ReplaceContractDialogComponent, {
      width: '1100px',
      data: {
        colseButton: true,
        data: this.editContractData,
        rowDetailData : this.editDetailsData
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (checkIsValueExists(result)) {
        this.editContractComponent.ngOnInit();
         this.locationService.setReplacedData(result);
      }
    });
  }

  LinkInventoryCDialog(from?: any) {
    const dialogRef = this.dialog.open(LinkInventoryCDialogComponent, {
      width: '1200px',
      data: {
        colseButton: true,
        data: this.sendDataToLinkPopup,
        whichPage: from,
        isSendVendorProductInventoryId: this.isSendVendorProductInventoryId
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.ContractId) {
        this.linkedData = result;
        this.selectedChild = 3;
        this.opentabsFromInventory_Contract = true;
        this.opentabsFromInventory_Inventory = true;
      }
      if (checkIsValueExists(result)) {
        this.variableManageService.setCallAPIInventoryData('true');
      }
    });
  }

  contractExport() {
    this.isDisabledExport = true;
    this.exportData['parentRecordIds'] = [];
    this.exportData['childRecordIDs'] = [];
    this.contractService.getAllContractsExport(this.exportData).subscribe({
      next: data => {
        this.isDisabledExport = false;
        let bolbUrl = URL.createObjectURL(data);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", `Contracts.xlsx`);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: error => {
        this.isDisabledExport = false;
      }
    })
  }

}
