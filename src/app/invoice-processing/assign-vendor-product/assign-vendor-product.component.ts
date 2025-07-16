import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { SortEvent, TreeNode } from 'primeng/api';
import { VendorProductDialogComponent } from './vendor-product-dialog/vendor-product-dialog.component';
import { checkIsValueExists, isValueExist, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { AddProductComponent } from 'src/app/management/add-product/add-product.component';
import { AddVendorProductComponent } from 'src/app/management/add-vendor-product/add-vendor-product.component';
import { filterOptionsText, filterOptionsNumber, filterOptionsDate, onChangeEndDate } from 'src/app/services/common-p-table';
import { LocationService } from 'src/app/services/location.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

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
  selector: 'app-assign-vendor-product',
  templateUrl: './assign-vendor-product.component.html',
  styleUrls: ['./assign-vendor-product.component.scss'],
  imports: [SharedModule, PrimgModule],
  providers: [WirelineService, SandBoxService]
})
export class AssignVendorProductComponent implements OnInit {
  addProductForm: FormGroup;
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  public loadingServices: any = [];
  isProductFormSubmit: boolean = false;
  vendorProductDetails = [];
  serviceData: any;
  saveButtonDisabled = false;
  showMessage = false;
  sbRemove: any = [];
  dialogRef: any;

  @Input() inventoryData: any;
  @Input() sandBoxGridRowData: any;
  @Input() inventoryPayload: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;
  @Input() headerCheckboxData: any;

  selectedVendor: any;
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('tooltipTexttop') tooltipTexttop: TemplateRef<any>;

  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();

  private _unsubscribeService: Subject<any> = new Subject<any>();
  private _unsubscribeVendorProductTypesDetails: Subject<any> = new Subject<any>();
  private _unsubscribeGetServiceProduct: Subject<any> = new Subject<any>();
  originalFiles: any;
   types = ['Product', 'Feature', 'Usage', 'Equipment'];
  selectedDetail: any = [];
  selectedRadio: any;
  viewNEditAddButton = rolePermission(['SuperTEMManager']);

  /* p-tree Table start */
  @Output() isBillingAccountExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

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
  expandedNode: TreeNode | null = null;
  lastNode: TreeNode | null = null;

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

  sortField: string = '';
  sortOrder: number = 1;

  selectedFiles!: any[];

  filesColumns: any = []

  selectedOption1: any = '';
  selectedOption2: any = '';

  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';

  radiobutton: any = '';
  finalAllDetailArr: any;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  public getDataPath: any = (data: any) => data.dataPath;

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;
  public exportAccounts: any;
  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu?.el?.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu.hide();
    }
  }
  /* p-tree Table end */
  private _unsubscribeAssignment: Subject<any> = new Subject<any>();

  constructor(public dialog: MatDialog, private fb: FormBuilder, private locationService: LocationService,
    private sandboxService: SandBoxService,
    private wirelineService: WirelineService) {
    this.addProductForm = fb.group({
      description: new FormControl(''),
      productTypeId: new FormControl('', [Validators.required]),
      serviceTypeId: new FormControl('', [Validators.required]),
      serviceId: new FormControl('', [Validators.required]),
      productId: new FormControl('', [Validators.required]),
      vendorProductTypeId: new FormControl('', [Validators.required]),
    })
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialogtop(): void {
    const dialogRef = this.dialog.open(this.tooltipTexttop, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  onBtnClick1(e: { SBChargeDetailId: any; }) {

    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-triangle",
      iconClass: "text-c-blue f-70",
      okBtnName: 'Do not remove Association',
      closeBtnName: 'Remove Association',
      message: 'Removing a Charge Code from this list will: Remove the Charge Code from the Parent/child relationship and from the Vendor Product if it was a part of the Product and it will need to be assigned separately after removal. Do you want to proceed?' //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      width: '600px',
      panelClass: 'error-warning', data: errorData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.sbRemove.push(e.SBChargeDetailId);

        if (this.selectedRadio['SBChargeDetailId'] === e.SBChargeDetailId) {
          this.selectedRadio = {};
        }

        this.files = this.files.filter((x) => x.data.SBChargeDetailId !== e.SBChargeDetailId)
        this.selectedDetail = this.selectedDetail.filter((x: { SBChargeDetailId: any; }) => x.SBChargeDetailId !== e.SBChargeDetailId)

        this.files.forEach(element => {
          this.selectedDetail.forEach((ele: { SBChargeDetailId: any; }) => {
            if (element.data.SBChargeDetailId === ele.SBChargeDetailId) {
              element.data['isChecked'] = true;
            }
          });
        });
      }
    });
  }
  radioSelect(e: { SBChargeDetailId: any; }) {
    // First unselect all radios
    this.files.forEach(file => {
      if (file.data) {
        file.data.parent = false;
      }
    });

    // Find and select the clicked radio
    const indexFile = this.files.findIndex((item) => item.data.SBChargeDetailId === e.SBChargeDetailId);
    if (indexFile !== -1) {
      this.files[indexFile].data.parent = true;
    }

    this.selectedRadio = e;
    const exists = this.selectedDetail.some((item: { SBChargeDetailId: any; }) => item.SBChargeDetailId === e.SBChargeDetailId);
    this.files[indexFile]['data']['isChecked'] = true;
    if (!exists) {
      this.selectedDetail.push(e);
    }

    // Force change detection
    this.files = [...this.files];
  }
  onSelectionChanged(obj: { SBChargeDetailId: any; }) {
    const index = this.selectedDetail.findIndex((item: { SBChargeDetailId: any; }) => item.SBChargeDetailId === obj.SBChargeDetailId);
    const exists = this.selectedDetail.some((item: { SBChargeDetailId: any; }) => item.SBChargeDetailId === obj.SBChargeDetailId);
    if (!exists) {
      this.selectedDetail.push(obj);
       if(index !== -1)
           this.selectedDetail[index]['isChecked'] = true;
    } else {
      this.selectedDetail.splice(index, 1);
    }
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

    this.setColumnDefs();
    this.getServiceProduct();
    this.getServices();
    this.getVendorProduct();
    this.loadNodes(this.pTableContain, true);

    let data1 = _.map(this.inventoryData, (e: any) => { return e.VendorProductTypeId });
    data1 = _.filter(data1, id => id !== null);
    let c = _.sortedUniq(data1);
    if (c.length == 1) {
      this.setValueInFormControl('vendorProductTypeId', c[0]);
      this.getServiceProduct(false);
    }
  }

 
  getCommonVendorBillingAlias(data: any[]): string | null {
    if (!data?.length) return null;
    const firstAlias = data[0].VendorBillingAlias;
    return data.every(item => item.VendorBillingAlias === firstAlias) ? firstAlias : '(Multiple VBAs)';
  }
  
  get vendorAliasCombined(): string {
    const name = this.inventoryData?.[0]?.VendorAccountName || '';
    const alias = this.getCommonVendorBillingAlias(this.inventoryData) || '';
    return name && alias ? `${name}/${alias}` : name || alias || '';
  }
  getServiceProduct(callGetInventory = true) {
    if (this.addProductForm.value.vendorProductTypeId) {
      const findObj: any = this.vendorProductDetails.find((a: any) => a.Id === this.addProductForm.value.vendorProductTypeId);
      if (findObj && findObj.Description) {
        this.setValueInFormControl('description', findObj.Description);
      }
      this._unsubscribeGetServiceProduct.next(null);
      this.wirelineService.vendorProductTypeDetail(this.addProductForm.value.vendorProductTypeId).pipe(takeUntil(this._unsubscribeGetServiceProduct)).subscribe((data) => {
        if (data.Data && data.Success) {
          this.serviceData = data.Data;
          this.sbRemove = [];
          this.setValueInFormControl('serviceId', this.serviceData.ServiceId);
          this.callService(false);
          this.setValueInFormControl('serviceTypeId', this.serviceData.ServiceTypeId);
          this.callServiceType(false);
          this.setValueInFormControl('productId', this.serviceData.ProductId);
          this.callProduct(false);
          this.setValueInFormControl('productTypeId', this.serviceData.ProductTypeId);
          this.form.get('serviceId')?.updateValueAndValidity();
          this.form.get('serviceTypeId')?.updateValueAndValidity();
          this.form.get('productId')?.updateValueAndValidity();
          this.form.get('productTypeId')?.updateValueAndValidity();

        }
      });
      if (callGetInventory) {

        this.selectedDetail = [];
        this.selectedRadio = {}
        this.loadNodes(this.pTableContain, true);
      }
    }
  }

  setValueInFormControl(key: string, value: any) {
    this.f[key].setValue(value);
  }
  getVendorProduct() {
    let data = {
      "industryId": null,
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null,
      "vendorAccountId": this.inventoryData[0]?.VendorAccountId
    }
    this._unsubscribeVendorProductTypesDetails.next(null);
    this.locationService.getVendorProductTypeList(data).pipe(takeUntil(this._unsubscribeVendorProductTypesDetails)).subscribe((data: any) => {
      if (data && data.Data.$values) {
        this.vendorProductDetails = data.Data.$values;
      } else {
        this.vendorProductDetails = [];
      }
    }, error => {
      this.vendorProductDetails = [];
    });

  }
  callService(allArrayDoBlank = true) {
    if (allArrayDoBlank) {
      this.serviceTypes = [];
      this.products = [];
      this.productTypes = [];
      this.addProductForm.controls['serviceTypeId'].setValue('');
      this.addProductForm.controls['productId'].setValue('');
      this.addProductForm.controls['productTypeId'].setValue('');
    }
    this.locationService.getServiceServicetypes(this.addProductForm.value.serviceId).subscribe((data) => {
      if (data.Success) {
        this.serviceTypes = data.Data.$values;
      }
    }, error => {
      if (error.status === 404) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No records found with the selected service'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  callServiceType(allArrayDoBlank = true) {
    if (allArrayDoBlank) {
      this.products = [];
      this.productTypes = [];
      this.addProductForm.controls['productId'].setValue('');
      this.addProductForm.controls['productTypeId'].setValue('');
    }
    this.locationService.getProductsServiceType(this.addProductForm.value.serviceTypeId).subscribe((data) => {
      if (data.Success) {
        this.products = data.Data.$values;
      }
    }, error => {
      if (error.status === 404) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No records found with the selected service type'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }
  callProduct(allArrayDoBlank = true) {
    if (allArrayDoBlank) {
      this.productTypes = [];
    }
    // this.addProductForm.controls['productTypeId'].setValue('');
    this.locationService.getProducttypes(this.addProductForm.value.productId).subscribe((data) => {
      if (data.Success) {
        this.productTypes = data.Data.$values;
      }
    }, error => {
      if (error.status === 404) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No records found with the selected product'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }
  getServices() {

    this.loadingServices = true;
    this._unsubscribeService.next(null);
    this.locationService.getServices().pipe(takeUntil(this._unsubscribeService)).subscribe((data: any) => {
      if (data) {
        this.services = data.Data.$values;
        this.loadingServices = false;
      } else {
        this.services = [];
        this.loadingServices = false;
      }
    }, error => {
      this.services = [];
      this.loadingServices = false;
    });
  }
  get f() : any {
    return this.addProductForm.controls;
  }

  get form() : any {
    return this.addProductForm;
  }
  addProduct() {

    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        colseButton: true,
        selected: this.sandBoxGridRowData
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
        selected: this.sandBoxGridRowData,
        previousTableRowData: this.inventoryData
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getVendorProduct();
      this.selectedVendor = result;
    });

  }

  saveChargeCodeGroupAndVendorProduct() {

    if (this.addProductForm.invalid) {
      this.isProductFormSubmit = true;
      return;
    }

    if (!this.selectedRadio) {
      this.showMessage = true
      return;
    }

    let rowDataFetch: any = [];
    let sbChargeDetailIds: any = [];
    let getGroupIds: any = [];
    this.files.forEach((element: any) => {
      if (element.data.GroupId !== null)
        getGroupIds.push(element.data.GroupId);
      rowDataFetch.push({
        "ParentChargeCodeId": element.data?.ParentChargeCodeId ?? null,
        "chargeCodeId": element.data.chargeCodeId,
        "primaryChargeCode": element.data.SBChargeDetailId == this.selectedRadio.SBChargeDetailId ? true : false,
        "inventoryId": element.data.InventoryId,
        "billingAccountHierarchyId": element.data.BillingAccountHierarchyId,
        "vendorProductInventoryId": element.data.ParentVendorProductInventoryId,
        "childInventoryId": element.data.ChildInventoryId,
        "sbChargeDetailId": element.data.SBChargeDetailId,
        "IsNeedToAdd": this.types.includes(element.data.ChargeCodeTypeName)
      });
      sbChargeDetailIds.push(element.data.SBChargeDetailId);
    });

    let a: any = _.sortedUniq(getGroupIds);
    if (a.length === 1) {
      a = a[0];
    } else {
      a = null;
    }

    rowDataFetch.forEach((el: { sbChargeDetailId: any; required: boolean; }) => {
      this.selectedDetail?.forEach((element: { SBChargeDetailId: any; }) => {
        if (element.SBChargeDetailId == el.sbChargeDetailId || el.sbChargeDetailId == this.selectedRadio.SBChargeDetailId) {
          el.required = true;
        }
      });
    });
    rowDataFetch.forEach((el: { required: boolean; }) => {
      if (!el.required) {
        el.required = false;
      }
    });

    const data = {
      // "vendorBillingAliasId": this.files[0].data.VendorBillingAliasId,
      "VendorAccountId": this.inventoryData[0]?.VendorAccountId,
      "chargeCodes": rowDataFetch,
      "groupId": a,
      "isParentChange": true,
      "vendorProductInventoryDescription": null,
      "vendorProductTypeId": this.addProductForm.value.vendorProductTypeId,
      "sbInvoiceId": this.sandBoxGridRowData.SBInvoiceId,
      "sbChargeDetailIds": sbChargeDetailIds,
      "fromParentDifferentAccountTab": false,
      "sbChargeDetailIdsToRemove": [...new Set(this.sbRemove)]
    };
    rowDataFetch.forEach((x: any, index: any) => {
      if (this.sbRemove.includes(x.sbChargeDetailId)) {
        rowDataFetch.splice(index, 1)
      }
    });
    if (this.selectedRadio) {

      if (checkIsValueExists(this.selectedRadio?.data?.SBChargeDetailId)) {
        this.selectedRadio = data;
      }
      let value = this.selectedDetail.some((item: { SBChargeDetailId: any; }) => item.SBChargeDetailId === this.selectedRadio.SBChargeDetailId);
      if (value == undefined || value == false) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'A Parent charge code must be selected as required'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {
        this.saveProduct(data);
      }
    }


  }

  saveProduct(data: { [x: string]: any; VendorAccountId?: any; chargeCodes: any; groupId?: any; isParentChange?: boolean; vendorProductInventoryDescription?: null; vendorProductTypeId?: any; sbInvoiceId?: any; sbChargeDetailIds?: any; fromParentDifferentAccountTab?: boolean; sbChargeDetailIdsToRemove?: unknown[]; }) {
    this.saveButtonDisabled = true;
    let errorData: any = {
      messgeType: "error",
      title: "Please wait",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: 'Hold the phone while we check for Vendor Products!',
      hideOkbtn: true
    };
    this.dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    this.sandboxService.chargeCodeGroupAndVendorProduct(data).pipe().subscribe((res: any) => {
      this.dialogRef.close();
      if (res.Success) {
        let matchVal: boolean;
        this.saveButtonDisabled = false;
        this._unsubscribeAssignment.next(null)
        this.sandboxService.vpaBySBInvoiceInventory(this.inventoryPayload).pipe(takeUntil(this._unsubscribeAssignment))
          .subscribe((data: any) => {
            if (data.Success) {
              matchVal = _.every(data.Data.$values, (x: any) => x.NewChargecode == 'No');
            }
            
            if(data?.Other?.NeedToCheckNextStep) {
              this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
              })
            }
          });
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: res.Message
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          this.loadNodes();
          if (matchVal) {
            this.redirectTab.emit({ index: 0, rowData: '' });
          } else {
            this.redirectTab.emit({ index: 1, rowData: '' });
          }
        });
      } else {

        if (res?.Data?.ValidationKey == 'SameGroupWithDifferentVP' || res?.Data?.ValidationKey == 'SameGroupWithSameVP') {

          // const names: any = this.vendorProductDetails
          //   .filter((item: any) => IdsList.includes(item.Id))
          //   .map((item: any) => item.Name);
          let list = {
                popupMessage: res.Message,
                ids: res.Data.VendorProductTypeIds.$values,
                ValidationKey: res?.Data?.ValidationKey

            }
          const dialogRef = this.dialog.open(VendorProductDialogComponent, {  width: '900px', data: list });
          dialogRef.afterClosed().subscribe(result => {
            if(!isValueExist(result)) {
              this.saveButtonDisabled = false;
            } else {
              let primarySet = false;
            
            const updatedData = data.chargeCodes.map((item: { ParentChargeCodeId: any; chargeCodeId: any; }) => {
              let match;
                if(checkIsValueExists(item.ParentChargeCodeId)) {
                  match = result.find((m: { ChargeCodeId: any; }) => m.ChargeCodeId === item.ParentChargeCodeId);
                } else {
                  match = result.find((m: { ChargeCodeId: any; }) => m.ChargeCodeId === item.chargeCodeId);
                }
                  let primaryChargeCode = false;
                  if (match && match.PrimaryChargeCode && !primarySet) {
                    primaryChargeCode = true;
                    primarySet = true; // only allow first true
                  }

                  return {
                    ...item,
                    primaryChargeCode,
                    required: match ? match.RequiredChargeCode : false
                  };
                  });
                  data['chargeCodes'] = updatedData;
                  data['vendorProductTypeId'] = res.Data.VendorProductTypeIds.$values[0].VendorProductTypeId;
                  this.saveProduct(data);
                
                }
          });

        } else {
          this.saveButtonDisabled = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: res.Message
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
      }
      if(res?.Other?.NeedToCheckNextStep) {
        this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
        })
      }
    })
  }

  ngOnDestroy() {
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
    this._unsubscribeVendorProductTypesDetails.next(null);
    this._unsubscribeVendorProductTypesDetails.complete();
    this._unsubscribeGetServiceProduct.next(null);
    this._unsubscribeGetServiceProduct.complete();

    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
  }


  /* p-table start */
  ngAfterViewInit() {
    const scrollableBody = this.treeTable.el.nativeElement.querySelector(
      '.p-treetable-scrollable-body'
    );

    if (scrollableBody) {
      scrollableBody.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  setCols() {
    const createColumn = (parent: number, width: string, isChildren: boolean, type: string, header: string, field: string, childHeader: string, columnGroupShow = 'close', colspan = 1, parentWidth = 150, isParentVisible = true, displayCheckboxColumns = true, isToggle = true) => ({
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
      // Parent Group
      createColumn(1, '90px', true, '', 'Parent', 'Parent', ''),
      createColumn(2, '100px', true, '', 'Required', 'Required', ''),

      // Inventory Group
      createColumn(3, '165px', true, 'text', 'Inventory', 'BillingId', 'Billing ID'),
      createColumn(3, '120px', false, 'text', '', 'ParentVendorProductInventoryNumber', 'Parent', 'open'),
      createColumn(3, '165px', false, 'text', '', 'ParentAccountNumber', 'Parent Account', 'open'),

      // Account Group
      createColumn(4, '200px', true, 'text', 'Account', 'MainAccountNumber', 'Main Account Number'),
      createColumn(4, '200px', false, 'text', '', 'SubAccountNumber', 'Sub Account Number', 'open'),

      // Charge Code Group
      createColumn(5, '189px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name', 'close'),
      createColumn(5, '150px', false, 'text', '', 'ChargeCode', 'Charge Code', 'open'),
      createColumn(5, '182px', false, 'text', '', 'ChargeCodeTypeName', 'Charge Code Type', 'open'),
      createColumn(5, '170px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Code Occurrence', 'open'),

      // Product Group
      createColumn(6, '180px', true, 'text', 'Product', 'VendorProductTypeName', 'Vendor Product', 'close'),
      createColumn(6, '117px', false, 'text', '', 'ServiceName', 'Service', 'open'),
      createColumn(6, '148px', false, 'text', '', 'ServiceTypeName', 'Service Type', 'open'),
      createColumn(6, '121px', false, 'text', '', 'ProductName', 'Product', 'open'),
      createColumn(6, '152px', false, 'text', '', 'ProductTypeName', 'Product Type', 'open'),
      createColumn(6, '152px', false, 'text', '', 'IndustryName', 'Industry', 'open'),

      // Charge Group
      createColumn(7, '150px', true, 'numberFilter', 'Charge', 'charge', 'Charge', 'close'),


      createColumn(8, '187px', true, 'text','Address', 'ChargeDetailAddress1', 'Address One', 'close'),
      createColumn(8, '152px', false, 'text', '', 'LocationCiy', 'City', 'open'),
      createColumn(8, '152px', false, 'text', '', 'LocationState', 'State', 'open'),
      createColumn(8, '152px', false, 'text', '', 'LocationZipCode', 'Zip', 'open'),

      // Additional Information Group
      createColumn(9, '190px', true, 'numberFilter', 'Additional Info', 'DistributionEventId', 'Distribution Event', 'close'),
      createColumn(9, '250px', false, 'numberFilter', '', 'DistributionAmountDistributed', 'Original Distribution Amount', 'open'),

      // // Remove Group
      createColumn(10, '100px', true, '', 'Remove', 'Remove', ''),
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
      this.loadNodes(this.pTableContain);
    }
  }

  isRowDisabled(rowData: any): boolean {
    return !this.types.includes(rowData.ChargeCodeTypeName);
  }

  checkIfAllRowsDisabled(): boolean {
    return this.files.every((element: any) => !this.types.includes(element.data.ChargeCodeTypeName));
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

  closeSidebar() {
    this.sidebarVisible = false;
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  dropdownOptionSelected() {
    navigator.clipboard.writeText(this.selectedNode).then(
      () => {
      },
      (err) => {
      }
    );

  }

  loadNodes(event?: { first: number; } | undefined, allOptionsClear = false, initCall = false, productId ?: any) {
  
      let data = _.map(this.inventoryData, (e: any) => { return e.SBChargeDetailId });

      this.loading = true;
  
  
      // Initialize pagination if not set
      this.isApiAlerdayCall = true;
      this.pTableContain.first = this.pTableContain?.first || 1;
      if (allOptionsClear) {
        this.pTableContain.first = 1;
      }
      // Build the data request object with optional chaining
  
      // Ensure finalFilterdArr is initialized if it's not already
      if (!this.finalFilterdArr) {
        this.finalFilterdArr = {};
      }
  
      // Ensure advanceFilter is initialized as an array
      if (!Array.isArray(this.finalFilterdArr['advanceFilter'])) {
        this.finalFilterdArr['advanceFilter'] = [];
      }
  
      this.finalFilterdArr['advanceFilter'] = Array.from(
        new Map(this.finalFilterdArr['advanceFilter'].map((item: any) => [JSON.stringify(item), item])).values()
      );
  
      let passInv: any = {
        vendorProductTypeId: this.addProductForm.value.vendorProductTypeId ? this.addProductForm.value.vendorProductTypeId : this.inventoryData[0].VendorProductTypeId,
        sbChargeDetailIds: this.headerCheckboxData ? null : data,
        InventorySelectionType: "MainAccountNumber",
        // ...this.finalFilterdArr,
        // ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      };
  
      if(this.headerCheckboxData) {
        passInv['from5ASelectAll'] = true;
        passInv['from5ASBInvoiceInventory'] = {...this.inventoryPayload};
      }
      this.finalAllDetailArr = passInv;
      this._unsubscribeGRid.next(null);
  
      // Clear files if needed
      if (allOptionsClear) this.files = [];
  
      if(productId) {
        passInv['vendorProductTypeId'] = productId;
      }
      this.sandboxService.addVPChargeCodeGroups(this.sandBoxGridRowData.SBInvoiceId, passInv)
  
        .pipe(takeUntil(this._unsubscribeGRid))
        .subscribe(
          response => this.handleResponse(response, allOptionsClear, initCall, productId),
          () => this.handleError()
        );
      // }
  }

  // Handle the response for loadNodes
  handleResponse(response: Object, allOptionsClear: boolean, initCall: boolean, productId: any) {
    this.loading = false;
    this.totalRecords = (response as any).TotalCount;

    if ((response as any)?.Data?.$values?.length) {
      const resData = (response as any).Data.$values.map(this.extractDataAndLeaf.bind(this));

      if (productId) {
        this.files = [];  
      }
      this.files = allOptionsClear ? resData : [...this.files, ...resData];

      let vendorProductTypeIds = _.map(this.files, item => item.data.VendorProductTypeId);
      vendorProductTypeIds = _.filter(vendorProductTypeIds, id => id !== null);
      let uniqueIds = _.sortedUniq(vendorProductTypeIds);

      if(uniqueIds.length == 1 && !isValueExist(this.f['vendorProductTypeId'].value)) {
        this.setValueInFormControl('vendorProductTypeId', uniqueIds[0]);
        this.getServiceProduct(false);
      }

      this.originalFiles = JSON.parse(JSON.stringify(this.files));

      this.files.forEach((node: any) => {
        const d = node.data.RequiredChargeCode == true ? true : false;
        d === true ? this.selectedDetail.push(node.data) : '';
        const s = node.data.PrimaryChargeCode == true ? true : false;
        node['data']['isChecked'] = d;
        node['data']['parent'] = s;
      });
      this.originalFiles = JSON.parse(JSON.stringify(this.files));

      let matched = _.map(this.files, (x: any) => x.VendorProductTypeId);
      let a = _.sortedUniq(matched);
      if (a.length > 1 || !a.includes(null)) {
        let data = a.filter(function (val) { return val !== null; });
        let d = _.sortedUniq(data);
        if (initCall) {
          if (d.length == 1) {
             console.log('d',d);
            this.setValueInFormControl('vendorProductTypeId', d[0]);
            this.getServiceProduct(false);
          }
        }
      }

      this.selectedRadio = _.find(this.files, (x: any) => x.data.PrimaryChargeCode == true)?.data;

      this.isApiAlerdayCall = false;
      
       
      if (productId) {
        console.log('productId',productId);
        this.setValueInFormControl('vendorProductTypeId', productId );

        // this.saveChargeCodeGroupAndVendorProduct();
      }
    } else {
      this.files = [];
      this.isApiAlerdayCall = false;
    }

    this.files.length > 0 ? this.isBillingAccountExist.emit(true) : this.isBillingAccountExist.emit(false);
  }

  // Extract data and leaf status

  extractDataAndLeaf = (item: { HasParent: any; }) => {
    return {
      data: this.extractData(item),
      leaf: !item.HasParent,
    };
  }

  // Handle error case
  handleError() {
    this.loading = false;
    this.files = [];
  }


  // Helper method to extract data fields

  extractData(item: { [x: string]: any; }) {
    const fields = Object.keys(item);

    return fields.reduce((acc: any, field: any) => {
      acc[field] = item[field];
      return acc;
    }, {});
  }


  setColumnDefs() {

    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;

    _.map(this.cols, (x: any) => {
      if (x.isChildren) {
        i = i + 1;

        headerData.push({
          "Position": i,
          "Title": x.header
        });

      }

      childIndex = childIndex + 1;

      ChildHeaderData.push({
        "HeaderPosition": i,
        "Position": childIndex,
        "FieldName": x.field,
        "Title": x.childHeader,
        "isCurrency": x.field == 'TotalCurrentChargesDisplay' || x.field == 'PreviousBillBalanceDisplay' ? true : false
      });
    });

    this.exportAccounts = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Accounts",
      },
      ExportToExcel: true,
      IsTotalNeed: true,
      ...this.finalFilterdArr,
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
    };

    this.exportAccountData.emit(this.exportAccounts);
  }

  isEditable() {
    let isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    let isCompanyAdmin = this.locationService.isUserCompanyAdmin();
    let isCompanyManager = this.locationService.isUserCompanyManager();
    let isCompanyUser = this.locationService.isUserCompanyUser();
    if ((isCustomerAdmin || isCompanyAdmin || isCompanyManager || isCompanyUser)) {
      return false;
    }
    return true;

  }


  onRowDoubleClick(data: any) {
    let datas = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
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
    this.loadNodes(this.pTableContain, true, true);
  }

  
  
  sortFiles() {
    if (!this.sortField) return;
  
    this.files.sort((a, b) => {
      const valA = a.data[this.sortField];
      const valB = b.data[this.sortField];
  
      if (valA == null) return this.sortOrder * -1;
      if (valB == null) return this.sortOrder * 1;
  
      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * this.sortOrder;
      }
  
      return (valA < valB ? -1 : valA > valB ? 1 : 0) * this.sortOrder;
    });
  }

  onFilter(event: any) {
    const filters = event.filters; // Get the filters object
    for (const field in filters) {
      if (filters.hasOwnProperty(field)) {
      }
    }
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
      filterOptionType2: txtVal2 ? this.selectedOption2 : null,
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

    let data: any = {};

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

  onFilterChangedFirst(value: any, col: any) {
    if (value == '') {
      this.displayModal1 = false;
    } else {
      this.displayModal1 = true;
    }
  }

  filerOutSide(e: any, col: any, i: any) {

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

  showContextMenu(event: MouseEvent, menu: any, event1: any) {
    event.preventDefault(); // Prevent default context menu from showing
    this.selectedNode = event1;
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    menu.show(event); // Show the PrimeNG context menu
  }

  nodeSelect(e: { node: { isparent: any; parentid: number; label: any; }; }) {
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

  nodeUnselect(e: { node: { isparent: any; parentid: any; label: any; parent: { children: any; }; }; }) {

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

  customSort(event: any) {
    const { field, order } = event;
    this.sortTree(this.files, field, order);
  }
   
  sortTree(nodes: TreeNode[], field: string, order: number) {
    nodes.sort((a, b) => {
      const val1 = a.data[field];
      const val2 = b.data[field];
      let res = 0;
      if (val1 == null) res = -1;
      else if (val2 == null) res = 1;
      else if (typeof val1 === 'string') res = val1.localeCompare(val2);
      else res = val1 < val2 ? -1 : val1 > val2 ? 1 : 0;
      return order * res;
    });
   
    for (let node of nodes) {
      if (node.children) {
        this.sortTree(node.children, field, order);
      }
    }
  }

}
