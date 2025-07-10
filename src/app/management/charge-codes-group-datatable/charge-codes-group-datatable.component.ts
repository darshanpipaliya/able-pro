import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import moment from 'moment';
import { Table } from 'primeng/table';
import { IsRowSelectable } from '@ag-grid-community/core';
import _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { AddVendorProductDialogComponent } from '../add-vendor-product-dialog/add-vendor-product-dialog.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { ChangeLogComponent } from 'src/app/common/change-log/change-log.component';
@Component({
    selector: 'app-charge-codes-group-datatable',
    templateUrl: './charge-codes-group-datatable.component.html',
    styleUrls: ['./charge-codes-group-datatable.component.scss'],
    standalone: true,
    imports: [SharedModule, PrimgModule, ChangeLogComponent ]
})
export class ChargeCodesGroupDatatableComponent implements OnInit {
    public loadingSetPrimary = false;
    @Input() action: string;
    @Input() vendorData: any;
    @Input() productData: any;
    @Input() userData: any;
    @Input() chargeCodeData: any;
    @Input() selectedChargeCodeGroup: any;
    vendors: any;
    industries: any;
    services: any;
    serviceTypes: any;
    products: any;
    productTypes: any;
    vendorProductTypeId: number;
    vendorAccountId: String;
    format: any = {
        add: 'Unselected Charge Codes', remove: 'Selected Charge Codes', all: 'Select All', none: 'Select None',
    };
    keepSorted = true;
    chargeCodeDataSource: any = [];
    chargeCodeGroupDataSource: any = [];
    changelogData: any;
    submitted: boolean = false;
    key: string;
    display: any;
    filter = true;
    source: any = [];
    confirmed: any = [];
    selectedChargeCodes: any[] = [];
    chargeCodeGroupName: string = "Group ID Placeholder";
    selectChargeCodeColumns: any[] = [];
    chargeCodeGroupColumns: any[] = [];
    column: any;
    disabled = false;
    logLoader = false;
    @Output() onAddChargeCode: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRemoveChargeCode: EventEmitter<any> = new EventEmitter<any>();
    @Output() setChargeCodeGroupNameEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() setClickFalse: EventEmitter<any> = new EventEmitter<any>();
    @Output() closeChargeCodeTab = new EventEmitter<any>();
    @Output() addEditSaveEvent = new EventEmitter<any>();
    @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()
    @ViewChild('htmlContent') htmlContent!: TemplateRef<any>;
    @ViewChild('htmlContent2') htmlContent2!: TemplateRef<any>;
    @ViewChild('dt') public dt: Table;
    @ViewChild('dtt') public dtt: Table;
    isSuperTEMManager: boolean = false;
    isSuperTEMAdmin: boolean = false;
    tooltipRef: any;
    tooltipRef2: any;
    isFilterData = false;

    public rowData: any = [];
    stopSpinner: any = true;
    selected: any = 0;
    selectedCCVLeft: any = [];
    selectedCCVRight: any = [];
    selectedButton: any = 'codegroup';
    buttonOptions: any = [
        { 'label': 'Products', value: 'products', icon: "fa-box-open" },
        { 'label': "Charge Codes", value: 'charge', icon: "fa-copyright" },
        { 'label': 'Charge Codes Group', value: 'codegroup', icon: "fa-layer-group" },
    ];
    isProductFormSubmit: boolean = false;
    vendorProductNames = [];
    vendorProductDetails: any;
    filters: any = [];
    checkForm: FormGroup;
    dummySource = [];
    cols: any[] = [];
    filesColumns: any[] = [];
    selectedFiles: any[] = [];
    displaycols: any[] = [];
    colsshow: any[] = [];
    columns: any = [];
    saveButtonLoader = false;
    disabledVendorDD = false;
    @ViewChild('dt') table: Table;
    @ViewChild('dtt') tablee: Table;
    gridOptions = {
        headerHeight: 35,
        groupHeaderHeight: 37,
        floatingFiltersHeight: 35
    }
    public isRowSelectable: IsRowSelectable = (params: any) => {
        return true;
    };

    private _unsubscribegetChargesCodeGridData: Subject<any> = new Subject<any>();
    private _unsubscribeVendorProductTypesDetails: Subject<any> = new Subject<any>();

    chargeCodeDataArr: any = [];
    rightSideTableArr: any = [];
    vendorProductsList: any = [];
    columnOne = [
        { field: 'ChargeCodeNm', header: 'Charge Code' },
        { field: 'ChargeCodeName', header: 'Charge Code Name' },
        { field: 'ChargeCodeTypeName', header: 'Charge Code Type' },
        { field: 'ChargeTypeName', header: 'Charge Type' },
        { field: 'VendorBillingAliasName', header: 'VBA' },
        { field: 'VendorAccountName', header: 'Vendor' },
    ]
    columnTwo = [
        { field: 'Parent', header: 'Parent' },
        { field: 'Required', header: 'Required' },
        { field: 'GroupId', header: 'Group ID' },
        { field: 'ChargeCodeNm', header: 'Charge Code' },
        { field: 'ChargeCodeName', header: 'Charge Code Name' },
        { field: 'ChargeCodeTypeName', header: 'Charge Code Type' },
        { field: 'VendorBillingAliasName', header: 'VBA' },
        { field: 'VendorAccountName', header: 'Vendor' },

    ]

    private _unsubscribeGRid: Subject<any> = new Subject<any>();
    private _unsubscribeChangelog: Subject<any> = new Subject<any>();
    selectedRadioData: any;
    constructor(private router: Router, private locationService: LocationService, public dialog: MatDialog,
        private fb: FormBuilder) {
        this.columns = [
            { field: 'TabSectionModuleDisplayName', header: 'Tab' },
            { field: 'TabModuleDisplayName', header: 'Section' },
            { field: 'VendorAccountName', header: 'Vendor' },
            { field: 'VendorProductTypeName', header: 'Vendor Product' },
            { field: 'GroupId', header: 'Group ID' },
            { field: 'Action', header: 'Action' },
            { field: 'DisplayColumnName', header: 'Field Name' },
            { field: 'OldValue', header: 'Previous Value' },
            { field: 'NewValue', header: 'New Value' },
            { field: 'ModificationDate', header: 'Date & Time' },
            { field: 'ModifiedBy', header: 'Who' }
        ];

    }

    openDialog() {
        this.tooltipRef = this.dialog.open(this.htmlContent, {
            width: '900px',
            data: {
                colseButton: true,
            }
        });
    }

    openTooltip() {
        this.tooltipRef2 = this.dialog.open(this.htmlContent2, {
            width: '900px',
            data: {
                colseButton: true,
            }
        });
    }

    closeTooltip() {
        this.tooltipRef.close();
    }
    closeTooltip2() {
        this.tooltipRef2.close();
    }


    ngOnInit(): void {
        if (this.action === 'Add') {
            const i = this.columnTwo.findIndex((f: any) => f.field === 'GroupId');
            this.columnTwo.splice(i, 1);
        }
        this.currentOpenEditPage.emit(false);
        this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();

        if (this.productData) {
            this.userData = this.productData
        }
        if (this.userData?.GroupStatus) {
            this.isFilterData = this.userData.GroupStatus
        }
        
        if (!this.userData.VendorProductTypeId && this.userData.Id) {
            this.userData.VendorProductTypeId = this.userData.Id;
        }
        if (this.userData && (this.userData.VendorProductTypeId)) {
            this.vendorProductTypesDetails();
            if (this.action === 'Add') {
                this.getChargecodesLogged();
            } else {
                this.rightSideTableData();
            }

            this.getVendorProduct();
        }

        if (!this.productData) {
            this.chargecodegroupsChangeLogs();
        }
        if (!this.isSuperTEMAdmin) {
            this.saveButtonLoader = true
        }


    }

    ngOnDestroy() {
        this._unsubscribeGRid.next(null);
        this._unsubscribeGRid.complete();
        this._unsubscribegetChargesCodeGridData.next(null);
        this._unsubscribegetChargesCodeGridData.complete();
        this._unsubscribeChangelog.next(null);
        this._unsubscribeChangelog.complete();
        this._unsubscribeVendorProductTypesDetails.next(null);
        this._unsubscribeVendorProductTypesDetails.complete();

    }

    vendorProductTypesDetails() {
        if (this.userData.VendorProductTypeId) {
            this.locationService.vendorProductTypesDetails(this.userData.VendorProductTypeId).subscribe((data) => {
                this.vendorProductDetails = {};
                if (data) {
                    this.vendorProductDetails = data.Data;
                }
            });
        }
    }
    getChargecodesLogged(removeVBAId: any = false) {

        const vId = this.userData.VendorAccountId;
        let datas: any = {
            "StartRowIndex": 1,
            "MaximumRows": 10000,
            "vendorAccountId": vId,
            "OrderBy": 'ChargeCodeNm',
            "SortOrder": 'desc',
            "advanceFilter": [
                {
                    "filterKey": "StatusValue",
                    "filterOptionType1": "equals",
                    "filterOptionValue1": "Active",
                    "filterOperationType": "AND",
                    "filterOptionType2": null,
                    "filterOptionValue2": null
                },
                {
                    "filterKey": "IsStep4DistributionValue",
                    "filterOptionType1": "equals",
                    "filterOptionValue1": "Yes",
                    "filterOperationType": "AND",
                    "filterOptionType2": null,
                    "filterOptionValue2": null
                }
            ]
        }


        if (this.action !== 'Add') {
            if (!removeVBAId) {
                datas['VendorBillingAliasId'] = this.rightSideTableArr[0].VendorBillingAliasId
            }
            this.locationService.getChargecodesLogged(datas).subscribe((data) => {
                this.chargeCodeDataArr = data.Data.$values;

                this.arrangLeftRightArr();
            });
        } else {
            this.locationService.getChargecodesLogged(datas).subscribe((data) => {
                this.chargeCodeDataArr = data.Data.$values;

                if (!removeVBAId) {
                    datas['VendorBillingAliasId'] = this.rightSideTableArr[0]?.VendorBillingAliasId
                }
                this.arrangLeftRightArr();
                // this.locationService.getChargecodesLogged(datas).subscribe((data) => {
                //     this.chargeCodeDataArr = data.Data.$values;
    
                 
                // });
                // this.rightSideTableData();
            });
        }

        this.chargeCodeDataArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));
        this.rightSideTableArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));

    }


    leftToRightDataMove() {
        this.selectedCCVLeft.forEach((data: any) => {
            const i = this.chargeCodeDataArr.findIndex((f: any) => f.ChargeCodeId == data.ChargeCodeId);
            this.chargeCodeDataArr.splice(i, 1);
        });
        this.rightSideTableArr = this.rightSideTableArr.concat(this.selectedCCVLeft);
        this.rightSideTableArr = _.cloneDeep(this.rightSideTableArr)
        this.selectedCCVLeft = [];
        this.rightSideTableArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));
        this.chargeCodeDataArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));

        if (this.rightSideTableArr.length === 1) {
            // this.getChargecodesLogged()
        }
    }

    rightToLeftDataMove() {
        this.selectedCCVRight.forEach((data: any) => {
            const i = this.rightSideTableArr.findIndex((f: any) => f.ChargeCodeId == data.ChargeCodeId);
            this.rightSideTableArr.splice(i, 1);
        })
        this.chargeCodeDataArr = this.chargeCodeDataArr.concat(this.selectedCCVRight);
        this.selectedCCVRight = [];
        this.rightSideTableArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));
        this.chargeCodeDataArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));

        if (this.rightSideTableArr.length === 0) {
            // this.getChargecodesLogged(true)
        }
    }


    chargecodegroupsChangeLogs() {
        this.logLoader = true;
        this._unsubscribeChangelog.next(null);
        this.locationService.getChargeCodeGrouplogs(this.userData.GroupXVendorProductTypeId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
            this.logLoader = false;
            if (data.Success) {
                this.changelogData = data.Data.$values;
            } else {
                this.changelogData = [];
            }
        });
    }
    rightSideTableData() {

        const data = {
            GroupId: this.userData.GroupId,
            VendorProductTypeId: this.userData.VendorProductTypeId
        }
        this._unsubscribeGRid.next(null);
        this.locationService
            .vendorProductChargeCodeGroups(data)
            .pipe(takeUntil(this._unsubscribeGRid))
            .subscribe(
                async (res: any) => {
                    this.rightSideTableArr = res.Data.$values;

                    if (this.action !== 'Add') {

                        this.getChargecodesLogged();
                    } else {
                        this.arrangLeftRightArr();
                    }


                }
            )
    }


    arrangLeftRightArr() {
        let seprateRightArr = _.map(this.rightSideTableArr, (x: any) => {
            const a: any = {};
            a['selected'] = x.RequiredChargeCode === true ? true : false
            a['parent'] = x.PrimaryChargeCode === true ? true : false
            a['GroupId'] = x.GroupId
            a['ChargeCodeId'] = x.ChargeCodeId
            return a;
        });
        this.rightSideTableArr = this.chargeCodeDataArr.filter((obj1: any) =>
            this.rightSideTableArr.some((obj2: any) => obj2.ChargeCodeId === obj1.ChargeCodeId)
        );


        this.rightSideTableArr.forEach((rightEle: any) => {

            const i = this.chargeCodeDataArr.findIndex((f: any) => f.ChargeCodeId == rightEle.ChargeCodeId);
            this.chargeCodeDataArr.splice(i, 1);

            seprateRightArr.forEach((sep: any) => {
                if (rightEle.ChargeCodeId === sep.ChargeCodeId) {
                    rightEle['selected'] = sep.selected === true ? true : false;
                    rightEle['parent'] = sep.parent === true ? true : false
                    rightEle['GroupId'] = sep.GroupId
                }
            });

        });
        this.chargeCodeDataArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));
        this.rightSideTableArr.sort((a: any, b: any) => b.ChargeCodeNm?.localeCompare(a.ChargeCodeNm));
    }

    save(isGroupIdToInactive = false, isOldGroupId = null) {

        const getParentData = _.filter(this.rightSideTableArr, (x: any) => x.parent);
        if (!getParentData.length) {
            let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: 'There should be at least one record selected as a parent'
            }
            this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            return
        } else {
            if (!getParentData[0].selected) {
                let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: 'Parent record must be selected as a required'
                }
                this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                return
            }

        }

        const result = this.checkKeyConsistency(this.rightSideTableArr, 'VendorBillingAliasId');
        if (!result) {
            let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: 'Vendor Product are created by VBA. Please ensure your selection of Charge Codes only 1 VBA.'
            }
            this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            return
        }
        let chageCodeIds: any = [];

        this.rightSideTableArr.forEach((element: any) => {
            chageCodeIds.push(
                {
                    chargeCodeId: element.ChargeCodeId,
                    required: element.selected ? true : false,
                    primaryChargeCode: element.parent ? true : false
                }
            );
        });

        let data: any = {
            // VendorBillingAliasId: this.rightSideTableArr[0].VendorBillingAliasId,
            VendorAccountId: this.userData.VendorAccountId,
            ChargeCodes: chageCodeIds,
            VendorProductTypeId: this.userData.VendorProductTypeId,
            GroupId: this.userData.GroupId,
            // VendorAccountId: this.userData.VendorAccountId
        }

        if (isGroupIdToInactive) {
            data['GroupIdToInactive'] = isOldGroupId
        }
        this.saveButtonLoader = true;
        this.locationService.addChargeCodeGroups(data).subscribe({

            next: (data: any) => {
                this.saveButtonLoader = false;
                if (data.Success) {

                    let errorData: any = {
                        messgeType: "error",
                        title: "Attention",
                        titleClass: "text-c-blue",
                        icon: "fas fa-exclamation-triangle",
                        iconClass: "text-c-blue f-70",
                        message: 'Successfully saved'
                    }
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                    dialogRef.afterClosed().subscribe(result => {

                        this.addEditSaveEvent.emit(true);
                    });
                } else if (data?.Data?.ValidationKey == 'SameGroupWithDifferentVP' || data?.Data?.ValidationKey == 'SameGroupWithSameVP') {
                    let IdsList: any = data?.Data?.VendorProductTypeIds.$values;

                    let list = {
                        ids: IdsList,
                        fromChargeCode: true,
                        popupMessage: data.Message,
                        ValidationKey: data?.Data?.ValidationKey
                    }
                    const dialogRef = this.dialog.open(AddVendorProductDialogComponent, { panelClass: 'error-warning', data: list });
                    dialogRef.afterClosed().subscribe(result => {
                        if (result === true) {
                            this.userData.VendorProductTypeId = data.Data.VendorProductTypeIds.$values[0].VendorProductTypeId;
                            this.save();
                        } else {
                            this.saveButtonLoader = false;
                        }
                    });
                }
                else {
                    let errorData: any = {
                        messgeType: "error",
                        title: "Attention",
                        titleClass: "text-c-blue",
                        icon: "fas fa-exclamation-triangle",
                        iconClass: "text-c-blue f-70",
                        message: data.Message
                    }
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                    dialogRef.afterClosed().subscribe(result => {
                    });
                }
            },
            error: error => {
                this.saveButtonLoader = false;
                let errorMessage: any = '';
                if (error.status === 400) {
                    errorMessage = error.error ? error.error : 'Bad request';
                    let errorData: any = {
                        messgeType: "error",
                        title: "Attention",
                        titleClass: "text-c-blue",
                        icon: "fas fa-exclamation-triangle",
                        iconClass: "text-c-blue f-70",
                        message: errorMessage
                    }
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                    dialogRef.afterClosed().subscribe(result => {
                    });
                }
            }
        });

    }

    toggle(event: any) {

         let errorData: any = {
            message: `Are you sure you want to change the status from ${this.isFilterData ? 'Inactive' : 'Active'} to ${event.checked ? 'Active' : 'Inactive'}?`,
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-question-circle",
            iconClass: "text-c-blue f-70",
            closeBtnName: "Do it!",
            textColor: 'black',
            okBtnName: 'Close & Review',
        }

        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                this.locationService.setGroupActiveInactiveUrl(this.userData.GroupId, this.isFilterData, this.userData.GroupXVendorProductTypeId).subscribe((data: any) => {
            
                    if (data?.Data?.ValidationKey == 'SameGroupWithDifferentVP' || data?.Data?.ValidationKey == 'SameGroupWithSameVP') {
                    
                        let IdsList: any = data?.Data?.VendorProductTypeIds.$values;

                        let list = {
                            ids: IdsList,
                            fromChargeCode: true,
                            popupMessage: data.Message,
                            ValidationKey: data?.Data?.ValidationKey
                        }
                        const dialogRef = this.dialog.open(AddVendorProductDialogComponent, { panelClass: 'error-warning', data: list });
                        dialogRef.afterClosed().subscribe(result => {
                            if (result === true) {
                                this.userData.VendorProductTypeId = data.Data.VendorProductTypeIds.$values[0].VendorProductTypeId;
                                this.save();
                            } else {
                                this.saveButtonLoader = false;
                                this.isFilterData = !this.isFilterData;
                            }
                        });
                    } else {
                        let errorData: any = {
                            messgeType: "error",
                            title: "Attention",
                            titleClass: "text-c-blue",
                            icon: "fas fa-exclamation-triangle",
                            iconClass: "text-c-blue f-70",
                            message: data.Message
                        }
                        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                        dialogRef.afterClosed().subscribe(result => {

                        });
                    }
                });

            } else {
                this.isFilterData = !this.isFilterData;
                this.saveButtonLoader = false;
            }
        });

      
    }

    radioClick(i: any) {

        this.rightSideTableArr.map((element: any, k: any) => {
            if (element.parent === undefined || element.parent === false) {
                if (k === i) {
                    element.parent = true;
                    element.selected = true;
                } else {
                    element.parent = false;
                }
            } else {
                element.parent = false;
            }
        });


    }

    CheckClick(i: any) {
        this.rightSideTableArr.map((element: any, k: any) => {
            if (element.selected === undefined || element.selected === false) {
                if (k === i) {
                    element.selected = true;
                }
            } else {
                if (k === i) {
                    element.selected = false;
                }
            }
        });
        this.rightSideTableArr = _.cloneDeep(this.rightSideTableArr);

    }

    checkKeyConsistency(arr: any, keyName: any) {
        if (arr.length === 0) return true;
        const firstValue = arr[0][keyName];
        for (let i = 1; i < arr.length; i++) {
            if (arr[i][keyName] !== firstValue) {
                return false;
            }
        }
        return true;
    }

    getVendorProduct() {
        let data: any = {
            "industryId": null,
            "serviceId": null,
            "serviceTypeId": null,
            "productId": null,
            "productTypeId": null,
            "vendorAccountId": this.userData.VendorAccountId
        }
        this._unsubscribeVendorProductTypesDetails.next(null);
        this.locationService.getVendorProductTypeList(data).pipe(takeUntil(this._unsubscribeVendorProductTypesDetails)).subscribe((data: any) => {
            if (data && data.Data.$values) {
                this.vendorProductsList = data.Data.$values;
            } else {
                this.vendorProductsList = [];
            }
        }, error => {
            this.vendorProductsList = [];
        });
    }

    filerOutSide($event: any, col: any) {
    }
}