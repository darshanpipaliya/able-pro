import { Component, OnInit } from '@angular/core';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Component({
    selector: 'app-disconnected-with-billing-chart',
    // templateUrl: './disconnected-with-billing-chart.component.html',
    // styleUrls: ['./disconnected-with-billing-chart.component.scss']
})
export class DisconnectedWithBillingChartComponent implements OnInit {

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }
    ngOnInit(): void {
        this.loadChartsavingOne()
    }
    async loadChartsavingOne(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [
                        {
                            name: "Income",
                            data: [11, 32, 45, 36, 36, 52, 41]
                        }
                    ],
                    chart: {
                        type: "area",
                        height: "100%",
                        width: "100%",
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#ee8336"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: "straight",
                        width: 2
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
                           
                        },
                        categories: [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul"
                        ]
                    },
                    yaxis: {
                        labels: {
                            show: false,
                            
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
                    }
                };

                // Initialize and render the chart
                const chart1 = new ApexCharts(document.querySelector('#crm_lead_conversations_chart1'), options);
                const chart2 = new ApexCharts(document.querySelector('#crm_lead_conversations_chart2'), options);
                const chart3 = new ApexCharts(document.querySelector('#crm_lead_conversations_chart3'), options);
                const chart4 = new ApexCharts(document.querySelector('#crm_lead_conversations_chart4'), options);
                chart1.render();
                chart2.render();
                chart3.render();
                chart4.render();
            } catch (error) {
            }
        }
    }
}
