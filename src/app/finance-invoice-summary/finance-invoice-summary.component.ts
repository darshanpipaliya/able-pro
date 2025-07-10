import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { FinanceInvoicesService } from '../services/finance-invoices.service';
import { LocationService } from '../services/location.service';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { InvoiceSummaryPTableComponent } from '../invoice-summary-p-table/invoice-summary-p-table.component';
import { InvoiceOverviewIComponent } from '../common/invoice-overview-i/invoice-overview-i.component';

@Component({
  selector: 'app-finance-invoice-summary',
  templateUrl: './finance-invoice-summary.component.html',
  styleUrls: ['./finance-invoice-summary.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceSummaryPTableComponent, InvoiceOverviewIComponent]
})
export class FinanceInvoiceSummaryComponent implements OnInit {

  @Input() gridRowData: any;
  @Input() recordPublishedOrCompleted: any;
  
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() invoiceOverviewDataOutput: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(InvoiceSummaryPTableComponent) private InvoiceSummaryPTableComponent: InvoiceSummaryPTableComponent;

  stopSpinner: boolean = false;
  isDisabledExport: boolean = false;
  rowData: any = [];
  invoiceOvervewData: any;
  costOverviewData: any;
  basicOptions: any;
  basicData: any;
  selectedTem: any = 'all';
  selectedTemDD: any;
  gridApi: any;
  gridColumnApi: any;
  private readonly _unsubscribeDownloadInvoice = new Subject<void>();
  overviewData: any;

  sideBar: any = {
    toolPanels: ['columns', 'filters'],
  };
  downloadinvoiceloader = false;

  public getDataPath: any = (data: any) => data.dataPath;
  public advanceFilter: any;
  public exportInvoiceSummaryData: any;
  public exportInvoiceSummaryDetail: any;

  private readonly _unsubscribeGRid: Subject<any> = new Subject<any>();

  @Output() onExportDisableEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRowDataLength: EventEmitter<any> = new EventEmitter<any>();
  @Output() stopSpinnerEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private financeInvoicesService: FinanceInvoicesService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.getInvoiceOverview();
    this.getInvoiceCostOverview();
    this.onExportDisableEvent.emit(false);
    this.stopSpinnerEvent.emit(false);


    this.exportInvoiceSummaryData = this.exportInvoiceSummaryDetail;
    if (this.advanceFilter) {
      this.exportInvoiceSummaryData['advanceFilter'] = this.advanceFilter
    }
  }

  overviewDetail(data: any) {
    this.overviewData = data;
  }
  currencyFormatter(currency: any, sign: any) {
    if (currency !== null) {
      var sansDec = currency.toFixed(2);
      // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // formatted = formatted ? parseFloat(formatted).toFixed(2) : 0.00;
      return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } else {
      return '';
    }
  }
  onCellDoubleClicked(event: any) {
    if (event.colDef.field == "DistributionEventId") {
      const rowData = event.data;
      let data = {
        redirect: true,
        type: 'distribution-detail',
        data: event.data
      }
      this.redirectTab.emit(data)
    }
  }
  redirectTab1(data: any) {
    this.redirectTab.emit(data)
  }
  onRowDataLength1(data: any) {
    this.onRowDataLength.emit(data)
  }
  stopSpinnerEvent1(data: any) {
    this.stopSpinnerEvent.emit(data)
  }
  customCellRenderer(params: any) {
    if (params.value !== null) {
      return "<a href='javascript:void(0);' style='text-decoration: underline;'>" + params.value + '</a>';
    }
    return '';
  }

  getInvoiceOverview() {
    this.financeInvoicesService.getInvoiceOverview(this.gridRowData.InvoiceId).subscribe((res: any) => {
      this.invoiceOvervewData = res.Data;
      this.invoiceOvervewData.InvoiceBillDate = moment(res.Data.InvoiceBillDate).format('MM/DD/YYYY');
      this.invoiceOvervewData.InvoicePayByDate = moment(res.Data.InvoicePayByDate).format('MM/DD/YYYY');

      this.invoiceOvervewData['PastDueAmount'] = res.Data.PastDueAmount ? parseFloat(res.Data.PastDueAmount).toFixed(2) : '0.00';
      this.invoiceOvervewData['TotalCurrentCharges'] = res.Data.TotalCurrentCharges ? parseFloat(res.Data.TotalCurrentCharges).toFixed(2) : '0.00';
      this.invoiceOvervewData['AmountToPay'] = res.Data.AmountToPay ? parseFloat(res.Data.AmountToPay).toFixed(2) : '0.00';
      this.invoiceOvervewData['PrevBillBalance'] = res.Data.PrevBillBalance ? parseFloat(res.Data.PrevBillBalance).toFixed(2) : '0.00';
      this.invoiceOvervewData['PaymentAmount'] = res.Data.PaymentAmount ? parseFloat(res.Data.PaymentAmount).toFixed(2) : '0.00';
      this.invoiceOvervewData['Difference'] = res.Data.Difference ? parseFloat(res.Data.Difference).toFixed(2) : '0.00';

      this.invoiceOvervewData['PastDueAmount'] = res.Data?.PastDueAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['TotalCurrentCharges'] = res.Data?.TotalCurrentCharges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['AmountToPay'] = res.Data?.AmountToPay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['PrevBillBalance'] = res.Data?.PrevBillBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['PaymentAmount'] = res.Data?.PaymentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['Difference'] = res.Data?.Difference.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOverviewDataOutput.emit(this.invoiceOvervewData);

    });
  }

  getInvoiceCostOverview() {
    this.financeInvoicesService.getInvoiceCostOverview(this.gridRowData.InvoiceId).subscribe((res: any) => {
      this.costOverviewData = res.Data.$values;
      this.initGrafh();
      this.costOverviewData[0]['AvgTotalCurrentCharges'] = this.costOverviewData[0]?.AvgTotalCurrentCharges ? parseFloat(this.costOverviewData[0].AvgTotalCurrentCharges).toFixed(2) : '0.00';
      this.costOverviewData[0]['HighestTotalCurrentCharges'] = this.costOverviewData[0]?.HighestTotalCurrentCharges ? parseFloat(this.costOverviewData[0].HighestTotalCurrentCharges).toFixed(2) : '0.00';

      this.costOverviewData[0]['AvgTotalCurrentCharges'] = this.costOverviewData[0].AvgTotalCurrentCharges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.costOverviewData[0]['HighestTotalCurrentCharges'] = this.costOverviewData[0].HighestTotalCurrentCharges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });
  }

  getInvoiceServiceSummery() {
    let data = {
      invoiceId: this.gridRowData.InvoiceId
    }
    this.rowData = [];
    this.stopSpinner = false;
    this.stopSpinnerEvent.emit(false);

    this._unsubscribeGRid.next(true);
    this.financeInvoicesService.getInvoiceServiceSummery(data, this.gridRowData.InvoiceId)
      .pipe(takeUntil(this._unsubscribeGRid)).subscribe((res: any) => {
        if (data && res.Data.$values) {
          this.rowData = this.processData(res.Data.$values);
          this.onRowDataLength.emit(this.rowData);
          this.stopSpinner = true;
          this.stopSpinnerEvent.emit(true);
        }
      }, error => {
        this.rowData = [];
        this.onRowDataLength.emit(this.rowData);
        this.stopSpinner = true;
        this.stopSpinnerEvent.emit(true);
      })
  }

  async initGrafh() {

    try {
      const ApexCharts = (await import('apexcharts')).default;

      const options = {
        series: [{
          name: '',
          data: _.map(this.costOverviewData, (res: any) => {
            return res.TotalCurrentCharges;
          }), 
        }],
        chart: {
          type: 'bar',
          toolbar: {
            show: false
          },
        },
        colors: ["#4680ff"],
        plotOptions: {
          bar: {
            columnWidth: '30%',
            distributed: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        yaxis: {
          labels: {
              show: true,
              formatter: function (value: any) {
                  return Math.round(value).toString(); // Removes decimals
              },
          },
          axisBorder: {
              show: false,
              color: '#edeff5'
          }
        },
        xaxis: {
          categories: _.map(this.costOverviewData, (res: any) => {
            return moment(res.InvoiceDate).format('MMM YY');
          }),
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        tooltip: {
          y: {
              formatter: function (val: any) {
                return "$" + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }
          }
        },
      };

      setTimeout(() => {
        // Initialize and render the chart
        let overviewChart = document.querySelector('#charge_overview_chart');
        if (overviewChart) {
          overviewChart.innerHTML = '';
          const chart = new ApexCharts(document.querySelector('#charge_overview_chart'), options);
          chart.render();
        }
      }, 500);

    } catch (error) {
    }
  }


  ngOnDestroy(): any {
    this._unsubscribeGRid.next(true);
    this._unsubscribeGRid.complete();
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.SubInformationData && row.SubInformationData.$values.length > 0) {
        row.SubInformationData.$values.forEach((underling: any) => {
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }

  export() {
    this.InvoiceSummaryPTableComponent.onBtnExportDataAsExcel();
  }

  downloadAttachment() {
    this.downloadinvoiceloader = true;

    this.locationService.downloadInvoiceAttachment(this.overviewData.ExpectedInvoiceId).subscribe((res: any) => {
      var fileURL = URL.createObjectURL(res);
      window.open(fileURL);
      this.downloadinvoiceloader = false;
    });
  }
}
