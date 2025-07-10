import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import moment from 'moment';
import * as _ from 'lodash';
import { interval, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, takeWhile } from 'rxjs/operators';
import { ActionPopupComponent } from '../distribution-rule/action-popup/action-popup.component';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist } from 'src/app/services/helper';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-invoice-overview',
  templateUrl: './invoice-overview.component.html',
  styleUrls: ['./invoice-overview.component.scss'],
  imports: [SharedModule, PrimgModule],
})
export class InvoiceOverviewComponent implements OnInit {
  @Input() shoDayRemained: any;
  @Input() sandBoxGridRowData: any;
  @Input() refreshDatas: any;
  @Input() fetchedData: any; 
  @Input() fromStep5: any; 
  @Input() openPage: any; 
  @Input() selectedTab: any;
 showWarning: any;

  @Output() invoiceOverviewDataOutput: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshData: EventEmitter<any> = new EventEmitter<any>();
  @Output() fetchedDataDataOutput: EventEmitter<any> = new EventEmitter<any>();
  @Output() reloadGrid: EventEmitter<any> = new EventEmitter<any>();

  private readonly _unsubscribeDownloadInvoice = new Subject<void>();

  invoiceOverviewData: any;
  gridApi: any; 
  gridColumnApi: any; 
  isDisabledExport = false; 
  constructor(public sandBoxService: SandBoxService,
    public dialog: MatDialog, private locationService: LocationService) { }
  public invoiceDate: any;
  statusList: any;
  showLoader = false;
  downloadAttachmentDisabled = false;
  downloadFileDisabled = false;

  ngOnInit(): void {
    this.getStatus();
    this.getInvoiceOverview();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['refreshDatas']?.currentValue == true) {
      
      this.getInvoiceOverview();
    }
  }

  downloadAttachment() {
    const fileName = this.generateFileName('Invoice');
    
    this.downloadAttachmentDisabled = true;
    this._unsubscribeDownloadInvoice.next();
    this.locationService.DownloadInvoiceAttachment(this.sandBoxGridRowData.ExpectedInvoiceId).subscribe((res: any) => {
      this.downloadAttachmentDisabled = false;
      if (res.type == 'application/json') {
        
      } else {
        const fileExtension = this.getFileExtension(res.type);
        let bolbUrl = URL.createObjectURL(res);
        window.open(bolbUrl);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", `${fileName}.${fileExtension}`);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      }
    });
  }

  downloadFile() {
    const fileName = this.generateFileName('DataFile');
    this.downloadFileDisabled = true;
    this.sandBoxService.downloadDataFiles(this.sandBoxGridRowData.SBInvoiceId).subscribe({
      next: (res) => {
      this.downloadFileDisabled = false;
      if (res.type == 'application/json') {
        
        } else {
          const fileExtension = this.getFileExtension(res.type);
          let bolbUrl = URL.createObjectURL(res);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", `${fileName}.${fileExtension}`);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        }
      },
      error: (err) => {
        this.downloadFileDisabled = false;
      }
    });
   
  }

  getFileExtension(contentType: string): string {
    const map: { [key: string]: string } = {
      'application/zip': 'zip',
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/csv': 'csv',
      'application/json': 'json'
    };
  
    return map[contentType] || 'bin';
  }
  

  generateFileName(fileType: 'Invoice' | 'DataFile' | 'PreSB' | 'SB'): string {
    const removeNonAlphaNumerics = (input: string): string =>
      input.replace(/[^a-zA-Z0-9]/g, '');
  
    const formatDate = (date: Date): string => {
      const options = { month: 'short', day: '2-digit', year: 'numeric' } as const;
      return date.toLocaleDateString('en-US', options).replace(/,|\s/g, ''); 
    };
  
    const customer = removeNonAlphaNumerics(this.invoiceOverviewData.CustomerAccountName);
    const vendor = removeNonAlphaNumerics(this.invoiceOverviewData.VendorAccountName);
    const payable = removeNonAlphaNumerics(this.invoiceOverviewData.PayableAccountNumber);
    const date = formatDate(new Date(this.invoiceOverviewData.InvoiceBillDate));
  
    return `${customer}_${vendor}_${payable}_${date}_${fileType}`;
  }


  getStatus() {
    this.sandBoxService.statusList().subscribe((res: any) => {
      this.statusList = res.Data.$values;
    })
  }


  checkWarningConditions() {
    this.showWarning = false;
    if(!this.invoiceOverviewData) return;

    const pastDue = parseFloat(this.invoiceOverviewData.PastDueAmount);
    const currentCharges = parseFloat(this.invoiceOverviewData.TotalCurrentCharges);
    const sum = pastDue + currentCharges;

    this.showWarning = pastDue < 0 && currentCharges > 0 && sum === 0 ;
  }


  changeStatus(data: any) {
    this.showLoader = true;
    let passid;

    // EAB-3038
    if (data == 'Data Issue') {
      passid = _.find(this.statusList, (x: any) => x.DisplayText == 'Working').Id
    } else {
      passid = _.find(this.statusList, (x: any) => x.DisplayText == 'Data Issue').Id
    }
    this.sandBoxService.sandboxStatus(this.sandBoxGridRowData.SBInvoiceId, passid).subscribe((res) => {
      this.showLoader = false;
      this.getInvoiceOverview();
    })
  }
  getInvoiceOverview() {
    if (this.sandBoxGridRowData && this.sandBoxGridRowData.SBInvoiceId) {
      let passdata: any = {}
      if (this.openPage === 'vststep1') {
        passdata['currentStep'] = 'invoicetotal'
      }
      if (this.openPage === 'vbastep2') {
        passdata['currentStep'] = 'vbaassignment'
      }

      if(this.fromStep5) {
        passdata['currentStep'] = 'VendorProductAssignment'
      }
      this.sandBoxService.getInvoiceOverview(this.sandBoxGridRowData.SBInvoiceId, passdata).subscribe((data: any) => {
        this.invoiceOverviewData = data.Data;
        this.invoiceOverviewDataOutput.emit(data.Data);

        this.checkWarningConditions();

        // if(passdata['currentStep'] !== 'invoicetotal' && passdata['currentStep'] !== 'vbaassignment') {
        //   const stepData = {
        //     SBInvoiceId: this.sandBoxGridRowData.SBInvoiceId
        //   }
        //     this.sandBoxService.invoiceProcesingStep(stepData).subscribe((res: any) => {
        //     });
        //   }
        if (data && data.Data) {
          this.invoiceDate = moment(data.Data.InvoiceBillDate).format('MM/DD/YYYY');
          // this.invoiceOverviewData['AmountToPay'] = data.Data.AmountToPay ? parseFloat(data.Data.AmountToPay).toFixed(2) : '0.00';
          // this.invoiceOverviewData['ChargeDetailTotal'] = data.Data.ChargeDetailTotal ? parseFloat(data.Data.ChargeDetailTotal).toFixed(2) : '0.00';
          // this.invoiceOverviewData['DifferencesDisplay'] = data.Data.DifferencesDisplay ? parseFloat(data.Data.DifferencesDisplay).toFixed(2) : '0.00';

          // this.invoiceOverviewData['AmountToPay'] =  data.Data?.AmountToPay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          // this.invoiceOverviewData['ChargeDetailTotal'] =  data.Data?.ChargeDetailTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          // this.invoiceOverviewData['DifferencesDisplay'] =  data.Data?.DifferencesDisplay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        let isSandboxDialogOpen = false;
    

        let NeedToUpdateProcessing = false;
        if(this.invoiceOverviewData.SandboxStatus !== 'DATA ISSUE' && this.invoiceOverviewData.SandboxStatus !== 'PUBLISHED') {
          if(this.selectedTab == 3 || this.selectedTab == 4 || this.selectedTab == 5 || this.selectedTab == 6 || this.selectedTab == 7 || this.selectedTab == 8) {
          
            if(this.invoiceOverviewData.SandboxStatus == 'SANDBOX PROCESSING') {
              NeedToUpdateProcessing = false;
            } else if(this.selectedTab == 3 && !this.invoiceOverviewData.InvoiceProcessingStepsData.ChargeCodeAssignment) {
                NeedToUpdateProcessing = true;
              } else if(this.selectedTab == 4 && !this.invoiceOverviewData.InvoiceProcessingStepsData.ChargeValidation) {
                NeedToUpdateProcessing = true;
              } else if(this.selectedTab == 5 && !this.invoiceOverviewData.InvoiceProcessingStepsData.CostDistributionRules) {
                NeedToUpdateProcessing = true;
              } else if(this.selectedTab == 6 && !this.invoiceOverviewData.InvoiceProcessingStepsData.VendorProductAssignment) {
                NeedToUpdateProcessing = true;
              } else if(this.selectedTab == 7 && !this.invoiceOverviewData.InvoiceProcessingStepsData.ChargeDistribution) {
                NeedToUpdateProcessing = true;
              } else if(this.selectedTab == 8) {
                NeedToUpdateProcessing = false;
              }
              this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId, NeedToUpdateProcessing).subscribe((res: any) => {    
              })
          } 
        }
        
        if(this.invoiceOverviewData.SandboxStatus == 'SANDBOX PROCESSING' || NeedToUpdateProcessing) {
          this.dialog?.closeAll();
          
          if (!isSandboxDialogOpen && isValueExist(this.selectedTab)) {
          this.dialog?.closeAll();
          const dialogRef: any = this.dialog.open(ActionPopupComponent, {
              width: '400px',
              disableClose: true,
              data: { text: 'Give us a sec while we make things awesome!' }
            });
            (this.dialog as any)['disableClose'] = true;
            isSandboxDialogOpen = true;
            let i = 0;
            
           interval(5000).pipe(
            switchMap(() => this.sandBoxService.getInvoiceOverview(this.sandBoxGridRowData.SBInvoiceId, {})),
            takeWhile((res: any) => res.Data.SandboxStatus === 'SANDBOX PROCESSING', true) // `true` includes last emission
          ).subscribe(res => {
            i++;
            if(i > 4) {
              const instance = dialogRef.componentInstance;
              instance?.updateMessage('Almost there! The system is doing its thing.');
            }
            this.invoiceOverviewData = res.Data;
            this.invoiceOverviewDataOutput.emit(res.Data);

            if (res.Data.SandboxStatus !== 'SANDBOX PROCESSING') {
              this.dialog.closeAll();
              this.reloadGrid.emit(true);
              isSandboxDialogOpen = false;
            }
          });
        }
      }
        this.fetchedData = true;
        this.fetchedDataDataOutput.emit(this.fetchedData);

      });
    }
  }
  onBtnExportDataAsExcel(sandbox = false) {
    if(!sandbox) {
      if (!this.invoiceOverviewData || this.invoiceOverviewData.length === 0) {
        return;
      }
    }
    // Disable the export button while exporting
    this.isDisabledExport = true;
    const fileName = this.generateFileName(sandbox ? 'SB' : 'PreSB');
  
    // Prepare data for export
    const exportData = {
      exportFilename:  sandbox ? 'Sandbox Data - ' + this.sandBoxGridRowData.InvoiceNumber :'Invoice_Overview.xlsx',
      sheetName: 'Invoice Overview',
      gridApi: this.gridApi,
      gridColumnApi: this.gridColumnApi
    };
  
    
    const payload = {
      IsSbInvoiceId: true
    }

    // Call the new DownloadBdfOrEdiData API with IsEdiOrBDF flag and SbInvoiceId
    const isEdiOrBDF = true; // Assuming you have this flag logic ready
    this.sandBoxService.downloaBDFFiles(this.sandBoxGridRowData.SBInvoiceId, sandbox ? payload : {}).subscribe({
      next: (data: Blob) => {
        // Enable the export button again
        this.isDisabledExport = false;
  
        // Check the MIME type to determine the file status
        if (data.type === 'application/json') {
         
        } else {
          const fileExtension = this.getFileExtension(data.type);

          // Create a blob URL and trigger download
          const blobUrl = URL.createObjectURL(data);
          const link = document.createElement('a');
          link.setAttribute('href', blobUrl);
          link.setAttribute('download', `${fileName}.${fileExtension}`);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
  
        }
      },
      error: () => {
        // Enable the export button again in case of an error
        this.isDisabledExport = false;
  
       
      }
    });
  }
}