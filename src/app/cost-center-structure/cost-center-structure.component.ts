import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { CostStructureService } from '../services/cost-structure.service';
import { LocationService } from '../services/location.service';
import { WirelineService } from '../services/wireline.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { PTreetableVpInventoryComponent } from './p-treetable-vp-inventory/p-treetable-vp-inventory.component';
import { PTreetableLocationComponent } from './p-treetable-location/p-treetable-location.component';
import { PTreetablePeopleComponent } from './p-treetable-people/p-treetable-people.component';
import { ChangeLogComponent } from '../common/change-log/change-log.component';

@Component({
  selector: 'app-cost-center-structure',
  templateUrl: './cost-center-structure.component.html',
  styleUrls: ['./cost-center-structure.component.scss'],
  providers: [CostStructureService, WirelineService],
  imports: [SharedModule, PrimgModule, PTreetableVpInventoryComponent, PTreetableLocationComponent, PTreetablePeopleComponent, ChangeLogComponent]
})
export class CostCenterStructureComponent implements OnInit {

  @Input() temValue: any;
  @Input() customerData: any;
  @Input() costCenterStructureRowData: any;
  @Input() action: any;

  @Output() onSaveCostCenterStructure: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEventCC: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedTemCCS: EventEmitter<any> = new EventEmitter<any>();

  private _unsubscribeCostCenterS: Subject<any> = new Subject<any>();

  structureForm: FormGroup;
  public sideBar;
  submitted = false;

  public CostAllocationStatus: any;
  public RefNumber: any;

  tems: any = [];
  customers: any = [];
  companies: any = [];
  costCenterData: any = [];
  public temAccountName: any;
  public customerAccountName: any;

  public existingLocation: any;
  public existingPeople: any;
  public existingInventory: any;

  public selectedLocations: any = [];
  public selectedPeoples: any = [];
  public selectedInventories: any = [];

  public serviceTypes: any = [];
  public loadingServiceTypes: any = [];
  public products: any = [];
  public loadingProducts: any = false;
  public assignments: any = [];
  public vendorProductInventoryIds: any = [];
  public peopleIds: any = [];
  public locationIds: any = [];

  stopSpinner = false;
  gridApi: any;
  gridColumnApi: any;

  gridColumnApi1: any;

  saveButtonLoader = false;
  saveAddButtonLoader = false;
  isCompanyManager: boolean = false;
  isCompanyAdmin: boolean = false;
  isCustomerAdmin: boolean = false;
  isViewOnly: boolean = false;

  gridColumnApiLocation: any;
  tableData: any;
  columns: any = [];

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScrollOptions: {
      storeType: 'partial',
      cacheBlockSize: 100
    },
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  }
  changelogData: any = [];
  logLoader = false;

  public loadingCustomerAPI = false;
  public loadingCompanyList: any = false;
  public loadingApprover: any = false;
  loadingCC = false;
  rowData1: any = [];
  rowData3: any;
  rowData: any = [];
  approverList: any = [];
  approverRequired: any = false;
  isDisableApproverOption: any = false;

  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  selectedIds: any = [];

  private _unsubscribeCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeGetCompanies: Subject<any> = new Subject<any>();
  private _unsubscribeCC: Subject<any> = new Subject<any>();
  private _unsubscribeServiceTypes: Subject<any> = new Subject<any>();
  private _unsubscribeGetProducts: Subject<any> = new Subject<any>();
  private _unsubscribePeople: Subject<any> = new Subject<any>();
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribeInvenotry: Subject<any> = new Subject<any>();
  private _unsubscribeDetail: Subject<any> = new Subject<any>();
  private _unsubscribeApproverDropdown: Subject<any> = new Subject<any>();

  @ViewChild('DistributionOrigin') DistributionOrigin!: TemplateRef<any>;
  @ViewChild('serviceDialog') serviceDialog!: TemplateRef<any>;
  @ViewChild('LocationsAssignment') LocationsAssignment!: TemplateRef<any>;
  @ViewChild('PeopleAssignment') PeopleAssignment!: TemplateRef<any>;

  constructor(public dialog: MatDialog, private locationService: LocationService, private fb: FormBuilder,
    public wirelineService: WirelineService,
    private costStructureService: CostStructureService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columns = [
      { field: 'TabModuleDisplayName', header: 'Tab' },
      { field: 'TabSectionModuleDisplayName', header: 'Section' },
      { field: 'DisplayColumnName', header: 'Field Name' },
      { field: 'OldValue', header: 'Previous Value' },
      { field: 'NewValue', header: 'New Value' },
      { field: 'Action', header: 'Action' },
      { field: 'ModificationDate', header: 'Time & Date' },
      { field: 'ModifiedBy', header: 'Who' }
    ];

    this.setForm();
  }

  getCCSChangelogData() {
    this.logLoader = true;
    this._unsubscribeCostCenterS.next(null);
    this.locationService.getCCSChangelogs(this.costCenterStructureRowData.CostCenterStructureId).pipe(takeUntil(this._unsubscribeCostCenterS)).subscribe((data: any) => {
      this.logLoader = false;
      if (data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  setForm() {
    this.structureForm = this.fb.group({
      temId: new FormControl(null),
      companyId: new FormControl(null, [Validators.required]),
      PeopleApproverId: new FormControl('', []),
      customerAccountId: new FormControl(null, [Validators.required]),
      costCenterId: new FormControl(null, [Validators.required]),
      serviceTypeId: [[], [Validators.required]],
      productId: new FormControl(null),
      assignmentType: new FormControl('', [Validators.required]),
      status: new FormControl(true),
      allocationPercentage: new FormControl(null, [Validators.required, Validators.max(100), Validators.min(0)])
    });
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }
  getServiceTypes() {

    this.loadingServiceTypes = true;
    this._unsubscribeServiceTypes.next(null);
    let data = {
      "industryId": null,
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getServiceTypeList(data).pipe(takeUntil(this._unsubscribeServiceTypes)).subscribe((data) => {
      if (data.Success) {
        this.serviceTypes = data.Data.$values;
        this.loadingServiceTypes = false;
      } else {
        this.loadingServiceTypes = false;
        this.serviceTypes = []
        // this.ErrorWarningPopupOpen(data.Message)
      }
    }, error => {
      this.loadingServiceTypes = false;
      this.serviceTypes = [];
    });


  }
  changeServiceType() {
    if (this.f['assignmentType'].value == 'Vendor Product') {
      this.setValueInFormControl('assignmentType', '')
    }
  }

  getApproverDropdown() {
    let custId = this.costCenterStructureRowData?.CustomerAccountId;
    if (!custId) {
      custId = this.f['customerAccountId'].value
    }
    this._unsubscribeApproverDropdown.next(null);
    this.costStructureService.getApproverDropdown(custId, this.f['companyId'].value).pipe(takeUntil(this._unsubscribeApproverDropdown)).subscribe((res: any) => {
      if (res.Success) {
        if(res.Data.$values.length > 0) {
          this.approverList = res.Data.$values;
        } else {
          this.approverList = [];
          this.f['PeopleApproverId'].setValue(null);
        }
      }
    })
  }

  saveRule(another = false) {
    this.submitted = true;

    if (this.f['assignmentType'].value == 'Company' && this.f['companyId'].value == 'all') {
      this.ErrorWarningPopupOpen('Any single company needs to be selected, when the Assignment Type is company');
      return
    }

    if (this.structureForm.valid) {
      if (this.CostAllocationStatus == null || this.CostAllocationStatus == false) {
        let errorData: any = {
          messgeType: "error",
          okBtnName: 'Close & Review',
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'Cost Allocation is presently inactive. To utilize these services, please activate Cost Allocation.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        return
      }

      if (this.f['assignmentType'].value == 'Company') {
        if (this.CostAllocationStatus == true && this.RefNumber == null) {
          let errorData: any = {
            messgeType: "error",
            okBtnName: 'Close & Review',
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Cost Allocation is presently inactive. To utilize these services, please activate Cost Allocation.'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          return
        }
      }
      let data = this.structureForm.value;
      data['costCenterStructureTypeId'] = _.find(this.assignments, (x: any) => x.Type == this.f['assignmentType'].value).Id;

      data['PeopleApproverId'] = this.structureForm.value?.PeopleApproverId ? this.structureForm.value?.PeopleApproverId : null;
      delete data.assignmentType;
      delete data.temId;
      delete data.productId;
      delete data.serviceTypeId;
      if (this.f['productId'].value !== null)
        data['ProductIds'] = [this.f['productId'].value];

      if (this.f['serviceTypeId'].value !== null)
        data['serviceTypeIds'] = this.f['serviceTypeId'].value;

      if (data.companyId == 'all')
        delete data.companyId

      if (this.vendorProductInventoryIds && this.vendorProductInventoryIds.length > 0)
        data['vendorProductInventoryIds'] = this.vendorProductInventoryIds;

      if (this.peopleIds && this.peopleIds.length > 0)
        data['peopleIds'] = this.peopleIds;

      if (this.locationIds && this.locationIds.length > 0)
        data['locationIds'] = this.locationIds;
      if (another)
        this.saveAddButtonLoader = true
      else
        this.saveButtonLoader = true;



      if (this.action == 'edit') {
        data['CostCenterStructureId'] = this.costCenterStructureRowData.CostCenterStructureId;

      }
      data['TabName'] = 'CostCenterStructures';

      this.costStructureService.ccStructuresRule(data).subscribe((res: any) => {
        if (res.Success) {
          if (another)
            this.saveAddButtonLoader = false
          else
            this.saveButtonLoader = false;
          this.ErrorWarningPopupOpen(res.Message).afterClosed().subscribe(data => {
            if (another == false) {
              this.onSaveCostCenterStructure.emit(true);
            } else {
              this.structureForm.reset();
              this.setValueInFormControl('status', true);
              this.submitted = false;
            }
          })

        } else {
          if (another)
            this.saveAddButtonLoader = false
          else
            this.saveButtonLoader = false;

          if (res.Data?.ValidationKey == 'OverAllocation') {

            let matchedData = _.map(res.Data.OverAllocation.$values, (x: any) => x.AssignmentValueId);
            let list;
            if (this.f['assignmentType'].value == 'People') {
              list = matchedData.map(id => this.selectedPeoples.find((item: any) => item.PeopleId === id)?.PeopleName).filter((PeopleName: any) => PeopleName !== undefined)
            } else if (this.f['assignmentType'].value == 'Location') {
              list = matchedData.map(id => this.selectedLocations.find((item: any) => item.LocationId === id)?.LocationName).filter((LocationName: any) => LocationName !== undefined)
            } else if (this.f['assignmentType'].value == 'Vendor Product') {
              list = matchedData.map(id => this.selectedInventories.find((item: any) => item.VendorProductInventoryId === id)?.VendorProductName).filter((VendorProductName: any) => VendorProductName !== undefined)
            }
            let errorData: any = {
              messgeType: 'error',
              okBtnName: 'Close & Review',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-question-circle',
              iconClass: 'text-c-blue f-70',
              message: res.Message,
              list: list
            };

            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
              }
            });
          } else if (res.Data?.ValidationKey == "Duplicate") {
            let errorData: any = {
              messgeType: 'error',
              closeBtnName: 'Oops, use the existing rule please',
              okBtnName: 'Close & Review',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-question-circle',
              iconClass: 'text-c-blue f-70',
              message: res.Message,
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
              }
            });
          } else {
            this.ErrorWarningPopupOpen(res.Message)
          }
        }
      }, error => {

        this.ErrorWarningPopupOpen(error.Message)
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
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return dialogRef
  }
  saveAddAnother() {
    this.structureForm.reset();
    this.setValueInFormControl('status', true);
    this.submitted = false;
  }

  openDialog1(): void {
    this.dialog.open(this.DistributionOrigin, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  serviceTooltip(): void {
    this.dialog.open(this.serviceDialog, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  ngOnInit(): void {

    this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();
    this.isCompanyManager = this.locationService.isUserCompanyManager();
    this.getServiceTypes();
    this.getAssignments();

    if (this.temValue?.temID) {
      this.setValueInFormControl('temId', this.temValue?.temID);
      this.changeTem();
      this.temAccountName = this.temValue?.temName;
    }

    if (this.customerData?.custName) {
      this.customerAccountName = this.customerData?.custName;
      this.setValueInFormControl('customerAccountId', this.customerData?.customerId);
      this.getCompanyByCustomerId();
    }

    if (this.action == 'edit') {

      this._unsubscribeDetail.next(null);
      this.costStructureService.getccStructuresDetail(this.costCenterStructureRowData.CostCenterStructureId).pipe(takeUntil(this._unsubscribeDetail)).subscribe((res: any) => {
        let serviceTypeIds = _.map(res.Data.CCStructureXServiceTypeProduct.$values, (x: any) => x.ServicetypeId);
        let productIds = _.map(res.Data.CCStructureXServiceTypeProduct.$values, (x: any) => x.ProductId);

        let editData = this.costCenterStructureRowData;

        if (this.isCompanyAdmin || this.isCustomerAdmin) {
          this.getAccountById(editData?.CustomerAccountId);
        }

        this.temAccountName = editData.TEMAccountName;
        this.setTemDDValueEventCC.emit({ temid: editData.TEMAccountId, customerid: editData.CustomerAccountId });
        this.customerAccountName = editData.CustomerAccountName;
        this.setValueInFormControl('customerAccountId', editData.CustomerAccountId);
        this.getCompanyByCustomerId();
        this.getCCSChangelogData();

        if (res.Data.CostCenterStructures.CompanyId == null) {
          this.setValueInFormControl('companyId', 'all');
        } else
          this.setValueInFormControl('companyId', res.Data.CostCenterStructures.CompanyId);
        this.getCostCenter();
        this.setValueInFormControl('costCenterId', res.Data.CostCenterStructures.CostCenterId);
        if (this.costCenterStructureRowData?.ServiceTypeId) {
          this.setValueInFormControl('serviceTypeId', [this.costCenterStructureRowData?.ServiceTypeId]);
        }
        // this.setValueInFormControl('serviceTypeId', serviceTypeIds);
        this.getProducts();
        this.setValueInFormControl('productId', productIds[0]);

        this.setValueInFormControl('allocationPercentage', res.Data.CostCenterStructures.Percentage);
        this.setValueInFormControl('assignmentType', res.Data.CostCenterStructures.CostCenterStructureType.Type);
        this.changeAssignment();
        this.setValueInFormControl('status', res.Data.CostCenterStructures.Status);

        if (res.Data.CostCenterStructures?.PeopleApproverId) {
          this.setValueInFormControl('PeopleApproverId', res.Data.CostCenterStructures?.PeopleApproverId);
        }

        if (res.Data.CostCenterStructures.CostCenterStructureType.Type == 'Location') {
          let locationIds = _.map(res.Data.CCAllocationAssignment.$values, (x: any) => x.LocationId);
          this.existingLocation = locationIds;
        } else if (res.Data.CostCenterStructures.CostCenterStructureType.Type == 'People') {
          let peopleIds = _.map(res.Data.CCAllocationAssignment.$values, (x: any) => x.PeopleId);
          this.existingPeople = peopleIds;
        } else if (res.Data.CostCenterStructures.CostCenterStructureType.Type == 'Vendor Product') {
          let vendorProductIds = _.map(res.Data.CCAllocationAssignment.$values, (x: any) => x.VendorProductInventoryId);
          // this.getLocationInventories();
          this.existingInventory = vendorProductIds;
        }

      });
    }
    this.getApproverDropdown();

    if (this.isCompanyManager) {
      this.structureForm.disable();
    }
  }

  getAccountById(id: any) {
    this.locationService.getTemAccountById(id).subscribe((data) => {
      if (data && data?.Data) {
        this.isViewOnly = !data.Data.CostAllocationEditStatus;
        if (this.isViewOnly) {
          this.structureForm.disable();
        }
      }
    });
  }

  onCustomerSelect($event: any) {
    if (this.isCompanyAdmin || this.isCustomerAdmin) {
      this.getAccountById($event.value);
    }
  }

  getLocationInventories() {
    this.rowData1 = [];
    this._unsubscribeInvenotry.next(null);

    let advanceFilter = [
      {
        "filterKey": "InventoryStatusDisplayText",
        "filterOptionType1": "equals",
        "filterOptionValue1": "Pending Activation",
        "filterOperationType": "OR",
        "filterOptionType2": "equals",
        "filterOptionValue2": "Active"
      }
    ];

    const data: any = {
      CustomerAccountId: this.f['customerAccountId'].value,
      advanceFilter: advanceFilter
    };
    if (this.f['serviceTypeId'].value?.length > 0)
      data['serviceTypeIds'] = this.f['serviceTypeId'].value;
    if (this.f['productId'].value !== null) {
      data['productIds'] = [this.f['productId'].value];
    }
    if (this.f['companyId'].value !== 'all') {
      data['companyId'] = this.f['companyId'].value
    }
    this.stopSpinner = false;
    this.locationService.inventoryHierarchy(data).pipe(takeUntil(this._unsubscribeInvenotry)).subscribe((res: any) => {
      if (res && res.Data.$values) {
        this.stopSpinner = true;
        this.rowData1 = this.processData(res.Data.$values);

        _.forEach(this.rowData1, (node: any) => {
          const d = this.existingInventory.some((r: any) => r === node.VendorProductInventoryId);
          node['isChecked'] = d;
        })
      }
    }, error => {
      this.rowData1 = [];
      this.stopSpinner = true;
    });
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.ChildInventory && row.ChildInventory.$values.length > 0) {
        row.ChildInventory.$values.forEach((underling: any) => {
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }
  changeAssignment() {

    if (this.f['assignmentType'].value == 'Company') {
      if (this.f['companyId'].value !== 'all') {
        this.locationService.getCompanyById(this.f['companyId'].value).subscribe((data) => {
          if (data) {
            this.RefNumber = data.Data.RefNumber;
          }
        });
      }
    }
  }
  onSelectionChangedLocation(event: any) {
    let Ids: any = [];
    event.forEach((element: any) => {
      Ids.push(element.LocationId)
    });
    this.locationIds = Ids;
    this.selectedLocations = event;
  }
  onSelectionChangedPeople(event: any) {
    let Ids: any = [];
    event.forEach((element: any) => {
      Ids.push(element.PeopleId)
    });
    this.peopleIds = Ids;
    this.selectedPeoples = event;
  }
  onSelectionChangedInventory(event: any) {
    
    this.vendorProductInventoryIds = [];
    this.selectedInventories = [];
    this.selectedIds = [];
    if (event.length  > 0) {
      _.forEach(event, (e: any) => {
        if (!this.selectedIds.includes(e.VendorProductInventoryId)) {
          this.selectedIds.push(e.VendorProductInventoryId)
        }
      });
      this.vendorProductInventoryIds = this.selectedIds;
      this.selectedInventories = event;
    }
  }

  getAssignments() {
    this.costStructureService.ccStructureTypes().subscribe((data: any) => {
      this.assignments = data.Data.$values;
      let index = _.findIndex(this.assignments, (x: any) => x.type == 'Customer');
      this.assignments.splice(index, 1);
    })
  }

  changeTem() {
    if (this.f['temId'].value && this.f['temId'].value != 'all') {
      this.customers = [];
      this.companies = [];
      this.loadingCustomerAPI = true;
      // this.selectedTemDD = event.target.value;
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.f['temId'].value).pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {

        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
          _.forEach(data.Data.$values, (customer: any) => {
            this.disableOption(customer);
          })
          this.customers.forEach((x: any) => {
            x['disabled'] = !x.CostAllocationStatus
          });
          // this.selectedCustomer = 'all';
          this.loadingCustomerAPI = false;
        } else {
          this.customers = []
          this.loadingCustomerAPI = false;
        }
      }, error => {
        this.customers = []
        this.loadingCustomerAPI = false;
      });
    } else {
      this.customers = [];
      this.companies = [];
      this.loadingCustomerAPI = true;
      // this.selectedTemDD = event.target.value;
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {

        if (data && data.$values) {
          this.customers = data.$values;
          _.forEach(data.$values, (customer: any) => {
            this.disableOption(customer);
          })
          this.customers.forEach((x: any) => {
            x['disabled'] = !x.CostAllocationStatus
          });
          // this.selectedCustomer = 'all';
          this.loadingCustomerAPI = false;
        } else {
          this.customers = []
          this.loadingCustomerAPI = false;
        }
      }, error => {
        this.customers = []
        this.loadingCustomerAPI = false;
      });
    }
  }

  disableOption(item: any): boolean {
    // return item.ApprovalsStatus !== true;
    return item.CostAllocationStatus !== true;
  }

  getCompanyByCustomerId() {
    if (this.f['customerAccountId'].value) {
      this.loadingCompanyList = true;
      this.companies = [];
      this.setValueInFormControl('companyId', null);
      this.setValueInFormControl('costCenterId', null);
      this.setValueInFormControl('assignmentType', null);

      this._unsubscribeGetCompanies.next(null);
      this.locationService.getCompanyByCustomerId(this.f['customerAccountId'].value).pipe(takeUntil(this._unsubscribeGetCompanies)).subscribe((data) => {
        if (data && data.$values && data.$values.length > 0) {

          this.companies = data.$values;
          if (data.$values.length > 1) {
            this.companies.unshift({ CompanyID: 'all', CompanyName: 'All' });
          } else {
            // this.setValueInFormControl('companyId', this.companies[0].CompanyID);
            this.getApproverDropdown();
            this.getCostCenter();
          }
          this.loadingCompanyList = false;
        } else {
          this.companies = [];
          this.loadingCompanyList = false;
        }
      }, error => {
        this.companies = [];
        this.loadingCompanyList = false;
      });

      this.locationService.getTemAccountById(this.f['customerAccountId'].value).subscribe((data) => {
        if (data) {
          this.CostAllocationStatus = data.Data.CostAllocationStatus;
          if (data.Data?.ApprovalStatus) {
            this.approverRequired = true;
            this.isDisableApproverOption = false;
            this.structureForm.get('PeopleApproverId')?.setValidators([Validators.required]);
          } else {
            this.approverRequired = false;
            this.isDisableApproverOption = true;
            this.structureForm.get('PeopleApproverId')?.setValidators([]);
          }
          this.structureForm.get('PeopleApproverId')?.updateValueAndValidity();
        }
      });
    }
  }

  getCostCenter() {
    if (this.f['assignmentType'].value !== null && this.action == 'add') {
      this.setValueInFormControl('assignmentType', null);
    }
    if (this.f['customerAccountId'].value) {
      let data: any = {
        "customerAccountId": this.f['customerAccountId'].value
      }

      if (this.f['companyId'].value !== 'all') {
        data['companyId'] = this.f['companyId'].value
      }
      if (this.action == 'add')
        this.setValueInFormControl('costCenterId', null);
      this._unsubscribeCC.next(null);
      this.loadingCC = true;
      this.costCenterData = [];
      this.costStructureService.costCenterDD(data).pipe(takeUntil(this._unsubscribeCC)).subscribe((res: any) => {
        this.loadingCC = false;
        if (res.Success) {
          this.getApproverDropdown();
          this.costCenterData = res?.Data?.$values || [];
          if (this.costCenterData.length === 0) {
            this.setValueInFormControl('costCenterId', null);
          }
        } else {
          this.handleCostCenterError();
        }
      }, error => {
        this.handleCostCenterError();
        this.loadingCC = false;
      });
    }
  }
  private handleCostCenterError(): void {
    this.costCenterData = [];
    this.setValueInFormControl('costCenterId', null);
  }
  getFilteredAssignments(): any[] {
    if (!this.assignments) {
      return [];
    }
    if (this.f['companyId'].value === 'all') {
      return this.assignments.filter((a: any) => a.Type !== 'Company');
    }
    return [...this.assignments];
  }
  getProducts(clickFromHTML = false) {
    if (!this.f['serviceTypeId'].value) {
      return;
    }
    this.products = [];
    if (clickFromHTML) {
      this.setValueInFormControl('productId', null)
    }
    if (this.f['assignmentType'].value == 'Vendor Product') {
      this.setValueInFormControl('assignmentType', '')
    }
    if (this.f['serviceTypeId'].value.length == 1) {
      this.loadingProducts = true;
      this._unsubscribeGetProducts.next(null);

      let data = {
        "industryId": null,
        "serviceId": null,
        "serviceTypeId": this.f['serviceTypeId'].value[0],
        "productId": null,
        "productTypeId": null
      }
      this.locationService.getProductList(data).pipe(takeUntil(this._unsubscribeGetProducts)).subscribe((data) => {
        if (data.Success) {
          this.products = data.Data.$values;
          if (data.Data.$values.length) {
            this.products.unshift({ Id: null, Name: 'Select Product...' });
          }
          this.loadingProducts = false;
        } else {
          this.loadingProducts = false;
          this.products = [];
        }
      }, error => {
        this.products = [];
        this.loadingProducts = false;
      });
    }
  }
  ngOnDestroy(): any {
    this._unsubscribeCustomer.next(null);
    this._unsubscribeCustomer.complete();
    this._unsubscribeGetCompanies.next(null);
    this._unsubscribeGetCompanies.complete();
    this._unsubscribeCC.next(null);
    this._unsubscribeCC.complete();
    this._unsubscribeServiceTypes.next(null);
    this._unsubscribeServiceTypes.complete();
    this._unsubscribeGetProducts.next(null);
    this._unsubscribeGetProducts.complete();
    this._unsubscribePeople.next(null);
    this._unsubscribePeople.complete();
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribeInvenotry.next(null);
    this._unsubscribeInvenotry.complete();
    this._unsubscribeDetail.next(null);
    this._unsubscribeDetail.complete();
    this._unsubscribeCostCenterS.next(null);
    this._unsubscribeCostCenterS.complete();
    this._unsubscribeApproverDropdown.next(null);
    this._unsubscribeApproverDropdown.complete();
  }

  get f() {
    return this.structureForm.controls;
  }
}
