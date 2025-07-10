import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import moment from 'moment';
import { interval, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, takeWhile } from 'rxjs/operators';
import { FinanceInvoicesService } from 'src/app/services/finance-invoices.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { LocationService } from 'src/app/services/location.service';
import { ActionPopupComponent } from '../action-popup/action-popup.component';

@Component({
  selector: 'app-invoice-overview-i',
  templateUrl: './invoice-overview-i.component.html',
  styleUrls: ['./invoice-overview-i.component.scss']
})
export class InvoiceOverviewIComponent implements OnInit {
  @Input() refreshDatas: any;
  @Input() gridRowData: any;
  @Input() fromPage: any;
  @Input() selectedTab: any;


  @Output() invoiceOverviewDataOutput: EventEmitter<any> = new EventEmitter<any>();
  private readonly _unsubscribeDownloadInvoice = new Subject<void>();

  invoiceOvervewData: any;
  downloadinvoiceloader = false;

  constructor(private financeInvoicesService: FinanceInvoicesService, public dialog: MatDialog, private invoiceService: InvoiceService,
    private locationService: LocationService) { }

  ngOnInit(): void {
    this.getInvoiceOverview();
  }

  getInvoiceOverview() {
    this.financeInvoicesService.getInvoiceOverview(this.gridRowData.InvoiceId).subscribe((res: any) => {
      this.invoiceOvervewData = res.Data;
      this.invoiceOvervewData.InvoiceBillDate = res.Data.InvoiceBillDate !== null ? moment(res.Data.InvoiceBillDate).format('MM/DD/YYYY') : '';
      this.invoiceOvervewData.InvoicePayByDate = res.Data.InvoicePayByDate !== null ? moment(res.Data.InvoicePayByDate).format('MM/DD/YYYY') : '';
      this.invoiceOverviewDataOutput.emit(res.Data);
      this.locationService.setStepData(res.Data);

      if (this.invoiceOvervewData?.InvoiceStatusDisplayText == 'Cost Allocation' && this.selectedTab == 3) {

        const data = {
          CheckPreDefault: true
        }

        this.invoiceService.getcostAllocationStructure(this.gridRowData.InvoiceId, data).subscribe((res: any) => {
          let isCostAllocationDialogOpen = false;
          if (res.Success && res.TotalCount > 0) {
            if (!isCostAllocationDialogOpen) {
            this.dialog?.closeAll();
            const dialogRef = this.dialog.open(ActionPopupComponent, {
              width: '400px',
              disableClose: true,
              data: { text: 'Give us a sec while we work our magic…' }
            });
             isCostAllocationDialogOpen = true;
            interval(5000).pipe(
              switchMap(() =>
                this.financeInvoicesService.getInvoiceOverview(this.gridRowData.InvoiceId)
              ),
              takeWhile((res: any) => res.Data.InvoiceStatusDisplayText == 'Cost Allocation', true)
            ).subscribe(res => {
              this.invoiceOvervewData = res.Data;
              if (res.Data.InvoiceStatusDisplayText !== 'Cost Allocation') {
                this.dialog.closeAll();
                isCostAllocationDialogOpen = false;
              }
              this.invoiceOverviewDataOutput.emit(res.Data);
              this.locationService.setStepData(res.Data);
            });
          }
        }
        })
      }

     
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshDatas']?.currentValue == true) {
      this.getInvoiceOverview();
    }
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
  downloadAttachment() {
    const fileName = this.generateFileName('Invoice');

    this.downloadinvoiceloader = true;

    this.locationService.downloadInvoiceAttachment(this.invoiceOvervewData.ExpectedInvoiceId).subscribe({
      next: (res) => {
        var fileURL = URL.createObjectURL(res);
        window.open(fileURL);
        const fileExtension = this.getFileExtension(res.type);

        // if (this.fromPage == 'distribution-detail' || this.fromPage == 'rule-engine') {
        var link = document.createElement("a");
        link.setAttribute("href", fileURL);
        link.setAttribute("download", `${fileName}.${fileExtension}`);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // }

        this.downloadinvoiceloader = false;
      },
      error: (err) => {
        this.downloadinvoiceloader = false;
      }
    });
  }
  generateFileName(fileType: 'Invoice'): string {
    const removeNonAlphaNumerics = (input: string): string =>
      input.replace(/[^a-zA-Z0-9]/g, '');

    const formatDate = (date: Date): string => {
      const options = { month: 'short', day: '2-digit', year: 'numeric' } as const;
      return date.toLocaleDateString('en-US', options).replace(/,|\s/g, '');
    };

    const customer = removeNonAlphaNumerics(this.invoiceOvervewData.CustomerAccountName);
    const vendor = removeNonAlphaNumerics(this.invoiceOvervewData.VendorAccountName);
    const payable = removeNonAlphaNumerics(this.invoiceOvervewData.PayableAccountNumber);
    const date = formatDate(new Date(this.invoiceOvervewData.InvoiceBillDate));

    return `${customer}_${vendor}_${payable}_${date}_${fileType}`;
  }
}

