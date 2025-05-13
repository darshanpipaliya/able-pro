import { Component, ElementRef, Inject, OnInit, ViewChild, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import {
    CdkDragDrop,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import html2canvas from 'html2canvas';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ManageService } from 'src/app/services/manage.service';
import { LocationService } from 'src/app/services/location.service';
import { rolePermission } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { FinanceDashboardComponent } from '../finance-dashboard/finance-dashboard.component';
import { InventoryDashboardComponent } from '../inventory-dashboard/inventory-dashboard.component';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, FinanceDashboardComponent, InventoryDashboardComponent],
    providers: [DashboardService, ManageService,DatePipe,CustomPipe ]
})
export class HomeComponent implements OnInit {

    // public chartOptions: ApexOptions;
    @ViewChild('screen', { static: false }) screen!: ElementRef;
    @ViewChild('screen2', { static: false }) screen2!: ElementRef;
    @ViewChild('screen3', { static: false }) screen3!: ElementRef;
    @ViewChild('screen4', { static: false }) screen4!: ElementRef;


    @ViewChild('canvas', { static: false }) canvas!: ElementRef;
    @ViewChild('downloadLink', { static: false }) downloadLink!: ElementRef;


    selectedTem: string = 'all';
    selectedCustomer: string = 'all';
    selectedCompany: string = 'all';
    spendVendorData: any[];
    previousYearVendorData: any[];
    inventoryOverview: any;

    previousYearData: any;

    listMonth = Array.from({ length: 12 }, (_, i) => ({
        monthId: i + 1,
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    }));
    billingProgress = 100;
    closedLocationProgress = 100;
    inactivePeopleProgress = 100;

    balanceOverviewChart: any;
    isDisableSearch = false;
    isClickFilter = false;

    spendSummary: any
    currentSpend: number = 0;
    previousSpend: number = 0;
    sixMonthAverage: number = 0;
    yearToDateSpend: number = 0;

    isArrowValue: boolean;
    isArrowPeople: boolean;
    isArrowLocation: boolean;
    isCustomerAdmin = false;
    isLoading: boolean = false;
    isSpendSummaryLoading = false;
    tems: any = [];
    customers: any = [];
    companies: any = [];

    vendorColor = ['blue', 'green', 'orange', 'purple', 'red', 'lightblue', 'lightgreen', '#FFDBBB', '#CBC3E3', '#FF6961'];

    nearingExpirationContracts: number;
    expiredContracts: number;
    billingGrandTotal: number;
    inactivePeopleTotal: number;
    billingInventory: number;
    peopleCount: number;
    locationCount: number;
    closedLocationTotal: number;
    products: any;
    loggedInUserId: any;
    selectedVendor: any =  this.getDefaultChartView();

    private isBrowser: boolean;
    private _unsubscribeSpend: Subject<any> = new Subject<any>();
    private _unsubscribeInvoiceProcessing: Subject<any> = new Subject<any>();
    private _unsubscribeTemLists: Subject<any> = new Subject<any>();
    private _unsubscribeAllCustomerListByTEMId: Subject<any> = new Subject<any>();
    private _unsubscribeCompany: Subject<any> = new Subject<any>();
    private _unsubscribeVendor: Subject<any> = new Subject<any>();
    private _unsubscribeInventory: Subject<any> = new Subject<any>();
    private _unsubscribeCustomer: Subject<any> = new Subject<any>();

    isAllowTemDropdown = false;
    isTemRole = false;

    selectedVal: any = '12 Mths';

    selectedProcessing: any =  this.getDefaultChartView();

    isShowSpend: boolean = false;

    items = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

    isOverviewLoad = false;
    isProcessingLoad = false;
    isVendorLoad = false;
    isInventoryLoad = false;
    isContractLoad = false;
    isBillingLoad = false;
    isClosedLocationLoad = false;
    isInactivePeopleLoad = false;

    startDate: any;
    endDate: any;
    IsPreviousYear = false;
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
    cols: any;

    tutorials: any;
    spendOverviewDd: any;
    data1: any;
    options: any = {
        // responsive: true,
        legend: {
            labels: {
                usePointStyle: true,
                color: "#FF6384",
            },
            position: 'right'
        }
    }
    currentIndex = 0;
    constructor(@Inject(PLATFORM_ID) private platformId: any, private dashboardService: DashboardService, public manageService: ManageService, public locationService: LocationService) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        let getobj = document.getElementById('mihir');

        if (getobj) {
            getobj.classList.remove('pcoded-content');
            getobj.classList.add('pcoded-content-new');
        }
        this.cols = [
            { field: "title", header: "" },
            { field: "wireline", header: "Wireline" },
            { field: "mobility", header: "Mobility" },
            { field: "cloud", header: "Cloud" },
            { field: "other", header: "Other" }
        ];

        this.spendOverviewDd = [
            { name: '12 Mths', value: '12 Mths' },
            { name: '12 Mths & Previous Year', value: '12 Mths & Previous Year' },
            { name: 'YTD', value: 'YTD' },
            { name: 'YTD & Previous Year', value: 'YTD & Previous Year' },
            { name: 'Previous Year', value: 'Previous Year' }
        ];

    }


    downloadChart() {
        this.chartDownload(this.screen, 'Inventory Overview')
    }

    downloadChart1() {
        this.chartDownload(this.screen2, 'Spend Overview')
    }
    downloadSpendVendor() {
        this.chartDownload(this.screen3, 'Spend by Vendor')

    }
    downloadInvoiceProcessing() {
        this.chartDownload(this.screen4, 'Invoice Processing')
    }
    chartDownload(element: ElementRef<any>, fileName: string) {
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

    getTemLists() {
        this.tems = [];
        this._unsubscribeTemLists.next(null);
        this.locationService.getTemLists().pipe(takeUntil(this._unsubscribeTemLists)).subscribe((data: { $values: any; }) => {
            if (data && data.$values) {
                this.tems = data.$values;
            } else {
                this.tems = [];
            }
        }, (error: any) => {
            this.tems = [];
        });
    }

    getDefaultChartView(): string {
        const today = new Date();
        return today.getDate() <= 4 ? 'Previous Month' : 'Current Month';
    }

    getLast12Months(endDate: any) {
        const months: any = [];
        for (let i = 11; i >= 0; i--) {
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

    onChangeTem() {
        if (this.selectedTem !== 'all') {
            this.customers = [];
            this.companies = [];
            this.selectedCompany = 'all';
            this._unsubscribeAllCustomerListByTEMId.next(null);
            this.locationService.getCustomerDropdownByNewTEM(this.selectedTem).pipe(takeUntil(this._unsubscribeAllCustomerListByTEMId)).subscribe({
                next: (data: { Data: { $values: any; }; }) => {
                    if (data && data.Data.$values) {
                        this.customers = data.Data.$values;
                    } else {
                        this.customers = [];
                    }
                },
                error: (error: any) => {
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
                next: (data: { $values: any; }) => {
                    if (data && data.$values) {
                        this.customers = data.$values;
                    } else {
                        this.customers = [];
                    }
                },
                error: (error: any) => {
                    this.customers = [];
                }
            })
    }

    getAllCompany() {
        this.locationService.getAllCompany().subscribe({
            next: (data: { $values: any; }) => {

                if (data && data.$values) {
                    this.companies = data.$values;
                } else {
                    this.companies = [];
                }
            },
            error: (error: any) => {
                this.companies = [];

            }
        });
    }

    getCompanyByTem(tem: string) {
        let data = {
            temAccountId: tem
        }
        this.locationService.getTemCompany(data).subscribe({
            next: (data: { $values: any; }) => {
                if (data && data.$values) {
                    this.companies = data.$values;
                } else {
                    this.companies = [];
                }
            },
            error: (error: any) => {
                let errorMessage: any = '';
                this.companies = [];
            }
        });
    }

    onTabChange(e: { index: number; }) {
        this.currentIndex = e.index;
        this.selectedTem = 'all';
        this.selectedCustomer = 'all';
        this.selectedCompany = 'all';

        
        if (!this.isCustomerAdmin) {
            this.onChangeCustomer();
            this.onChangeTem();
        }

        if (this.isCustomerAdmin) {
            this._unsubscribeCompany.next(null);
            this.locationService.getCompanyByCustomerId(this.loggedInUserId).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data: { $values: string | any[]; }) => {
                if (data && data.$values && data.$values.length > 0) {
                    this.companies = data.$values;
                } else {
                    this.companies = [];
                }
            }, (error: any) => {
                this.companies = [];
            });
        }
    }
    filterData() {
        this.isDisableSearch = true;
        this.isClickFilter = true;

        if (this.currentIndex === 0) {
            this.getOverviewdata(true);
            this.getInactivePeople({ value: 'current' });
            const defaultItem = this.chartView.find(item => item.name === this.selectedVendor);
            this.vendorData(defaultItem);
            const defaultProcess = this.chartView.find(item => item.name === this.selectedProcessing);
            this.getInvoiceProcessing(defaultProcess);
            this.getInventoryOverview();
            this.getexpiredContracts();
            this.getDisconnectedBilling({ value: 'current' });
            this.getClosedLocation({ value: 'current' });
            this.getSpendSummary();
        }
        // this.checkFetchedData();
    }

    isClickFilterEmit(e: boolean) {
        this.isClickFilter = e;
    }

    isDisableSearchEmit(e: boolean) {
        this.isDisableSearch = e;
    }

    checkFetchedData() {
        let isMatched = _.every([this.isOverviewLoad, this.isProcessingLoad, this.isVendorLoad, this.isInventoryLoad, this.isContractLoad, this.isBillingLoad, this.isClosedLocationLoad, this.isInactivePeopleLoad], (x: any) => x == true)
        this.isDisableSearch = !isMatched;
        if (isMatched)
            this.isClickFilter = false;
    }

    isAfterFirstFourDays(date = new Date()) {
        return date.getDate() > 4;
    }

    onChangeCustomer() {
        if (this.selectedCustomer !== 'all') {
            this.companies = [];
            this.selectedCompany = 'all';

            this._unsubscribeCompany.next(null);
            this.locationService.getCompanyByCustomerId(this.selectedCustomer).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data: { $values: string | any[]; }) => {
                if (data && data.$values && data.$values.length > 0) {
                    this.companies = data.$values;
                } else {
                    this.companies = [];
                }
            }, (error: any) => {
                this.companies = [];
            });
        } else {
            this.selectedCompany = 'all';
            this.companies = [];
            this.getAllCompany();

        }
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

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    }

    ngOnInit(): void {

        this.locationService.setPadding('true');
        this.isAllowTemDropdown = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM']);
        this.isTemRole = rolePermission(['TEMAdmin', 'TEMManager', 'TEMUser']);

        this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();

        this.recallAPi();

        if (this.isCustomerAdmin) {
            let id = sessionStorage.getItem("LoggedAccountId");
            this.loggedInUserId = id;
            this._unsubscribeCompany.next(null);
            this.locationService.getCompanyByCustomerId(this.loggedInUserId).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data: { $values: string | any[]; }) => {
                if (data && data.$values && data.$values.length > 0) {
                    this.companies = data.$values;
                } else {
                    this.companies = [];
                }
            }, (error: any) => {
                this.companies = [];
            });
        }

        if (this.isTemRole || this.isAllowTemDropdown) {
            this.getAllCustomer();
            this.getAllCompany();
        }
    }

    recallAPi() {
        // setInterval(() => {
        const defaultItem = this.chartView.find(item => item.name === this.selectedVendor);
        this.vendorData(defaultItem);
        this.getTemLists();
        const defaultProcess = this.chartView.find(item => item.name === this.selectedProcessing);
        this.getInvoiceProcessing(defaultProcess);
        this.getInventoryOverview();
        this.getexpiredContracts();
        this.getDisconnectedBilling({ value: 'current' });
        this.getClosedLocation({ value: 'current' });
        this.getInactivePeople({ value: 'current' });
        this.checkFetchedData();
        this.getSpendSummary();
        this.onMenuItemClick(this.selectedVal);
        //   }, 60000);
    }

    getSpendSummary(): void {
        const data: any = {};

        // Set start date dynamically
        const today = new Date();
        data['startDate'] = this.getDate(today.getFullYear(), today.getMonth(), today.getDate());
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        this.isSpendSummaryLoading = true;

        // API call
        this.dashboardService.getSpendSummary(data).subscribe(
            (res: any) => {
                this.isSpendSummaryLoading = false; // Loading complete

                if (res.Success && res.Data?.$values?.length) {
                    const spendData = res.Data.$values[0];

                    // Assign response data
                    this.currentSpend = spendData.CurrentMonth || 0;
                    this.previousSpend = spendData.PrevMonth || 0;
                    this.sixMonthAverage = spendData.lastSixMonthData || 0;
                    this.yearToDateSpend = spendData.YTD || 0;
                } else {
                    // Handle empty or invalid response
                    this.currentSpend = 0;
                    this.previousSpend = 0;
                    this.sixMonthAverage = 0;
                    this.yearToDateSpend = 0;
                }

            },
            (error: any) => {
                this.isSpendSummaryLoading = false; // Reset loading state on error
            }
        );
    }

    getClosedLocation(event: { value: string; }) {
        let data: any = {};
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        const today = new Date();
        data['startDate'] = this.getDate(today.getFullYear(), 0, 1);
        data['endDate'] = this.getDate(today.getFullYear(), 11, 31);
        data['IsPreviousYear'] = true;
        this.isClosedLocationLoad = false;
        this.dashboardService.closedLocation(data).pipe().subscribe((res: any) => {
            this.isClosedLocationLoad = true;
            this.checkFetchedData();
            this.closedLocationTotal = res.Data?.$values[0]?.GrandTotal;
            this.locationCount = res.Data?.$values[0]?.TotalLocationCount;

            if (res.Other?.$values[0].GrandTotal !== 0 && this.closedLocationProgress !== 0) {
                this.isArrowLocation = res.Other?.$values[0].GrandTotal > this.closedLocationProgress ? false : true;
                this.closedLocationProgress = (this.closedLocationProgress * 100) / res.Other?.$values[0].GrandTotal;
                this.closedLocationProgress = this.closedLocationProgress > 100 ? 100 : Math.round(this.closedLocationProgress);
            } else {
                this.isArrowLocation = res.Other?.$values[0].GrandTotal !== 0 ? false : true;
                this.closedLocationProgress = 100;
            }

            let seriesData = [
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
            ].map((month, index) => {
                const responseData = res.Data.$values[0].resultWithTotalsdata?.$values.find((item: { Month: number; }) => item.Month === index + 1);
                if (responseData) {
                    return responseData.Total;
                }
                return 0;
            });
            this.loadOppertunity(seriesData, 'closed_location', '#38BDF8')
        });
    }

    getInactivePeople(event: { value: string; }) {
        let data: any = {};
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        const today = new Date();
        data['startDate'] = this.getDate(today.getFullYear(), 0, 1);
        data['endDate'] = this.getDate(today.getFullYear(), 11, 31);
        data['IsPreviousYear'] = true;
        this.isInactivePeopleLoad = false;
        this.dashboardService.inactivePeople(data).pipe().subscribe((res: any) => {
            this.inactivePeopleTotal = res.Data?.$values[0]?.GrandTotal;
            this.peopleCount = res.Data?.$values[0]?.TotalPeopleCount;
            this.isInactivePeopleLoad = true;
            this.checkFetchedData();
            if (res.Other?.$values[0].GrandTotal !== 0 && this.inactivePeopleProgress !== 0) {
                this.isArrowPeople = res.Other?.$values[0].GrandTotal > this.inactivePeopleProgress ? false : true;
                this.inactivePeopleProgress = (this.inactivePeopleProgress * 100) / res.Other?.$values[0].GrandTotal;
                this.inactivePeopleProgress = this.inactivePeopleProgress > 100 ? 100 : Math.round(this.inactivePeopleProgress);
            } else {
                this.isArrowPeople = res.Other?.$values[0].GrandTotal !== 0 ? false : true;
                this.inactivePeopleProgress = 100;
            }
            let seriesData = [
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
            ].map((month, index) => {
                const responseData = res.Data.$values[0].resultWithTotalsData?.$values.find((item: { Month: number; }) => item.Month === index + 1);
                if (responseData) {
                    return responseData.Total;
                }
                return 0;
            });
            this.loadOppertunity(seriesData, 'inactive_people', '#34D399')
        });
    }

    getDisconnectedBilling(event: { value: string; }) {
        let data: any = {};
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        const today = new Date();
        data['startDate'] = this.getDate(today.getFullYear(), 0, 1);
        data['endDate'] = this.getDate(today.getFullYear(), 11, 31);
        data['IsPreviousYear'] = true;
        this.isBillingLoad = false;
        this.dashboardService.disconnectedProduct(data).pipe().subscribe((res: any) => {
            this.isBillingLoad = true;
            this.billingGrandTotal = res.Data?.$values[0]?.GrandTotal;
            this.billingInventory = res.Data?.$values[0]?.TotalVendorProductInvCount;
            this.checkFetchedData();

            if (res.Other?.$values[0].GrandTotal !== 0 && this.billingGrandTotal !== 0) {
                this.isArrowValue = res.Other?.$values[0].GrandTotal > this.billingGrandTotal ? false : true;
                this.billingProgress = (this.billingGrandTotal * 100) / res.Other?.$values[0].GrandTotal;
                this.billingProgress = this.billingProgress > 100 ? 100 : Math.round(this.billingProgress);
            } else {
                this.isArrowValue = res.Other?.$values[0].GrandTotal !== 0 ? false : true;
                this.billingProgress = 100;
            }
            let seriesData = [
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
            ].map((month, index) => {
                const responseData = res.Data.$values[0].resultWithTotalsData?.$values?.find((item: { Month: number; }) => item.Month === index + 1);
                if (responseData) {
                    return responseData.Total;
                }
                return 0;
            });
            this.loadOppertunity(seriesData, 'disconnect_billing', '#FB7185')
        });
    }
    getexpiredContracts() {
        let data: any = {};
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        this.isContractLoad = false;
        this.dashboardService.getExpiredContract(data).pipe().subscribe((res: any) => {
            this.isContractLoad = true;
            this.checkFetchedData();
            this.expiredContracts = res.Data.expiredContracts;
            this.nearingExpirationContracts = res.Data.NearingExpirationContracts;
        })
    }

    getOverviewdata(date?: boolean) {
        let data: any = {};
        if (date) {
            data['startDate'] = this.startDate,
                data['endDate'] = this.endDate
        }
        data['IsPreviousYear'] = this.IsPreviousYear;
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        this._unsubscribeSpend.next(null);
        this.isOverviewLoad = false;
        this.isShowSpend = true;
        this.dashboardService.getSpendOverviewData(data).pipe(takeUntil(this._unsubscribeSpend)).subscribe(async (result: any) => {
            this.isOverviewLoad = true;
            this.checkFetchedData();


            let currentYearData = result.Data.$values.filter((item: { Year: number; }) => item.Year === (new Date().getFullYear() - 1)); // Assuming you are pushing the year 2024 data
            if (result.Other == null) {
                result.Other = {};
                result.Other['PreviousYearData'] = {};
                result.Other['PreviousYearData']['$values'] = [];


                // Push it into the PreviousYearData array
                result.Other['PreviousYearData']['$values'].push(...currentYearData);


                result.Data.$values = result.Data.$values.filter((item: { Year: number; }) => item.Year !== (new Date().getFullYear() - 1));
            }
            if (this.isBrowser) {
                try {
                    const ApexCharts = (await import('apexcharts')).default;
                    const options: any = {
                        chart: {
                            // height: "100%",
                            // height: 419,
                            height: 180,
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
                            categories: this.selectedVal == '12 Mths' || this.selectedVal == '12 Mths & Previous Year' ? this.listMonth.map(item => item.month) : this.listMonth.map(item => this.getMonthName(item.monthId))
                        },
                        yaxis: {
                            labels: {
                                show: true,
                                style: {
                                    colors: "#a9a9c8",
                                    fontSize: "13px"
                                },
                                formatter: function (value: number) {
                                    return Math.round(value).toString(); // Removes decimals
                                },
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
                        legend: {
                            show: true,
                            position: 'bottom',
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
                        if (this.selectedVal == 'Previous Year') {
                            options['series'] = [
                                {
                                    name: "Previous",
                                    data: _.map(this.listMonth, (element: any) => {
                                        let value = result?.Other?.PreviousYearData?.$values.find((x: { Month: any; }) => x.Month == element.monthId)?.Total;
                                        return value ? value : 0
                                    }),
                                },
                            ]
                        } else {
                            options['series'] = [
                                {
                                    name: "Previous",
                                    data: _.map(this.listMonth, (element: any) => {
                                        let value = result?.Other?.PreviousYearData?.$values.find((x: { Month: any; }) => x.Month == element.monthId)?.Total;
                                        return value ? value : 0
                                    }),
                                },
                                {
                                    name: "Current",
                                    data: _.map(this.listMonth, (element: any) => {
                                        let value = result.Data?.$values.find((x: { Month: any; }) => x.Month == element.monthId)?.Total;
                                        return value ? value : 0
                                    })
                                }
                            ];
                        }
                    } else {
                        if (this.selectedVal == '12 Mths') {
                            const today = new Date();
                            const recordsCurrent = result.Data?.$values.filter((item: { Year: number; }) => item.Year === today.getFullYear());

                            if (recordsCurrent?.length) {
                                result.Data.$values = result.Data.$values.filter((item: { Year: number; }) => item.Year !== today.getFullYear());
                                result.Other?.PreviousYearData?.$values.push(...recordsCurrent);
                            }
                            options['series'] = [
                                {
                                    name: 'Current',
                                    data: _.map(this.listMonth, (element: any) => {
                                        let value = result.Other?.PreviousYearData?.$values.find((x: { Month: any; }) => x.Month == element.monthId)?.Total;
                                        return value ? value : 0
                                    })
                                }
                            ]
                        } else {
                            options['series'] = [
                                {
                                    name: 'Current',
                                    data: _.map(this.listMonth, (element: any) => {
                                        let value = result.Data?.$values.find((x: { Month: any; }) => x.Month == element.monthId)?.Total;
                                        return value ? value : 0
                                    })
                                }
                            ]
                        }
                    }

                    setTimeout(() => {
                        // Initialize and render the chart
                        let overviewChart = document.querySelector('#crm_balance_overview_chart');
                        if (overviewChart) {
                            overviewChart.innerHTML = '';
                            const chart = new ApexCharts(document.querySelector('#crm_balance_overview_chart'), options);
                            chart.render();
                        }
                    }, 500);

                } catch (error) {
                }
            }
        });
    }

    getInvoiceProcessing(event: { name: string; value: string; } | undefined) {
        this.selectedProcessing = event?.name;
        let data: any = {};
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        const today = new Date();
        if (event?.value == 'current') {
            // data['startDate'] = '2024-08-01T00:00:00+00:00';
            data['startDate'] = this.getDate(today.getFullYear(), today.getMonth(), 1);
        } else {
            const today = new Date();
            data['startDate'] = this.getDate(today.getFullYear(), today.getMonth() - 1, 1);
        }

        this.isProcessingLoad = false;
        this._unsubscribeVendor.next(null);
        this.dashboardService.getProcessingData(data).pipe(takeUntil(this._unsubscribeVendor)).subscribe(async (result: any) => {
            this.isProcessingLoad = true;
            this.checkFetchedData();
            this.loadChartInvoiceProcessing(result);
        });
    }

    getInventoryOverview() {
        let data: any = {};
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        this.isInventoryLoad = false;
        this._unsubscribeInventory.next(null);
        this.dashboardService.getInventoryOverview(data).pipe(takeUntil(this._unsubscribeInventory)).subscribe(async (result: any) => {
            this.isInventoryLoad = true;
            this.checkFetchedData();
            this.tutorials = this.generateTutorials(result.Data.$values);
        });

    }

    generateTutorials(data: any[]): any[] {
        let grandTotal = 0;
        const totals: any = {};
        const CountInv: any = {};
        const percentages: any = {};
        const predefinedKeys = ["wireline", "mobility", "cloud", "other"];

        predefinedKeys.forEach(key => {
            totals[key] = 0;
            percentages[key] = "0%";
        });

        data.forEach(item => {
            const key = item.DisplayName.toLowerCase();
            CountInv[key] = (CountInv[key] || 0) + item.Count;
            totals[key] = (totals[key] || 0) + item.Total;
            grandTotal += item.Total;
        });

        Object.keys(totals).forEach(key => {
            if (grandTotal > 0) {
                percentages[key] = `${((totals[key] / grandTotal) * 100).toFixed(0)}%`;
            }
        });

        const tutorials = [
            {
                title: "Inventory",
                ...predefinedKeys.reduce((acc: any, key: any) => {
                    acc[key] = `${CountInv[key] || "0"}`;
                    return acc;
                }, {})
            },
            {
                title: "Spend *",
                ...predefinedKeys.reduce((acc: any, key: any) => {
                    acc[key] = `$${(totals[key] || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                    return acc;
                }, {})
            },
            {
                title: "% of Spend",
                ...predefinedKeys.reduce((acc: any, key: any) => {
                    acc[key] = percentages[key] || "0%";
                    return acc;
                }, {})
            }
        ];

        return tutorials;
    }


    vendorData(event: { name: string; value: string; } | undefined) {
        this.selectedVendor = event?.name;
        let data: any = {};
        if (this.selectedTem !== 'all')
            data['temAccountId'] = Number(this.selectedTem);
        if (this.selectedCustomer !== 'all')
            data['customerAccountId'] = Number(this.selectedCustomer);
        if (this.selectedCompany !== 'all')
            data['companyId'] = Number(this.selectedCompany);

        const today = new Date();
        if (event?.value == 'current') {
            // data['startDate'] = '2024-08-01T00:00:00+00:00';
            data['startDate'] = this.getDate(today.getFullYear(), today.getMonth(), 1);
        } else {
            const today = new Date();
            data['startDate'] = this.getDate(today.getFullYear(), today.getMonth() - 1, 1);
        }
        this.isVendorLoad = false;
        this._unsubscribeInvoiceProcessing.next(null);
        this.dashboardService.getSpendVendor(data).pipe(takeUntil(this._unsubscribeInvoiceProcessing)).subscribe((result: any) => {

            this.isVendorLoad = true;
            this.spendVendorData = result.Data?.$values;
            this.previousYearVendorData = result?.Other?.$values;
            this.checkFetchedData();
            this.spendVendorData.forEach((item: { color: string; }, index: number) => {
                item.color = this.vendorColor[index];
            });

            this.previousYearData = result.Other?.$values[0];

            this.spendVendorData.forEach((current: { [x: string]: number; VendorId: any; persentage: number; Total: number; previousVal: number; progress: number; GrandTotal: number; }) => {
                let previousVendorFound = false;
                this.previousYearVendorData.forEach((prev: { VendorId: any; Total: number; }) => {
                    if (current.VendorId == prev.VendorId) {
                        previousVendorFound = true;
                        current.persentage = prev.Total === 0 ? 100 : Math.abs(prev.Total - current.Total) / prev.Total * 100;
                        current.previousVal = prev.Total;
                        current.persentage = current.persentage > 100 || current.persentage < 0 ? 100 : Math.round(current.persentage)
                    }

                });
                if (!previousVendorFound) {
                    current.persentage = 100;
                    current.previousVal = 0;
                }
                current.progress = (current.Total * 100) / current.GrandTotal;


                if (current.previousVal < current.Total) {
                    current['arraw'] = 1
                }
                if (current.previousVal > current.Total) {
                    current['arraw'] = -1
                }
                if (current.persentage === 0) {
                    current['arraw'] = 0
                }
            });
        });
    }

    getDate(year: number, month: number | undefined, day: number | undefined) {
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

    onMenuItemClick(value: any) {
        const currentDate = new Date();

        this.selectedVal = value;
        switch (value) {
            case '12 Mths':
                this.IsPreviousYear = false;
                this.startDate = this.getDate(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                this.endDate = currentDate;
                this.listMonth = this.getLast12Months(this.endDate);
                break;

            case '12 Mths & Previous Year':
                this.IsPreviousYear = true;
                this.startDate = this.getDate(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                this.endDate = currentDate;
                this.listMonth = this.getLast12Months(this.endDate);

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

        this.getOverviewdata(true);
    }

    async loadChartInvoiceProcessing(result: { Data: { expectedInvoiceCount: any; ProcessingCount: any; NotFinishedRecordCount: any; FinishedRecordCount: any; }; }): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [result.Data.expectedInvoiceCount, result.Data.ProcessingCount, result.Data.NotFinishedRecordCount, result.Data.FinishedRecordCount],
                    chart: {
                        height: "180px",
                        // height: 300,
                        type: "donut",
                        // sparkline: {
                        //     enabled: true,
                        // },
                    },
                    labels: [
                        "Retrievals", "Processing", "Recon", "Finished"
                    ],
                    stroke: {
                        // width: 0,
                        width: 2,
                        show: true,
                        curve: "smooth"
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: "#fff",
                            fontSize: '10px',
                            fontWeight: 400,
                        },
                        formatter: function (val: number) {
                            return Math.round(val) + "%";
                        }
                    },
                    colors: [
                        "#A367DC", "#ee8336", "#00b69b", "#2DB6F5"
                    ],
                    legend: {
                        offsetY: 0,
                        fontSize: "11px",
                        // position: "bottom",
                        horizontalAlign: "right",
                        labels: {
                            colors: "#77838F",
                        },
                        itemMargin: {
                            horizontal: 6,
                            vertical: 4
                        }
                    },

                    responsive: [{
                        breakpoint: 480,
                        legend: {
                            offsetY: 0,
                            fontSize: "11px",
                            position: "top",
                            horizontalAlign: "right",
                            labels: {
                                colors: "#77838F",
                            },
                            itemMargin: {
                                horizontal: 0,
                                vertical: 6
                            }
                        },
                    }],

                    tooltip: {
                        y: {
                            formatter: function (val: any) {
                                return val;
                            }
                        }
                    }
                };
                setTimeout(() => {
                    const chart = new ApexCharts(document.querySelector('#crm_organic_sessions_chart'), options);
                    chart.render();
                }, 500);

            } catch (error) {
            }
        }
    }

    async loadOppertunity(result: any[], chart: string, color: string): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                const options = {
                    series: [
                        {
                            name: "Total",
                            data: result
                        }
                    ],
                    animations: {
                        enabled: false,
                    },
                    chart: {
                        type: "area",
                        // height: "80",
                        // width: "100%",
                        height: '80',
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
                    colors: [
                        color
                    ],
                    fill: {
                        opacity: 0.5,
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: "smooth",
                        width: 4
                    },
                    grid: {
                        show: false,
                        strokeDashArray: 0,
                        borderColor: "#edeff5"
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
                    legend: {
                        show: false
                    },
                    tooltip: {

                        y: {
                            formatter: function (val: any) {
                                return "$" + val;
                            }
                        }
                    },

                };
                setTimeout(() => {
                    const chart2 = new ApexCharts(document.querySelector(`#${chart}`), options);
                    chart2.render();
                }, 500);

            } catch (error) {
            }
        }
    }

    ngOnDestroy() {
        this._unsubscribeTemLists.next(null);
        this._unsubscribeTemLists.complete();
        this._unsubscribeAllCustomerListByTEMId.next(null);
        this._unsubscribeAllCustomerListByTEMId.complete();
        this._unsubscribeCompany.next(null);
        this._unsubscribeCompany.complete();
        this._unsubscribeVendor.next(null);
        this._unsubscribeVendor.complete();
        this._unsubscribeInvoiceProcessing.next(null);
        this._unsubscribeInvoiceProcessing.complete();
        this._unsubscribeSpend.next(null);
        this._unsubscribeSpend.complete();
        this._unsubscribeInventory.next(null);
        this._unsubscribeInventory.complete();
        this.locationService.setPadding(null);
        // let getobj = document.getElementById('mihir') as any;
        // getobj.classList.remove('pcoded-content-new');
        // getobj.classList.add('pcoded-content');
    }

}