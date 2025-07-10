import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { AttributeInputRender } from 'src/app/common/add-wireline/review-service-popup/attribute-input.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-add-service-type-attr-dialog-mobility',
  templateUrl: './add-service-type-attr-dialog-mobility.component.html',
  styleUrls: ['./add-service-type-attr-dialog-mobility.component.scss'],
  imports: [SharedModule, PrimgModule],
  providers: [DatePipe, CustomPipe, WirelineService]
})
export class AddServiceTypeAttrDialogMobilityComponent implements OnInit {
  @ViewChild('attributeCell') attributeCell: TemplateRef<any>;

  addServiceAttributeForm: any;
  submitted: boolean = false;
  data: any;
  getAttributesData: any;
  getInventoryFormData: any;
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private _unsubscribeGetAttributes: Subject<any> = new Subject<any>();
  public serviceTypes: any = [];
  public loadingServiceTypes: any = false;
  public saveButtonLoader: Boolean = false;
  isUserAccess: boolean = false;
  stopSpinner: any = false;
  columnDefs: any;
  private _unsubscribe: Subject<any> = new Subject<any>();
  public rowData: [];
  public checkedRowData:any = [];
  gridApi: any;
  gridColumnApi: any;
  public attributeData: any;
  public selectedData: any;
  public checkedAttribute: any;
  public selectedAttribute: any = [];
  checkedAttr:any = [];
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatFilter: true,
    flex: 1,
  };

  gridOptions = {
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    enableFilter: true
  };

  rowSelection: any = 'multiple';

  sideBar: any = {
    toolPanels: ['columns', 'filters'],
  };

  attributesArray:any = [];
  constructor(private locationService: LocationService, private dialogRef: MatDialogRef<AddServiceTypeAttrDialogMobilityComponent>, private wirelineService: WirelineService, private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: any, public dialog: MatDialog) {
    this.data = data.editedData;
    this.getAttributesData = data.attributesData;
    this.getInventoryFormData = data.formData;
    dialogRef.disableClose = true;
    this.getAttributesData.forEach((res: any) => {
      res.disableAttribute = true;
    })
  }

  ngOnInit(): void {
    this.isUserAccess = rolePermission(['CompanyUser', 'TEMUser']);

    this.getServiceTypes();
    this.setServiceAttributeForm();
    this.setAttributrData();
    this.getAttributeList();

  }
  ngAfterViewInit() {
    this.columnDefs = [
      {
        headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        editable: false,
        filter: false,
        suppressFilter: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        flex: 0,
      },
      {
        field: 'ServiceType.Name',
        headerName: 'Service Type',
        editable: false,
        filter: false,
        suppressFilter: true
      },
      {
        field: 'Attributes.Name',
        headerName: 'Attribute',
        editable: false,
        filter: false,

      },
      {
        field: 'attribute_value',
        headerName: 'Attribute Value',
        editable: false,
        filter: false,
        cellRendererFramework: AttributeInputRender,
        cellRendererParams: {
          ngTemplate: this.attributeCell
        }
      }];
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  getAttributeList() {
    const data: any = {};
    if ((this.getInventoryFormData && this.getInventoryFormData.ServiceTypeId !== this.data.ServiceTypeId)) {
      data['serviceTypeId'] = this.getInventoryFormData.ServiceTypeId;
    } else {
      data['serviceTypeId'] = this.data.ServiceTypeId;
    }


    this.stopSpinner = false;
    this.wirelineService.addServiceTypeAttributes(this.data['VendorProductInventoryId'], data)
      .subscribe(
        async (data: any) => {
          if (data && data.Data.$values) {
            this.checkedRowData = data.Data.$values;
            this.setSelected();
          } else {
          }
        },
        (error) => {
          this.stopSpinner = true;
        }
      );
  }

  onSelectionChangedEvent(event: any) {
    this.selectedData = event;
    let map: any = {};
    event.map((obj: any) => {
      map[obj.AttributeId] = obj.attribute_value ? obj.attribute_value : null;
    });
    const data = {
      inventoryId: this.data.InventoryId,
      vendorProductInventoryId: this.data.VendorProductInventoryId,
      serviceTypeAttributeDescriptions: map
    }

    this.attributeData = data;
  }

  isCheckedManually($event: any) {
    this.rowData.forEach((node: any) => {
      const d = $event.some((r: any) => r.Id === node.Id);
      node['isChecked'] = d;
    });
  }

  setSelected() {
    this._unsubscribe.next(null);
    let serviceTypeId;
    if ((this.getInventoryFormData && this.getInventoryFormData.ServiceTypeId !== this.data.ServiceTypeId)) {
      serviceTypeId = this.getInventoryFormData.ServiceTypeId;
    } else {
      serviceTypeId = this.data.ServiceTypeId;
    }

    this.wirelineService.getServicetypeattributes(serviceTypeId).pipe(takeUntil(this._unsubscribe)).subscribe(result => {
      this.rowData = result.Data.$values;
      const data = [...new Set([...this.checkedRowData, ...this.getAttributesData])];
      this.checkedAttribute = data;
      this.rowData.forEach((node: any) => {
        const d = data.some(r => r.AttributeId === node.AttributeId);
        node['isChecked'] = d;
        node['attribute_value'] = data.find(r => r.AttributeId === node.AttributeId)?.AttributeDescription;
      });
      this.rowData.forEach((ele: any, i) => {
        if (ele.isChecked) {
          this.selectedAttribute.push(ele)
          this.checkedAttr[i] = true;
        }
      });

      let map: any = {};
      this.selectedAttribute.map((obj: any) => {
        map[obj.AttributeId] = obj.attribute_value ? obj.attribute_value : null;
      });

      const updatedData = {
        inventoryId: this.data.InventoryId,
        vendorProductInventoryId: this.data.VendorProductInventoryId,
        serviceTypeAttributeDescriptions: map
      }

      this.attributeData = updatedData;

      this.stopSpinner = true;
    }, error => {
      this.stopSpinner = true;
    });
  }
  onHeaderSelectionChange(data: any) {
    if(data.checked) {
      this.selectedAttribute = _.cloneDeep(this.selectedAttribute);
      let map: any = {};
      this.selectedAttribute.map((obj: any) => {
        map[obj.AttributeId] = obj.attribute_value ? obj.attribute_value : null;
      });
      this.attributeData.serviceTypeAttributeDescriptions = map;
    } else {
      this.attributeData.serviceTypeAttributeDescriptions = {};
    }
  }
  getServiceTypes() {
    this.loadingServiceTypes = true;
    this.locationService.getServiceTypes().subscribe((data: any) => {
      if (data) {
        this.serviceTypes = data.$values;
        this.loadingServiceTypes = false;
      } else {
        this.serviceTypes = [];
        this.loadingServiceTypes = false;
      }
    }, error => {
      this.serviceTypes = [];
      this.loadingServiceTypes = false;
    });
  }
  setServiceAttributeForm() {
    this.addServiceAttributeForm = this._formBuilder.group({
      serviceNumber: new FormControl(this.data?.ServiceNumber ? this.data.ServiceNumber : ""),
      parentServiceNumber: new FormControl(''),
      status: new FormControl(this.data.InventoryStatusCode),
      vendorProduct: new FormControl(this.getInventoryFormData && this.getInventoryFormData.VendorProductTypeName ? this.getInventoryFormData.VendorProductTypeName : this.data.VendorProductTypeName),
      service: new FormControl(this.getInventoryFormData && this.getInventoryFormData.ServiceName ? this.getInventoryFormData?.ServiceName : this.data.Service),
      serviceType: new FormControl(this.getInventoryFormData && this.getInventoryFormData.ServiceTypeName ? this.getInventoryFormData?.ServiceTypeName : this.data.ServiceType),
      product: new FormControl(this.getInventoryFormData && this.getInventoryFormData.ProductName ? this.getInventoryFormData.ProductName : this.data.Product),
      productType: new FormControl(this.getInventoryFormData && this.getInventoryFormData.ProductTypeName ? this.getInventoryFormData.ProductTypeName : this.data.ProductType),
      chargecodeName: new FormControl(this.data.ChargeCodeName),
      chargecodeType: new FormControl(this.data.ChargeCodeTypeName),
      chargeType: new FormControl(''),
      chargeCodeOccurance: new FormControl(''),
      VendorProductDescription: new FormControl(this.getInventoryFormData && this.getInventoryFormData.Description ? this.getInventoryFormData.Description : this.data.Description),
      attributes: this._formBuilder.array([])
    });
  }

  addServiceAttributeRow() {
    (<FormArray>this.addServiceAttributeForm.get("attributes")).push(
      this.addAttributeGroup('')
    );
  }

  addAttributeGroup(data: any): FormGroup {
    return this._formBuilder.group({
      category: new FormControl(this.getInventoryFormData?.ServiceTypeId ? this.getInventoryFormData?.ServiceTypeId : this.data.ServiceTypeId),
      attribute: new FormControl(data.ServiceTypeAttributeId ? data.ServiceTypeAttributeId : '', [Validators.required]),
      attribute_value: new FormControl(data.AttributeDescription ? data.AttributeDescription : '', [Validators.required])
    })
  }

  get f() {
    return this.addServiceAttributeForm.controls;
  }

  get form() {
    return this.addServiceAttributeForm;
  }

  get attributes() {
    return this.addServiceAttributeForm.get('attributes') as FormArray;
  }

  addServiceTypeAttribute() {
    let matchRecord = _.every(this.selectedAttribute, (x: any) => isValueExist(x.attribute_value));
    if (!matchRecord) {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: 'Attribute Value is required to add a Service Type Attribute',
      };
      this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      return
    } else {
      // if (this.selectedAttribute == undefined || (this.selectedAttribute && this.selectedAttribute.length == 0)) {
      //   let errorData: any = {
      //     messgeType: "error",
      //     title: "Attention",
      //     titleClass: "text-c-blue",
      //     icon: "fas fa-exclamation-triangle",
      //     iconClass: "text-c-blue f-70",
      //     message: 'At least one Attribute must be selected.'
      //   }
      //   const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      //   dialogRef.afterClosed().subscribe(result => {
      //   });
      // }
      // else {
        if (this.data.ServiceTypeId && !this.getInventoryFormData) {
          this.saveButtonLoader = true;
          this._unsubscribeInventory.next(null);
          this.wirelineService.inventoryattributesAssign(this.attributeData).pipe(takeUntil(this._unsubscribeInventory)).subscribe((data: any) => {
            if (data.Success) {
              this.errorPopup(data);
              this.saveButtonLoader = false;
            } else {
              this.errorPopup(data);
              this.saveButtonLoader = false;
            }
          });
        }
        else if (this.data && this.getInventoryFormData) {
          let data: any = {};
          data['checkedData'] = this.selectedAttribute;
          this.dialogRef.close(data);
        } else {
          let data: any = {};
          data['checkedData'] = this.selectedAttribute;
          this.dialogRef.close(data);
        }
      // }
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
    this._unsubscribeGetAttributes.next(null);
    this._unsubscribeGetAttributes.complete();
  }

  getAttribute(row: any, data: any, fromCheckbox = false) {

    if (!fromCheckbox) {
      row['attribute_value'] = data.target.value;
      if (isValueExist(data.target.value)) {
        let a = _.find(this.selectedAttribute, (s: any) => s.Id === row.Id);
        if (isValueExist(a) && a.attribute_value !== data.target.value) {
          let index = this.selectedAttribute.findIndex((x: any) => x.Id == row.Id);
          this.selectedAttribute.splice(index, 1);
          this.selectedAttribute.push(row);
        } else {
          this.selectedAttribute.push(row);
        }
      }
      else {
        if (_.some(this.selectedAttribute, (x: any) => x.Id == row.Id)) {
          let index = this.selectedAttribute.findIndex((x: any) => x.Id == row.Id);
          this.selectedAttribute.splice(index, 1);
        }
      }
    } 
    this.selectedAttribute = _.cloneDeep(this.selectedAttribute);
    let map: any = {};
    this.selectedAttribute.map((obj: any) => {
      map[obj.AttributeId] = obj.attribute_value ? obj.attribute_value : null;
    });

    this.attributeData.serviceTypeAttributeDescriptions = map;

    // this.selectedData = event;

    // this.attributeData['serviceTypeAttributeDescriptions'][row.AttributeId] = data.target.value;
    // if(this.selectedData) {
    //   let matchedRecord =  this.selectedData.find((x) => x.AttributeId == row.AttributeId);
    //    matchedRecord.attribute_value = data.target.value;
    //  }
  }

  setAttributrData() {
    if (this.getAttributesData.length > 0) {
      this.getAttributesData.forEach((element: any) => {
        const setdata = this.addServiceAttributeForm.get('attributes') as FormArray;
        setdata.push(this.addAttributeGroup(element));
      });
    } else {
      const setdata = this.addServiceAttributeForm.get('attributes') as FormArray;
      setdata.push(this.addAttributeGroup(''));
    }
  }

  onAttributeChange(data: any) {
    this.attributesArray.forEach((res: any) => {
      if (res.AttributeId === data) {
        res.disableAttribute = true;
      }
    })
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
    this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    let isUpdate = this.getInventoryFormData && this.getInventoryFormData.ServiceTypeId ? false : true;
    this.dialogRef.close(isUpdate);
  }

}
