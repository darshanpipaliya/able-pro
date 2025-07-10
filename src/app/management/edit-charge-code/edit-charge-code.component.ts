import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import moment from 'moment';
import _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateChargeCodeGroupComponent } from './update-charge-code-group/update-charge-code-group.component';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-edit-charge-code',
  templateUrl: './edit-charge-code.component.html',
  styleUrls: ['./edit-charge-code.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective, AgGridModule, AgGridTableComponent]
})
export class EditChargeCodeComponent implements OnInit {

  @Input() chargeCodeData: any;
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()
  @Output() onChargeCodeCellDoubleClickedEmit: EventEmitter<any> = new EventEmitter<any>();

  columnDefs: any = ['Tab',
    'Section',
    'Field Name',
    'Previous Value',
    'New Value',
    'Time & Date',
    'Who'
  ];
  cols: any = [];

  @ViewChild('IIconTooltip') IIconTooltip!: TemplateRef<any>;

  columnDefsGrid: any = [];
  colForParentChargeCodeGrid: any = [];
  rowSelection: any = 'multiple';
  defaultColDef: any = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  sideBar: any = [];
  rowData: any = [];
  changeLogData: any = [];
  hierarchyData: any = [];
  chargeCodeDataNew: any;
  columnDefs2: any;
  vendors: any = [];
  chargeCodeTypes: any = [];
  selectedChargeType: boolean = false;;
  billingAlias: any = [];
  editChargeCodeForm: FormGroup;
  taxTypes: any = [];
  origins: any = [];
  chargeCodeOrigin: any = '';
  ChargeCodeGroup: any = [];
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isChargeCodeFormSubmit: boolean = false;
  codeOccurence: any = [];
  saveButtonLoadder = false;
  stopSpinner: any = true;
  stopSpinner1: any = true;
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ];


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

  private _unsubscribeChangelog: Subject<any> = new Subject<any>();
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    public fb: FormBuilder) {
    this.currentOpenEditPage.emit(true);
    this.editChargeCodeForm = this.fb.group({

      vendorAccountId: new FormControl('', [Validators.required]),
      chargeCodeOccurenceId: new FormControl('', [Validators.required]),
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required]),
      vendorBillingAliasId: new FormControl('', [Validators.required]),
      chargeCodeOriginId: new FormControl('', [Validators.required]),
      chargeCode: new FormControl('', [Validators.required]),
      chargeCodeName: new FormControl('', [Validators.required]),
      //chargeCodeDisplayName: new FormControl(''),
      description: new FormControl(''),
      status: new FormControl(true, [Validators.required]),

      vendorId: new FormControl(''),
      // chargeCodeType: new FormControl(''),

      CreatedBy: new FormControl(''),
      CreationDate: new FormControl(''),
      ModificationDate: new FormControl(''),
      ModifiedBy: new FormControl('')
    });

    this.chargeCodeGrid();

    this.cols = [
      { field: 'ExpectedInvoiceNoteCreatedDate', header: 'Parent Charge Code/Name', spinner: true },
      { field: 'Notes', header: 'Child Charge Code/Name', spinner: true }
    ];

    this.columnDefs2 = [
      {
        headerName: 'Parent Charge Code/Name',
        field: 'ParentChargeCodeName',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 94,
        flex: 0
      },
      {
        headerName: 'Child Charge Code/Name',
        field: 'ChildChargeCodeName',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 94,
        flex: 0
      }
    ];

  }

  chargeCodeGrid() {
    this.columnDefsGrid = [
      // {
        // headerCheckboxSelection: true,
        // checkboxSelection: true,
        // floatingFilter: true,
        // minWidth: 150,
        // maxWidth: 50,
        // width: 100,
        // flex: 0,
        // resizable: true,
        // sortable: true,
        // editable: false,
        // filter: false,
        // suppressColumnsToolPanel: true,
      // },
      {
        headerName: 'Group Name',
        children: [
          {
            field: 'GroupId',
            // valueGetter(params) {
            //   return params?.data?.GroupName ? params?.data?.GroupId + ' - ' + params.data.GroupName : params.data.GroupId;
            // },
            headerName: 'Group ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          // {
          //   field: 'ChargeCodeDisplayName',
          //   headerName: 'Charge Code Display Name',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 250,
          //   flex: 0,
          // },

          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          // {
          //   field: 'ChargeCodeDescription',
          //   headerName: 'Charge Code Description',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 250,
          //   flex: 0,
          // },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Code Occurrence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },

        ],
      },
      {
        headerName: 'Group Info',
        children: [
          {
            field: 'PrimaryChargeCodeDisplay',
            headerName: 'Primary?',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'RequiredChargeCodeDisplay',
            headerName: 'Required?',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,

          }
        ]
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorBillingAliasName',
            headerName: 'VBA',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'VendorName',
            headerName: 'Vendor',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          }
        ],
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 230,
            flex: 0,
          },
          // {
          //   field: 'VendorProductDescription',
          //   headerName: 'Vendor Product Description',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 260,
          //   flex: 0,
          // },

          // {
          //   field: 'VendorProductStatusValue',
          //   headerName: 'Status',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 250,
          //   flex: 0,
          // },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },

        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'VendorProductStatusValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
        ]
      }
    ];
  }

  ngOnInit(): void {
    this.currentOpenEditPage.emit(true);
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();

    this.chargeCodeOrigin = this.chargeCodeData.ChargeCodeOriginName;

    this.locationService.getChargeCodeDetailNew(this.chargeCodeData.ChargeCodeId).subscribe((data) => {
      if (data.Success) {
        this.chargeCodeDataNew = data.Data;
      }
    });

    this.chargecodesChangeLog();
    this.getChargecodesHierarchy();
    // this.locationService.getChargeCodeGroupDetail(this.chargeCodeData.ChargeCodeId).subscribe((data) => {
    //   if (data) {
    //     this.ChargeCodeGroup = data.$values;
    //   }
    // });

    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
        this.getVendorBillingAlias(this.chargeCodeData.VendorAccountId);
      }
    });

    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getChargeCodeTypes(passData).subscribe((data) => {
      if (data.Success) {
        this.chargeCodeTypes = data.Data.$values;
        this.getTaxRegulatoryTypes(this.chargeCodeData.ChargeCodeTypeId);
      }
    });

    this.locationService.getChargeCodeOrigins().subscribe((data) => {
      if (data && data.$values) {
        this.origins = data.$values;
      }
    });

    this.editChargeCodeForm.controls['vendorAccountId'].setValue(this.chargeCodeData.VendorAccountId);
    this.editChargeCodeForm.controls['vendorId'].setValue(this.chargeCodeData.VendorAccountId);
    this.editChargeCodeForm.controls['vendorBillingAliasId'].setValue(this.chargeCodeData.VendorBillingAliasId);
    this.editChargeCodeForm.controls['chargeCode'].setValue(this.chargeCodeData?.ChargeCodeNm);
    //this.editChargeCodeForm.controls['chargeCodeDisplayName'].setValue(this.chargeCodeData.ChargeCodeDisplayName);
    this.editChargeCodeForm.controls['chargeCodeName'].setValue(this.chargeCodeData.ChargeCodeName);
    this.editChargeCodeForm.controls['description'].setValue(this.chargeCodeData.ChargeCodeDescription);
    this.editChargeCodeForm.controls['chargeCodeTypeId'].setValue(this.chargeCodeData.ChargeCodeTypeId);
    this.editChargeCodeForm.controls['chargeTypeId'].setValue(this.chargeCodeData.ChargeTypeId);
    this.editChargeCodeForm.controls['status'].setValue(this.chargeCodeData.Status);
    this.editChargeCodeForm.controls['chargeCodeOriginId'].setValue(this.chargeCodeData.ChargeCodeOriginId);
    this.editChargeCodeForm.controls['chargeCodeOccurenceId'].setValue(this.chargeCodeData.ChargeCodeOccurrenceId);
    // let CreatedBy = this.chargeCodeData.CreateByUser.FirstName + ' ' + this.chargeCodeData.CreateByUser.LastName;

    this.editChargeCodeForm.controls['CreatedBy'].setValue(this.chargeCodeData.CreatedByUser);

    this.editChargeCodeForm.controls['CreationDate'].setValue(moment(this.chargeCodeData.CreationDate).format('MM/DD/YYYY'));

    if (this.chargeCodeData.ModificationDate) {
      this.editChargeCodeForm.controls['ModificationDate'].setValue(moment(this.chargeCodeData.ModificationDate).format('MM/DD/YYYY'));
    }
    if (this.chargeCodeData.ModifiedByUser) {
      this.editChargeCodeForm.controls['ModifiedBy'].setValue(this.chargeCodeData.ModifiedByUser);
    }
    if (!this.isSuperTEMAdmin) {
      this.editChargeCodeForm.disable();
    }
    this.getChargeCodeOccurrence();
  }

  chargecodesChangeLog() {
    const data: any = {
      chargeCodeId: this.chargeCodeData.ChargeCodeId
    }
    this._unsubscribeChangelog.next(null);
    this.locationService.chargecodesChangeLog(this.chargeCodeData.ChargeCodeId, data).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      if (data.Success) {
        this.changeLogData = data.Data.$values;
        _.map(this.changeLogData, (res: any) => {
          if (res['ModificationDate']) {
            const d = res;
            d['ModificationDate'] = moment(res['ModificationDate']).format('MM/DD/YYYY') + ' ' + this.getTime(res['ModificationDate']);
            return d;
          }
        });
      } else {
        this.changeLogData = [];
      }
    });
  }

  getChargecodesHierarchy() {
    this.locationService.getChargecodesHierarchy(this.chargeCodeData.ChargeCodeId).subscribe((data) => {
      if (data.Success) {
        this.hierarchyData = data.Data.$values;
      }
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

  closeModal() {
    this.dialog.closeAll();
  }

  getTime(date: any) {
    let d = new Date(date);
    const timeZoneOffset = -0.5 * 60;
    const adjustedTime = new Date(d.getTime() + timeZoneOffset * 60 * 1000)
    return adjustedTime.getHours() + ':' + adjustedTime.getMinutes();
  }

  getVendorBillingAlias(id: any) {
    this.locationService.getVendorBillingAlias(id).subscribe((data) => {
      if (data && data.$values) {
        this.billingAlias = data.$values;
      }
    });
  }
  onChargeCodeTypeChange() {
    if (this.f.chargeCodeTypeId.valid && this.f.chargeCodeTypeId.value) {
      const id = Number(this.f.chargeCodeTypeId.value);
      this.f.chargeTypeId.setValue('');
      this.getTaxRegulatoryTypes(id);
    } else {
      this.taxTypes = [];
      this.f.chargeTypeId.setValue('');
    }

    if(this.f.chargeCodeTypeId.value == 1002) {
      const usageId = this.codeOccurence.find((item: any) => item.Occurrence === 'Usage')?.Id;
      this.f.chargeCodeOccurenceId.setValue(usageId);
    } else {
      this.f.chargeCodeOccurenceId.setValue(null);
    }
  }
  getChargeCodeOccurrence() {
    this.locationService.getChargeCodeOccurrence().subscribe((data) => {
      if (data && data.$values) {
        this.codeOccurence = data.$values;
      }
    });
  }

  onVendorChange() {

    if (this.f.vendorAccountId.valid && this.f.vendorAccountId.value) {
      const id = Number(this.f.vendorAccountId.value);
      this.f.vendorBillingAliasId.setValue('');
      this.getVendorBillingAlias(id);
    } else {
      this.billingAlias = [];
      this.f.vendorBillingAliasId.setValue('');
    }
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      // rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray: any = [];
        const filterArrayDate: any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'ChargeCodeCreatedDate' || key === 'ChargeCodeModificationDate') {
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

        if (this.chargeCodeData?.ChargeCodeId) {
          data['ChargeCodeId'] = this.chargeCodeData.ChargeCodeId;
        }
        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k: any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this._unsubscribeGRid.next(null);
        this.locationService
          .vendorProductChargeCodeGroups(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.ChargeCodeGroup = data?.Data?.$values;
              if (data && data.Data.$values.length > 0) {
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

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onChargeCodeCellDoubleClicked($event: any) {
    if ($event.data) {
      this.onChargeCodeCellDoubleClickedEmit.emit($event.data)
    }
  }

  onChargetypeChange($event: any  ) {
    if ($event.value) {
      let obj: any = {};
      obj = _.filter(this.chargeCodeTypes, (res: any) => { return res.Id == $event.value });

      if ((this.chargeCodeDataNew?.ChargeCodeTypeId == 1000 || this.chargeCodeDataNew?.ChargeCodeTypeId == 1001 || this.chargeCodeDataNew?.ChargeCodeTypeId == 1002 || this.chargeCodeDataNew?.ChargeCodeTypeId == 1003) && !obj[0]?.is_step4_distribution) {
        this.selectedChargeType = true;
      } else {
        this.selectedChargeType = false;
      }
    }
  }

  getTaxRegulatoryTypes(id: any) {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getTaxRegulatoryTypes(id, passData).subscribe((data) => {
      if (data.Success) {
        this.taxTypes = data.Data.$values;
      } else {
        this.taxTypes = [];
      }
    });
  }
  get f(): any {
    return this.editChargeCodeForm.controls;
  }
  updateChagecodeData() {

    this.isChargeCodeFormSubmit = true;
    if (this.f['status'].value || this.f['status'].value === 'true') {
      this.f['status'].setValue(true);
    } else {
      this.f['status'].setValue(false);
    }


    if (this.editChargeCodeForm.valid) {
      this.saveButtonLoadder = true;

      let data: any = {
        "chargeCodeTypeId": this.f.chargeCodeTypeId.value,
        "chargeTypeId": this.f.chargeTypeId.value,
        "vendorBillingAliasId": this.f.vendorBillingAliasId.value,
        "chargeCodeOriginId": this.f.chargeCodeOriginId.value,
        "chargeCodeName": this.f.chargeCodeName.value,
        "description": this.f.description.value,
        "status": this.f.status.value,
        "vendorAccountId": this.f.vendorAccountId.value,
        "ChargeCodeOccurrenceId": this.f.chargeCodeOccurenceId.value,
        "chargeCode": this.f.chargeCode.value,
        //"chargeCodeDisplayName": this.f.chargeCodeDisplayName.value,

      };
      if (this.selectedChargeType) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'This charge code correction impacts the Charge Code Group(s) associated with Vendor Products that the system will automatically remove the Charge Code from the group due to the changes.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.locationService.updateChageCode(this.chargeCodeData.ChargeCodeId, data).subscribe({
              next: data => {
                this.saveButtonLoadder = false;
                if (data?.Data?.IsPrimaryChargeCodeGroupFound) {
                  const dialogRef = this.dialog.open(UpdateChargeCodeGroupComponent, {
                    width: '820px',
                    panelClass: 'addVendorProduct',
                    data: {
                      colseButton: true,
                      disableClose: true,
                      vendorTypeName: data?.Data?.vendorTypeName
                    }
                  });
                  dialogRef.afterClosed().subscribe((result) => {

                    if (result) {
                      this.updateChagecodeData();
                    }
                  });
                } else {
                  // if(this.selectedChargeType) {
                  //   let errorData: any = {
                  //       messgeType: "error",
                  //       title: "Attention",
                  //       titleClass: "text-c-blue",
                  //       icon: "fas fa-exclamation-circle",
                  //       iconClass: "text-c-blue f-70",
                  //       message: 'This charge code correction impacts the Charge Code Group(s) associated with Vendor Products that the system will automatically remove the Charge Code from the group due to the changes.'
                  //     }
                  //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                  //     dialogRef.afterClosed().subscribe(result => {
                  //       if(result) {
                  let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: data.Message //if messges is multiple use array
                  }
                  const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                  dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                      this.onUserAddEvent.emit(true);
                    }
                  });
                  // }
                  // });
                }
              },
              error: error => {
                this.saveButtonLoadder = false;
                let errorMessage: any = '';
                if (error.status === 400) {
                  errorMessage = error.error ? error.error : 'Bad request';
                  let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: errorMessage //if messges is multiple use array
                  }
                  const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                  dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                      this.onUserAddEvent.emit(true);
                    }
                  });
                }
              }
            });
          }
        });
      } else {
        this.locationService.updateChageCode(this.chargeCodeData.ChargeCodeId, data).subscribe({
          next: data => {
            this.saveButtonLoadder = false;
            if (data?.Data?.IsPrimaryChargeCodeGroupFound) {
              const dialogRef = this.dialog.open(UpdateChargeCodeGroupComponent, {
                width: '820px',
                panelClass: 'addVendorProduct',
                data: {
                  colseButton: true,
                  disableClose: true,
                  vendorTypeName: data?.Data?.vendorTypeName
                }
              });
              dialogRef.afterClosed().subscribe((result) => {

                if (result) {
                  this.updateChagecodeData();
                }
              });
            } else {
              // if(this.selectedChargeType) {
              //   let errorData: any = {
              //       messgeType: "error",
              //       title: "Attention",
              //       titleClass: "text-c-blue",
              //       icon: "fas fa-exclamation-circle",
              //       iconClass: "text-c-blue f-70",
              //       message: 'This charge code correction impacts the Charge Code Group(s) associated with Vendor Products that the system will automatically remove the Charge Code from the group due to the changes.'
              //     }
              //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              //     dialogRef.afterClosed().subscribe(result => {
              //       if(result) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: data.Message //if messges is multiple use array
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.onUserAddEvent.emit(true);
                }
              });
              // }
              // });
            }
          },
          error: error => {
            this.saveButtonLoadder = false;
            let errorMessage: any = '';
            if (error.status === 400) {
              errorMessage = error.error ? error.error : 'Bad request';
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: errorMessage //if messges is multiple use array
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.onUserAddEvent.emit(true);
                }
              });
            }
          }
        });
      }
    }
  }
  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY');
  }
  getModifiedByUser(FirstName: any, LastName: any) {

    let fname = (FirstName) ? FirstName : '';
    let lname = (LastName) ? LastName : '';

    return fname + lname;
  }

  ngOnDestroy(): void {
    this._unsubscribeChangelog.next(null);
    this._unsubscribeChangelog.complete();
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

}
