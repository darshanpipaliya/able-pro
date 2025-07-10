import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import _ from 'lodash';
import { WirelineService } from 'src/app/services/wireline.service';
import { CommanHtmlRendererComponent } from 'src/app/common/ag-grid-cell-renderer-element/comman-html-renderer.component';
import { LinkPeopleDialogComponent } from 'src/app/common/link-people-dialog/link-people-dialog.component';
import { EditLinkLocationPrimaryComponent } from 'src/app/inventory/wireline-datatable/assignments/edit-link-location-primary/edit-link-location-primary-dialog.component';
import { isValueExist, rolePermission, isValuesUndefined } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-assignments-m',
  templateUrl: './assignments-m.component.html',
  styleUrls: ['./assignments-m.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent,AgGridModule]
})
export class AssignmentsMComponent implements OnInit {
  @Input() rowData: any;
  @Input() selectedButton: any;
  @Input() isInventoryAssignmnet: any

  public sideBar;
  temRoles = false;
  sbInvoiceId: any;
  @ViewChild('locationCell', { static: false }) locationCell: TemplateRef<any>;
  @ViewChild('primaryCell', { static: false }) primaryCell: TemplateRef<any>;

  locationColumnDefs: any;
  columnDefs: any;
  stopSpinner = true;
  stopSpinnerLocation = true;
  private _unsubscribeLocations: Subject<any> = new Subject<any>();
  private _unsubscribePeoples: Subject<any> = new Subject<any>();
  public peopleRowData: any = [];
  primaryPeopleId: any;
  primaryLocationId: any;

  public locationRowData: any = [];
  gridOptions = {
    rowModelType: 'serverSide',
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
  };

  locationTotal: any;
  peopleTotal: any;

  rowData1: any = [];
  rowDataPeople: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  defaultColDef2 = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  public exportLocationData: any;
  public exportLocationDetail: any;
  isDisableLocation = false;
  public exportPeopleData: any;
  public exportPeopleDetail: any;

  isDisablePeople = false;

  gridApi: any;
  gridColumnApi: any;

  gridApiLocation: any;
  gridColumnApiLocation: any;
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('tooltipText1') tooltipText1!: TemplateRef<any>;
  @Output() wirelinePageName: EventEmitter<any> = new EventEmitter<any>();
  constructor(public dialog: MatDialog, private wirelineService: WirelineService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };
    this.rowData1 = [{ Name: "Dickinson", Status: "ND", Company: "Active", AddressOne: "EOG Resources", StartDate: "2933 3rd Ave" }];
    this.rowDataPeople = [{ CustomerAccountName: "Disneyland", CompanyName: "", PeopleName: "Goofy Disney", PeopleFirstName: "", PeopleLastName: "", PeopleUserTitle: "", EmployeeId: "", ManagerName: "", ManagerEmail: "", Department: "", PeopleCustomField1: "", PeopleCustomField2: "", PeopleCustomField3: "", PeopleCustomField4: "", PeopleEmail: "goofy@disney.com", DeskPhone: "", CellPhone: "", CustomerContactType: "", UserBlockEmail: "", PeopleStatusDisplayValue: "Active", CustomerDisplayRole: "", SystemUser: "", UserAccountState: "", UserEmailVerified: "", PrimaryLocationDisplayValue: "Toon Town" }];

  }


  ngAfterViewInit() {
    this.locationColumnDefs = [
      {
        headerName: 'Organization',
        children: [
          {
            headerName: 'Customer', field: 'CustomerAccountName',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            minWidth: 150,
            flex: 0,
            editable: false,
            sortingField: 'customerAccountName'
          },
          {
            headerName: 'Company', field: 'CompanyName',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'companyName'
          },

        ]
      },
      {
        headerName: 'Location Name',
        children: [{
          headerName: 'Location Name',
          field: 'LocationName',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'close',
          minWidth: 180,
          flex: 0,
          editable: false,
          sortingField: 'locationName',
          cellRendererFramework: CommanHtmlRendererComponent,
          cellRendererParams: {
            ngTemplate: this.locationCell
          }
        },
        {
          headerName: 'Location Code',
          field: 'LocationCode',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'open',
          minWidth: 140,
          flex: 0,
          editable: false,
          sortingField: 'locationCode'
        },
        {
          headerName: 'Location Alias',
          field: 'LocationAlias',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'open',
          minWidth: 140,
          flex: 0,
          editable: false,
          sortingField: 'locationAlias'
        },
        {
          headerName: 'Location Custom 1',
          field: 'LocationCustomField1',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'open',
          minWidth: 200,
          editable: false,
          sortingField: 'locationCustomField1'
          // flex: 0
        },
        {
          headerName: 'Location Custom 2',
          field: 'LocationCustomField2',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'open',
          minWidth: 140,
          editable: false,
          flex: 0,
          sortingField: 'locationCustomField2'
        },
        {
          headerName: 'Location Custom 3',
          field: 'LocationCustomField3',
          filter: 'agTextColumnFilter', columnGroupShow: 'open',
          minWidth: 140,
          flex: 0,
          editable: false,
          sortingField: 'locationCustomField3'
        },
        {
          headerName: 'Location Custom 4',
          field: 'LocationCustomField4',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'open',
          minWidth: 140,
          flex: 0,
          editable: false,
          sortingField: 'locationCustomField4'
        }]
      },
      {
        headerName: 'Address',
        children: [
          {
            columnGroupShow: 'close',
            headerName: 'Address One',
            field: 'Address1',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'address1'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Address Two',
            field: 'Address2',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'address2'
          },
          {
            columnGroupShow: 'open',
            headerName: 'City',
            field: 'City',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'city'
          },
          {
            columnGroupShow: 'open',
            headerName: 'State/Province/Region',
            field: 'StateName',
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
            editable: false,
            sortingField: 'stateName'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Zip/Postal Code',
            field: 'PostalCode',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'postalCode'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Country',
            field: 'CountryName',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'countryName'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Same as Location Address',
            field: 'SameMailAddressDisplayValue',
            filter: 'agTextColumnFilter',
            minWidth: 240,
            flex: 0,
            editable: false,
            sortingField: 'SameMailAddressDisplayValue'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Mailing Street Address One',
            field: 'MailingAddress1',
            filter: 'agTextColumnFilter',
            minWidth: 265,
            flex: 0,
            editable: false,
            sortingField: 'MailingAddress1'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Mailing Street Address Two',
            field: 'MailingAddress2',
            filter: 'agTextColumnFilter',
            minWidth: 260,
            flex: 0,
            editable: false,
            sortingField: 'MailingAddress2'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Mailing City',
            field: 'MailingAddressCity',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'MailingAddressCity'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Mailing State/Province/Region',
            field: 'MailingAddressStateName',
            filter: 'agTextColumnFilter',
            minWidth: 285,
            flex: 0,
            editable: false,
            sortingField: 'MailingAddressStateName'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Mailing Zip/Postal Code',
            field: 'MailingAddressPostalCode',
            filter: 'agTextColumnFilter',
            minWidth: 240,
            flex: 0,
            editable: false,
            sortingField: 'MailingAddressPostalCode'
          },
          {
            columnGroupShow: 'open',
            headerName: 'Mailing Country',
            field: 'MailingAddressCountryName',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'MailingAddressCountryName'
          },
        ]
      },
      {
        headerName: 'Status',
        children: [{
          field: 'LocationStatus', headerName: 'Location Status',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'close',
          minWidth: 180,
          flex: 0,
          editable: false,
          sortingField: 'locationStatus'
        },
        {
          field: 'LocationType', headerName: 'Location Type',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'open',
          minWidth: 140,
          flex: 0,
          editable: false,
          sortingField: 'locationType'
        },
        {
          field: 'LocationTermName', headerName: 'Location Term',
          filter: 'agTextColumnFilter',
          columnGroupShow: 'open',
          minWidth: 140,
          flex: 0,
          editable: false,
          sortingField: 'LocationTermName'
        }]
      },

      // {
      //   headerName: 'Address',
      //   children: [       
      //     {
      //       columnGroupShow: 'open',
      //       headerName: 'City',
      //       field: 'City',
      //       filter: 'agTextColumnFilter',
      //       minWidth: 140,
      //       flex: 0,
      //       editable: false,
      //       sortingField: 'city'
      //     },

      //   ]
      // },

      {
        headerName: 'Dates', children: [
          {
            field: 'CompanyLocationStartDate',
            headerName: 'Start Date',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'close',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'companyLocationStartDate',
            valueFormatter: this.startDateFormatter,
          },
          {
            field: 'CompanyLocationEndDate',
            headerName: 'End Date',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'open',
            cellEditor: 'datePicker',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'companyLocationEndDate',
            valueFormatter: this.endDateFormatter,
          }]
      }
    ];
    this.columnDefs = [
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            sortingField: 'customerAccountName',
            cellRendererFramework: CommanHtmlRendererComponent,
            cellRendererParams: {
              ngTemplate: this.primaryCell
            }
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            sortingField: 'companyName'
          },
        ],
      },
      {
        headerName: 'Personal',
        children: [
          {
            headerName: 'Name',
            columnGroupShow: 'close',
            field: 'PeopleName',
            suppressMenu: true,
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            sortingField: 'peopleName'
          },
          {
            field: 'PeopleFirstName',
            headerName: 'First Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            editable: false,
            sortingField: 'peopleFirstName'
          },
          {
            field: 'PeopleLastName',
            headerName: 'Last Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            editable: false,
            sortingField: 'peopleLastName'
          },
          {
            field: 'PeopleUserTitle',
            headerName: 'Title',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
            editable: false,
            sortingField: 'peopleUserTitle'
          },
          {
            field: 'EmployeeId',
            headerName: 'Employee Id',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
            editable: false,
            sortingField: 'employeeId'
          },
          {
            field: 'ManagerName',
            headerName: 'Manager',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
            editable: false,
            sortingField: 'managerName'
          },
          {
            field: 'ManagerEmail',
            headerName: 'Manager Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
            editable: false,
            sortingField: 'managerEmail'
          },
          {
            field: 'Department',
            headerName: 'Department',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'department'
          },

          {
            field: 'PeopleCustomField1',
            headerName: 'People Custom 1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            editable: false,
            sortingField: 'peopleCustomField1'
          },
          {
            field: 'PeopleCustomField2',
            headerName: 'People Custom 2',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'peopleCustomField2'
          },
          {
            field: 'PeopleCustomField3',
            headerName: 'People Custom 3',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'peopleCustomField3'
          },
          {
            field: 'PeopleCustomField4',
            headerName: 'People Custom 4',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'peopleCustomField4'
          },
        ],
      },
      {
        headerName: 'Contact',
        children: [
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            sortingField: 'peopleEmail'
          },
          {
            field: 'DeskPhone',
            headerName: 'Desk Phone',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            editable: false,
            sortingField: 'deskPhone'
          },
          {
            field: 'CellPhone',
            headerName: 'Mobile Phone',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            editable: false,
            sortingField: 'cellPhone'
          },
          {
            field: 'CustomerContactType',
            headerName: 'Contact Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            sortingField: 'customerContactType'
          },
          {
            field: 'UserBlockEmail',
            headerName: 'Block Email',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            sortingField: 'userBlockEmail'
          },

        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'PeopleStatusDisplayValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            sortingField: 'peopleStatusDisplayValue',
            minWidth: 180,
            flex: 0,
            filter: 'agTextColumnFilter',
          },
          {
            field: 'CustomerDisplayRole',
            headerName: 'Roles',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            editable: false,
            sortingField: 'customerDisplayRole'
          },
          {
            field: 'SystemUser',
            headerName: 'System User',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            editable: false,
            sortingField: 'systemUser'
          },
          {
            field: 'UserAccountState',
            headerName: 'User Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            editable: false,
            sortingField: 'userAccountState'
          },
          {
            field: 'UserEmailVerified',
            headerName: 'Email Verification',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            editable: false,
            sortingField: 'userEmailVerified'
          },

        ],
      },
      {
        headerName: 'Location',
        children: [
          {
            field: 'PrimaryLocationDisplayValue',
            headerName: 'Location ',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
            tooltipField: 'PrimaryLocationDisplayValue',
            tooltipComponentParams: { color: '#ececec' },
            sortingField: 'primaryLocationDisplayValue'
          },
        ],
      },
    ];


    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.locationColumnDefs, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
          })
        }
      }
    });

    this.exportLocationDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Assignments_Location"
      },
      ExportToExcel: true
    };
    this.exportLocationData = this.exportLocationDetail;

    let peopleheaderData:any = [];
    let peopleChildHeaderData:any = [];
    let peoplei = 0;
    let peoplechildIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName)) {
        peoplei = peoplei + 1;
        peopleheaderData.push({ position: peoplei, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            peoplechildIndex = peoplechildIndex + 1;
            peopleChildHeaderData.push({ Position: peoplechildIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: peoplei })
          })
        }
      }
    });

    this.exportPeopleDetail = {
      ExportToExcelData: {
        HeaderData: peopleheaderData,
        ChildHeaderData: peopleChildHeaderData,
        fileName: "Assignments_People"
      },
      ExportToExcel: true
    };
    this.exportPeopleData = this.exportPeopleDetail;
  }

  ngOnInit(): void {
    this.wirelinePageName.emit('AssignmentTab');
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
  }

  onAgGridReady($event: any) {
    this.stopSpinner = true;
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'StartDate' || key === 'EndDate') {
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
          startRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          maximumRows: 100,
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        data['customerAccountId'] = this.rowData['CustomerAccountId'];


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
        this.exportPeopleData = { ...this.exportPeopleDetail, ...data };
        this._unsubscribePeoples.next(null);
        this.wirelineService
          .getInventoryContacts(data, this.rowData['VendorProductInventoryId'])
          .pipe(takeUntil(this._unsubscribePeoples))
          .subscribe(
            async (data: any) => {
              this.peopleTotal = data?.TotalCount;
              if (data && data.Data.$values.length > 0) {
                setTimeout(() => {
                  this.peopleRowData = data.Data.$values;
                  this.primaryPeopleId = _.find(this.peopleRowData, (x: any) => x.PrimaryPeople)?.PeopleId;
                }, 500);
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
              this.peopleRowData = [];
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
      this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialog2() {
    const dialogRef = this.dialog.open(this.tooltipText1, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }


  onAgGridReadyLocation($event: any) {
    this.stopSpinner = true;
    this.gridApiLocation = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'CompanyLocationStartDate' || key === 'CompanyLocationEndDate') {
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
          startRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          maximumRows: 100,
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        data['customerAccountId'] = this.rowData['CustomerAccountId'];

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
        this.exportLocationData = { ...this.exportLocationDetail, ...data };
        this._unsubscribeLocations.next(null);
        this.wirelineService
          .getInventoryLocations(data, this.rowData['VendorProductInventoryId'])
          .pipe(takeUntil(this._unsubscribeLocations))
          .subscribe(
            async (data: any) => {
              this.locationTotal = data?.TotalCount;
              if (data && data.Data.$values.length > 0) {
                this.locationRowData = data.Data.$values;
                this.primaryLocationId = _.find(this.locationRowData, (x: any) => x.PrimaryLocation)?.LocationId;

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
              this.locationRowData = [];
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
    if (this.gridApiLocation.api) {
      this.gridApiLocation.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApiLocation!.setGridOption("serverSideDatasource", dataSource);
    }
  }
  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }
  onAgGridReadyEmitLocation($event: any) {
    this.gridApiLocation = $event.api;
    this.gridColumnApiLocation = $event.columnApi;
  }
  linkLocation() {
    const dialogRef = this.dialog.open(EditLinkLocationPrimaryComponent, {
      width: '900px',
      data: {
        data: this.rowData,
        primaryPeopleId: this.primaryPeopleId
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isValuesUndefined(result)) {
        const a = this.gridApiLocation.api ? this.gridApiLocation.api : this.gridApiLocation;
        this.onAgGridReadyLocation(a);
        if (this.primaryPeopleId) {
          const b = this.gridApi.api ? this.gridApi.api : this.gridApi;
          this.onAgGridReady(b);
        }
      }
    });

  }

  onBtnExportDataAsExcel() {
  
    this.isDisablePeople = true;
    this.wirelineService
      .getInventoryContactsExcel(this.exportPeopleData, this.rowData['VendorProductInventoryId'])
      .subscribe({
        next: data => {
          this.isDisablePeople = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Assignments_People.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
         
        },
        error: error => {
          this.isDisablePeople = false;
          
        }
      });
  }

  onBtnExportDataAsExcelLocation() {
 
    this.isDisableLocation = true;
    this.wirelineService
      .getInventoryLocationsExcel(this.exportLocationData, this.rowData['VendorProductInventoryId'])
      .subscribe({
        next: data => {
          this.isDisableLocation = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Assignments_Location.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
         
        },
        error: error => {
          this.isDisableLocation = false;
          
        }
      });
  }

  startDateFormatter(params: any) {
    if (params && params.data && params.data.CompanyLocationStartDate) {
      let date = new Date(params.data.CompanyLocationStartDate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }

  endDateFormatter(params: any) {
    if (params && params.data && params.data.CompanyLocationEndDate) {
      let date = new Date(params.data.CompanyLocationEndDate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }


  linkPeople() {
    const dialogRef = this.dialog.open(LinkPeopleDialogComponent, {
      width: '900px',
      data: {
        rowData: this.rowData,
        action: 'Edit',
        openFrom: 'assignment-tab',
        primaryLocationId: this.primaryLocationId,
        isPrimaryExist: this.primaryLocationId || this.primaryPeopleId ? true : false
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isValuesUndefined(result)) {
        const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
        this.onAgGridReady(a);
        if (this.primaryLocationId) {
          const b = this.gridApiLocation.api ? this.gridApiLocation.api : this.gridApiLocation;
          this.onAgGridReadyLocation(b);
        }
      }
    });

  }
}

