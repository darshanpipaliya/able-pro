import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-change-log',
  templateUrl: './change-log.component.html',
  styleUrls: ['./change-log.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
  ]
})
export class ChangeLogComponent implements OnInit {

  @Input() title: string = '';
  @Input() column: any = [];
  @Input() changelogData: any = [];
  @Input() vpInventoryID: any;
  @Input() customerID: any;
  @Input() companyID: any;
  @Input() ccId: any;
  @Input() locationId: any;
  @Input() peopleId: any;
  @Input() billingId: any;
  @Input() className: any;
  @Input() logLoader: any;
  @Input() rowData: any;
  @Input() retrievalId: any;
  @Input() userId: any;
  @Input() chargeCodeGroupId: any;

  loadingDataFromApi = false;
  @Input() recordChild: boolean;
  @Input() isShowAction: boolean;
  @Input() height: any = '250px';

  @Output() setCustomerDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  
  private _unsubscribeChangelog: Subject<any> = new Subject<any>();

  tableData: any;
  cols: any[];

  constructor(private locationService: LocationService) {
  }

  ngOnInit(): void {
    if(this.rowData) {
      this.setCustomerDDValueEvent.emit(this.rowData.CustomerAccountId);
      this.setTemDDValueEvent.emit(this.rowData.TEMAccountId);
    }
    
    this.changeLogData();
  }

  getChangeLogData() {
    this.loadingDataFromApi = true;

    this._unsubscribeChangelog.next(null);
    this.locationService.getCustomerChangelogs(this.customerID).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.loadingDataFromApi = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  changeLogData(){
    if (this.vpInventoryID) {
      this.getWirelineMobileChangelogs();
    }

    if(this.locationId) {
      this.getLocationChangelogs();
    }

    if(this.peopleId) {
      this.getPeopleChangelogs();
    }

    if(this.billingId) {
      this.getAccountChangelog();
    }

    if(this.customerID) {
      this.getChangeLogData();
    }

    if(this.companyID) {
      this.getCompanyChangeLogData();
    }

    if (this.ccId) {
      this.getCCLogData();
    }

    if(this.retrievalId) {
      this.getInvoiceChangelogData()
    }

    if(this.userId) {
      this.getUserChangelogs();
    }

    if(this.chargeCodeGroupId) {
       this.chargecodegroupsChangeLogs();
    }
  }

  chargecodegroupsChangeLogs() {
    this.logLoader = true;
    this._unsubscribeChangelog.next(null);
    this.locationService.getChargeCodeGrouplogs(this.chargeCodeGroupId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
        this.logLoader = false;
        if (data.Success) {
            this.changelogData = data.Data.$values;
        } else {
            this.changelogData = [];
        }
    });
  }

  getUserChangelogs() {
    this.logLoader = true;
    this._unsubscribeChangelog.next(null);
    this.locationService.getUserChangelogs(this.userId).pipe(takeUntil(this._unsubscribeChangelog))
        .subscribe((data: any) => {
            this.logLoader = false;
            if (data.Success) {
                this.changelogData = data.Data.$values;
            } else {
                this.changelogData = [];
            }
        });
  }

  getCCLogData(){
    this._unsubscribeChangelog.next(null);
        this.loadingDataFromApi = true;
        this.locationService.getCostCenterChangelogs(this.ccId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
            this.loadingDataFromApi = false;
            if(data.Success) {
                this.changelogData = data.Data.$values;
            } else {
                this.changelogData = [];
            }
        });
  }

  getCompanyChangeLogData() {
    this._unsubscribeChangelog.next(null);
    this.loadingDataFromApi = true;
    this.locationService.getCompanyChangelogs(this.companyID).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.loadingDataFromApi = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  getInvoiceChangelogData() {
    this.logLoader = true;
    this._unsubscribeChangelog.next(null);
    this.locationService.getInvoiceRetrievalChangelogs(this.retrievalId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.logLoader = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }


  getAccountChangelog() {
    this._unsubscribeChangelog.next(null);
    this.loadingDataFromApi = true;

    this.locationService.getAccountChangelogs(this.billingId).pipe(takeUntil(this._unsubscribeChangelog))
      .subscribe((data: any) => {
        this.loadingDataFromApi = false;
        if(data.Success) {
          this.changelogData = data.Data.$values;
        } else {
          this.changelogData = [];
        }
      });
  }

  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY h:mm');
  }

  getLocationChangelogs() {
    this._unsubscribeChangelog.next(null);
    this.loadingDataFromApi = true;

    this.locationService.getLocationChangelogs(this.locationId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.loadingDataFromApi = false;
      
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  getPeopleChangelogs() {
    this._unsubscribeChangelog.next(null);
    this.loadingDataFromApi = true;
    this.locationService.getPeopleChangelogs(this.peopleId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.loadingDataFromApi = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  getWirelineMobileChangelogs() {
    this._unsubscribeChangelog.next(null);
    this.loadingDataFromApi = true;
    this.locationService.getWirelineMobileChangelogs(this.vpInventoryID, this.recordChild).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.loadingDataFromApi = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeChangelog.next(null);
    this._unsubscribeChangelog.complete();
  }
}
