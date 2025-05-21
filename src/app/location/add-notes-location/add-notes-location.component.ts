import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import _ from 'lodash';
import { TreeNode } from 'primeng/api';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { onChangeEndDate } from 'src/app/services/common-p-table';
import { AddLocationNotesDialogComponent } from '../add-location-notes-dialog/add-location-notes-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';

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
  selector: 'app-add-notes-location',
  templateUrl: './add-notes-location.component.html',
  styleUrls: ['./add-notes-location.component.scss'],
  providers: [LocationService],
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ]
})
export class AddNotesLocationComponent implements OnInit {

  @Input() locationaData: any;

  selectedRows: number = 0;
  public locationId: any;
  public locationNoteIds: any;
  headerCount: number = 1;
  public rowData: any = [];

  hasSsuperTemUsers: boolean = false;

  private _unsubscribeNotes: Subject<any> = new Subject<any>();
  private _unsubscribeActive: Subject<any> = new Subject<any>();
  selectedRecords: any[] = [];

  cols: any[];
  totalRecords: number;
 
  selectedNode: any;
  public exportAccounts: any;

  refreshbutton: boolean = false;
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  loader: boolean = false;
  payload: any = {};
  GridAPI: any = api_list.Location.Location.locationNotesLocation;
  exportData: any = {};

  constructor(private locationService: LocationService, public dialog: MatDialog) {
  }

  setCols() {
    this.hasSsuperTemUsers = this.locationService.isUserHasSuperTEMUsersRole();

    const createColumn = ({
      parent,
      width,
      isChildren,
      type,
      header,
      field,
      childHeader,
      columnGroupShow = 'close',
      colspan = 1,
      parentWidth = 150,
      isParentVisible = false,
      displayCheckboxColumns = true,
      isToggle = true
    }: {
      parent: any;
      width: any;
      isChildren: any;
      type?: any;
      header?: any;
      field?: any;
      childHeader?: any;
      columnGroupShow?: string;
      colspan?: number;
      parentWidth?: number;
      isParentVisible?: boolean;
      displayCheckboxColumns?: boolean;
      isToggle?: boolean;
    }) => ({
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


    if (this.hasSsuperTemUsers) {
      this.cols = [
        createColumn({ parent: 1, width: '60px', isChildren: true, type: 'checkbox' }),
        createColumn({ parent: 2, width: '170px', isChildren: true, field: 'LocationName', childHeader: 'Location Name' }),
        createColumn({ parent: 3, width: '104px', isChildren: true, type: 'dateFilter', field: 'LocationNoteCreatedDate', childHeader: 'Date' }),
        createColumn({ parent: 4, width: '300px', isChildren: true, field: 'Notes', childHeader: 'Notes' }),
        createColumn({ parent: 5, width: '140px', isChildren: true, type: 'icon', field: 'IsLocationNoteAttachment', childHeader: 'Attachments' }),
        createColumn({ parent: 6, width: '130px', isChildren: true, field: 'LocationNoteStatus', childHeader: 'Note Status' }),
        createColumn({ parent: 7, width: '110px', isChildren: true, field: 'NoteType', childHeader: 'Note Type' }),
        createColumn({ parent: 8, width: '300px', isChildren: true, field: 'LocationNoteCreatedByWithEmail', childHeader: 'Who' })
      ];
    } else {
      this.cols = [
        createColumn({ parent: 1, width: '60px', isChildren: true, type: 'checkbox' }),
        createColumn({ parent: 2, width: '170px', isChildren: true, field: 'LocationName', childHeader: 'Location Name' }),
        createColumn({ parent: 3, width: '104px', isChildren: true, type: 'dateFilter', field: 'LocationNoteCreatedDate', childHeader: 'Date' }),
        createColumn({ parent: 4, width: '300px', isChildren: true, field: 'Notes', childHeader: 'Notes' }),
        createColumn({ parent: 5, width: '140px', isChildren: true, type: 'icon', field: 'IsLocationNoteAttachment', childHeader: 'Attachments' }),
        createColumn({ parent: 6, width: '130px', isChildren: true, field: 'LocationNoteStatus', childHeader: 'Note Status' }),
        createColumn({ parent: 7, width: '300px', isChildren: true, field: 'LocationNoteCreatedByWithEmail', childHeader: 'Who' })
      ];
    }
  }

  ngOnInit(): void {
    this.hasSsuperTemUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.payload = {
      "locationId": this.locationaData.LocationId,
      "privateNote": this.hasSsuperTemUsers ? null : false,
      "status": null,
      "isNeed3RecordOnly": null
    }

    this.setCols();
  }

  buttonClickedForLocation(rowData: any) {
    this.locationService.downloadLocationNotes(rowData.LocationNoteId).subscribe({
      next: dataa => {
        let bolbUrl = URL.createObjectURL(dataa);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);

        link.setAttribute("download", rowData.UploadFileName);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: error => {

      }
    });
  }

  createDateFormatter(data: any) {
    if (data) {
      let date = new Date(data);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }

  addNotes() {
    const dialogRef = this.dialog.open(AddLocationNotesDialogComponent, {
      panelClass: ['width-900', 'popup-custom-design'],
      data: { rowData: this.rowData, locationaData: this.locationaData },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshbuttonEmitFn(true);
      }
    });
  }

  setChangeLocationNotesStatus(type: any) {
    const selectedLocationNotesId: any = [];
    this.selectedRecords.forEach((e) => {
      this.locationId = this.locationaData.LocationId;
      selectedLocationNotesId.push(e['LocationNoteId']);
    });
    this.locationNoteIds = selectedLocationNotesId;

    if (this.selectedRecords.length == 0) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'Please select at least 1 note.'
      }
      this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    } else {
      if (this.selectedRecords.length >= 1) {
        let isInActive = _.some(this.selectedRecords, (x: any) => x.LocationNoteStatus == 'Inactive');
        let isActive = _.some(this.selectedRecords, (x: any) => x.LocationNoteStatus == 'Active');
        if (isInActive && type == 'inactive') {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Please select Active notes to change the status to Inactive.'
          }
          this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        } else if (isActive && type == 'active') {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Please select Inactive notes to change the status to Active.'
          }
          this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        } else {
          const data: any = {};
          data['locationId'] = this.locationId;
          data['locationNoteIds'] = this.locationNoteIds;
          data['active'] = (type == 'active') ? true : false;
          this._unsubscribeActive.next(null);
          this.locationService.makeLocationNotesStatusActive(data).pipe(takeUntil(this._unsubscribeActive)).subscribe((response) => {
            if (response.Success) {
              this.errorPopup(response);
              this.selectedRecords = [];
              this.refreshbuttonEmitFn(true);
            } else {
              this.selectedRecords = [];
              this.errorPopup(response);
            }
          }, error => {
            this.selectedRecords = [];
            this.errorPopup(error);
          });
        }
      }
    }
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
    });
  }

  // P-Table code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  ngOnDestroy() {
    this._unsubscribeNotes.next(null);
    this._unsubscribeNotes.complete();
    this._unsubscribeActive.next(null);
    this._unsubscribeActive.complete();
  }


  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  tableDataExistFn(event: any) {
    this.tableDataExist.emit(event)
  }

  exportAccountDataFn(event: any) {
    this.exportData = event;
    this.exportAccountData.emit(event)
  }

  selectedRowsEmitFn(event: any) {
    this.selectedRowsEmit.emit(event);
    this.selectedRecords = event;
    const selectedInventory: any = [];
    if (this.selectedRecords.length > 0) {
      this.selectedRecords.forEach((e: any) => {
        selectedInventory.push(e['LocationNoteId'])
      });
      this.locationNoteIds = selectedInventory;
    } else {
      this.locationNoteIds = []
    }

  }

  rowCellDoubleClickedFn(event: any) {
    this.rowCellDoubleClicked.emit(event)
  }
  totalRecordsEmitFn(event: any) {
    this.totalRecords = event;
  }
  loaderEmitFn(event: any) {
    this.loader = event;
    this.loaderEmitParent.emit(event);
  }

}
