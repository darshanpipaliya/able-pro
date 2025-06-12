import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import { LocationService } from '../services/location.service';
import { DashboardService } from '../services/dashboard.service';
import { rolePermission } from '../services/helper';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.scss'],
  providers: [DashboardService],
  imports: [ SharedModule, PrimgModule]
})
export class FinanceDashboardComponent implements OnInit {

  @ViewChild('screen', { static: false }) screen!: ElementRef;
  @ViewChild('screen2', { static: false }) screen2!: ElementRef;
  @ViewChild('screen3', { static: false }) screen3!: ElementRef;

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink!: ElementRef;

  selectedTem: string = 'all';
  selectedCustomer: string = 'all';
  selectedCompany: string = 'all';
  @Input() fromPage: string = '';

  @Input() InSelectedCompany: any;
  @Input() InIsClickFilter: any;
  @Input() InSelectedCustomer: any;
  @Input() InSelectedTem: any;

  selectedVal: any = 'YTD';
  startDate: any;
  endDate: any;
  isShowSpend: boolean = false;
  serviceTypeTotal: any;
  spendSummaryTotal: any;
  dataSource = new MatTableDataSource<any>([]);
  tems: any = [];
  customers: any = [];
  companies: any = [];
  isDisableSearch = false;
  isClickFilter = false;
  isCustomerAdmin = false;
  isAllowTemDropdown = false;
  isTemRole = false;

  selectedMonitor = { value: 'current' };
  defaultValue = new Date().getDate() <= 4 ? 'previous' : 'current';
  selectedVendor = { value: this.defaultValue };
  selectedSummaryValue = this.getDefaultChartView();

  cols1: any;
  rowData: any;
  invoiceVendorDd: any;
  private isBrowser: boolean;
  tableEnable = false;
  paginatedData: any;
  pageSize = 10;
  spendDropodown;
  IsPreviousYear = false;
  displayedColumns: string[] = ['vendor', 'retrievals', 'processing', 'recon', 'finished'];
  isSummaryLoad: boolean = false;
  isServiceTypeLoad: boolean = false;
  isSumByVendor: boolean = false;
  isInvoiceMonitor: boolean = false;
  loggedInUserId: any;

  private _unsubscribeSpend: Subject<any> = new Subject<any>();
  private _unsubscribeSummary: Subject<any> = new Subject<any>();
  private _unsubscribeSummary1: Subject<any> = new Subject<any>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();

  private _unsubscribeTemLists: Subject<any> = new Subject<any>();
  private _unsubscribeCompany: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomerListByTEMId: Subject<any> = new Subject<any>();
  private _unsubscribeMonitor: Subject<any> = new Subject<any>();

  listMonth = Array.from({ length: 12 }, (_, i) => ({
    monthId: i + 1,
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
  }));

  chartView = [
    {
      name: 'Current Month',
      value: 'current'
    },
    {
      name: 'Previous Month',
      value: 'previous'
    }
  ];

  totalMonitor: number = 0;
  totalVendors: any;
  vendorId: number;

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;

  searchMonitor: any = '';

  @Output() isClickFilterEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() isDisableSearchEmit: EventEmitter<any> = new EventEmitter<any>();

  ngOnChanges(changes: any) {
    if (changes?.InSelectedCustomer?.currentValue !== changes?.InSelectedCustomer?.previousValue) {
      this.selectedCustomer = _.cloneDeep(changes?.InSelectedCustomer?.currentValue)
    }

    if (changes?.InSelectedTem?.currentValue !== changes?.InSelectedTem?.previousValue) {
      this.selectedTem = _.cloneDeep(changes?.InSelectedTem?.currentValue)
    }

    if (changes?.InSelectedCompany?.currentValue !== changes?.InSelectedCompany?.previousValue) {
      this.selectedCompany = _.cloneDeep(changes?.InSelectedCompany?.currentValue)
    }
    if (changes?.InIsClickFilter?.currentValue !== changes?.InIsClickFilter?.previousValue) {
      if (changes?.InIsClickFilter?.currentValue) {
        this.filterData();
      }
    }
  }

  constructor(@Inject(PLATFORM_ID) private platformId: any, public locationService: LocationService, private sanitizer: DomSanitizer, private dashboardService: DashboardService, private el: ElementRef) {
    let getobj = document.getElementById('mihir');


    if (getobj) {
      getobj.classList.remove('pcoded-content');
      getobj.classList.add('pcoded-content-new');
    }
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.cols1 = [
      { field: "VendorAccount", header: "Vendor" },
      { field: "TotalInvoices", header: "Total Invoices" },
      // { field: "CountInvoiceId", header: "Outstanding Invoices" },
      { field: "CountInvoiceId", header: "Remaining Invoices" },
      { field: "AmountToPay", header: "Amount to Pay*" },
      { field: "Total", header: "Total Current Charges" },
      { field: "prevTotal", header: "Previous Charges" },
      { field: "differenceP", header: "Difference (%)" },
      { field: "differenceD", header: "Difference ($)" },
      // { field: "ProjectedRemaining", header: "Projected Remaining" },
      { field: "YTD", header: "YTD" },
      { field: "trend", header: "Trend" }
    ];

    this.spendDropodown = [
      { name: 'YTD', value: 'YTD' },
      { name: 'YTD and Previous Year', value: 'YTD & Previous Year' },
      { name: '12 Mths', value: '12 Mths' },
      { name: '12 Mths and Previous Year', value: '12 Mths & Previous Year' },
      { name: '6 Mths', value: '6 Mths' },
      { name: '6 Mths and Previous Year', value: '6 Mths & Previous Year' },
      { name: '3 Mths', value: '3 Mths' },
      { name: '3 Mths and Previous Year', value: '3 Mths & Previous Year' }
    ]
  }

  ngAfterViewInit(): void {
    // Ensure paginator is linked to the data source after view initialization
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  showData(data: any) {
    this.vendorId = data.VendorId;
    const defaultItem = this.chartView.find(item => item.name === this.selectedSummaryValue);
    this.getSpendByServiceType(defaultItem);
    this.onMenuItemClick(this.selectedVal);
  }

  chartDownload(element: any, fileName: string) {
    if (!element.nativeElement) {
      return;
    }
    html2canvas(element.nativeElement, {
      useCORS: true,
      scale: 2,
      width: element.nativeElement.scrollWidth,
      height: element.nativeElement.scrollHeight
    }).then(canvas => {
      const imageData = canvas.toDataURL('image/png');
      if (this.canvas?.nativeElement) {
        this.canvas.nativeElement.src = imageData;
      }
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      this.downloadLink.nativeElement.download = `${fileName}.png`;
      this.downloadLink.nativeElement.click();
    });
  }

  getDefaultChartView(): string {
    const today = new Date();
    return today.getDate() <= 4 ? 'Previous Month' : 'Current Month';
  }

  downloadVendor() {
    this.chartDownload(this.screen, 'Invoice Summary by Vendor');
  }

  onvendorChange(event: any) {
    this.getinvoiceSumByVendor(this.selectedVendor, event.pageSize, event.pageIndex + 1);
  }
  onPageChange1(event: any) {
    this.dataSource.paginator = this.paginator;
    this.getInvoiceMonitor(this.selectedMonitor, event.pageSize, event.pageIndex + 1);
  }
  onMenuItemClick(value: any) {
    const currentDate = new Date();

    this.selectedVal = value;
    switch (value) {
      case '3 Mths':
        this.IsPreviousYear = false;
        // this.listMonth = Array.from({ length: 3 }, (_, i) => ({
        //     monthId: i + 1,
        //     month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        // }));
        this.startDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
        this.endDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        this.listMonth = this.getPreviouMonths(new Date(this.endDate), 2);

        break;

      case '3 Mths & Previous Year':
        this.IsPreviousYear = true;
        //   this.listMonth = Array.from({ length: 3 }, (_, i) => ({
        //     monthId: i + 1,
        //     month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        // }));
        this.startDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
        this.endDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        this.listMonth = this.getPreviouMonths(new Date(this.endDate), 2);

        break;

      case '6 Mths':
        this.IsPreviousYear = false;
        // this.listMonth = Array.from({ length: 6 }, (_, i) => ({
        //   monthId: i + 1,
        //   month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        // }));
        this.startDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
        this.endDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        this.listMonth = this.getPreviouMonths(new Date(this.endDate), 5);

        break;

      case '6 Mths & Previous Year':
        this.IsPreviousYear = true;
        // this.listMonth = Array.from({ length: 6 }, (_, i) => {
        //   let date = new Date();
        //   date.setMonth(date.getMonth() - (5 - i));
        //   return {
        //       monthId: date.getMonth() + 1,
        //       month: date.toLocaleString('default', { month: 'short' }) 
        //   };
        // });
        this.startDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
        this.endDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        this.listMonth = this.getPreviouMonths(new Date(this.endDate), 5);

        break;

      case '12 Mths':
        this.IsPreviousYear = false;
        this.startDate = this.getDate(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        this.endDate = currentDate;
        this.listMonth = this.getPreviouMonths(new Date(this.endDate), 11);
        break;

      case '12 Mths & Previous Year':
        this.IsPreviousYear = true;
        this.startDate = this.getDate(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        this.endDate = currentDate;
        this.listMonth = this.getPreviouMonths(new Date(this.endDate), 11);
        break;

      case 'YTD':
        this.IsPreviousYear = false;

        this.startDate = this.getDate(currentDate.getFullYear(), 0, 1);
        this.endDate = currentDate;
        let endMonth = currentDate.getMonth() - new Date(this.startDate).getMonth() + 1;
        this.listMonth = Array.from({ length: 12 }, (_, i) => ({
          monthId: i + 1,
          month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        }));
        break;

      case 'YTD & Previous Year':
        this.IsPreviousYear = true;
        this.startDate = this.getDate(currentDate.getFullYear(), 0, 1);
        this.endDate = currentDate;
        let endMonth1 = currentDate.getMonth() - new Date(this.startDate).getMonth() + 1;
        this.listMonth = Array.from({ length: 12 }, (_, i) => ({
          monthId: i + 1,
          month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        }));
        break;

      case 'Previous Year':
        this.IsPreviousYear = true;
        this.startDate = this.getDate(currentDate.getFullYear(), 0, 1)
        this.endDate = this.getDate(currentDate.getFullYear(), 11, 31);
        this.listMonth = Array.from({ length: 12 }, (_, i) => ({
          monthId: i + 1,
          month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        }));
        break;

      default:
        this.startDate = this.endDate = new Date();
        break;

    }

    this.getSpendBySummary(true);
  }

  ngOnInit(): void {
    this.locationService.setPadding('true');
    this.getTemLists();
    const today = new Date();
    const defaultValue = today.getDate() <= 4 ? 'previous' : 'current';
    this.getinvoiceSumByVendor({ value: defaultValue });
    const defaultItem = this.chartView.find(item => item.name === this.selectedSummaryValue);
    this.getSpendByServiceType(defaultItem);
    this.getInvoiceMonitor(this.selectedMonitor);

    this.onMenuItemClick(this.selectedVal);
    this.isAllowTemDropdown = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM']);
    this.isTemRole = rolePermission(['TEMAdmin', 'TEMManager', 'TEMUser']);

    this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    if (this.isCustomerAdmin) {
      let id = sessionStorage.getItem("LoggedAccountId");
      this.loggedInUserId = id;
      this._unsubscribeCompany.next(null);
      this.locationService.getCompanyByCustomerId(this.loggedInUserId).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data) => {
        if (data && data.$values && data.$values.length > 0) {
          this.companies = data.$values;
        } else {
          this.companies = [];
        }
      }, error => {
        this.companies = [];
      });
    }

    if (this.isTemRole || this.isAllowTemDropdown) {
      this.getAllCustomer();
      this.getAllCompany();
    }
  }


  getInvoiceMonitor(event: any, pageSize = 10, pageNumber = 1, searchText = '', callFromHtml = false) {

    this.selectedMonitor = event;

    const data: any = {};
    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    const today = new Date();
    if (event.value == 'current') {
      if (callFromHtml)
        this.paginator.firstPage();
      data['startDate'] = this.getDate(today.getFullYear(), today.getMonth(), 1);
    } else {
      if (callFromHtml)
        this.paginator.firstPage();
      data['startDate'] = this.getDate(today.getFullYear(), today.getMonth() - 1, 1);
    }
    data['pageSize'] = pageSize;
    data['pageNumber'] = pageNumber;
    data['serachvalue'] = this.searchMonitor ? this.searchMonitor : searchText;
    this.isInvoiceMonitor = false;
    this._unsubscribeMonitor.next(null);
    this.dashboardService.invoiceMonitor(data).pipe(takeUntil(this._unsubscribeMonitor)).subscribe((res: any) => {
      this.isInvoiceMonitor = true;
      this.checkFetchedData();
      this.dataSource = res.Data.$values;
      this.totalMonitor = res.TotalCount;
      this.dataSource.paginator = this.paginator;
    });
  }

  getTemLists() {
    this.tems = [];
    this._unsubscribeTemLists.next(null);
    this.locationService.getTemLists().pipe(takeUntil(this._unsubscribeTemLists)).subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;
      } else {
        this.tems = [];
      }
    }, error => {
      this.tems = [];
    });
  }
  onChangeTem() {
    if (this.selectedTem !== 'all') {
      this.customers = [];
      this.companies = [];
      this.selectedCompany = 'all';
      this._unsubscribeAllCustomerListByTEMId.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.selectedTem).pipe(takeUntil(this._unsubscribeAllCustomerListByTEMId)).subscribe({
        next: data => {
          if (data && data.Data.$values) {
            this.customers = data.Data.$values;
          } else {
            this.customers = [];
          }
        },
        error: error => {
          this.customers = [];
        }
      });
      this.getCompanyByTem(this.selectedTem);

    } else {
      this.customers = [];
      this.companies = [];
      this.getAllCustomer();
      this.getAllCompany();

      this.selectedCustomer = 'all';
      this.selectedCompany = 'all';
    }
  }


  getAllCustomer() {
    this._unsubscribeCustomer.next(null)
    this.locationService
      .getCustomerDropDown()
      .pipe(takeUntil(this._unsubscribeCustomer))
      .subscribe({
        next: (data) => {
          if (data && data.$values) {
            this.customers = data.$values;
          } else {
            this.customers = [];
          }
        },
        error: error => {
          this.customers = [];
        }
      })
  }

  getAllCompany() {
    this.locationService.getAllCompany().subscribe({
      next: data => {

        if (data && data.$values) {
          this.companies = data.$values;
        } else {
          this.companies = [];
        }
      },
      error: error => {
        this.companies = [];

      }
    });
  }

  getCompanyByTem(tem: any) {
    let data = {
      temAccountId: tem
    }
    this.locationService.getTemCompany(data).subscribe({
      next: data => {
        if (data && data.$values) {
          this.companies = data.$values;
        } else {
          this.companies = [];
        }
      },
      error: error => {
        let errorMessage: any = '';
        this.companies = [];
      }
    });
  }

  filterData() {
    this.isDisableSearch = true;
    this.isClickFilter = true;
    const defaultItem = this.chartView.find(item => item.name === this.selectedSummaryValue);
    this.getSpendByServiceType(defaultItem);
    this.onMenuItemClick(this.selectedVal);
    this.getInvoiceMonitor(this.selectedMonitor);
    this.getSpendBySummary();
    const today = new Date();
    const defaultValue = today.getDate() <= 4 ? 'previous' : 'current';
    this.getinvoiceSumByVendor({ value: defaultValue });
  }

  checkFetchedData() {
    let isMatched = _.every([this.isSummaryLoad, this.isServiceTypeLoad, this.isSumByVendor, this.isInvoiceMonitor], (x: any) => x == true)
    this.isDisableSearch = !isMatched;
    if (isMatched)
      this.isClickFilter = false;

    this.isClickFilterEmit.emit(this.isClickFilter);
    this.isDisableSearchEmit.emit(this.isDisableSearch);
  }


  vendorSearch(event: any) {
    this.getinvoiceSumByVendor(this.selectedVendor, 10, 1, event.target.value);
  }
  getSafeImageUrl(base64String: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/gif;base64,' + base64String);
  }
  invoiceMonitorSearch(event: any) {
    this.paginator.firstPage();
    this.getInvoiceMonitor(this.selectedMonitor, 10, 1, event.target.value);
  }
  getSpendByServiceType(event: any) {
    this.selectedSummaryValue = event.name;
    const data: any = {};
    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    const today = new Date();
    if (event.value == 'current') {
      data['startDate'] = this.getDate(today.getFullYear(), today.getMonth(), 1);
      // data['startDate'] = "2024-09-01T00:00:00+00:00"
    } else {

      data['startDate'] = this.getDate(today.getFullYear(), today.getMonth() - 1, 1);
    }
    data['vendorAccountId'] = this.vendorId;
    this.isServiceTypeLoad = false;
    this._unsubscribeSummary.next(null);
    this.dashboardService.spendSumByService(data).pipe(takeUntil(this._unsubscribeSummary)).subscribe((res: any) => {
      this.isServiceTypeLoad = true;
      let series = res.Data.$values[0]?.MainServiceData.$values.map((el: any) => el.Total);
      let services = res.Data.$values[0]?.MainServiceData.$values.map((el: any) => el.ServiceName);
      this.serviceTypeTotal = res.Data.$values[0]?.GrandTotal;
      this.loadChartSpendSummarybyServiceType(series, services);
    });
  }

  onChangeCustomer() {
    if (this.selectedCustomer !== 'all') {
      this.companies = [];
      this.selectedCompany = 'all';
      this._unsubscribeCompany.next(null);
      this.locationService.getCompanyByCustomerId(this.selectedCustomer).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data) => {
        if (data && data.$values && data.$values.length > 0) {
          this.companies = data.$values;
        } else {
          this.companies = [];
        }
      }, error => {
        this.companies = [];
      });
    } else {
      this.selectedCompany = 'all';
      this.companies = [];
      this.getAllCompany();
    }
  }
  getSpendBySummary(date?: boolean) {
    const data: any = {};
    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    data['startDate'] = this.startDate;
    data['endDate'] = this.endDate;
    data['IsPreviousYear'] = this.IsPreviousYear;
    data['vendorAccountId'] = this.vendorId;

    this._unsubscribeSummary1.next(null);
    this.isShowSpend = true;
    this.isSummaryLoad = false;
    this.dashboardService.spendBySummary(data).pipe(takeUntil(this._unsubscribeSummary1)).subscribe(async (result: any) => {
      this.isSummaryLoad = true;
      this.checkFetchedData();
      this.spendSummaryTotal = result.Data?.$values[0]?.GrandTotal;
      if (this.selectedVal == '12 Mths') {
        let currentYearData = result.Data.$values.filter((item: any) => item.Year === (new Date().getFullYear() - 1)); // Assuming you are pushing the year 2024 data
        if (result.Other?.$values.length == 0) {
          result.Other['$values'].push(...currentYearData);
          result.Data.$values = result.Data.$values.filter((item: any) => item.Year !== (new Date().getFullYear() - 1));
        }
      }
      if (this.isBrowser) {
        try {
          const ApexCharts = (await import('apexcharts')).default;

          // Define chart options
          const options: any = {
            // series : [
            //   {
            //       name: "Previous",
            //       data: result?.Other?.PreviousYearData?.$values ? result?.Other?.PreviousYearData?.$values?.map(item => item.Total) : []
            //   },
            //   {
            //       name: "Current",
            //       data: result.Data?.$values ? result.Data?.$values?.map(item => item.Total) : []
            //   }
            // ],
            chart: {
              // height: "100%",
              height: 280,
              type: "area",
              toolbar: {
                show: false
              }
            },
            dataLabels: {
              enabled: false
            },
            fill: {
              type: "gradient",
              gradient: {
                opacityFrom: 0.45,
                opacityTo: 0.05
              }
            },
            grid: {
              show: true,
              strokeDashArray: 0,
              borderColor: "#edeff5",
              xaxis: {
                lines: {
                  show: true
                }
              },
              yaxis: {
                lines: {
                  show: true
                }
              }
            },
            stroke: {
              width: 4,
              curve: "smooth"
            },
            colors: this.IsPreviousYear ? [
              "#00b69b", "#3761EE"
            ] : ['#3761EE'],
            xaxis: {
              axisBorder: {
                show: false,
                color: '#edeff5'
              },
              axisTicks: {
                show: false,
                color: '#edeff5'
              },
              tooltip: {
                enabled: false
              },
              labels: {
                show: true,
                style: {
                  colors: "#262626",
                  fontSize: "13px"
                }
              },
              categories: this.selectedVal == '12 Mths' || this.selectedVal == '3 Mths' || this.selectedVal == '6 Mths' || this.selectedVal == '3 Mths & Previous Year' || this.selectedVal == '6 Mths & Previous Year' || this.selectedVal == '12 Mths & Previous Year' ? this.listMonth.map(item => item.month) : this.listMonth.map(item => this.getMonthName(item.monthId))
              // categories: result?.Other?.$values?.length > 0 ? result?.Other?.$values?.map(item => this.getMonthName(item.BillDate)) : result.Data?.$values?.map(item => this.getMonthName(item.BillDate))
            },
            yaxis: {
              labels: {
                show: true,
                style: {
                  colors: "#a9a9c8",
                  fontSize: "13px"
                },
                formatter: function (value: any) {
                  let d = Math.round(value)
                  if (d === null || d === undefined) return '';
                  if (d >= 1_000_000) {
                    return (d / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
                  } else if (d >= 1_000) {
                    return (d / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
                  }
                  return d.toString();
                  // return Math.round(value).toString(); // Removes decimals
                },
              },
              axisBorder: {
                show: true,
                color: '#edeff5'
              }
            },
            tooltip: {
              y: {
                formatter: function (val: any) {
                  return "$" + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                }
              }
            },
            legend: {
              show: true,
              position: 'top',
              fontSize: '13px',
              horizontalAlign: 'center',
              labels: {
                colors: '#77838f',
              },
              itemMargin: {
                horizontal: 15,
                vertical: 0
              },
              markers: {
                offsetY: -1
              }
            }
          };

          if (this.IsPreviousYear) {

            if (this.selectedVal == '6 Mths & Previous Year' || this.selectedVal == '3 Mths & Previous Year' || this.selectedVal == '12 Mths & Previous Year') {
              let previousYearData: any = [];

              if (result?.Other?.$values?.length === 0) {
                previousYearData = new Array(this.listMonth.length).fill(0);
              } else {
                previousYearData = _.map(this.listMonth, (element: any) => {
                  let value = result?.Other?.$values.find((x: any) => x.Month == element.monthId)?.Total;
                  return value ? value : 0;
                });
              }

              options['series'] = [
                {
                  name: 'Previous',
                  data: previousYearData,
                },
                {
                  name: 'Current',
                  data: _.map(this.listMonth, (element: any) => {
                    let value = result.Data?.$values.find((x: any) => x.Month == element.monthId)?.Total;
                    return value ? value : 0;
                  }),
                }
              ];
            } else if (this.selectedVal == 'Previous Year') {
              options['series'] = [
                {
                  name: "Previous",
                  data: _.map(this.listMonth, (element: any) => {
                    let value = result?.Other?.$values.find((x: any) => x.Month == element.monthId)?.Total;
                    return value ? value : 0
                  })
                },
              ]
            } else {
              options['series'] = [
                {
                  name: "Previous",
                  data: _.map(this.listMonth, (element: any) => {
                    let value = result?.Other?.$values.find((x: any) => x.Month == element.monthId)?.Total;
                    return value ? value : 0
                  })
                },
                {
                  name: "Current",
                  data: _.map(this.listMonth, (element: any) => {
                    let value = result.Data?.$values.find((x: any) => x.Month == element.monthId)?.Total;
                    return value ? value : 0
                  })
                }
              ];
            }
          } else {
            if (this.selectedVal == '12 Mths') {
              const today = new Date();
              const recordsCurrent = result.Data?.$values.filter((item: any) => item.Year === today.getFullYear());

              if (recordsCurrent?.length) {
                result.Data.$values = result.Data.$values.filter((item: any) => item.Year !== today.getFullYear());
                result.Other?.$values.push(...recordsCurrent);
              }
              options['series'] = [
                {
                  name: 'Current',
                  data: _.map(this.listMonth, (element: any) => {
                    let value = result.Other?.$values.find((x: any) => x.Month == element.monthId)?.Total;
                    return value ? value : 0
                  })
                }
              ]
            } else {
              options['series'] = [
                {
                  name: 'Current',
                  data: _.map(this.listMonth, (element: any) => {
                    let value = result.Data?.$values.find((x: any) => x.Month == element.monthId)?.Total;
                    return value ? value : 0
                  })
                }
              ]
            }
          }
          setTimeout(() => {
            // Initialize and render the chart

            const chartContainer = document.querySelector('#spend_summary_chart') as any;
            if (chartContainer) {
              chartContainer.innerHTML = '';
              const chart = new ApexCharts(chartContainer, options);
              chart.render();
            }
          }, 500);
        } catch (error) {
        }
      }

    })
  }

  getPreviouMonths(endDate: any, month: any) {
    const months: any = [];
    for (let i = month; i >= 0; i--) {
      const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      const mon = this.listMonth.find((k) => {
        return k.month.includes(month)
      })?.monthId
      months.push({ monthId: mon, month: `${month} ${year % 100}` });
    }

    return months;
  }

  getMonthName(month: number): string {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return monthNames[month - 1];
  }

  getinvoiceSumByVendor(event: any, pageSize = 10, pageNumber = 1, searchText = '') {
    this.selectedVendor.value = event.value;
    const data: any = {};
    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    const today = new Date();
    if (event.value == 'current') {
      data['startDate'] = this.getDate(today.getFullYear(), today.getMonth(), 1);
      // data['startDate'] = "2024-06-02T00:00:00+00:00"
    } else {
      data['startDate'] = this.getDate(today.getFullYear(), today.getMonth() - 1, 1);
    }
    data['pageSize'] = pageSize;
    data['pageNumber'] = pageNumber;
    data['serachvalue'] = searchText;

    this.isSumByVendor = false;
    this._unsubscribeSpend.next(null);
    this.dashboardService.invoiceSumByVendor(data).pipe(takeUntil(this._unsubscribeSpend)).subscribe(async (res: any) => {
      this.isSumByVendor = true;
      this.checkFetchedData();
      this.rowData = res.Data.$values;
      this.totalVendors = res.TotalCount;
      this.rowData = this.rowData?.forEach((element: any, index: any) => {
        element['trendId'] = `trend_chart_${index}`;
        element['differenceD'] = element['Total'] - element['prevTotal'];
        element['differenceP'] = element['prevTotal'] === 0 ? 100 : Math.abs(element['prevTotal'] - element['Total']) / element['prevTotal'] * 100;
        element['differenceP'] = element.differenceP > 100 || element.differenceP < 0 ? 100 : element.differenceP;
        element['differenceP'] = element.differenceP > 100 ? 100 : Math.round(element.differenceP);
        element['differenceD'] = Math.abs(element.differenceD).toFixed(2);

      });
      this.rowData = res.Data.$values?.map((obj: any) => {
        const trend = [
          obj.one_month || 0,
          obj.two_month || 0,
          obj.three_month || 0,
          obj.four_month || 0,
          obj.five_month || 0,
          obj.six_month || 0,
          obj.seven_month || 0,
          obj.eight_month || 0,
          obj.nine_month || 0,
          obj.ten_month || 0,
          obj.eleven_month || 0,
          obj.twelve_month || 0
        ];
        return { ...obj, trend }; // Add trend to each object
      });

      setTimeout(() => {
        this.loadChartInTable(res.TotalCount);
      }, 5000);
    });
  }

  getDate(year: any, month: any, day: any) {
    const date = new Date(Date.UTC(year, month, day));
    const year1 = date.getUTCFullYear();
    const month1 = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day1 = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const isoDate = `${year1}-${month1}-${day1}`;
    return isoDate;
  }
  ngAfterViewChecked() {
  }

  loadChartInTable(totalRecords: any) {
    this.rowData?.forEach(async (row: any, index: any) => {


      if (this.isBrowser) {
        try {
          const ApexCharts = (await import('apexcharts')).default;

          // Define chart options
          const options = {
            series: [
              {
                name: "Vendor",
                data: row.trend
              }
            ],
            chart: {
              type: "area",
              height: "30px",
              width: "150px",
              // offsetY: 0,
              sparkline: {
                enabled: true,
              },
              zoom: {
                enabled: false
              },
              toolbar: {
                show: false
              }
            },
            stroke: {
              width: 2,
              curve: "smooth"
            },
            grid: {
              show: false,
              // padding: {
              //   top: -20,
              //   bottom: -27,
              //   left: 0,
              //   right: 0
              // },
            },
            colors: [
              "#4680ff"
            ],
            dataLabels: {
              enabled: false
            },
            xaxis: {
              axisBorder: {
                show: false,
                color: '#edeff5'
              },
              axisTicks: {
                show: false,
                color: '#edeff5'
              },
              labels: {
                show: false,
                style: {
                  colors: "#262626",
                  fontSize: "13px"
                }
              },
              tooltip: {
                enabled: false
              },
              categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
              ]
            },
            yaxis: {
              labels: {
                show: false,
                style: {
                  colors: "#a9a9c8",
                  fontSize: "13px"
                }
              },
              axisBorder: {
                show: false,
                color: '#edeff5'
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

          if (document.querySelector('#trend_chart_' + index)) {
            const chart = new ApexCharts(document.querySelector('#trend_chart_' + index), options);
            chart.render();
          }

        } catch (error) {
        }
      }
    })
  }
  async summaryByVendor(series: any, chartId: string) {
    if (this.isBrowser) {
      try {

        // Define chart options
        const options = {
          series: [
            {
              name: "Sales",
              data: series
            }
          ],
          chart: {
            type: "area",
            height: 115,
            zoom: {
              enabled: false
            },
            toolbar: {
              show: false
            }
          },
          grid: {
            show: true,
            strokeDashArray: 0,
            borderColor: "#EDEFF5",
            xaxis: {
              lines: {
                show: true
              }
            },
            yaxis: {
              lines: {
                show: true
              }
            }
          },
          colors: [
            "#4680ff"
          ],
          dataLabels: {
            enabled: false
          },
          xaxis: {
            axisBorder: {
              show: false,
              color: '#edeff5'
            },
            axisTicks: {
              show: false,
              color: '#edeff5'
            },
            labels: {
              show: false,
              style: {
                colors: "#262626",
                fontSize: "13px"
              }
            },
            categories: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"
            ]
          },
          yaxis: {
            labels: {
              show: false,
              style: {
                colors: "#a9a9c8",
                fontSize: "13px"
              }
            },
            axisBorder: {
              show: false,
              color: '#edeff5'
            }
          },
        };
        const chart = new ApexCharts(document.querySelector('#' + chartId), options);
        chart.render();
      } catch (error) {
      }
    }
  }

  downloadSummary() {
    this.chartDownload(this.screen2, 'Spend Summary')
  }

  downloadSummaryServiceType() {
    this.chartDownload(this.screen3, 'Spend Summary by Service Type')
  }

  async loadChartSpendSummarybyServiceType(series: any, category: any): Promise<void> {
    if (this.isBrowser) {
      try {
        // Dynamically import ApexCharts
        const ApexCharts = (await import('apexcharts')).default;

        // Define chart options
        const options = {
          series: [
            {
              name: "Summary",
              data: series ? series : []
            }
          ],
          chart: {
            type: "bar",
            // height: '100%',
            height: 235,
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            bar: {
              horizontal: true,
              borderRadius: 10,
              borderRadiusApplication: 'end',
              borderRadiusWhenStacked: 'last',
              // barHeight: '18px',
              barHeight: '28px',
            }
          },
          grid: {
            show: true,
            strokeDashArray: 0,
            borderColor: "#EDEFF5",
            xaxis: {
              lines: {
                show: true
              }
            },
            yaxis: {
              lines: {
                show: true
              }
            }
          },
          colors: [
            "#3761EE"
          ],
          dataLabels: {
            enabled: true,
            formatter: function (val: number) {
              return "$" + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
          },
          xaxis: {
            axisBorder: {
              show: series?.length > 0 ? true : false,
              color: '#edeff5'
            },
            axisTicks: {
              show: false,
              color: '#edeff5'
            },
            labels: {
              show: true,
              style: {
                colors: "#A9A9C8",
                fontSize: "13px"
              },
              formatter: function (value: any) {
                let d = Math.round(value)
                if (d === null || d === undefined) return '';
                if (d >= 1_000_000) {
                  return (d / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
                } else if (d >= 1_000) {
                  return (d / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
                }
                return d.toString();
                // return Math.round(value).toString(); // Removes decimals
              },
            },
            categories: category ? category : []
          },
          yaxis: {
            labels: {
              show: series?.length > 0 ? true : false,
              style: {
                colors: "#262626",
                fontSize: "13px"
              }
            },
            axisBorder: {
              show: true,
              color: '#edeff5'
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
          let serviceTypeChart = document.querySelector('#spend_Summary_by_service_type_chart');
          if (serviceTypeChart) {
            serviceTypeChart.innerHTML = '';
            const chart1 = new ApexCharts(document.querySelector('#spend_Summary_by_service_type_chart'), options);
            chart1.render();
          }
        }, 500);
      } catch (error) {
      }
    }
  }

  ngOnDestroy() {
    this._unsubscribeMonitor.next(null);
    this._unsubscribeMonitor.complete();
    this._unsubscribeSummary1.next(null);
    this._unsubscribeSummary1.complete();

    this._unsubscribeSummary.next(null);
    this._unsubscribeSummary.complete();
    this.locationService.setPadding(null);
    if (this.fromPage !== 'home') {
      let getobj = document.getElementById('mihir') as any;
      getobj.classList.remove('pcoded-content-new');
      getobj.classList.add('pcoded-content');
    }
  }
}