import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { MakeChildPopupComponent } from './make-child-popup/make-child-popup.component';
import { LinkLocationDialogComponent } from './link-location-dialog/link-location-dialog.component';
import { ReviewServicePopupComponent } from './review-service-popup/review-service-popup.component';
import { LinkAssociatedInventoryComponent } from './link-associated-inventory/link-associated-inventory.component';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { ManageService } from 'src/app/services/manage.service';
import { checkIsValueExists, isValueExist, isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { LinkPeopleDialogComponent } from '../link-people-dialog/link-people-dialog.component';
import { AddEditChildInventoryComponent } from '../add-edit-child-inventory/add-edit-child-inventory.component';
import { AddServiceTypeComponent } from '../add-service-type/add-service-type.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-add-wireline',
  templateUrl: './add-wireline.component.html',
  styleUrls: ['./add-wireline.component.scss'],
  imports: [
    SharedModule,
    PrimgModule
  ],
  providers: [CustomPipe, DatePipe, LocationService, WirelineService, VariableManageService, ManageService]
})
export class AddWirelineComponent implements OnInit, OnDestroy {

  inventoryForm: FormGroup;
  submitted: boolean = false;
  isSuperTEMRole: boolean = false;
  tems: any = [];
  loadingTems: any = false;
  customerList: any = [];
  loadingCustomerList: any = false;
  MainBillingAccountDD: any = [];
  mainBillingAccDD: any = false;
  varPayableAccount = null;
  vendorsList: any = [];
  loadingVendorsList: any = [];
  inventoryStatusList: any = [];
  loadingInventorySts: any = [];
  inventoryOriginList: any = [];
  vendorProductDetails: any = [];
  loadingVendorProductDetails: any = false;
  subBillingAccountDD: any = [];
  loadingsubBillAccDD: any = false;
  isDisabled: boolean = false;
  isPageAccess: boolean = false;
  serviceTypeAttributeDescriptions: any;
  locationIds: any;
  primaryLocationId: any;
  primaryPeopleId: any;
  loadingSetPrimary1 = false;
  isLoadingAttribute: boolean = true;
  maxRows = 100;
  disableCompany: boolean = false;
  isIvoiceCycleRequired: boolean = false;
  isUpdateStatusInChildInventory: boolean = false;
  peopleIds: any = [];
  isExistPrimaryPeople = false;
  isExistPrimaryLocation = false;

  serviceData: any;
  rowStartEndIndex = {
    startRowIndex: 1,
    maximumRows: this.maxRows
  }
  previousSearchAtr: any = {};

  @Input() action: String;
  @Input() rowData: any;
  @Input() addData: String;
  @Input() selectedTem: any;
  @Input() currentIndexPage: any;
  @Input() buttonAction: String;
  @Input() selectedButton: any;
  @Input() isInventoryPage: any;
  @Input() selectedCustomer: any;
  @Input() isClickedEdit: any;
  @Input() clickOnSearchButton: any;
  @Input() selectedTemDD: any;
  @Input() fromTab: any;


  private _unsubscribeAll: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeService: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeCustomer: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeAllCustomerVendor: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeVendor: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeInventoryStatus: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeInventoryStatusCode: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeAttribute: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeInventory: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeInventoryAttribute: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeLocation: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeInventoryOrigins: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeInventoryOriginsName: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeGetServiceDetail: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeGetServiceTypes: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeGetProductsForVendor: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeGetProductTypes: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeVendorProductTypesDetails: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeGetServiceProduct: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeCompany: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeChildInventory: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeSaveChildInventory: Subject<any | null> = new Subject<any | null>();
  private _unsubscribePeople: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeChildData: Subject<any | null> = new Subject<any | null>();

  subAccountNumberRequired = false;
  disconnectionDateReq = false;

  gridApi: any;
  gridApiChild: any;
  gridColumnApi: any;

  gridApiAttribute: any;
  gridApiAttributeSaveEvent: any;
  gridColumnApiAttribute: any;
  gridChildColumnApi: any;
  public attributeTotal: number;
  loadingAttribute = false;
  loadingVendorproducttypes = false;
  Vendorproducttypes: any = [];
  previousSortAtr = '';
  previousStateAtr = '';
  setTemDDValue: any;
  setMindate: any;

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
  };
  serviceIds: any = [];
  days: any = [];


  @ViewChild('IIconTooltip') IIconTooltip!: TemplateRef<any>;
  @ViewChild('IIconTooltipPeople') IIconTooltipPeople!: TemplateRef<any>;

  @Output() onWirelineAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() addWirelineFromData: EventEmitter<any> = new EventEmitter<any>();
  @Output() onWirelineEditEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onInventoryDataFetch: EventEmitter<any> = new EventEmitter<any>();
  @Output() onEditedInventory: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSaveSendDataParent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setCustomerDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setClickFalse: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDestroyOutput: EventEmitter<any> = new EventEmitter<any>();
  @Output() wirelinePageName: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() isSetAction: EventEmitter<any> = new EventEmitter<any>();

  dataFromEditApi: any;

  dataFromSavedApi: any;

  loadingDataFromEditApi = false;
  VendorAccountLogo = '';
  statusFieldDisabled = false;
  companyLocations: any;
  companyPeoples: any;

  confirmed: any = [];
  confirmed2: any = [];

  inventoryTableTotal: any = 0;

  defaultRowNStartIndex = {
    startRowIndex: 1,
    maximumRows: this.maxRows
  }

  previousSort = '';
  previousState = '';
  previousSearch = {};

  constructor(public dialog: MatDialog, private fb: FormBuilder, private locationService: LocationService,
    private wirelineService: WirelineService, public variableManageService: VariableManageService,
    private router: Router,
    private manageService: ManageService) { }
  public defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  colsAttribute = [
    { field: 'ServiceType', header: 'Service Type', width: '260px', spinner: true },
    { field: 'AttributeName', header: 'Attribute', width: '210px', spinner: true },
    { field: 'AttributeDescription', header: 'Attribute Value', width: '210px', spinner: true },
  ];

  public locationRowData: any = [];
  public rowDataServiceTypeAttr: any = [];

  public services: any = [];
  public loadingServices: any = [];
  public serviceTypes: any = [];
  public loadingServiceTypes: any = false;
  public products: any = [];
  public loadingProducts: any = false;
  public productTypes: any = [];
  public loadingProductTypes = false;
  public inventoryOriginsList: any = [];
  public companyList: any = [];
  public childInventoryData: any = [];
  public loadingCompanyList: any = false;
  public loadingInventoryOrigins: any = false;
  public saveButtonLoadder: Boolean = false;
  public saveAddButtonLoader: Boolean = false;
  public loadingSetPromary = false;
  public typeOfService = [
    { Id: 'Parent', lable: 'Parent' },
    { Id: 'Individual', lable: 'Individual' },
    { Id: 'Child', lable: 'Child' },
  ];
  typeService = '';
  isChildRecord = false;
  emptymessage = "Loading...";
  emptymessageAtr = "Loading...";
  temRoles = false;
  productStructureDetailId = '';
  public columnDefs: any = [
    {
      headerName: 'Location',
      field: 'LocationName',
      filter: 'agTextColumnFilter',
      editable: false,
      sortingField: 'LocationName'
    },
    {
      headerName: 'Address ',
      field: 'Address1',
      filter: 'agTextColumnFilter',
      editable: false,
      sortingField: 'Address1'
    },
    {
      headerName: 'Type',
      field: 'LocationTypeDisplayName',
      filter: 'agTextColumnFilter',
      editable: false,
      sortingField: 'LocationTypeDisplayName'
    }
  ];
  loadingAssInventory = false;
  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  public serviceAttributeColumn: any = [
    {
      headerName: 'Service Type',
      field: 'ServiceType',
      filter: 'agTextColumnFilter',
      minWidth: 200,
      editable: false,
      sortingField: 'ServiceType'
    },
    {
      headerName: 'Attribute',
      field: 'AttributeName',
      filter: 'agTextColumnFilter',
      minWidth: 180,
      editable: false,
      sortingField: 'AttributeName'
    },
    {
      headerName: 'Attribute Value',
      field: 'AttributeDescription',
      filter: 'agTextColumnFilter',
      minWidth: 180,
      editable: false,
      sortingField: 'AttributeDescription'
    }
  ];
  rowSelection = 'multiple';

  public associatedInventoryColumn: any = [
    {
      headerName: 'Service Number',
      field: 'ServiceNumber',
      filter: 'agTextColumnFilter',
      minWidth: 200,
      editable: false,
      sortingField: 'ServiceNumber'
    },
    {
      headerName: 'Service Type',
      field: 'ServiceType',
      filter: 'agTextColumnFilter',
      minWidth: 180,
      editable: false,
      sortingField: 'ServiceType'
    },
    {
      headerName: 'Product',
      field: 'Product',
      filter: 'agTextColumnFilter',
      minWidth: 180,
      editable: false,
      sortingField: 'Product'
    },
    {
      headerName: 'Status',
      field: 'InventoryStatusDisplayText',
      filter: 'agTextColumnFilter',
      minWidth: 180,
      editable: false,
      sortingField: 'InventoryStatusDisplayText'
    }
  ];

  cols = [
    { field: 'ServiceNumber', header: 'Service Number', width: '210px', spinner: true },
    { field: 'ServiceType', header: 'Service Type', width: '185px', spinner: true },
    { field: 'Product', header: 'Product', width: '150px', spinner: true },
    { field: 'InventoryStatusDisplayText', header: 'Status', width: '150px', spinner: true }
  ];

  isUpdateToAccountDetail: any = false;
  onlyCustomerChange = 0;
  ngOnInit() {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    for (let i = 1; i <= 3; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }

    this.wirelinePageName.emit('DetailTab');
    this.setInventoryForm();

    if (this.rowData) {
      // this.setCustomerDDValueEvent.emit(this.rowData.CustomerAccountId)
    }

    this.getServices();
    if (this.action === 'Edit' || this.action == 'location' || this.action == 'people') {
      if (this.rowData && this.rowData['ChildInventoryId'] == null) {
        this.getServiceDetailFn();
      } else {
        this.isChildRecord = true;
        this.filterCustomerGridByTEMId();
        this.getChildInventoryDetail();
      }
      this.getLocationByCustomer();
      this.getPeopleByCustomer();

    } else {
      this.filterCustomerGridByTEMId();
      this.form.patchValue(this.addData);

      if (this.f['service'].value) {
        this.getServiceTypes();
      }

      if (this.f['serviceType'].value) {
        this.getProducts();
      }

      if (this.f['product'].value) {
        this.getProductTypes();
      }
      if (this.f['VendorId'].value) {
        this.getVendorProductType();
      }
      this.getMainBillingAccountDD();
      if (this.f['customerId'].value) {
        this.getCompany();
      }
      this.f['vendorProductTypeId'].enable();
      this.inventoryForm.get('vendorProductTypeId')?.setValidators([Validators.required]);
      this.inventoryForm.get('vendorProductTypeId')?.updateValueAndValidity();
    }
    this.isSuperTEMRole = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.isPageAccess = rolePermission(['CompanyUser', 'TEMUser']);
    // this.getTemLists();
    this.getVendorList();
    this.getInventorystatuses();
    this.getInventoryorigins();

    if (this.isPageAccess) {
      this.inventoryForm.disable();
    }
  }

  getLocationByCustomer() {
    let data: any = {};
    if (this.selectedTem && this.selectedTem[this.currentIndexPage] !== 'all') {
      data['TemAccountId'] = parseInt(this.selectedTem[this.currentIndexPage]);
    }
    if (this.rowData) {
      if (this.rowData['CustomerAccountId'] && this.f['customerId'].value) {
        data['CustomerAccountId'] = this.rowData['CustomerAccountId'] !== this.f['customerId'].value ? this.f['customerId'].value : this.rowData['CustomerAccountId'];
      } else {
        data['CustomerAccountId'] = this.rowData['CustomerAccountId']
      }

      this._unsubscribeLocation.next(null);
      this.wirelineService
        .getInventoryLocations(data, this.rowData['VendorProductInventoryId'])
        .pipe(takeUntil(this._unsubscribeLocation))
        .subscribe((data) => {
          if (data && data.Data.$values) {
            this.companyLocations = data.Data.$values;
            if (data.Data.$values.length > 0) {
              let index = this.companyLocations.findIndex((item: any) => item.PrimaryLocation == true);
              this.companyLocations.unshift(this.companyLocations.splice(index, 1)[0]);
              const record = this.companyLocations.find((a: any, index: any) => a.PrimaryLocation);
              this.primaryLocationId = record?.LocationId;
              if (record) {
                this.disableCompany = true;
              } else {
                this.disableCompany = false;
              }
              this.isExistPrimaryLocation = record ? true : false;
              if (record)
                this.setValueInFormControl('companyId', record?.CompanyId);
            }
          }
        });
    } else {
      this.companyLocations = [];
      this.primaryLocationId = null;
      this.locationIds = null;
    }
  }

  getPeopleByCustomer() {

    let data: any = {};
    if (this.selectedTem && this.selectedTem[this.currentIndexPage] !== 'all') {
      data['TemAccountId'] = parseInt(this.selectedTem[this.currentIndexPage]);
    }
    if (this.rowData) {
      if (this.rowData['CustomerAccountId'] && this.f['customerId'].value) {
        data['CustomerAccountId'] = this.rowData['CustomerAccountId'] !== this.f['customerId'].value ? this.f['customerId'].value : this.rowData['CustomerAccountId'];
      } else {
        data['CustomerAccountId'] = this.rowData['CustomerAccountId']
      }

      this._unsubscribePeople.next(null);
      this.wirelineService
        .getInventoryContacts(data, this.rowData['VendorProductInventoryId'])
        .pipe(takeUntil(this._unsubscribePeople))
        .subscribe((data) => {
          if (data && data.Data.$values) {
            this.companyPeoples = data.Data.$values;

            const record = this.companyPeoples.find((a: any, index: any) => a.PrimaryPeople);
            this.primaryPeopleId = record?.PeopleId;
            if (record) {
              this.disableCompany = true;
            } else {
              this.disableCompany = false;
            }
            this.isExistPrimaryPeople = record ? true : false;
            if (record)
              this.setValueInFormControl('companyId', record?.CompanyId);
          }
        });
    } else {
      this.companyPeoples = [];
      this.primaryPeopleId = null;
      this.peopleIds = null;
    }
  }
  onPListboxChange(value: any) {

    if (this.companyLocations.length === 1) {
      this.confirmed = value;
    } else if (this.companyLocations.length === value.length) {
      this.confirmed = this.companyLocations.filter((a: any) => a.PrimaryLocation);
    } else {
      if (value.length > 1) {
        value = [value[value.length - 1]];
        this.confirmed = value;
      }
    }
  }
  onPListboxChange2(value: any) {
    if (this.companyPeoples.length === 1) {
      this.confirmed2 = value;
    } else if (this.companyPeoples.length === value.length) {
      this.confirmed2 = this.companyPeoples.filter((a: any) => a.PrimaryPeople);
    } else {
      if (value.length > 1) {
        value = [value[value.length - 1]];
        this.confirmed2 = value;
      }
    }
  }
  changeStatus(event: any) {
    const selectedVal = this.findStatusNameById(event.value);
    let childInvlist;
    if (this.dataFromEditApi.HasParent) {
      this._unsubscribeChildData.next(null);
      this.wirelineService.getChildinventoriesData(this.dataFromEditApi.VendorProductInventoryId).pipe(takeUntil(this._unsubscribeChildData)).subscribe((res: any) => {
        childInvlist = res.Data.$values;
        if (selectedVal == 'Deleted' && (this.dataFromEditApi && this.dataFromEditApi.HasParent)) {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            okBtnName: 'Proceed',
            closeBtnName: 'Cancel',
            message: 'This change to delete will apply to any assigned child <br> inventory items. Would you like to proceed?',
            innerHtml: true
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe((result) => {
            if (result == false || result == 'undefined') {
              this.setValueInFormControl('statusId', this.dataFromEditApi.Status);
            } else {
              this.isUpdateStatusInChildInventory = true;
            }
          })
        } else if (selectedVal == 'Disconnected' && (this.dataFromEditApi && this.dataFromEditApi.HasParent) && childInvlist.length > 0) {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            okBtnName: 'Close & Review',
            closeBtnName: 'Please Disconnect the Children!',
            message: 'This inventory item is a parent. Its associated child inventory are currently connected. Would you like to disconnect them as well?',
            innerHtml: true,
            list: childInvlist,
            fromTab: 'uploadfile'
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe((result) => {
            if (result == false || result == 'undefined') {
              this.isUpdateStatusInChildInventory = true;
            } else {
              this.setValueInFormControl('statusId', this.dataFromEditApi.Status);
            }
          })
        }
      });

    }

    if (this.action === 'Edit') {
      this.isIvoiceCycleRequired = false;
      if (selectedVal == 'Disconnected') { // || selectedVal == 70 || selectedVal == 80
        this.isIvoiceCycleRequired = true;
        this.disconnectionDateReq = true;
        this.inventoryForm.get('EndDate')?.setValidators([Validators.required]);
        this.form.get('EndDate')?.updateValueAndValidity();
      } else {
        this.disconnectionDateReq = false;
        this.inventoryForm.get('EndDate')?.setValidators([]);
        this.form.get('EndDate')?.updateValueAndValidity();
        this.inventoryForm.get('EndDate')?.setValue('');
      }
    }
  }

  getCompany() {
    if (this.f['customerId'].value) {
      this.loadingCompanyList = true;
      this.companyList = [];
      this._unsubscribeCompany.next(null);
      this.locationService.getCompanyByCustomerIdNew(this.f['customerId'].value).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data) => {
        if (data.Success) {
          this.companyList = data.Data.$values;
          this.loadingCompanyList = false;
        } else {
          this.loadingCompanyList = false;
          this.companyList = [];
        }
      }, error => {
        this.loadingCompanyList = false;
        this.companyList = [];
      });

      this.getLocationByCustomer();
      this.getPeopleByCustomer();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['buttonAction'] && (changes['buttonAction'].currentValue !== '' && changes['buttonAction']['currentValue'] == 'make-child')) {
      this.makeChildPopup();
    } else if (changes && changes['buttonAction'] && changes['buttonAction']['currentValue'] == 'add-child-inventory') {
      this.addChildInventory();
    }

    if (changes && changes['selectedTemDD'] && changes['selectedTemDD']['currentValue'] && changes['selectedTemDD']['currentValue'] !== changes['selectedTemDD']['previousValue']) {
      this.getCustomerFromParent(this.selectedTemDD);
    }
    if (this.clickOnSearchButton && changes && changes['clickOnSearchButton'] && changes['clickOnSearchButton']['currentValue']) {

      this.clickOnSearchButton = false;

      if (this.selectedCustomer !== 'all') {
        this.selectedCustomer = this.selectedCustomer;
        this.setValueInFormControl('customerId', this.selectedCustomer);
        let data = {
          value: this.selectedCustomer
        };
        this.setClickFalse.emit(false);
        this.onCustomerSelect(data);

        this.getMainBillingAccountDD();
        this.getCompany()
      }

    }
  }

  getCustomerFromParent(id: any) {


    this.customerList = [];
    this.loadingCustomerList = true;
    if (id && id !== 'all') {
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropdownByNewTEM(id)
        .pipe(takeUntil(this._unsubscribeCustomer))
        .subscribe({
          next: (data) => {
            if (data && data.Data.$values) {
              this.customerList = data.Data.$values;
              // this.setValueInFormControl('customerId', '');
              this.loadingCustomerList = false;
            } else {
              this.customerList = [];
              this.loadingCustomerList = false;
            }
          },
          error: (error) => {
            this.customerList = [];
            this.loadingCustomerList = false;
          },
        });
    }
  }

  getServices() {

    this.loadingServices = true;
    this._unsubscribeService.next(null);
    let data = {
      "industryId": null,
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null,
      "serviceIds": this.serviceIds
    }
    this.locationService.getServicesList(data).pipe(takeUntil(this._unsubscribeService)).subscribe((data) => {
      if (data.Success) {
        this.services = data.Data.$values;
        this.loadingServices = false;
        // let removeWireless = _.findIndex(this.services, (x: any) => x.Name == "Wireless");
        // if (removeWireless >= 0) {
        //   this.services.splice(removeWireless, 1);
        // }
        // let removeMobile = _.findIndex(this.services, (x: any) => x.Name == "Mobility");
        // if (removeMobile >= 0) {
        //   this.services.splice(removeMobile, 1);
        // }
        this.serviceIds = _.map(this.services, (obj: any) => obj.Id);
      } else {
        this.loadingServices = false;
      }
    }, error => {
      this.loadingServices = false;
      this.services = [];
    });
  }

  getServiceTypes(clickFromHTML = false) {
    if (!this.f['service'].value) {
      return;
    }
    this.serviceTypes = [];
    this.products = [];
    this.productTypes = [];
    if (clickFromHTML) {
      this.setValueInFormControl('serviceType', '')
      this.setValueInFormControl('product', '')
      this.setValueInFormControl('productType', '')
      this.setValueInFormControl('vendorProductTypeId', '')
    }

    this.loadingServiceTypes = true;
    this._unsubscribeGetServiceTypes.next(null);

    let data = {
      "industryId": null,
      "serviceId": this.f['service'].value,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null,
      // "serviceIds": this.serviceIds
    }
    this.locationService.getServiceTypeList(data).pipe(takeUntil(this._unsubscribeGetServiceTypes)).subscribe((data) => {
      if (data.Success) {
        this.serviceTypes = data.Data.$values;
        this.loadingServiceTypes = false;
      } else {
        this.loadingServiceTypes = false;
        this.serviceTypes = [];
      }
    }, error => {
      this.serviceTypes = [];
      this.loadingServiceTypes = false;
    });
  }

  getProducts(clickFromHTML = false) {

    if (!this.f['serviceType'].value) {
      return;
    }
    this.products = [];
    this.productTypes = [];

    if (clickFromHTML) {
      this.setValueInFormControl('product', '');
      this.setValueInFormControl('productType', '');
      this.setValueInFormControl('vendorProductTypeId', '')
    }

    this.loadingProducts = true;
    this._unsubscribeGetProductsForVendor.next(null);

    let data = {
      "industryId": null,
      "serviceId": this.f['service'].value,
      "serviceTypeId": this.f['serviceType'].value,
      "productId": null,
      "productTypeId": null,
      // "serviceIds": this.serviceIds
    }
    this.locationService.getProductList(data).pipe(takeUntil(this._unsubscribeGetProductsForVendor)).subscribe((data) => {
      if (data.Success) {
        this.products = data.Data.$values;
        this.loadingProducts = false;
      } else {
        this.products = [];
        this.loadingProducts = false;
      }
    }, error => {
      this.products = [];
      this.loadingProducts = false;
    });
  }

  getVendorProductType1(clickFromHTML = false) {
    if (!this.f['serviceType'].value && !this.f['service'].value && !this.f['product'].value && !this.f['productType'].value) {
      return;
    }

    const pageMappings = ['wireline', 'mobility', 'cloud'];
    const pagename = pageMappings.find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    ) || null;
    let data = {
      "serviceId": this.f['service'].value,
      "serviceTypeId": this.f['serviceType'].value,
      "productId": this.f['product'].value,
      "productTypeId": this.f['productType'].value,
      "IndustryId": null,
      "vendorAccountId": this.f['VendorId'].value,
      // inventoryType: pagename
    }
    this._unsubscribeVendorProductTypesDetails.next(null);
    this.locationService.getVendorProductTypeList(data).pipe(takeUntil(this._unsubscribeVendorProductTypesDetails)).subscribe((data: any) => {
      if (data.Success) {
        this.vendorProductDetails = data.Data.$values;
      } else {
        this.vendorProductDetails = [];
        if (this.action !== 'New') {
          data.Message = 'The selected Vendor Product is no longer active, only active Vendor Products can be saved to inventory not in an end state.  Please select an active Vendor Product';
          this.ErrorWarningPopupOpen(data.Message)
        }
        this.setValueInFormControl('vendorProductTypeId', '')
      }
    }, error => {
      this.vendorProductDetails = [];
      this.ErrorWarningPopupOpen(error.Message)
    });
  }

  getVendorProductType(clickFromHTML = false) {
    if (!this.f['productType'].value && this.f['VendorId'].value) {
      this.vendorProductDetailsFn();
    } else {
      if (clickFromHTML) {
        this.setValueInFormControl('vendorProductTypeId', null)
      }

    }
  }

  vendorProductDetailsFn() {
    const pageMappings = ['wireline', 'mobility', 'cloud'];
    const pagename = pageMappings.find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    ) || null;
    let id: any = this.f['VendorId'].value;
    if (id) {
      this.loadingVendorProductDetails = true;
      let data = {
        "serviceId": null,
        "serviceTypeId": null,
        "productId": null,
        "productTypeId": null,
        "IndustryId": null,
        "vendorAccountId": id,
        // inventoryType: pagename
      }
      this._unsubscribeVendorProductTypesDetails.next(null);
      this.locationService.getVendorProductTypeList(data).pipe(takeUntil(this._unsubscribeVendorProductTypesDetails)).subscribe((data: any) => {
        if (data.Success) {
          this.vendorProductDetails = data.Data.$values;
          this.loadingVendorproducttypes = false;
        } else {
          this.vendorProductDetails = [];
          this.loadingVendorproducttypes = false;
          if (this.action !== 'New') {
            this.ErrorWarningPopupOpen(data.Message)
          }
          this.setValueInFormControl('vendorProductTypeId', '')
        }
      }, error => {
        this.vendorProductDetails = [];
        this.loadingVendorproducttypes = false;
        this.ErrorWarningPopupOpen(error.Message)
      });
    }
  }

  getProductTypes(clickFromHTML = false) {
    if (!this.f['product'].value) {
      return
    }

    if (clickFromHTML) {
      this.setValueInFormControl('productType', null);
      this.setValueInFormControl('vendorProductTypeId', null)
    }
    this.productTypes = [];
    this.loadingProductTypes = true;
    this._unsubscribeGetProductTypes.next(null);

    let data = {
      "industryId": null,
      "serviceId": this.f['service'].value,
      "serviceTypeId": this.f['serviceType'].value,
      "productId": this.f['product'].value,
      "productTypeId": null,
      // "serviceIds": this.serviceIds
    }
    this.locationService.getProductTypeList(data).pipe(takeUntil(this._unsubscribeGetProductTypes)).subscribe((data) => {
      if (data.Success) {
        this.loadingProductTypes = false;
        this.productTypes = data.Data.$values;
      } else {
        this.productTypes = [];
        this.loadingProductTypes = false;
      }
    }, error => {
      this.productTypes = [];
      this.loadingProductTypes = false;
    });
  }


  getServiceDetailFn() {
    this._unsubscribeGetServiceDetail.next(null);
    this.loadingDataFromEditApi = true;
    this.onInventoryDataFetch.emit(true);
    this.wirelineService.getServiceDetail(this.rowData['VendorProductInventoryId'])
      .pipe(takeUntil(this._unsubscribeGetServiceDetail),
        tap(user => {
          if (user?.Success) {
            this.getInventorystatuses();
          }
          // return of(user);
        }),
        catchError(err => {
          return of(null);  // Return a fallback value so the stream completes
        }),
        finalize(() => {
        }))
      .subscribe((data) => {
        if (data && data.Data) {
          this.serviceDetailSet(data);
        } else {
          this.loadingDataFromEditApi = false;
          this.onInventoryDataFetch.emit(false);
        }
      }, error => {
        this.loadingDataFromEditApi = false;
        this.onInventoryDataFetch.emit(false);
      });
  }


  openPrimaryLOCPopup() {
    if (this.isExistPrimaryPeople) {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: 'This inventory item already has a Primary assignment. Continuing with this action will change the Primary assignment.',
        okBtnName: 'Close & Review',
        closeBtnName: 'Change the Assignment!',
        removeLink: true
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res == false) {
          this.companyPeoples = _.map(this.companyPeoples, (x: any) => {
            const a = x;
            a.PrimaryPeople = false
            return a;
          });
          // this.primaryPeopleId = null;
          this.isExistPrimaryPeople = false;
          this.setPrimaryLocation(true);
        }
      })
      return
    }
    else {
      this.setPrimaryLocation();
    }

  }

  setPrimaryLocation(isSetPrimary = false) {

    if (((this.rowData && this.rowData['CustomerAccountId']) !== this.f['customerId'].value) || (!this.rowData)) {
      this.companyLocations = this.companyLocations.map((r: any) => {
        let a: any = {};
        a = r;
        a['PrimaryLocation'] = this.confirmed[0].LocationId == r.LocationId ? true : null
        this.setValueInFormControl('companyId', r?.CompanyId);
        this.disableCompany = true;
        return a;
      });

      this.primaryLocationId = this.confirmed[0]?.LocationId;
      this.isExistPrimaryLocation = this.primaryLocationId ? true : false;
      if (this.isExistPrimaryLocation) {
        this.primaryPeopleId = null;
      }
      this.disableCompany = true;
      this.confirmed = [];

    } else {
      this.loadingSetPromary = true;

      let data: any = {}
      let locationIds: any = [];
      this.companyLocations.forEach((element: any) => {
        locationIds.push(element.LocationId)
      });
      data['locationIds'] = locationIds;
      data['inventoryId'] = this.rowData['InventoryId']
      data['primaryLocationId'] = this.confirmed[0].LocationId;
      data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
      if (isSetPrimary) {
        data['primaryContactId'] = this.primaryPeopleId;
      }
      this.wirelineService.inventorylocationsAssign(data)
        .subscribe((data) => {
          this.loadingSetPromary = false;
          if (data.Success) {
            this.setValueInFormControl('companyId', this.confirmed[0]?.CompanyId)
            this.disableCompany = true;

            this.getLocationByCustomer();
            this.confirmed = [];
            let errorData: any = {
              messgeType: 'error',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-exclamation-circle',
              iconClass: 'text-c-blue f-70',
              message: data.Message,
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
          }
        }, error => {
          this.loadingSetPromary = false;
          this.disableCompany = false;
        });
    }
  }

  setPrimaryPeople(isSetPrimary = false) {
    if (((this.rowData && this.rowData['CustomerAccountId']) !== this.f['customerId'].value) || (!this.rowData)) {

      this.companyPeoples = this.companyPeoples.map((r: any) => {
        let a: any = {};
        a = r;
        a['PrimaryPeople'] = this.confirmed2[0].PeopleId == r.PeopleId ? true : null
        this.setValueInFormControl('companyId', r?.PeopleId);
        this.disableCompany = true;
        return a;
      });
      this.primaryPeopleId = this.confirmed2[0]?.PeopleId;
      this.isExistPrimaryPeople = this.primaryPeopleId ? true : false;
      if (this.isExistPrimaryPeople) {
        this.primaryLocationId = null;
      }
      this.disableCompany = true;
      this.confirmed2 = [];

    } else {
      this.loadingSetPrimary1 = true;

      let data: any = {}
      let contactIds: any = [];
      this.companyPeoples.forEach((element: any) => {
        contactIds.push(element.PeopleId)
      });
      data['contactIds'] = contactIds;
      data['inventoryId'] = this.rowData['InventoryId']
      data['primaryContactId'] = this.confirmed2[0].PeopleId;
      data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
      if (isSetPrimary) {
        data['primaryLocationId'] = this.primaryLocationId;
      }

      this.wirelineService.inventorycontactsAssign(data)
        .subscribe((data) => {
          this.loadingSetPrimary1 = false;
          if (data.Success) {
            // this.setValueInFormControl('companyId', this.confirmed[0]?.CompanyId)
            this.disableCompany = true;

            this.getPeopleByCustomer();
            this.confirmed2 = [];
            let errorData: any = {
              messgeType: 'error',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-exclamation-circle',
              iconClass: 'text-c-blue f-70',
              message: data.Message,
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
          }
        }, error => {
          this.loadingSetPrimary1 = false;
          this.disableCompany = false;
        });
    }
  }

  openPrimaryPeoplePopup() {

    if (this.isExistPrimaryLocation) {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: 'This inventory item already has a Primary assignment. Continuing with this action will change the Primary assignment.',
        okBtnName: 'Close & Review',
        closeBtnName: 'Change the Assignment!',
        removeLink: true
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res == false) {
          this.companyLocations = _.map(this.companyLocations, (x: any) => {
            const a = x;
            a.PrimaryLocation = false
            return a;
          });
          // this.primaryLocationId = null;
          this.isExistPrimaryLocation = false;
          this.setPrimaryPeople(true);
        }
      })
      return
    } else {
      this.setPrimaryPeople();
    }
  }

  getChildInventoryDetail() {

    if (this.rowData && this.rowData['ChildInventoryId']) {
      this.loadingDataFromEditApi = true;
      this.onInventoryDataFetch.emit(true);
      this._unsubscribeGetServiceDetail.next(null);
      this.wirelineService.getChildinventoriesDetails(this.rowData['ChildInventoryId']).pipe(takeUntil(this._unsubscribeGetServiceDetail))
        .subscribe((data) => {
          if (data && data.Data) {
            this.serviceDetailSet(data);
          } else {
            this.loadingDataFromEditApi = false;
            this.onInventoryDataFetch.emit(false);
          }
        }, error => {
          this.loadingDataFromEditApi = false;
          this.onInventoryDataFetch.emit(false);
        });
    }
  }

  clearServiceAndOther() {
    this.setValueInFormControl('service', '');
    this.setValueInFormControl('serviceType', '');
    this.setValueInFormControl('product', '');
    this.setValueInFormControl('productType', '');
    this.setValueInFormControl('vendorProductInventoryDescription', '');
    this.form.get('service')?.updateValueAndValidity();
    this.form.get('serviceType')?.updateValueAndValidity();
    this.form.get('product')?.updateValueAndValidity();
    this.form.get('productType')?.updateValueAndValidity();
    this.form.get('vendorProductInventoryDescription')?.updateValueAndValidity();
  }

  statusFieldDisabledFn(data: any) {
    return data === 60;
  }
  serviceDetailSet(data: any) {
    this.dataFromEditApi = data.Data;
    this.typeService = checkIsValueExists(this.dataFromEditApi.ChildInventoryId) ? 'Child' :
      (this.dataFromEditApi.TotalChildInventory === 0) ? "Individual" : "Parent";
    this.VendorAccountLogo = this.dataFromEditApi.VendorAccountLogo ? 'data:image/png;base64,' + this.dataFromEditApi.VendorAccountLogo : '';
    this.statusFieldDisabled = this.statusFieldDisabledFn(this.dataFromEditApi['Status']);
    this.loadingDataFromEditApi = false;
    this.onInventoryDataFetch.emit(false);

    this.setValueInFormControl('TEM', this.dataFromEditApi.TEMAccountId);
    this.setValueInFormControl('customerId', this.dataFromEditApi.CustomerAccountId);
    this.setValueInFormControl('VendorId', this.dataFromEditApi.VendorAccountId);
    this.setValueInFormControl('BillingAccountHierarchyId', this.dataFromEditApi.MainBillingAccountHierarchyId);
    this.setValueInFormControl('subAccountNumber', this.dataFromEditApi.SubBillingAccountHierarchyId);
    this.setValueInFormControl('payableAccountNumber', this.dataFromEditApi.PayableAccountNumber);
    this.setValueInFormControl('isPhoneNumber', this.dataFromEditApi.IsPhoneNumber);
    this.setValueInFormControl('serviceNumber', this.dataFromEditApi.ServiceNumber);
    this.setValueInFormControl('billingId', this.dataFromEditApi.BillingId);
    this.setValueInFormControl('InventoryOriginId', this.dataFromEditApi.InventoryOriginId);
    this.setValueInFormControl('statusId', this.dataFromEditApi.Status);
    if (this.dataFromEditApi.Status == 20) {
      this.disconnectionDateReq = true;
      this.inventoryForm.get('EndDate')?.setValidators([Validators.required]);
      this.form.get('EndDate')?.updateValueAndValidity();
    } else {
      this.disconnectionDateReq = false;
      this.inventoryForm.get('EndDate')?.setValidators([]);
      this.form.get('EndDate')?.updateValueAndValidity();
      this.form.get('EndDate')?.setValue('');
    }
    this.setValueInFormControl('service', this.dataFromEditApi.ServiceId);
    this.setValueInFormControl('BillingCharge', this.dataFromEditApi.BillingCharge);
    this.setValueInFormControl('serviceType', this.dataFromEditApi.ServiceTypeId);
    this.setValueInFormControl('product', this.dataFromEditApi.ProductId);
    this.setValueInFormControl('productType', this.dataFromEditApi.ProductTypeId);
    this.setValueInFormControl('vendorProductTypeId', this.dataFromEditApi.VendorProductTypeId);
    this.setValueInFormControl('vendorProductInventoryDescription', this.dataFromEditApi.Description ? this.dataFromEditApi.Description : this.dataFromEditApi.VendorProductDescription);
    this.setValueInFormControl('inventoryCustomField1', this.dataFromEditApi.InventoryCustomField1);
    this.setValueInFormControl('inventoryCustomField2', this.dataFromEditApi.InventoryCustomField2);
    this.setValueInFormControl('inventoryCustomField3', this.dataFromEditApi.InventoryCustomField3);
    this.setValueInFormControl('inventoryCustomField4', this.dataFromEditApi.InventoryCustomField4);
    this.setValueInFormControl('assignedChildren', this.dataFromEditApi.TotalChildInventory);
    this.setValueInFormControl('companyId', this.dataFromEditApi.CompanyId);
    this.setValueInFormControl('StartDate', this.dataFromEditApi.StartDate ? isValueExist(this.manageService.convertDate(this.dataFromEditApi.StartDate, '', '/')) : '');
    this.onChangeStartDate(this.dataFromEditApi.StartDate);
    this.setValueInFormControl('EndDate', this.dataFromEditApi.EndDate ? isValueExist(this.manageService.convertDate(this.dataFromEditApi.EndDate, '', '/')) : '');
    this.setValueInFormControl('InvoiceCyclesRemaining', this.dataFromEditApi.InvoiceCyclesRemaining ? this.dataFromEditApi.InvoiceCyclesRemaining.toString() : null);

    this.setCustomerDDValueEvent.emit(this.dataFromEditApi.CustomerAccountId);
    this.filterCustomerGridByTEMId();
    this.getMainBillingAccountDD();
    this.getCompany();

    if (this.f['service'].value) {
      this.getServiceTypes();
    }

    if (this.f['serviceType'].value) {
      this.getProducts();
    }

    if (this.f['product'].value) {
      this.getProductTypes();
    }

    if (this.f['productType'].value) {
      this.getVendorProductType();
    }

    this.getVendorProductType1();

    if (this.f['customerId'].value) {
      this.getVendorList(false, this.f['customerId'].value);
    }
  }

  getTemLists() {
    this.loadingTems = true;
    this.locationService
      .getTEMLoggedInUserDropDown()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data && data.$values) {
          this.tems = data.$values;
          this.loadingTems = false;
        } else {
          this.tems = [];
          this.loadingTems = false;
        }
      }, error => {
        this.tems = [];
        this.loadingTems = false;
      });
  }


  filterCustomerGridByTEMId() {


    this.customerList = [];
    this.loadingCustomerList = true;
    if (this.selectedTem && this.currentIndexPage && this.selectedTem[this.currentIndexPage] && this.selectedTem[this.currentIndexPage] !== 'all') {
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.selectedTem[this.currentIndexPage])
        .pipe(takeUntil(this._unsubscribeCustomer))
        .subscribe({
          next: (data) => {
            if (data && data.Data.$values) {
              this.customerList = data.Data.$values;
              this.loadingCustomerList = false;
            } else {
              this.customerList = [];
              this.loadingCustomerList = false;
            }
          },
          error: (error) => {
            this.customerList = [];
            this.loadingCustomerList = false;
          },
        });
    } else {
      this._unsubscribeCustomer.next(null);
      this.locationService
        .getCustomerDropDown()
        .pipe(takeUntil(this._unsubscribeCustomer))
        .subscribe({
          next: (data) => {
            if (data && data.$values) {
              this.customerList = data.$values;
              this.loadingCustomerList = false;
              if (this.action === 'Edit') {
                const data1 = this.customerList.find((res: any) => res.Id === this.rowData['CustomerAccountId']);
                this.setTemDDValue = data1.TemAccountID;

                this.setTemDDValueEvent.emit(this.setTemDDValue);
              }
            } else {
              this.customerList = [];
              this.loadingCustomerList = false;
            }
          },
          error: (error) => {
            this.customerList = [];
            this.loadingCustomerList = false;
          },
        });
    }
  }

  onCustomerSelect($event: any, fromHTML = false) {

    if (fromHTML) {
      this.setValueInFormControl('vendorProductTypeId', '');
      this.setValueInFormControl('vendorProductInventoryDescription', '');
      if (this.rowData && this.rowData['CustomerAccountId'] !== this.f['customerId'].value) {
        this.isExistPrimaryLocation = false;
        this.isExistPrimaryPeople = false;
        this.primaryLocationId = null;
        this.primaryPeopleId = null;
      }
    }
    if ($event.value) {
      const data1 = this.customerList.find((res: any) => res.Id === $event.value);
      if (data1 && data1.TemAccountID) {
        this.setTemDDValue = data1.TemAccountID;


        this.setTemDDValueEvent.emit(this.setTemDDValue);
      }
    }
  }

  getVendorList(Parent?: any, CustomerAccountId?: any, fromHTMLFile = false) {
    if (fromHTMLFile) {
      this.setValueInFormControl('VendorId', '');
    }
    this.vendorsList = [];
    this.loadingVendorsList = true;
    this._unsubscribeVendor.next(null);
    this.locationService
      .getVendorDropdown(Parent, CustomerAccountId)
      .pipe(takeUntil(this._unsubscribeVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Success) {
            this.vendorsList = data.Data?.$values;
            this.loadingVendorsList = false;
          } else {
            this.vendorsList = [];
            this.loadingVendorsList = false;
          }
        },
        error: (error) => {
          this.vendorsList = [];
          this.loadingVendorsList = false;
        },
      });
  }

  getMainBillingAccountDD(fromHTMLFile = false) {
    let KeyString: string = '';

    // Only proceed if either customerId or VendorId has a value
    if (this.f['customerId'].value || this.f['VendorId'].value) {
      // Start with the customerId if available
      if (this.f['customerId'].value) {
        KeyString = `?customerId=${this.f['customerId'].value}`;
      }

      // Append VendorId if available
      if (this.f['VendorId'].value) {
        // If KeyString already has a value, append with '&'
        KeyString += KeyString ? `&VendorId=${this.f['VendorId'].value}` : `?VendorId=${this.f['VendorId'].value}`;
      }

      // Always append 'getOnlyMain=true'
      KeyString += '&getOnlyMain=true';
    }

    this.MainBillingAccountDD = [];
    this.subBillingAccountDD = [];
    this.mainBillingAccDD = true;
    this.loadingsubBillAccDD = true;
    this._unsubscribeAllCustomerVendor.next(null);

    if (fromHTMLFile) {
      this.setValueInFormControl('BillingAccountHierarchyId', '');
      this.setValueInFormControl('subAccountNumber', '');
      this.setValueInFormControl('payableAccountNumber', '');

      this.inventoryForm.get('BillingAccountHierarchyId')?.updateValueAndValidity();
      this.inventoryForm.get('subAccountNumber')?.updateValueAndValidity();
      this.inventoryForm.get('payableAccountNumber')?.updateValueAndValidity();
    }

    this.locationService
      .mainBillingAccountsDD(KeyString)
      .pipe(takeUntil(this._unsubscribeAllCustomerVendor))
      .subscribe((data) => {
        if (data && data.Data.$values) {
          this.MainBillingAccountDD = data.Data.$values;
          this.mainBillingAccDD = false;
          this.loadingsubBillAccDD = false;
          this.getSubBillingAccountDD(fromHTMLFile);
        } else {
          this.MainBillingAccountDD = [];
          this.mainBillingAccDD = false;
          this.loadingsubBillAccDD = false;
        }
      }, error => {
        this.MainBillingAccountDD = [];
        this.mainBillingAccDD = false;
        this.loadingsubBillAccDD = false;
      });


  }

  getSubBillingAccountDD(fromHTMLFile = false) {
    if (fromHTMLFile) {
      this.setValueInFormControl('payableAccountNumber', '');
      this.setValueInFormControl('subAccountNumber', null);
      this.inventoryForm.get('payableAccountNumber')?.updateValueAndValidity();
      this.inventoryForm.get('subAccountNumber')?.updateValueAndValidity();
    }
    if (checkIsValueExists(this.f['BillingAccountHierarchyId'].value)) {
      this.subBillingAccountDD = [];
      const findObj = this.MainBillingAccountDD.find((a: any) => a.Id === this.f['BillingAccountHierarchyId'].value);
      if (findObj && findObj.PayableAccount) {
        this.setValueInFormControl('payableAccountNumber', findObj.AccountNumber);

        this.inventoryForm.get('subAccountNumber')?.setValidators([]);
        this.subAccountNumberRequired = false;
      } else {
        this.subAccountNumberRequired = true;
        this.inventoryForm.get('subAccountNumber')?.setValidators([Validators.required]);
      }
      this.inventoryForm.get('subAccountNumber')?.updateValueAndValidity();
      this.inventoryForm.get('payableAccountNumber')?.updateValueAndValidity();

      this.loadingsubBillAccDD = true;
      this.wirelineService.getSubBillingAccountsDD(this.f['BillingAccountHierarchyId'].value)
        .pipe(takeUntil(this._unsubscribeAllCustomerVendor))
        .subscribe((data) => {
          if (data && data.Data.$values) {
            this.subBillingAccountDD = data.Data.$values;
            this.loadingsubBillAccDD = false;

            if (checkIsValueExists(this.f['subAccountNumber'].value)) {
              this.clickToSubAccNumber();
            }
          } else {
            this.subBillingAccountDD = [];
            this.loadingsubBillAccDD = false;
          }
        }, error => {
          this.subBillingAccountDD = [];
          this.loadingsubBillAccDD = false;
        });
    }
  }

  clickToSubAccNumber() {
    const findObj = this.subBillingAccountDD.find((a: any) => a.Id === this.f['subAccountNumber'].value);
    if (findObj && findObj.PayableAccount) {
      this.setValueInFormControl('payableAccountNumber', findObj.AccountNumber);
    }
  }

  linkAssociatedInventory() {
    const dialogRef = this.dialog.open(LinkAssociatedInventoryComponent, {
      width: '1200px',
      data: {
        inventory: this.childInventoryData,
        rowData: this.rowData,
        customerId: this.f['customerId'].value,
        serviceId: this.serviceIds
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isValuesUndefined(result)) {
        if (result === true) {
          console.log('result', result);
          this.onLazyLoadInventoryTable('', true, true, 2);
        }
        if (result.checkedData && result.checkedData.length > 0) {
          this.childInventoryData = [];
          this.childInventoryData.push({ 'noValue': 1 });
          this.inventoryTableTotal = 0;
          this.emptymessage = "No Row To Show";
          this.loadingAssInventory = false;
          this.childInventoryData = result.checkedData;
          this.inventoryTableTotal = result.checkedData.length;

        }
      }
    });
  }

  linkLocationPopup() {
    const dialogRef = this.dialog.open(LinkLocationDialogComponent, {
      width: '900px',
      data: {
        linkLocation: this.companyLocations,
        inventoryData: this.rowData,
        action: this.action,
        customerId: this.f['customerId'].value,
        isPrimaryExist: this.primaryPeopleId ? true : false,
        primaryPeopleId: this.primaryPeopleId,
        primaryLocationId: this.primaryLocationId
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.getLocationByCustomer();
        if (this.primaryPeopleId) {
          this.getPeopleByCustomer();
        }
      } else if (result && result.checkedData) {
        this.companyLocations = result.checkedData;
        this.locationIds = result.locationIds;
        let locations = result.checkedData;
        this.primaryLocationId = result.primaryLocationId;
        this.isExistPrimaryLocation = result.primaryLocationId ? true : false;
        this.companyLocations = locations.map((r: any) => {
          let a: any = {};
          a = r;
          a['LocationDisplay'] = r.CompanyName + '/' + r.LocationName + '/' + r.Address1 + '/' + r.City + '/' + r.StateName
          a['PrimaryLocation'] = result.primaryLocationId == r.LocationId ? true : null
          if (result.primaryLocationId) {
            this.setValueInFormControl('companyId', r?.CompanyId);
          }
          this.disableCompany = true;
          return a;
        });

        if (this.companyPeoples.length && this.primaryLocationId) {
          this.primaryPeopleId = null;
          this.isExistPrimaryPeople = false;
          this.companyPeoples = _.map(this.companyPeoples, (x: any) => {
            const a = x;
            a.PrimaryPeople = false
            return a;
          });
        }
      }
    });
  }

  linkPeoplePopup() {
    const dialogRef = this.dialog.open(LinkPeopleDialogComponent, {
      width: '900px',
      data: {
        linkPeople: this.companyPeoples,
        rowData: this.rowData,
        action: this.action,
        customerId: this.f['customerId'].value,
        isPrimaryExist: this.primaryLocationId ? true : false,
        primaryLocationId: this.primaryLocationId,
        primaryPeopleId: this.primaryPeopleId
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isValuesUndefined(result) && !result.add) {
        this.getPeopleByCustomer();
        if (this.primaryLocationId) {
          this.getLocationByCustomer();
        }
      } else if (result && result.checkedData && result.add) {
        this.companyPeoples = result.checkedData;
        this.peopleIds = result.contactIds;
        let peoples = result.checkedData;
        this.primaryPeopleId = result.primaryContactId;
        this.isExistPrimaryPeople = result.primaryContactId ? true : false;
        this.companyPeoples = peoples.map((r: any) => {
          let a: any = {};
          a = r;
          a['PeopleDisplay'] = r.PeopleName + '-' + r.PeopleEmail + '-' + r.PeopleStatusDisplayValue + (isValueExist(r.ManagerName) ? '-' + r.ManagerName : '');
          a['PrimaryPeople'] = result.primaryContactId == r.PeopleId ? true : null
          return a;
        })

        if (this.companyLocations.length && this.primaryPeopleId) {
          this.primaryLocationId = null;
          this.isExistPrimaryLocation = false;
          this.companyLocations = _.map(this.companyLocations, (x: any) => {
            const a = x;
            a.PrimaryLocation = false
            return a;
          });
        }
      }
    });
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event;
    this.gridColumnApi = $event.columnApi;
  }
  onAgGridReadyChildEmit($event: any) {
    this.gridApiChild = $event;
    this.gridChildColumnApi = $event.columnApi;
  }

  onAgGridReadyEmitAttribute($event: any) {
    this.gridApiAttribute = $event;
    this.gridColumnApiAttribute = $event.columnApi;
  }

  ngOnDestroy(): void {
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribePeople.next(null);
    this._unsubscribePeople.complete();
    this._unsubscribeInventoryAttribute.next(null);
    this._unsubscribeInventoryAttribute.complete();
    this._unsubscribeInventoryStatusCode.next(null);
    this._unsubscribeInventoryStatusCode.complete();
    this._unsubscribeInventoryOrigins.next(null);
    this._unsubscribeInventoryOrigins.complete();
    this._unsubscribeInventoryOriginsName.next(null);
    this._unsubscribeInventoryOriginsName.complete();
    this._unsubscribeGetServiceDetail.next(null);
    this._unsubscribeGetServiceDetail.complete();
    this._unsubscribeAttribute.next(null);
    this._unsubscribeAttribute.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
    this._unsubscribeGetServiceTypes.next(null);
    this._unsubscribeGetServiceTypes.complete();
    this._unsubscribeGetProductsForVendor.next(null);
    this._unsubscribeGetProductsForVendor.complete();
    this._unsubscribeGetProductTypes.next(null);
    this._unsubscribeGetProductTypes.complete();
    this._unsubscribeVendorProductTypesDetails.next(null);
    this._unsubscribeVendorProductTypesDetails.complete();
    this._unsubscribeGetServiceProduct.next(null);
    this._unsubscribeGetServiceProduct.complete();
    this._unsubscribeCompany.next(null);
    this._unsubscribeCompany.complete();
    this._unsubscribeChildInventory.next(null);
    this._unsubscribeChildInventory.complete();
    this._unsubscribeCustomer.next(null);
    this._unsubscribeCustomer.complete();
    this.addWirelineFromData.emit(this.form.value);
    this.onWirelineEditEvent.emit(this.form.value);
    this.setTemDDValueEvent.emit('');
    this.setCustomerDDValueEvent.emit('');
    this.onDestroyOutput.emit(true);
    this._unsubscribeChildData.next(null);
    this._unsubscribeChildData.complete();

  }

  getInventorystatuses() {
    this.loadingInventorySts = true;
    this._unsubscribeInventoryStatus.next(null);
    this.locationService.getInventorystatuses().pipe(takeUntil(this._unsubscribeInventoryStatus)).subscribe((data: any) => {
      if (data && data.Data && data.Data.$values) {
        this.inventoryStatusList = data.Data.$values;

        if (this.action === 'Edit' && this.inventoryStatusList.length && this.dataFromEditApi?.Status) {
          const status = _.find(this.inventoryStatusList, (c: any) => c.Id === this.dataFromEditApi?.Status).Code;

          if (status === 'PENDING ACTIVATION') {
            this.inventoryStatusList = _.filter(this.inventoryStatusList, (x: any) => x.Code == "PENDING ACTIVATION" || x.Code == "ACTIVE" || x.Code == "DELETED");
          }
        }
        this.loadingInventorySts = false;
        if (this.action === 'New') {
          this.getInventorystatusesCode();
        }
      } else {
        this.loadingInventorySts = false;
        this.inventoryStatusList = [];
      }
    }, error => {
      this.loadingInventorySts = false;
      this.inventoryStatusList = [];
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.IIconTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialogPeople(): void {
    const dialogRef = this.dialog.open(this.IIconTooltipPeople, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

  getInventorystatusesCode() {
    this._unsubscribeInventoryStatusCode.next(null);
    this.locationService.getInventorystatusesCode().pipe(takeUntil(this._unsubscribeInventoryStatusCode)).subscribe((data: any) => {
      if (data && data.Data && data.Data.Id) {
        const findObj = this.inventoryStatusList.find((a: any) => a.Id === data.Data.Id);
        this.setValueInFormControl('statusId', findObj.Id);
        this.form.get('statusId')?.updateValueAndValidity();
      }
    });
  }

  getInventoryorigins() {
    this.loadingInventoryOrigins = true;
    this._unsubscribeInventoryOrigins.next(null);
    this.wirelineService.getInventoryorigins().pipe(takeUntil(this._unsubscribeInventoryOrigins)).subscribe((data: any) => {

      if (data && data.Data && data.Data.$values) {
        this.inventoryOriginsList = data.Data.$values;
        this.loadingInventoryOrigins = false;

        if (this.action === 'New') {
          this._unsubscribeInventoryOriginsName.next(null);
          this.wirelineService.getInventoryoriginsName().pipe(takeUntil(this._unsubscribeInventoryOriginsName)).subscribe((datas: any) => {
            if (datas) {
              const findObj = this.inventoryOriginsList.find((a: any) => a.Id === datas.Data.Id);
              this.setValueInFormControl('InventoryOriginId', findObj.Id);
              this.form.get('InventoryOriginId')?.updateValueAndValidity();
            }
          }, error => {
            this.loadingInventoryOrigins = false;
            this.inventoryOriginsList = [];
          });
        }
      }
    });
  }



  getServiceProduct() {
    this.setValueInFormControl('vendorProductInventoryDescription', '');
    if (this.inventoryForm.value.vendorProductTypeId) {
      const findObj = this.vendorProductDetails.find((a: any) => a.Id === this.inventoryForm.value.vendorProductTypeId);

      if (findObj && findObj.Description) {
        this.setValueInFormControl('vendorProductInventoryDescription', findObj.Description);
      }
      this._unsubscribeGetServiceProduct.next(null);

      this.wirelineService.vendorProductTypeDetail(this.inventoryForm.value.vendorProductTypeId).pipe(takeUntil(this._unsubscribeGetServiceProduct)).subscribe((data) => {
        if (data.Data && data.Success) {
          this.serviceData = data.Data;
          this.setValueInFormControl('service', this.serviceData.ServiceId);
          this.getServiceTypes();
          this.setValueInFormControl('serviceType', this.serviceData.ServiceTypeId);
          this.getProducts();
          this.setValueInFormControl('product', this.serviceData.ProductId);
          this.getProductTypes();
          this.setValueInFormControl('productType', this.serviceData.ProductTypeId);
          this.form.get('service')?.updateValueAndValidity();
          this.form.get('serviceType')?.updateValueAndValidity();
          this.form.get('product')?.updateValueAndValidity();
          this.form.get('productType')?.updateValueAndValidity();

          this.onLazyLoadAttribute('', true, true)
        }

        if (this.action == 'Edit') {
          const dialogRef = this.dialog.open(ReviewServicePopupComponent, {
            width: '900px',
            data: {
              'editedData': this.dataFromEditApi,
              'attributesData': this.rowDataServiceTypeAttr,
              'formData': this.serviceData
            }
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.rowDataServiceTypeAttr = [];
              this.rowDataServiceTypeAttr.push({ 'noValue': 1 });
              this.serviceTypeAttributeDescriptions = result.serviceTypeAttributeDescriptions;

              if (result.checkedData && result.checkedData.length > 0) {
                let attributes = result.checkedData.map((data: any) => {
                  let a: any = {};
                  a['ServiceType'] = data.ServiceType.Name,
                    a['AttributeName'] = data.Attributes.Name,
                    a['AttributeDescription'] = data.attribute_value,
                    a['AttributeId'] = data.AttributeId
                  return a;
                })

                this.rowDataServiceTypeAttr = [...new Set(attributes)];
              }
            }
          });

          if (this.rowData['ServiceTypeId'] !== this.serviceData['ServiceTypeId']) {
            this.onLazyLoadAttribute('', true, true);
          }
        }
      });


    }
  }

  addChildInventory() {
    const dialogRef = this.dialog.open(AddEditChildInventoryComponent, {
      width: '900px',
      data: {
        'editedData': this.dataFromEditApi, 'savedData': this.dataFromSavedApi, 'vendorList': this.vendorsList, 'serviceTypes': this.serviceTypes,
        'services': this.services, 'products': this.products, 'productTypes': this.productTypes, 'vendorProductDetails': this.vendorProductDetails, 'MainBillingAccountDD': this.MainBillingAccountDD
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.isSetAction.emit('');
      if (result.Success) {
        this.onEditedInventory.emit(true);
        this.saveAddButtonLoader = false;
        const data = this.dataFromEditApi ? this.dataFromEditApi : this.dataFromSavedApi;
        if (this.action == 'New') {
          this.onWirelineAddEvent.emit(data);
        } else {
          this._unsubscribeGetServiceDetail.next(null);
          this.wirelineService.getServiceDetail(this.rowData['VendorProductInventoryId'])
            .pipe(takeUntil(this._unsubscribeGetServiceDetail))
            .subscribe((data) => {
              if (data && data.Data) {
                this.setValueInFormControl('assignedChildren', data.Data.TotalChildInventory);
              }
            }
            )
        }
      }
    });
    this.onWirelineEditEvent.emit(this.form.value);
  }
  makeChildPopup() {
    const dialogRef = this.dialog.open(MakeChildPopupComponent, {
      width: '1100px',
      data: {
        'editedData': this.dataFromEditApi, 'savedData': this.dataFromSavedApi, 'vendorList': this.vendorsList, 'serviceTypes': this.serviceTypes,
        'services': this.services, 'products': this.products, 'productTypes': this.productTypes, 'vendorProductDetails': this.vendorProductDetails, 'MainBillingAccountDD': this.MainBillingAccountDD,
        'serviceId': this.serviceIds
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.isSetAction.emit('');
      if (result.Success) {
        this.onEditedInventory.emit('');
      }
    });
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  setInventoryForm() {
    this.inventoryForm = this.fb.group({
      TEM: new FormControl(''),
      companyId: new FormControl(''),
      customerId: new FormControl('', [Validators.required]),
      VendorId: new FormControl(null, [Validators.required]),
      BillingAccountHierarchyId: new FormControl('', [Validators.required]),
      subAccountNumber: new FormControl(''),
      payableAccountNumber: new FormControl(''),
      isPhoneNumber: new FormControl('', [Validators.required]),
      serviceNumber: new FormControl('', [Validators.required]),
      billingId: new FormControl(''),
      InventoryOriginId: new FormControl(),
      statusId: new FormControl('', [Validators.required]),
      service: new FormControl('', [Validators.required]),
      serviceType: new FormControl('', [Validators.required]),
      product: new FormControl('', [Validators.required]),
      productType: new FormControl('', [Validators.required]),
      vendorProductTypeId: new FormControl('', [Validators.required]),
      vendorProductInventoryDescription: new FormControl(''),
      inventoryCustomField1: new FormControl(''),
      inventoryCustomField2: new FormControl(''),
      inventoryCustomField3: new FormControl(''),
      inventoryCustomField4: new FormControl(''),
      BillingCharge: new FormControl(true),
      assignedChildren: new FormControl(''),
      StartDate: new FormControl(''),
    })


    if (this.action == 'Edit') {
      this.inventoryForm.addControl('EndDate', this.fb.control(''));
      this.inventoryForm.addControl('InvoiceCyclesRemaining', this.fb.control(''));
    }
  }

  get f() {
    return this.inventoryForm?.controls;
  }

  get form() {
    return this.inventoryForm;
  }

  onselectSetDate($event: any, regex = '/') {
    if ($event && !$event.toString().includes('/')) {
      let d = $event;
      let dd = d.getDate();
      let mm = d.getMonth() + 1;
      let yy = d.getFullYear();

      let userAgent = navigator.userAgent;
      let browserName;

      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "chrome";
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
      } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
      } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
      } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
      } else {
        browserName = "No browser detection";
      }

      if (browserName === 'firefox' || browserName === 'safari') {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}`, 'saveDatePicker', regex));
      } else {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}T0000`, 'saveDatePicker', regex));
      }
    } else {
      return isValueExist(this.manageService.convertDate(`${$event}T0000`, 'saveDatePicker', regex));
    }
  }

  onChangeEndDate($event: any) {
    if ($event) {
      this.isIvoiceCycleRequired = true;
      this.form.get('InvoiceCyclesRemaining')?.setValidators([Validators.required]);
    } else {
      this.isIvoiceCycleRequired = false;
      this.form.get('InvoiceCyclesRemaining')?.setValidators([]);
    }
    this.form.get('InvoiceCyclesRemaining')?.updateValueAndValidity();
  }

  onChangeStartDate($event: any) {
    let date;
    let endDate;
    if (this.action === 'Edit' && $event && this.f['EndDate'].value) {
      date = new Date($event);
      endDate = new Date(this.f['EndDate'].value);
      this.setMindate = date;
      if (date > endDate) {
        this.f['EndDate'].patchValue('');
        this.f['InvoiceCyclesRemaining'].patchValue(null);
      }
    } else {
      date = new Date($event);
      this.setMindate = date;
    }


  }

  findStatusNameById(id: any) {
    return this.inventoryStatusList.find((a: any) => a.Id === id).DisplayText;
  }

  addInventoryData(save?: string) {
    this.submitted = true;
    if (this.form.valid) {
      const selectedVal = this.findStatusNameById(this.f['statusId'].value);

      if (this.f['StartDate']?.value) {

        if (this.action === 'Edit' && this.f['EndDate'].value && selectedVal !== 'Disconnected') {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            okBtnName: 'Close & Review',
            message: 'The status needs to be updated to an end state of: Disconnected, Recycled, or Disposed. Please make the status update.',
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe((result) => {
          });
          return
        }

        if (selectedVal == 'Pending Activation') {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            okBtnName: 'Close & Review',
            message: 'The status of this item is neither active nor suspended. A service date suggests that the service is either in use or on hold. Please update the status to "Active" or "Suspended" when entering the start date.',
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.setValueInFormControl('statusId', '');
            }
          });
          return
        }
      }

      if ((this.rowData && this.rowData['ChildInventoryId'] == null) || this.action === 'New') {
        let isSelectedPrimary: any;
        let locationIds: any;
        if (this.companyLocations && this.companyLocations.length > 0) {
          isSelectedPrimary = this.companyLocations.find((r: any) => r.PrimaryLocation)?.LocationId;
          locationIds = this.companyLocations.map((r: any) =>
            r.LocationId
          );
        }

        let isSelectedPrimaryPeople: any;
        let peopleIds: any;

        if (this.companyPeoples && this.companyPeoples.length > 0) {
          isSelectedPrimaryPeople = this.companyPeoples.find((r: any) => r.PrimaryPeople)?.PeopleId;
          peopleIds = this.companyPeoples.map((r: any) =>
            r.PeopleId
          );
        }

        if (this.form.value.subAccountNumber) {
          this.form.value['BillingAccountHierarchyId'] = this.form.value.subAccountNumber;
        }

        this.confirmPopupForChangeCustomer().then((customerChanged) => {
          this.isUpdateToAccountDetail = customerChanged === 1;
          this._unsubscribeInventory.next(null);
          const data = this.form.value;

          this.isDisabled = true;
          if (save == 'save-add') {
            this.saveAddButtonLoader = true;
            this.saveButtonLoadder = false;
          } else {
            this.saveButtonLoadder = true;
            this.saveAddButtonLoader = false;
          }

          if (this.isUpdateToAccountDetail) {
            let assosiatedInventoryIds = this.childInventoryData.map((r: any) =>
              r.VendorProductInventoryId
            );
            if (assosiatedInventoryIds[0] === undefined) {
              assosiatedInventoryIds = [];
            }
            data['vendorProductInventoryIds'] = assosiatedInventoryIds;
            if (this.locationIds || this.primaryLocationId) {
              this.form.value['locationIds'] = this.locationIds;
              this.form.value['primaryLocationId'] = this.primaryLocationId ? this.primaryLocationId : null;
            }

            if (this.peopleIds || this.primaryPeopleId) {
              this.form.value['peopleIds'] = this.peopleIds;
              this.form.value['primaryPeopleId'] = this.primaryPeopleId ? this.primaryPeopleId : null;
            }
          }

          this.form.value.StartDate = this.form.value.StartDate ? _.cloneDeep(this.onselectSetDate(this.form.value.StartDate, '-')) : null;

          if (this.action === 'Edit') {
            this.form.value.EndDate = this.form.value.EndDate ? _.cloneDeep(this.onselectSetDate(this.form.value.EndDate, '-')) : null;
          }

          if (this.action === 'New') {
            let data = this.form.value;
            if (this.locationIds || this.primaryLocationId) {
              data['locationIds'] = this.locationIds;
              data['primaryLocationId'] = this.primaryLocationId ? this.primaryLocationId : null;
            }
            if (this.peopleIds || this.primaryPeopleId) {
              this.form.value['peopleIds'] = this.peopleIds;
              this.form.value['primaryPeopleId'] = this.primaryPeopleId ? this.primaryPeopleId : null;
            }
            this.locationService.addInventories(data).pipe(takeUntil(this._unsubscribeInventory)).
              subscribe((data) => {
                this.saveButtonLoadder = false;
                this.saveAddButtonLoader = false;
                this.isDisabled = false;
                this.dataFromSavedApi = data.Data;
                if (data.Success) {
                  this.statusFieldDisabled = this.statusFieldDisabledFn(this.dataFromSavedApi['InventoryStatusId']);
                  if (save == 'save-add') {
                    this.addChildInventory();
                  } else {
                    this.errorPopup(data);
                  }
                } else {
                  this.errorPopup(data);
                }
              }, error => {
                this.isDisabled = false;
                this.saveButtonLoadder = false;
                this.saveAddButtonLoader = false;
                this.errorPopup(error);
              });
          } else {
            this.form.value['vendorProductInventoryId'] = this.dataFromEditApi['VendorProductInventoryId'];
            if (this.isUpdateToAccountDetail) {
              this.form.value['isUpdateToAccountDetail'] = true;
            } else {
              this.form.value['isUpdateToAccountDetail'] = false;
            }

            if (locationIds || isSelectedPrimary) {
              this.form.value['locationIds'] = locationIds;
              this.form.value['primaryLocationId'] = isSelectedPrimary ? isSelectedPrimary : null
            }

            if (this.peopleIds || isSelectedPrimaryPeople) {
              this.form.value['peopleIds'] = peopleIds;
              this.form.value['primaryPeopleId'] = isSelectedPrimaryPeople ? isSelectedPrimaryPeople : null
            }

            if (this.isUpdateToAccountDetail) {

              let map: any = {};
              this.rowDataServiceTypeAttr.map((obj: any) => {
                map[obj.AttributeId] = obj.attribute_value ? obj.attribute_value : obj.AttributeDescription;
              });
              this.form.value['serviceTypeAttributeDescriptions'] = map;
            }

            this.form.value['isUpdateStatusInChildInventory'] = this.isUpdateStatusInChildInventory;
            this.locationService.saveInventories(this.dataFromEditApi['InventoryId'], this.form.value).pipe(takeUntil(this._unsubscribeInventory)).subscribe((data) => {
              this.saveButtonLoadder = false;
              this.saveAddButtonLoader = false;
              this.isDisabled = false;

              if (data.Success) {
                this.onSaveSendDataParent.emit(data.Data);
                this.rowData = data.Data;
                this.dataFromEditApi = data.Data;
                this.statusFieldDisabled = this.statusFieldDisabledFn(data.Data['InventoryStatusId']);
                this.dataFromEditApi.CustomerAccountId = data.Data['CustomerAccountId'];
                this.dataFromEditApi.VendorAccountId = data.Data['VendorAccountId'];
                this.dataFromEditApi.MainBillingAccountHierarchyId = data.Data['MainBillingAccountHierarchyId'];
                this.dataFromEditApi.SubBillingAccountHierarchyId = data.Data['SubBillingAccountHierarchyId'];
                this.dataFromEditApi.Status = data.Data['Status'];

                if (this.isUpdateToAccountDetail === false) {
                  this.setValueInFormControl('customerId', this.dataFromEditApi.CustomerAccountId);
                  this.setValueInFormControl('VendorId', this.dataFromEditApi.VendorAccountId);
                  this.setValueInFormControl('vendorProductTypeId', this.dataFromEditApi.VendorProductTypeId);

                  this.setValueInFormControl('service', this.dataFromEditApi.ServiceId);
                  this.setValueInFormControl('serviceType', this.dataFromEditApi.ServiceTypeId);
                  this.setValueInFormControl('product', this.dataFromEditApi.ProductId);
                  this.setValueInFormControl('productType', this.dataFromEditApi.ProductTypeId);
                  this.setValueInFormControl('vendorProductInventoryDescription', this.dataFromEditApi.Description ? this.dataFromEditApi.Description : this.dataFromEditApi.VendorProductDescription);
                }
                this.getLocationByCustomer();
                this.getInventorystatuses();
                this.errorPopup(data);
                if (this.isUpdateStatusInChildInventory == true) {
                  this.onEditedInventory.emit(true);
                } else {
                  this.onEditedInventory.emit(true);
                }

              } else {
                this.errorPopup(data);
              }
            }, error => {
              this.saveButtonLoadder = false;
              this.saveAddButtonLoader = false;
              this.isDisabled = false;

              this.errorPopup(error);
            });
          }

        });
      } else {
        this.form.value['BillingAccountHierarchyId'] = this.f['subAccountNumber'].value ? this.f['subAccountNumber'].value : this.f['BillingAccountHierarchyId'].value;
        this.form.value['VendorProductInventoryId'] = this.dataFromEditApi['VendorProductInventoryId'];
        this.form.value['InventoryId'] = this.dataFromEditApi['InventoryId'];
        this._unsubscribeSaveChildInventory.next(null);
        this.saveButtonLoadder = true;
        this.saveAddButtonLoader = false;
        this.isDisabled = false;

        this.wirelineService.saveChildInventory(this.form.value, this.rowData['ChildInventoryId']).pipe(takeUntil(this._unsubscribeSaveChildInventory)).subscribe((data) => {
          this.saveButtonLoadder = false;

          this.errorPopup(data);
          this.onEditedInventory.emit(true);
        }, error => {
          this.saveButtonLoadder = false;
          this.errorPopup(error);
        });
      }

    }

  }

  confirmPopupForChangeCustomer() {

    const sendStatus = {
      success: 1,
      fail: 0,
      close: 2
    }
    return new Promise((resolve) => {
      if (this.action !== 'Edit' || !this.dataFromEditApi) {
        resolve(sendStatus.close);
      }

      if (
        (this.form.value['customerId'] !== this.dataFromEditApi.CustomerAccountId) ||
        (this.form.value['VendorId'] !== this.dataFromEditApi.VendorAccountId) ||
        (this.form.value['vendorProductTypeId'] !== this.dataFromEditApi.VendorProductTypeId)
      ) {

        let message = '';
        if ((this.form.value['customerId'] !== this.dataFromEditApi.CustomerAccountId) && (this.form.value['VendorId'] === this.dataFromEditApi.VendorAccountId)) {
          message = 'Customer'
        } else if ((this.form.value['customerId'] !== this.dataFromEditApi.CustomerAccountId) && (this.form.value['VendorId'] !== this.dataFromEditApi.VendorAccountId)) {
          message = 'Customer and Vendor'
        } else if (this.form.value['customerId'] === this.dataFromEditApi.CustomerAccountId && (this.form.value['VendorId'] === this.dataFromEditApi.VendorAccountId || this.form.value['vendorProductTypeId'] !== this.dataFromEditApi.VendorProductTypeId)) {
          message = 'Vendor Product'
        }

        this.saveButtonLoadder = false;
        this.saveAddButtonLoader = false;

        let errorData: any = {
          messgeType: 'error',
          closeBtnName: 'Do not change',
          okBtnName: 'Change it!',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message: `Please confirm that you want to change the ${message} related details for this inventory and any related child inventory `,
        };
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.onlyCustomerChange = result === 'undefined' ? sendStatus.close : result === true ? sendStatus.success : sendStatus.fail;

          if (this.dataFromEditApi && this.onlyCustomerChange === 0) {
            console.log('this.dataFromEditApi');
            this.setValueInFormControl('customerId', this.dataFromEditApi.CustomerAccountId);
            this.onLazyLoadInventoryTable('', true, true, 1);

            this.setValueInFormControl('VendorId', this.dataFromEditApi.VendorAccountId);
            this.getMainBillingAccountDD();

            this.setValueInFormControl('BillingAccountHierarchyId', this.dataFromEditApi.MainBillingAccountHierarchyId);
            this.getVendorProductType();
            this.setValueInFormControl('subAccountNumber', this.dataFromEditApi.SubBillingAccountHierarchyId);
            this.setValueInFormControl('payableAccountNumber', this.dataFromEditApi.PayableAccountNumber);
            this.setValueInFormControl('vendorProductTypeId', this.dataFromEditApi.VendorProductTypeId);

            if (this.f['vendorProductTypeId'].value) {
              this.wirelineService.vendorProductTypeDetail(this.inventoryForm.value.vendorProductTypeId).subscribe((data) => {
                if (data && data.Success) {
                  this.serviceData = data.Data;
                  this.onLazyLoadAttribute('', true, true)
                }
              });
            }
            resolve(this.onlyCustomerChange);
          } else {
            resolve(this.onlyCustomerChange);
          }

        });
      } else {
        resolve(sendStatus.fail);
      }
    });
  }
  addServiceType() {
    const dialogRef = this.dialog.open(AddServiceTypeComponent, {
      width: '900px',
      data: {
        'editedData': this.dataFromEditApi,
        'attributesData': this.rowDataServiceTypeAttr,
        'formData': this.serviceData
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.checkedData && result.checkedData.length > 0) {
          let attributes = result.checkedData.map((data: any) => {
            let a: any = {};
            a['ServiceType'] = data.ServiceType.Name,
              a['AttributeName'] = data.Attributes.Name,
              a['AttributeDescription'] = data.attribute_value,
              a['AttributeId'] = data.AttributeId
            return a;
          });
          this.rowDataServiceTypeAttr = attributes;
        }

        if (result == true) {
          this.onLazyLoadAttribute('', false, true)
        }
      }
    });
  }

  errorPopup(data: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: data.Message,
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (data.Success) {
        if (this.action !== 'Edit') {
          this.onWirelineAddEvent.emit(data.Data);
        } else {
          this.submitted = false;
        }

        if (this.fromTab == 'Contract') {
          this.redirectTab.emit({ redirectIndex: 1 });
        }

        if (this.fromTab == 'location')
          this.redirectTab.emit({ redirectIndex: 2 });
      }
    });
  }


  private lastLazyLoadEvent: any = null;

  onLazyLoadInventoryTable(event: any, update?: any, reset = false, isClickHtml = 0) {
    console.log('onLazyLoadInventoryTable', update, isClickHtml);

    if (!this.rowData?.VendorProductInventoryId) return;

    // Prevent redundant API calls for identical events
    const eventChanged = !this.lastLazyLoadEvent ||
      this.lastLazyLoadEvent.first !== event.first ||
      this.lastLazyLoadEvent.rows !== event.rows ||
      this.lastLazyLoadEvent.sortField !== event.sortField ||
      this.lastLazyLoadEvent.sortOrder !== event.sortOrder ||
      JSON.stringify(this.lastLazyLoadEvent.filters) !== JSON.stringify(event.filters);

    if (!eventChanged && !reset) {
      return;
    }

    this.lastLazyLoadEvent = event;

    const startRowIndex = reset ? 1 : this.defaultRowNStartIndex.startRowIndex;
    const maxRows = reset ? this.maxRows : this.defaultRowNStartIndex.maximumRows;

    const data: any = {
      startRowIndex,
      maximumRows: maxRows,
      OrderBy: event.sortField,
      SortOrder: event.sortOrder === 1 ? 'asc' : 'desc',
      LinkAssVendorProductInventoryId: this.rowData.VendorProductInventoryId,
      CustomerAccountId: update ? this.f['customerId'].value : this.rowData.CustomerAccountId,
      advanceFilter: this.buildFilters(event.filters)
    };

    // Add required default filter (always applied)
    data.advanceFilter.push({
      filterKey: "InventoryLocationAtt",
      filterOptionType1: "Equal",
      filterOptionValue1: "Yes",
      filterOperationType: "AND"
    });

    this.loadingAssInventory = true;
    this._unsubscribeChildInventory.next(null);

    this.wirelineService.getInventoryData(data)
      .pipe(takeUntil(this._unsubscribeChildInventory))
      .subscribe({
        next: (res: any) => {
          const values = res?.Data?.$values ?? [];

          if (values.length) {
            if (reset) {
              this.childInventoryData = values;
            } else {
              this.childInventoryData = [...this.childInventoryData, ...values];
            }

            this.inventoryTableTotal = res.TotalCount;
            this.defaultRowNStartIndex.startRowIndex = this.childInventoryData.length + 1;
            this.defaultRowNStartIndex.maximumRows = maxRows;
          } else {
            this.childInventoryData = [{ noValue: 1 }];
            this.inventoryTableTotal = 0;
            this.emptymessage = "No Row To Show";
          }

          this.previousSort = event.sortField;
          this.previousState = event.sortOrder;
          this.previousSearch = data.advanceFilter;
          this.loadingAssInventory = false;
        },
        error: () => {
          this.childInventoryData = [{ noValue: 1 }];
          this.inventoryTableTotal = 0;
          this.emptymessage = "No Row To Show";
          this.loadingAssInventory = false;
        }
      });
  }

  buildFilters(filters: any): any[] {
    if (!filters) return [];

    return Object.keys(filters).map((key) => {
      const f = filters[key];

      return {
        filterKey: key,
        filterOperationType: f[0]?.operator === 'and' ? 'AND' : 'OR',
        filterOptionType1: f[0]?.matchMode ?? null,
        filterOptionValue1: f[0]?.value ?? null,
        filterOptionType2: f[1]?.matchMode ?? null,
        filterOptionValue2: f[1]?.value ?? null
      };
    }).filter(f => f.filterOptionValue1 || f.filterOptionValue2);
  }

  onLazyLoadAttribute($event: any, update?: any, reset = false) {
    if (!checkIsValueExists(this.rowData) || (this.rowData && !checkIsValueExists(this.rowData['VendorProductInventoryId']))) {
      return;
    }
    let filterArray: any = [];
    let findFilterValueOrNot = false;
    if (checkIsValueExists($event.filters) && !reset) {
      for (let key in $event.filters) {
        let arr: any;
        let data = $event.filters[key];
        if (isValueExist(data[0]['value'])) {
          findFilterValueOrNot = true;
        }
        arr = {
          filterKey: key,
          filterOperationType: data[0] && data[0]['operator'] === 'and' ? 'AND' : 'OR',
          filterOptionType1: data[0] && data[0]['matchMode'] ? data[0]['matchMode'] : null,
          filterOptionValue1: data[0] && data[0]['value'] ? data[0]['value'] : null,
          filterOptionType2: data[1] && data[1]['matchMode'] ? data[1]['matchMode'] : null,
          filterOptionValue2: data[1] && data[1]['value'] ? data[1]['value'] : null
        }
        filterArray.push(arr);
      }

      filterArray = _.filter(filterArray, function (currentObject: any) {
        return currentObject.filterOptionValue1 || currentObject.filterOptionValue1;
      });
      if (filterArray.length > 0 || (JSON.stringify(this.previousSearchAtr) !== JSON.stringify(filterArray)) && (JSON.stringify(filterArray) === '[]' && JSON.stringify(this.previousSearchAtr) !== '[]')) {
        reset = true;
      }

      if (JSON.stringify(this.previousSearchAtr) === JSON.stringify(filterArray)) {
        reset = false;
      }
    }
    if (reset ||
      (
        ((this.previousStateAtr !== $event['sortOrder'] || this.previousSortAtr !== $event['sortField']) ||
          (JSON.stringify(this.previousSearchAtr) !== JSON.stringify(filterArray)) &&
          ((this.attributeTotal !== this.rowDataServiceTypeAttr.length && this.attributeTotal > this.rowDataServiceTypeAttr.length) || this.attributeTotal === 0 || this.rowDataServiceTypeAttr.length === 0))
      )) {
      let data: any = {
        startRowIndex: this.rowStartEndIndex.startRowIndex,
        maximumRows: this.rowStartEndIndex.maximumRows,
      };

      data['serviceTypeId'] = this.rowData['ServiceTypeId'];

      if (update) {
        data['serviceTypeId'] = this.serviceData.ServiceTypeId;
      } else {
        data['serviceTypeId'] = this.rowData['ServiceTypeId'];
      }

      data['OrderBy'] = $event['sortField'];
      if (data['OrderBy']) {
        data['SortOrder'] = ($event['sortOrder'] === 1) ? 'asc' : 'desc';
      }

      if ((this.previousStateAtr !== $event['sortOrder'] || this.previousSortAtr !== $event['sortField']) && !reset) {
        this.rowDataServiceTypeAttr = [];
        this.rowDataServiceTypeAttr.push({ 'noValue': 1 });
        this.attributeTotal = 0;
        data['startRowIndex'] = 1;
        data['maximumRows'] = this.maxRows;
        this.rowStartEndIndex.startRowIndex = data['startRowIndex'];
        this.rowStartEndIndex.maximumRows = data['maximumRows'];
      }
      if ((findFilterValueOrNot && (JSON.stringify(this.previousSearchAtr) !== JSON.stringify(filterArray)) ||
        (JSON.stringify(this.previousSearchAtr) === JSON.stringify(filterArray) && this.previousStateAtr !== $event['sortOrder'] || this.previousSortAtr !== $event['sortField']))
        && reset) {
        data['startRowIndex'] = 1;
        data['maximumRows'] = this.maxRows
        this.rowStartEndIndex.startRowIndex = data['startRowIndex'];
        this.rowStartEndIndex.maximumRows = data['maximumRows'];
        this.rowDataServiceTypeAttr = [];
        this.rowDataServiceTypeAttr.push({ 'noValue': 1 });
        this.attributeTotal = 0;
      }
      if (filterArray && filterArray.length > 0) {
        data['advanceFilter'] = filterArray;
      }
      this.loadingAttribute = true;
      this._unsubscribeAttribute.next(null);

      if (reset) {
        data['startRowIndex'] = 1;
      }

      this.wirelineService
        .addServiceTypeAttributes(this.rowData['VendorProductInventoryId'], data)
        .pipe(takeUntil(this._unsubscribeAttribute))
        .subscribe(
          async (data: any) => {
            if (data && data.Data.$values.length > 0) {

              if (reset) {
                this.rowDataServiceTypeAttr = [];
                this.rowDataServiceTypeAttr.push({ 'noValue': 1 });
                this.attributeTotal = 0;
                this.rowDataServiceTypeAttr = data.Data.$values;
              } else {
                this.rowDataServiceTypeAttr = this.rowDataServiceTypeAttr.concat(data.Data.$values);
              }
              this.attributeTotal = data.TotalCount;
              this.rowStartEndIndex.startRowIndex = this.rowDataServiceTypeAttr.length + 1;
              this.rowStartEndIndex.maximumRows = this.rowStartEndIndex.maximumRows;
              this.loadingAttribute = false;
              this.previousSortAtr = $event['sortField'];
              this.previousStateAtr = $event['sortOrder'];
              this.previousSearchAtr = filterArray;

            } else {
              this.rowDataServiceTypeAttr = [];
              this.rowDataServiceTypeAttr.push({ 'noValue': 1 });
              this.attributeTotal = 0;
              this.emptymessageAtr = "No Row To Show";
              this.loadingAttribute = false;
            }

          }, error => {
            this.rowDataServiceTypeAttr = [];
            this.rowDataServiceTypeAttr.push({ 'noValue': 1 });
            this.attributeTotal = 0;
            this.emptymessageAtr = "No Row To Show";
            this.loadingAttribute = false;
          });

    }
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return
  }

}
