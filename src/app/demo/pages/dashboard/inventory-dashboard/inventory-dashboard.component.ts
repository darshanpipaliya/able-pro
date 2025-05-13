import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import html2canvas from 'html2canvas';
import { MatPaginator } from '@angular/material/paginator';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LocationService } from 'src/app/services/location.service';
import { rolePermission } from 'src/app/services/helper';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { SharedModule } from 'src/app/demo/shared/shared.module';
// import { MatTableDataSource } from '@angular/material/table';


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
};
@Component({
  selector: 'app-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,

  ],
  providers: [DashboardService, CustomPipe]
})
export class InventoryDashboardComponent implements OnInit {

  @Input() selectedCompany: any;
  @Input() selectedTem: any;
  @Input() selectedCustomer: any;
  @Input() isClickFilter: any;
  @Input() fromPage: any;

  isSelectedCompany = 'all';
  // IsClickFilter;
  isSelectedCustomer = 'all';
  isSelectedTem = 'all';

  tems: any = [];
  customers: any = [];
  companies: any = [];

  private _unsubscribeVendorChart: Subject<any> = new Subject<any>();
  private _unsubscribeinventoryByStatusChart: Subject<any> = new Subject<any>();
  private _unsubscribeProductChart: Subject<any> = new Subject<any>();
  private _unsubscribeProductTypeChart: Subject<any> = new Subject<any>();

  private _unsubscribeTemLists: Subject<any> = new Subject<any>();
  private _unsubscribeCompany: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomerListByTEMId: Subject<any> = new Subject<any>();

  @ViewChild('screen', { static: false }) screen!: ElementRef;
  @ViewChild('screen2', { static: false }) screen2!: ElementRef;
  @ViewChild('screen3', { static: false }) screen3!: ElementRef;
  @ViewChild('screen4', { static: false }) screen4!: ElementRef;

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink!: ElementRef;


  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;
  @ViewChild('paginator3') paginator3: MatPaginator;

  // dataSource = new MatTableDataSource<any>();

  constructor(@Inject(PLATFORM_ID) private platformId: any, public locationService: LocationService, private dashboardService: DashboardService) {
    let getobj = document.getElementById('mihir');

    if (getobj) {
      getobj.classList.remove('pcoded-content');
      getobj.classList.add('pcoded-content-new');
    }
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private isBrowser: boolean;
  vendorTotalCount: any;
  productTotalCount: any;
  productTypeTotalCount: any;

  vendorSearchValue: any;
  productSearchValue: any;
  productTypeSearchValue: any;
  loggedInUserId: any;

  inventorybyStatusLoader: boolean = false;
  getVendorChartLoader: boolean = false;
  getSpendSumByProductLoader: boolean = false;
  getSpendSumByProductTypeLoader: boolean = false;
  isAllowTemDropdown = false;
  isTemRole = false;
  isCustomerAdmin = false;

  vendorGrandTotal = 0;
  productGrandTotal = 0;
  productTypeGrandTotal = 0;

  vendorpageIndex = 0;
  productpageIndex = 0;
  productTypepageIndex = 0;
  isDisableSearch = false;
  @Output() isClickFilterEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() isDisableSearchEmit: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();

  ngOnInit(): void {
    this.getTemLists();
    this.getVendorChart();
    this.getInventoryByStatusChart();
    this.getSpendSumByProduct();
    this.getSpendSumByProductType();

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


  checkFetchedData() {
    let isMatched = _.every([this.getVendorChartLoader, this.inventorybyStatusLoader, this.getSpendSumByProductLoader, this.getSpendSumByProductTypeLoader], (x: any) => x == true)
    this.isDisableSearch = !isMatched;
    if (isMatched)
      this.isClickFilter = false;

    this.isClickFilterEmit.emit(this.isClickFilter);
    this.isDisableSearchEmit.emit(this.isDisableSearch);
  }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }

  filterData() {
    this.isDisableSearch = true;
    this.isClickFilter = true;

    this.vendorSearchValue = '';
    this.productSearchValue = '';
    this.productTypeSearchValue = '';
    this.selectedTem = this.isSelectedTem;
    this.selectedCustomer = this.isSelectedCustomer;
    this.selectedCompany = this.isSelectedCompany;

    this.getVendorChart();
    this.getInventoryByStatusChart();
    this.getSpendSumByProduct();
    this.getSpendSumByProductType();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isClickFilter']?.currentValue == true) {
      this.vendorSearchValue = '';
      this.productSearchValue = '';
      this.productTypeSearchValue = '';
      this.getVendorChart();
      this.getInventoryByStatusChart();
      this.getSpendSumByProduct();
      this.getSpendSumByProductType();
    }
  }
  onChangeCustomer() {
    if (this.isSelectedCustomer !== 'all') {
      this.companies = [];
      this.selectedCompany = 'all';
      this._unsubscribeCompany.next(null);
      this.locationService.getCompanyByCustomerId(this.isSelectedCustomer).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data) => {
        if (data && data.$values && data.$values.length > 0) {
          this.companies = data.$values;
        } else {
          this.companies = [];
        }
      }, error => {
        this.companies = [];
      });
    } else {
      this.companies = [];
      this.isSelectedCompany = 'all';
      this.getAllCompany();
    }
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
    if (this.isSelectedTem !== 'all') {
      this.customers = [];
      this.companies = [];
      this.selectedCompany = 'all';
      this._unsubscribeAllCustomerListByTEMId.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.isSelectedTem).pipe(takeUntil(this._unsubscribeAllCustomerListByTEMId)).subscribe({
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
    this._unsubscribeCustomer.next(null);
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


  searchVendor($event: any) {
    this.vendorpageIndex = 0;
    this.vendorSearchValue = $event.target.value ? $event.target.value : null;
    this.getVendorChart(this.vendorSearchValue);
  }

  searchProduct($event: any) {
    this.productpageIndex = 0;
    this.productSearchValue = $event.target.value ? $event.target.value : null;
    this.getSpendSumByProduct($event.target.value);
  }

  searchProductType($event: any) {
    this.productTypepageIndex = 0;
    this.productTypeSearchValue = $event.target.value ? $event.target.value : null;
    this.getSpendSumByProductType($event.target.value);
  }

  vendorPage($event: any) {
    this.vendorpageIndex = $event.pageIndex;
    this.getVendorChart(this.vendorSearchValue, $event.pageSize, $event.pageIndex + 1);
  }

  productPage($event: any) {
    this.productpageIndex = $event.pageIndex;
    this.getSpendSumByProduct(this.productSearchValue, $event.pageSize, $event.pageIndex + 1);
  }

  productTypePage($event: any) {
    this.productTypepageIndex = $event.pageIndex;
    this.getSpendSumByProductType(this.productTypeSearchValue, $event.pageSize, $event.pageIndex + 1);
  }

  getInventoryByStatusChart() {
    const data: any = {};

    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    this.inventorybyStatusLoader = false;
    this._unsubscribeinventoryByStatusChart.next(null);
    this.dashboardService.getInventoryByStatusChart(data).pipe(takeUntil(this._unsubscribeinventoryByStatusChart)).subscribe((res: any) => {
      this.inventorybyStatusLoader = true;
      this.checkFetchedData();
      if (res.Success) {
        this.loadChartInventorybyStatus(res.Data);
      }
    });
  }

  getVendorChart(serachvalue?: any, pageSize = 10, pageNumber = 1) {
    let data: any = {
      serachvalue: serachvalue,
      pageSize: pageSize,
      pageNumber: pageNumber
    }

    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    this.getVendorChartLoader = false;
    this._unsubscribeVendorChart.next(null);
    this.dashboardService.getVendorChart(data).pipe(takeUntil(this._unsubscribeVendorChart)).subscribe((res: any) => {
      this.getVendorChartLoader = true;
      this.checkFetchedData();
      if (res.Success) {
        this.vendorTotalCount = res?.TotalCount;
        this.vendorGrandTotal = res?.Other;
        // this.dataSource = new MatTableDataSource<any>(res.Data.$values);
        this.loadChartVendor(res.Data);
      }
    });
  }

  getSpendSumByProduct(serachvalue?: any, pageSize = 10, pageNumber = 1) {
    let data: any = {
      serachvalue: serachvalue,
      pageSize: pageSize,
      pageNumber: pageNumber
    }


    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    this.getSpendSumByProductLoader = false;
    this._unsubscribeProductChart.next(null);
    this.dashboardService.getSpendSumByProduct(data).pipe(takeUntil(this._unsubscribeProductChart)).subscribe((res: any) => {
      this.getSpendSumByProductLoader = true;
      this.checkFetchedData();
      if (res.Success) {

        // this.productTotalCount = res?.Data?.$values[0]?.TotalVendorProductInvCount;
        // this.productGrandTotal = res?.Data?.$values[0]?.GrandTotal;
        // this.loadChartProduct(res?.Data?.$values[0]?.MainProductData);

        this.productTotalCount = res?.TotalCount;
        this.productGrandTotal = res?.Other;
        this.loadChartProduct(res.Data);
      }
    });
  }

  getSpendSumByProductType(serachvalue?: any, pageSize = 10, pageNumber = 1) {
    let data: any = {
      serachvalue: serachvalue,
      pageSize: pageSize,
      pageNumber: pageNumber
    }


    if (this.selectedTem !== 'all')
      data['temAccountId'] = Number(this.selectedTem);
    if (this.selectedCustomer !== 'all')
      data['customerAccountId'] = Number(this.selectedCustomer);
    if (this.selectedCompany !== 'all')
      data['companyId'] = Number(this.selectedCompany);

    this.getSpendSumByProductTypeLoader = false;
    this._unsubscribeProductTypeChart.next(null);
    this.dashboardService.getSpendSumByProductType(data).pipe(takeUntil(this._unsubscribeProductTypeChart)).subscribe((res: any) => {
      this.getSpendSumByProductTypeLoader = true;
      this.checkFetchedData();
      if (res.Success) {
        // this.productTypeTotalCount = res?.Data?.$values[0]?.TotalVendorProductInvCount;
        // this.productTypeGrandTotal = res?.Data?.$values[0]?.GrandTotal;
        // this.loadChartProductType(res?.Data?.$values[0]?.MainProductTypeData);

        this.productTypeTotalCount = res?.TotalCount;
        this.productTypeGrandTotal = res?.Other;
        this.loadChartProductType(res?.Data);
      }
    });
  }

  async loadChartInventorybyStatus(data: any): Promise<void> {

    if (this.isBrowser) {
      try {
        // Dynamically import ApexCharts
        const ApexCharts = (await import('apexcharts')).default;

        // Define chart options
        const options: any = {
          series: _.map(data.$values, (res: any) => {
            return res.InventoryCount;
          }),

          chart: {
            // width: 380,
            height: '280px',
            type: "pie"
          },
          labels: _.map(data.$values, (res: any) => {
            return res.StatusName;
          }),
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: "bottom"
                }
              }
            }
          ],
          legend: {
            offsetY: 0,
            fontSize: '13px',
            labels: {
              colors: '#77838f'
            },
            itemMargin: {
              horizontal: 0,
              vertical: 5
            }
          },
          stroke: {
            width: 0,
            show: true
          },
          colors: [
            "#775DD0", "#ff8214", "#008FFB", "#99d3ff", "#FF4560", "#00E396", "#99ffdd", "#fedd9a", "#bdb0e8", "#ff99a8", "#4db2ff", "#4dffc3", "#fec34d", "#8c75d7", "#ff4d67",
          ],
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '14px',
            },
            dropShadow: {
              enabled: false
            },
            formatter: function (val: number) {
              return Math.round(val) + "%";
            }
          },
          // tooltip: {
          //   y: {
          //     formatter: function (val: any) {
          //       return val + "%";
          //     }
          //   }
          // }
        };

        // Initialize and render the chart
        setTimeout(() => {
          const chart = new ApexCharts(document.querySelector('#basic_pie_chart'), options);
          chart.render();
        }, 1000);
      } catch (error) {
      }
    }
  }

  async loadChartVendor(data: any): Promise<void> {

    const vc = _.map(data.$values, (res: any) => {
      return res.VendorName.trim();
    });
    if (this.isBrowser) {
      try {
        // Dynamically import ApexCharts
        const ApexCharts = (await import('apexcharts')).default;

        // Define chart options
        const options = {
          series: [
            {
              name: "Count",
              data: _.map(data.$values, (res: any) => {
                return res.InventoryCount;
              }),
            }
          ],
          chart: {
            type: "bar",
            height: '280px',
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
              barHeight: '18px',
              // barHeight: '28px',
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
            enabled: true
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
              show: true
            },
            categories: vc
          },
          yaxis: {
            labels: {
              show: true,
              style: {
                colors: "#262626",
                fontSize: "11px"
              }
            },
            axisBorder: {
              show: true,
              color: '#edeff5'
            }
          },
          //   tooltip: {

          //     y: {
          //         formatter: function (val: any) {
          //             return "$" + val;
          //         }
          //     }
          // },
        };

        // Initialize and render the chart
        setTimeout(() => {
          const chart = new ApexCharts(document.querySelector('#vendor_chart'), options);
          chart.render();
        }, 1000);
      } catch (error) {

      }

    }
  }

  async loadChartProduct(data: any): Promise<void> {
    if (this.isBrowser) {
      try {
        // Dynamically import ApexCharts
        const ApexCharts = (await import('apexcharts')).default;

        // Define chart options
        const options = {
          series: [
            {
              name: "Count",
              data: _.map(data.$values, (res: any) => {
                return res.InventoryCount;
              })
            }
          ],
          chart: {
            type: "bar",
            height: '280px',
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
              barHeight: '18px',
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
            // "#008FFB"
            "#3761EE"
          ],
          dataLabels: {
            enabled: true,


          },
          // textAnchor: 'start',
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
              show: true
            },
            categories: _.map(data.$values, (res: any) => {
              return res.ProductName.trim();
            })
          },
          yaxis: {
            labels: {
              show: true,
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
          // tooltip: {
          //   y: {
          //     formatter: function (val: any) {
          //       return "$" + val;
          //     }
          //   }
          // }
        };

        // Initialize and render the chart
        setTimeout(() => {
          const chart = new ApexCharts(document.querySelector('#Product_chart'), options);
          chart.render();
        }, 1000);
      } catch (error) {

      }
    }
  }

  async loadChartProductType(data: any): Promise<void> {
    if (this.isBrowser) {
      try {
        // Dynamically import ApexCharts
        const ApexCharts = (await import('apexcharts')).default;

        // Define chart options
        const options = {
          series: [
            {
              name: "Count",
              data: _.map(data.$values, (res: any) => {
                return res.InventoryCount;
              })
            }
          ],
          chart: {
            type: "bar",
            height: '280px',
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
              barHeight: '18px',
            }
          },
          grid: {
            show: true,
            strokeDashArray: 0,
            borderColor: "#EDEFF5",
            xaxis: {
              lines: {
                show: true,
                height: '50',
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
            enabled: true
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
              show: true
            },
            categories: _.map(data.$values, (res: any) => {
              return res.ProductTypeName.trim();
            })
          },
          yaxis: {
            labels: {
              show: true,
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
          // tooltip: {

          //   y: {
          //     formatter: function (val: any) {
          //       return "$" + val;
          //     }
          //   }
          // },
        };

        // Initialize and render the chart
        setTimeout(() => {
          const chart = new ApexCharts(document.querySelector('#Product_Type_chart'), options);
          chart.render();
        }, 1000);
      } catch (error) {

      }
    }
  }

  downloadInventorybyStatus() {
    this.chartDownload(this.screen, 'Inventory by Status')
  }

  downloadInventorybyVendor() {
    this.chartDownload(this.screen2, 'Inventory by Vendor')
  }

  downloadInventorybyProduct() {
    this.chartDownload(this.screen3, 'Inventory by Product')
  }

  downloadInventorybyProductType() {
    this.chartDownload(this.screen4, 'Inventory by Product Type')
  }

  chartDownload(element: any, fileName: any) {

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

  ngOnDestroy(): any {
    this._unsubscribeVendorChart.next(null);
    this._unsubscribeVendorChart.complete();
    this._unsubscribeinventoryByStatusChart.next(null);
    this._unsubscribeinventoryByStatusChart.complete();
    this._unsubscribeProductChart.next(null);
    this._unsubscribeProductChart.complete();
    this._unsubscribeProductTypeChart.next(null);
    this._unsubscribeProductTypeChart.complete();
    if (this.fromPage !== 'home') {
      let getobj = document.getElementById('mihir') as any;
      getobj.classList.remove('pcoded-content-new');
      getobj.classList.add('pcoded-content');
    }
  }
}
