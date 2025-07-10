import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import _ from 'lodash';
import { Subject } from 'rxjs';
import { rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';


interface CustomCellRendererParams extends ICellRendererParams {
  statusList: any[];
  onClick: (params: any) => void;
}

@Component({
  selector: 'action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./action-button.component.scss'],
  imports: [SharedModule, PrimgModule],
  template: `
      <ng-container >
      <div class="actionicons-template">
        
        <span class="verified-button" [class.disabled]="superTemUser">
        <span [class.disabled]="disableViewInvoice" class="inbtn " container="body" tooltipClass="tooltip-bg" ngbTooltip="View Invoice" (click)="viewSandboxData()" ><i class="fa fa-eye"></i></span>
        <span class="inbtn " container="body" tooltipClass="tooltip-bg" ngbTooltip="Download Data Files" (click)="downloadSandboxData()"  style="left: 30px;"><i class="fas fa-cloud-download-alt"></i></span>
        <span class="inbtn " [ngClass]="{'disabled' : recordPublishedOrCompleted || isDeletedRecord}" *ngIf="this.params.data?.SandboxStatusDisplayText !== 'No Vendor'" container="body" tooltipClass="tooltip-bg" [ngbTooltip]="this.params.data?.SandboxStatusDisplayText == 'No Retrieval Record' || this.params.data?.ExpectedInvoiceId == null  ? 'Add Retrieval Record' : 'Edit Retrieval Record'" (click)="editSandboxData()"  style="left: 60px;"><i class="fas fa-edit"></i></span>
        <span class="inbtn " container="body" tooltipClass="tooltip-bg" *ngIf="this.params.data?.SandboxStatusDisplayText == 'No Retrieval Record' || this.params.data?.SandboxStatusDisplayText == 'No Vendor'" ngbTooltip="Search Retrieval" style="left: 60px;" (click)="searchClick()">
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
 "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="13px" viewBox="0 0 324.000000 312.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,312.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M621 3108 c-262 -37 -460 -208 -528 -453 -8 -30 -25 -249 -43 -545
-42 -716 -52 -983 -48 -1265 4 -250 4 -250 35 -338 43 -122 85 -189 178 -283
133 -134 289 -198 485 -198 129 0 189 13 305 69 186 90 307 231 376 440 l24
70 -4 507 -3 506 59 13 c76 16 234 16 301 0 l52 -13 0 -476 c0 -508 4 -551 52
-672 82 -206 263 -367 479 -426 87 -24 261 -24 348 0 235 64 424 243 498 471
34 105 39 246 24 675 -18 516 -70 1387 -86 1455 -55 221 -231 392 -465 452
-85 21 -235 21 -320 -2 -169 -44 -322 -169 -399 -326 -38 -78 -71 -196 -71
-255 0 -28 6 -27 -95 -9 -105 19 -233 19 -335 -1 -45 -8 -84 -13 -86 -11 -3 2
-9 33 -15 68 -13 82 -45 183 -76 236 -96 170 -268 284 -468 313 -80 11 -86 11
-174 -2z m222 -304 c68 -23 148 -100 180 -172 30 -67 60 -263 41 -269 -31 -10
-120 -71 -136 -93 -50 -68 -23 -169 55 -210 56 -30 89 -23 186 35 300 180 588
180 877 0 40 -25 85 -48 102 -51 66 -13 138 35 161 107 23 72 -7 127 -99 179
l-62 35 6 85 c9 154 58 256 149 317 66 44 117 58 212 58 68 -1 90 -5 146 -32
80 -37 134 -89 166 -160 24 -51 26 -74 53 -576 16 -287 32 -573 36 -636 3 -62
2 -112 -2 -109 -5 2 -47 23 -94 46 -201 99 -417 97 -622 -6 l-98 -49 0 82 0
83 58 -5 c45 -3 63 0 89 16 64 40 88 143 46 199 -27 38 -190 134 -298 176
-140 55 -199 68 -345 73 -158 6 -266 -10 -401 -61 -110 -41 -268 -129 -309
-171 -61 -63 -47 -161 30 -213 30 -20 44 -23 93 -19 l57 5 0 -83 0 -82 -97 49
c-112 56 -201 78 -320 78 -112 0 -220 -26 -320 -76 l-83 -41 0 55 c0 78 58
1138 65 1187 29 203 261 325 478 249z m6 -1685 c164 -57 284 -239 267 -405
-28 -269 -232 -438 -478 -396 -85 15 -156 50 -219 109 -93 87 -133 187 -127
322 3 77 7 96 40 163 97 195 310 280 517 207z m1796 4 c154 -48 271 -195 283
-352 12 -175 -79 -346 -222 -416 -214 -105 -466 -15 -569 203 -30 62 -32 75
-32 172 0 94 3 111 28 164 36 78 85 136 149 178 113 75 234 91 363 51z"/>
</g>
</svg>
</span>
        <span class="inbtn " [ngClass]="{'disabled' : recordPublishedOrCompleted || isDeletedRecord}" container="body" tooltipClass="tooltip-bg" ngbTooltip="Rerun Retrieval" (click)="refreshSandboxData()"  style="left: 90px;"><i class="fa fa-eye c-refresh"></i></span>
        </span>

        <span class="inbtn" *ngIf="isStatusNoRetrievalRecord" container="body" tooltipClass="tooltip-bg" ngbTooltip="Delete"   (click)="removeRecord(params?.data)" style="cursor: pointer;"><i class="fas fa-trash"></i></span>
    </div>
      </ng-container>
  `,
})

export class ActionButtonRender implements OnInit {

  params: CustomCellRendererParams;
  isShowAccept = false;
  disableViewInvoice: boolean = false;
  public superTemUser = false;
  recordPublishedOrCompleted = false;
  isStatusNoRetrievalRecord: boolean = false;
  isDeletedRecord: boolean = false;
  statusList: any;
  private readonly _unsubscribeDownloadInvoice = new Subject<void>();
  constructor(private sandBoxService: SandBoxService, public dialog: MatDialog,
    private locationService: LocationService
  ) {
  }
  ngOnInit(): void {
    this.superTemUser = rolePermission(['SuperTEMUser']);
  }
  public cellValue!: string;

  agInit(params: ICellRendererParams): void {
    this.params = params as CustomCellRendererParams;
    this.statusList = (params as CustomCellRendererParams).statusList;

    this.disableViewInvoice = this.params.data?.IsExpectedInvoicePDFAvailable ? false : true;
    if(this.params.data?.SandboxStatusDisplayText === 'Completed' || this.params.data?.SandboxStatusDisplayText === 'Published') {
      this.recordPublishedOrCompleted = true;
    } else {
      this.recordPublishedOrCompleted = false;
    }

    if (this.params.data?.SandboxStatusDisplayText == 'Pending' || this.params.data?.SandboxStatusDisplayText == 'Working' || this.params.data?.SandboxStatusDisplayText == 'Processing' || this.params.data?.SandboxStatusDisplayText == 'Data Issue') {
      this.isShowAccept = true;
    }

    if(this.params.data?.SandboxStatusDisplayText == 'No Retrieval Record'){
      this.isStatusNoRetrievalRecord = true;
    }

    if(this.params.data?.SandboxStatusDisplayText == 'Deleted'){
      this.isDeletedRecord = true;
    }
  }

  refresh(params: ICellRendererParams) {
  }

  viewSandboxData() {
    this._unsubscribeDownloadInvoice.next();
    this.locationService.DownloadInvoiceAttachment(this.params.data.ExpectedInvoiceId).subscribe((res) => {
      if (res.type == 'application/json') {
        
      } else {
        let bolbUrl = URL.createObjectURL(res);
        window.open(bolbUrl, '_blank');
        
      }
    });

  }
  searchClick() {
    const params = {
      redirect: true,
      type: 'search',
      data: this.params.data
    }
    this.params.onClick(params);
  }
  editSandboxData() {
    // if (this.params.data.ExpectedInvoiceId == null) {
    if (this.params.data?.SandboxStatusDisplayText == 'No Vendor') {
      // 
    } else if (this.params.data?.SandboxStatusDisplayText == 'No Retrieval Record') {
      if (this.params.data?.ExpectedInvoiceId == null) {
        const params = {
          redirect: true,
          type: 'add',
          data: this.params.data
        }
        this.params.onClick(params);
      }
    } else {
      if (this.params.data?.ExpectedInvoiceId !== null) {
        const params = {
          redirect: true,
          type: 'edit',
          data: this.params.data
        }
        this.params.onClick(params);
      }
    }

  }
  downloadSandboxData() {
    
    this.sandBoxService.downloadDataFiles(this.params.data.SBInvoiceId).subscribe((res) => {
      if (res.type == 'application/json') {
        
      } else {
        let bolbUrl = URL.createObjectURL(res);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", 'Sandbox_'+ new Date().toLocaleDateString());

        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      }
    });
  }

  refreshSandboxData() {
    this.sandBoxService.refreshGridData(this.params.data.SBInvoiceId).subscribe((res: any) => {
      if(res.Success) {
        this.params.onClick({reload: true});
      }
    })
  }


  removeRecord(params: any) {
    let passid;
    if (params?.SandboxStatusDisplayText == 'No Retrieval Record') {
      passid = _.find(this.statusList, (x: any) => x.DisplayText == 'Deleted').Id;
    } 
    this.sandBoxService.sandboxStatus(params.SBInvoiceId, passid).subscribe((res) => {
      this.params.onClick({reload: true});
    })
  }

  acceptSandboxData() {

  }
}