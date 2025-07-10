import { Component, OnInit, Inject, ViewChild, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-vendor-product-dialog',
  templateUrl: './vendor-product-dialog.component.html',
  styleUrls: ['./vendor-product-dialog.component.scss'],
  imports: [SharedModule, PrimgModule,]
})
export class VendorProductDialogComponent implements OnInit {
  close = 'undefined';
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  rightSideTableArr: any = [];
  selectedCCVRight: any = [];
  tooltipRef2: any;
  @ViewChild('htmlContent2') htmlContent2!: TemplateRef<any>;
  vendorData: any;
  isChargeCode = false;
  popupMessage: any;
  ValidationKey: any;

  constructor(
    private locationService: LocationService, public dialog: MatDialog,
    public matDialogRef: MatDialogRef<VendorProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data : any
  ) {
    matDialogRef.disableClose = true;
    this.vendorData = data.ids;
    this.isChargeCode = data?.fromChargeCode;
    this.popupMessage = data?.popupMessage;
    this.ValidationKey = data?.ValidationKey;

    if(document?.location?.origin) {
      sessionStorage.setItem('hostname', document?.location?.origin)
    }
  }
  columnTwo = [
    { field: 'Parent', header: 'Parent' },
    { field: 'Required', header: 'Required' },
    { field: 'GroupId', header: 'Group ID' },
    { field: 'ChargeCode', header: 'Charge Code' },
    { field: 'ChargeCodeName', header: 'Charge Code Name' },
    { field: 'ChargeCodeType', header: 'Charge Code Type' },
    { field: 'VendorBillingAliasName', header: 'VBA' },
    { field: 'VendorName', header: 'Vendor' },

  ]

  openTooltip() {
    this.tooltipRef2 = this.dialog.open(this.htmlContent2, {
      width: '800px',
      data: {
        colseButton: true,
      }
    });
  }

  redirectVendor() {
    let hostname = sessionStorage.getItem('hostname');
    if(hostname) {
      const link = hostname + '/management/vendors/vendor-products?VendorProductTypeId=' + this.vendorData[0].VendorProductTypeId; 
      window.open(link, '_blank');
      this.matDialogRef.close(false);
    }
  }

  onClose() {
    if(!this.isChargeCode) {
      this.matDialogRef.close(this.rightSideTableArr);
    } else {
      this.matDialogRef.close(true);
    }
  }

  closeTooltip2() {
    this.tooltipRef2.close();
  }

  ngOnInit(): void {
    this.rightSideTableData()
  }

  rightSideTableData() {
    
    const data = {
        GroupId: this.vendorData[0].GroupId,
        VendorProductTypeId: this.vendorData[0].VendorProductTypeId
    }

    this._unsubscribeGRid.next(null);
    this.locationService
      .vendorProductChargeCodeGroups(data)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        async (res: any) => {
          this.rightSideTableArr = res.Data.$values;
          this.rightSideTableArr = _.map(this.rightSideTableArr, (x: any) => {
            return {
                ...x,
                selected: x.RequiredChargeCode === true,
                parent: x.PrimaryChargeCode === true,
                GroupId: x.GroupId,
                ChargeCodeId: x.ChargeCodeId
            };
           });
        }
      )
  }
}
