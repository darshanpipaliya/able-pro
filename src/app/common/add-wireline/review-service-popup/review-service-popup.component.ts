import { AfterViewInit, Component, Inject, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';


import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AttributeInputRender } from './attribute-input.component';
import * as _ from 'lodash';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from '../../error-warning-popup/error-warning-popup.component';
import { WirelineService } from 'src/app/services/wireline.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
@Component({
  selector: 'app-review-service-popup',
  templateUrl: './review-service-popup.component.html',
  styleUrls: ['./review-service-popup.component.scss'],
  imports: [
    SharedModule
  ]
})
export class ReviewServicePopupComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('attributeCell') attributeCell: TemplateRef<any>;

  addServiceAttributeForm: any;
  data: any;
  getAttributesData: any;
  getInventoryFormData: any;
  submitted: boolean = false;
  gridApi: any;
  gridColumnApi: any;
  rowData:any = [];
  checkedRowData:any = [];
  private _unsubscribe: Subject<any> = new Subject<any>();
  stopSpinner: any = false;
  attributeData: any;
  public saveButtonLoader: Boolean = false;
  checkedData: any;
  checkedAttr:any = [];

  public selectedAttribute: any = [];
  columnDefs: any;

  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatFilter: true,
    flex: 1,
  };

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

  onCellValueChangedEventForCL(data: any) {
    this.attributeData['serviceTypeAttributeDescriptions'][data.data.Id] = data.value;
  }

  saveAttribute() {
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
        if (this.attributeData && this.attributeData.serviceTypeAttributeDescriptions) {
          this.saveButtonLoader = true;
          this.selectedAttribute = _.sortedUniq(this.selectedAttribute);
          this.attributeData['checkedData'] =this.selectedAttribute;
          this.dialogRef.close(this.attributeData);
        }
      // }
    }
  }

  onSelectionChangedEvent(event: any) {
    this.checkedData = event;
    let map: any = {};
    event.map((obj: any) => {
      map[obj.AttributeId] = obj.attribute_value ? obj.attribute_value : null;
    });
    const data = {
      checkedData: event,
      inventoryId: this.data.InventoryId,
      vendorProductInventoryId: this.data.VendorProductInventoryId,
      serviceTypeAttributeDescriptions: map
    }

    this.attributeData = data;
  }

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

  constructor(private _formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<ReviewServicePopupComponent>,
    private wirelineService: WirelineService, public dialog: MatDialog) {
    this.data = data.editedData;
    this.getAttributesData = data.attributesData;
    this.getInventoryFormData = data.formData;
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  ngOnInit(): void {
    this.setServiceAttributeForm();
    this.getAttributes();
  }

  getAttributes() {
    let filterData: any = {};
    filterData['serviceTypeId'] = this.getInventoryFormData['ServiceTypeId'];
    this.stopSpinner = false;
    this.wirelineService.addServiceTypeAttributes(this.data['VendorProductInventoryId'], filterData)
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


  isCheckedManually($event: any) {
    this.rowData.forEach((node: any) => {
      const d = $event.some((r: any) => r.Id === node.Id);
      node['isChecked'] = d;
    });
  }

  setSelected() {
    this._unsubscribe.next(null);
    this.wirelineService.getServicetypeattributes(this.getInventoryFormData.ServiceTypeId).pipe(takeUntil(this._unsubscribe)).subscribe(result => {
      this.rowData = result.Data.$values;
      this.rowData.forEach((node: any) => {
        const d = this.checkedRowData.some((r:any) => r.AttributeId === node.AttributeId);
        node['isChecked'] = d;
        node['attribute_value'] = this.checkedRowData.find((r:any)=> r.AttributeId === node.AttributeId)?.AttributeDescription;
      });
      this.rowData.forEach((ele: any, i: any) => {
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

  setServiceAttributeForm() {
    this.addServiceAttributeForm = this._formBuilder.group({
      serviceNumber: new FormControl(this.data?.ServiceNumber ? this.data.ServiceNumber : ""),
      parentServiceNumber: new FormControl(''),
      status: new FormControl(this.data.InventoryStatusCode),
      vendorProduct: new FormControl(this.getInventoryFormData.VendorProductTypeName),
      service: new FormControl(this.getInventoryFormData?.ServiceName),
      serviceType: new FormControl(this.getInventoryFormData?.ServiceTypeName ? this.getInventoryFormData?.ServiceTypeName : this.data.ServiceType),
      product: new FormControl(this.getInventoryFormData.ProductName),
      productType: new FormControl(this.getInventoryFormData.ProductTypeName),
      chargecodeName: new FormControl(this.data.ChargeCodeName),
      chargecodeType: new FormControl(this.data.ChargeCodeTypeName),
      chargeType: new FormControl(''),
      chargeCodeOccurance: new FormControl(''),
      VendorProductDescription: new FormControl(this.getInventoryFormData.Description),
      attributes: this._formBuilder.array([])
    });
    setTimeout(() => {
      // this.getAttributes(0);
    }, 1000);
  }

  onAgGridReady() {

  }

  get f() {
    return this.addServiceAttributeForm.controls;
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
    this.dialogRef.close(true);
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
    // if (this.attributeData.serviceTypeAttributeDescriptions) {
    //   this.attributeData['serviceTypeAttributeDescriptions'][row.AttributeId] = data.target.value;
    // }
    // if(this.checkedData) {
    //  let matchedRecord =  this.checkedData.find((x) => x.AttributeId == row.AttributeId);
    //   matchedRecord.attribute_value = data.target.value;
    // }
  }

  ngOnDestroy() {
    this._unsubscribe.next(null);
    this._unsubscribe.complete();
  }
}
