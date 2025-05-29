import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RetrievalService } from 'src/app/services/retrieval.service';
import { LocationService } from 'src/app/services/location.service';
import { rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { AddRetrievalFileComponent } from '../add-retrieval-file/add-retrieval-file.component';
import { ActionPopupComponent } from 'src/app/common/action-popup/action-popup.component';
import { CommonPTreeTableComponent } from "../../common/common-p-tree-table/common-p-tree-table.component";
import { api_list } from 'src/app/services/api-list';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { createColumn } from 'src/app/utils/column-utils';

@Component({
    selector: 'app-invoice-data-retrival',
    templateUrl: './invoice-data-retrival.component.html',
    styleUrls: ['./invoice-data-retrival.component.scss'],
    standalone:true,
    providers: [RetrievalService],
    imports: [CommonPTreeTableComponent, SharedModule, PrimgModule]
})
export class InvoiceDataRetrivalComponent implements OnInit {
    productService: any;

    @Input() type: any;
    @Output() recordEdited: EventEmitter<any> = new EventEmitter<any>();
    @Output() vendorDataEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() tableDataEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() invoiceretrievalMethodEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() dataSourcesEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() templateTypeEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() retrievalMethodEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() processingMethodEmit: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

    products: any;
    sizes: { name: string; class: string; }[];
    tableData: any = [];
    cols: any[];
    @Input() vendorData: any;
    @Input() vendorNewData: any;
    @Input() tableDataEmitData: any;
    @Input() invoiceretrievalMethodData: any;
    @Input() dataSourcesEmitData: any;
    @Input() retrievalMethodData: any;
    @Input() templateTypeEmitData: any;
    @Input() retrievalMethodEmitData: any;
    @Input() processingMethodEmitData: any;
    submitted: boolean = false;
    submitted1: boolean = false;
    showInvoiceUrl = false;
    showDataRetrivalUrl = false;
    private _unsubscribeDataSource: Subject<any> = new Subject<any>();
    private _unsubscribeRetrieval: Subject<any> = new Subject<any>();
    private _unsubscribeProcessing: Subject<any> = new Subject<any>();
    private _unsubscribeTemplate: Subject<any> = new Subject<any>();
    private _unsubscribeRMethod: Subject<any> = new Subject<any>();
    private _unsubscribeSave: Subject<any> = new Subject<any>();
    saveDisabled: boolean = false;
    isShowRequired = false;

    days = Array.from({ length: 31 }, (_, i) => i + 1);

    retrievalForm: FormGroup;
    dataRetrievalForm: FormGroup;
    viewNEdit = false;
    dataSources: any;
    invoiceretrievalMethod: any;
    templateType: any;
    retrievalMethod: any;
    processingMethod: any;
    pageType: string;

    editVendorForm: FormGroup;
    invoiceSource = [{
        text: 'Customer',
        id: 'Customer'
    },
    {
        text: 'Vendor',
        id: 'Vendor'
    }];

    sideBar: any = [];
    GridAPI = api_list.Vendor.Vendor.dataretrievalTemplate;
    refreshbutton: boolean = false;
    tableDataExist: any;
    exportData: any = {};
    selectedRecords: any[] = [];
    totalRecords: number = 0;
    loaderParent: any = false;
    ids: any = {};
    constructor(public dialog: MatDialog, private fb: FormBuilder,
        public retrievalService: RetrievalService, public locationService: LocationService) {
        
        this.retrievalForm = fb.group({
            invoiceSource: new FormControl('', [Validators.required]),
            invoiceRetrievalMethodId: new FormControl(null, [Validators.required]),
            invoiceRecieveDays: new FormControl(null, [Validators.required]),
            invoiceMissingDays: new FormControl(null, [Validators.required]),
            invoicePayByDays: new FormControl(null, [Validators.required]),
            invoiceRetrievalWebURL: new FormControl(null, [Validators.required]),
            invoiceRetrievalNote: new FormControl('', [Validators.maxLength(500)])
        });

        this.dataRetrievalForm = fb.group({
            dataRetrievalSourceId: new FormControl('', [Validators.required]),
            dataRetrievalMethodId: new FormControl(null, [Validators.required]),
            dataRecieveDays: new FormControl(null, [Validators.required]),
            dataMissingDays: new FormControl(null, [Validators.required]),
            dataRetrievalProcessingMethodId: new FormControl(null, [Validators.required]),
            dataRetrievalTemplateTypeId: new FormControl(null),
            dataRetrievalWebURL: new FormControl(null, [Validators.required]),
            dataRetrievalNote: new FormControl('', [Validators.maxLength(500)])
        });
    }

    ngOnInit(): void {
        this.ids = { id: this.vendorData.VendorAccountId };
        this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

        this.getDataRetrievalSource();
        this.getDataRetrievalTemplate();
        this.getDataRetrievalMethods();
        this.getDataRetrievalProcessingMethods();
        this.getInvoiceRetrievalMethods();

        this.retrievalMethod1();

        if (this.pageType == 'edit') {
            this.getDetail();
        }
        if (!this.viewNEdit) {
            this.retrievalForm.disable();
            this.dataRetrievalForm.disable();
        }

        this.setCols();
    }

    setCols() {
        let currentParent = 0;
        const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;
      
        this.cols = [];
      
        this.cols.push(createColumn(getParentId(true), '220px', true, 'text', 'Report Info', 'VendorReportName', 'Vendor Report Name'));
        this.cols.push(createColumn(currentParent, '200px', false, 'text', '', 'VendorFileName', 'Vendor File Name'));
        this.cols.push(createColumn(currentParent, '160px', false, 'text', '', 'ShortName', 'Short Name'));
        this.cols.push(createColumn(currentParent, '140px', false, 'text', '', 'RequiredValue', 'Required'));
        this.cols.push(createColumn(currentParent, '155px', false, 'text', '', 'Description', 'Description'));
        this.cols.push(createColumn(currentParent, '140px', false, 'text', 'File Info', 'FileType', 'File Type'));
        this.cols.push(createColumn(currentParent, '120px', false, 'text', '', 'InZip', 'In Zip?'));
        this.cols.push(createColumn(currentParent, '145px', false, 'icon', '', 'Notes', 'File Notes'));
        this.cols.push(createColumn(currentParent, '120px', false, 'text', '', 'Status', 'Status'));
      
        // Retrieval Group
        const retrievalParent = getParentId(true);
        this.cols.push(createColumn(retrievalParent, '200px', true, 'text', 'Retrieval', 'DataRetrievalMethod', 'Retrieval Method'));
      }

    ngOnChanges(changes: SimpleChanges) {
        if (changes && changes['type'] && changes['type'].currentValue) {
            this.pageType = changes['type'].currentValue;
        }
    }

    getDetail() {
        if (this.vendorNewData) {
            this.patchValue(this.vendorNewData);
        } else {
            this.locationService.geVendorById(this.vendorData.VendorAccountId).subscribe((res) => {
                if (res && res.Data) {
                    this.vendorDataEmit.emit(res.Data)
                    this.patchValue(res.Data);
                }
            })
        }
    }

    patchValue(data: any) {
        this.retrievalForm.patchValue({ 'invoiceSource': data.InvSource });
        this.retrievalForm.patchValue({ 'invoiceRecieveDays': data.InvReceiveDay });
        this.retrievalForm.patchValue({ 'invoiceMissingDays': data.InvMissingDay });
        this.retrievalForm.patchValue({ 'invoicePayByDays': data.InvPayByDay });
        this.retrievalForm.patchValue({ 'invoiceRetrievalMethodId': data.InvRetrievalMethodId });
        this.retrievalForm.patchValue({ 'invoiceRetrievalWebURL': data.InvoiceRetrievalMethodDto?.WebUrl });
        this.retrievalForm.patchValue({ 'invoiceRetrievalNote': data.InvoiceRetrievalMethodDto?.NoteText });
        this.dataRetrievalForm.patchValue({ 'dataRetrievalSourceId': data.DataRetrievalSourceId });
        this.dataRetrievalForm.patchValue({ 'dataRetrievalTemplateTypeId': data.DataRetrievalSettingDto?.DataRetrievalTemplateTypeId });
        this.dataRetrievalForm.patchValue({ 'dataRetrievalProcessingMethodId': data.DataRetrievalSettingDto?.DataRetrievalProcessingMethodId });
        this.dataRetrievalForm.patchValue({ 'dataRetrievalSourceId': data.DataRetrievalSettingDto?.DataRetrievalSourceId });
        this.dataRetrievalForm.patchValue({ 'dataRetrievalMethodId': data.DataRetrievalSettingDto?.DataRetrievalMethodId });
        this.dataRetrievalForm.patchValue({ 'dataRecieveDays': data.DataReceiveDay });
        this.dataRetrievalForm.patchValue({ 'dataMissingDays': data.DataMissingDay });
        this.dataRetrievalForm.patchValue({ 'dataRetrievalWebURL': data.DataRetrievalSettingDto?.WebUrl });
        this.dataRetrievalForm.patchValue({ 'dataRetrievalNote': data.DataRetrievalSettingDto?.NoteText });

        if (data.DataRetrievalSettingDto?.DataRetrievalProcessingMethodId == 90) {
            this.isShowRequired = true;
            this.dataRetrievalForm.controls['dataRetrievalTemplateTypeId']?.setValidators([Validators.required]);
        } else {
            this.isShowRequired = false;
            this.dataRetrievalForm.controls['dataRetrievalTemplateTypeId']?.clearValidators();
        }
        this.dataRetrievalForm.controls['dataRetrievalTemplateTypeId']?.updateValueAndValidity();
    }

    get f() {
        return this.retrievalForm.controls;
    }

    get f1() {
        return this.dataRetrievalForm.controls;
    }

    get form() {
        return this.retrievalForm;
    }
    copyForm(event: any) {
        if (event.target.checked) {
            this.dataRetrievalForm.patchValue({ 'dataRecieveDays': this.retrievalForm.value.invoiceRecieveDays })
            this.dataRetrievalForm.patchValue({ 'dataMissingDays': this.retrievalForm.value.invoiceMissingDays })
            this.dataRetrievalForm.patchValue({ 'dataRetrievalWebURL': this.retrievalForm.value.invoiceRetrievalWebURL })
            this.dataRetrievalForm.patchValue({ 'dataRetrievalNote': this.retrievalForm.value.invoiceRetrievalNote })
            if (this.retrievalForm.value.invoiceRetrievalMethodId !== null) {
                let matchRecord = this.invoiceretrievalMethod.find((x: { Id: any; }) => x.Id == this.retrievalForm.value.invoiceRetrievalMethodId).DisplayName
                let values = this.retrievalMethod.find((x: { DisplayName: any; }) => x.DisplayName == matchRecord);
                this.dataRetrievalForm.patchValue({ 'dataRetrievalMethodId': values.Id })
            }
        } else {
            // this.dataRetrievalForm.reset();
            this.dataRetrievalForm.get('dataRetrievalMethodId')?.reset();
            this.dataRetrievalForm.get('dataRecieveDays')?.reset();
            this.dataRetrievalForm.get('dataMissingDays')?.reset();
            this.dataRetrievalForm.get('dataRetrievalWebURL')?.reset();
            this.dataRetrievalForm.get('dataRetrievalNote')?.reset();
            this.dataRetrievalForm.enable();
        }
    }
    openTooltipDialog() {
        const dialogRef = this.dialog.open(this.tooltipText, {
            width: '900px',
            data: {
                colseButton: true,
            }
        });
    }
    saveRetrieval() {


        this.submitted = true;
        this.submitted1 = true

        if (this.retrievalForm.valid && this.dataRetrievalForm.valid) {
            this._unsubscribeSave.next(null);

            this.retrievalForm.value.invoiceRetrievalNote = this.retrievalForm.value.invoiceRetrievalNote ? this.retrievalForm.value.invoiceRetrievalNote.replace(/\n/g, ' ') : null;
            this.dataRetrievalForm.value.dataRetrievalNote = this.dataRetrievalForm.value.dataRetrievalNote ? this.dataRetrievalForm.value.dataRetrievalNote.replace(/\n/g, ' ') : null;

            let data = { ...this.dataRetrievalForm.value, ...this.retrievalForm.value };
            this.saveDisabled = true;
            this.retrievalService.saveInvoiceAndDataRetrieval(this.vendorData.VendorAccountId, data).subscribe((res) => {
                if (res) {
                    this.saveDisabled = false;
                    let isCheck = document.getElementById('isCheckCopy') as any;
                    if (isCheck?.checked) {
                        isCheck.checked = false;
                    }
                    let errorData: any = {
                        messgeType: 'error',
                        title: 'Attention',
                        titleClass: 'text-c-blue',
                        icon: 'fas fa-exclamation-circle',
                        iconClass: 'text-c-blue f-70',
                        message: res.Message,
                    };
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                        panelClass: 'error-warning',
                        data: errorData,
                    });
                    if (res.Success) {
                        this.recordEdited.emit(true);
                    }

                }
            })
        }
    }
    AddRetrievalFile() {
        const dialogRef = this.dialog.open(AddRetrievalFileComponent, {
            width: '900px',
            data: {
                vendorData: this.vendorData,
                type: 'Add'
            },
            disableClose: true
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.refreshbutton = true;
        });
    }
    onCellDoubleClicked($event: any) {
        const dialogRef = this.dialog.open(AddRetrievalFileComponent, {
            width: '900px',
            data: {
                rowData: $event,
                type: 'Edit'
            },
            disableClose: true
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result !== '')
                this.refreshbutton = true;
        });
    }

    getDataretrievalData(e = false) {

        if (this.tableDataEmitData && !e) {
            this.tableData = this.tableDataEmitData;
        } else {
            this.locationService.getDataretrievalData(this.vendorData.VendorAccountId).subscribe((res: any) => {
                this.tableData = res.Data.$values;
                this.tableDataEmit.emit(this.tableData);
            })
        }
    }


    invoiceRetrieal() {

        if (this.f['invoiceRetrievalMethodId'].value == 20) {
            this.showInvoiceUrl = true;
            this.retrievalForm.get('invoiceRetrievalWebURL')?.setValidators([Validators.required]);
        } else {
            this.showInvoiceUrl = false;
            this.retrievalForm.get('invoiceRetrievalWebURL')?.clearValidators();
        }
        this.retrievalForm.get('invoiceRetrievalWebURL')?.updateValueAndValidity();
    }

    changeProcessingMethod(data: { value: number; }) {
        this.dataRetrievalForm.controls['dataRetrievalTemplateTypeId'].setValue(null);
        if (data.value == 90) {
            this.isShowRequired = true;
            this.dataRetrievalForm.controls['dataRetrievalTemplateTypeId'].setValidators([Validators.required]);
        } else {
            this.isShowRequired = false;
            this.dataRetrievalForm.controls['dataRetrievalTemplateTypeId'].clearValidators();
        }
        this.dataRetrievalForm.controls['dataRetrievalTemplateTypeId'].updateValueAndValidity();
    }

    retrievalMethod1() {
        if (this.f1['dataRetrievalMethodId'].value == 10) {
            this.showDataRetrivalUrl = true;
            this.dataRetrievalForm.get('dataRetrievalWebURL')?.setValidators([Validators.required]);
        } else {
            this.showDataRetrivalUrl = false;
            this.dataRetrievalForm.get('dataRetrievalWebURL')?.clearValidators();
        }
        this.dataRetrievalForm.get('dataRetrievalWebURL')?.updateValueAndValidity();
    }

    getInvoiceRetrievalMethods() {

        if (this.invoiceretrievalMethodData?.length) {
            this.invoiceretrievalMethod = this.invoiceretrievalMethodData;
        } else {
            this._unsubscribeRMethod.next(null);
            this.retrievalService.getinvoiceRetrievalMethods().pipe(takeUntil(this._unsubscribeRMethod)).subscribe((response: any) => {
                if (response && response.Data.$values) {
                    this.invoiceretrievalMethod = response.Data.$values;
                    this.invoiceretrievalMethodEmit.emit(this.invoiceretrievalMethod);
                }
            });
        }
    }

    getDataRetrievalSource() {

        if (this.dataSourcesEmitData?.length) {
            this.dataSources = this.dataSourcesEmitData;
        } else {
            this._unsubscribeDataSource.next(null);
            this.retrievalService.getRetrievalSource().pipe(takeUntil(this._unsubscribeDataSource)).subscribe((response: any) => {
                if (response && response.Data.$values) {
                    this.dataSources = response.Data.$values;
                    this.dataSourcesEmit.emit(this.dataSources);
                }
            });
        }
    }

    getDataRetrievalTemplate() {

        if (this.templateTypeEmitData?.length) {
            this.templateType = this.templateTypeEmitData;
        } else {
            this._unsubscribeTemplate.next(null);
            this.retrievalService.getTemplateType().pipe(takeUntil(this._unsubscribeTemplate)).subscribe((response: any) => {
                if (response && response.Data.$values) {
                    this.templateType = response.Data.$values;
                    this.templateTypeEmit.emit(this.templateType);
                }
            });
        }
    }

    getDataRetrievalMethods() {

        if (this.retrievalMethodEmitData?.length) {
            this.retrievalMethod = this.retrievalMethodEmitData;
        } else {
            this._unsubscribeRetrieval.next(null);
            this.retrievalService.getRetrievalMethods().pipe(takeUntil(this._unsubscribeRetrieval)).subscribe((response: any) => {
                if (response && response.Data.$values) {
                    this.retrievalMethod = response.Data.$values;
                    this.retrievalMethodEmit.emit(this.retrievalMethod);

                }
            });
        }

    }

    getDataRetrievalProcessingMethods() {

        if (this.processingMethodEmitData?.length) {
            this.processingMethod = this.processingMethodEmitData;
        } else {
            this._unsubscribeProcessing.next(null);
            this.retrievalService.getProcessingMethods().pipe(takeUntil(this._unsubscribeProcessing)).subscribe((response: any) => {
                if (response && response.Data.$values) {
                    this.processingMethod = response.Data.$values;
                    this.processingMethodEmit.emit(this.processingMethod);
                }
            });
        }
    }

    openNote(e: { rowData: { Notes: any; }; }) {
        if (e.rowData.Notes) {
            let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                iconNot: true,
                textColor: 'black'
            }

            const dialogReff = this.dialog.open(ActionPopupComponent, {
                width: '700px', data:
                {
                    text: e.rowData.Notes,
                    errorData: errorData
                }
            });
        }
    }

    ngOnDestroy() {
        this._unsubscribeDataSource.next(null);
        this._unsubscribeDataSource.complete();
        this._unsubscribeRetrieval.next(null);
        this._unsubscribeRetrieval.complete();
        this._unsubscribeProcessing.next(null);
        this._unsubscribeProcessing.complete();
        this._unsubscribeTemplate.next(null);
        this._unsubscribeTemplate.complete();
        this._unsubscribeRMethod.next(null);
        this._unsubscribeRMethod.complete();
    }

    refreshbuttonEmitFn(event: any) {
        this.refreshbutton = event;
    }

    
  tableDataExistFn(e?: any) {
    this.tableDataExist = e;
  }

  exportAccountDataFn(event: any) {
    this.exportData = event;
  }

  selectedRowsEmitFn(event: any) {
    this.selectedRecords = event;
  }

  rowCellDoubleClickedFn(event: any) {
    this.onCellDoubleClicked(event)
  }

  totalRecordsEmitFn(event: any) {
    this.totalRecords = event;
  }


  loaderEmitFn(event: any) {
    this.loaderParent = event;
  }
}