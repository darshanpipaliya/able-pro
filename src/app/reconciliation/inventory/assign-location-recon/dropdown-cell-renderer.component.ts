import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { LocationService } from '../../../location.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dropdown-cell-renderer',
  template: `
    <p-dropdown [options]="locationRowData" appendTo="body" placeholder="Select a Address" optionValue="LocationId" optionLabel="LocationDisplayValue" filterBy="LocationDisplayValue"
    (onFilter)="onSearch($event)" [filter]="true" (onChange)="onValueChange($event)">
      <ng-template let-item pTemplate="item">
          {{ item.LocationDisplayValue }}
      </ng-template>
      <ng-template pTemplate="empty">
          <span *ngIf="isLoading">Loading...</span>
          <span *ngIf="!isLoading">No results found</span>
      </ng-template>
    </p-dropdown>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,

  ],
})
export class DropdownCellRendererComponent implements OnInit, ICellRendererAngularComp {
  options: any;
  selectedValue: any;
  params: any;
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  locationRowData: any;
  isLoading: boolean = false;

  constructor(private locationService: LocationService) { }

  ngOnInit() {
  }

  agInit(params: ICellRendererParams): void {

    this.options = params.colDef.filterParams.values[0];
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onValueChange(data: any) {
    const params = {
      locationId: data.value,
      VendorProductInventoryId: this.params.data.VendorProductInventoryId
    }
    this.params.onClick(params);
  }

  onSearch(value) {
    const query = value.filter?.trim()
    const existingFilterIndex = this.options['advanceFilter'].findIndex(
      (filter) => filter.filterKey === "LocationDisplayValue"
    );

    if ((query?.length === 1 || query?.length === 2) && query >= 0 ) {
      this.search(query, existingFilterIndex)
    } else if (query?.length >= 3) {
      this.search(query, existingFilterIndex)
    } else {
      this.locationRowData = [];
    }
  }


  search(query, existingFilterIndex) {
    this.isLoading = true; 

    if (existingFilterIndex !== -1) {
      this.options['advanceFilter'][existingFilterIndex].filterOptionValue1 = query;
    } else {
      this.options['advanceFilter'].push({
        "filterKey": "LocationDisplayValue",
        "filterOptionType1": "contains",
        "filterOptionValue1": query,
        "filterOperationType": "AND",
        "filterOptionType2": null,
        "filterOptionValue2": null
      });
    }
    this.getLocations()
  }

  getLocations() {
    let data: any = {};

    data['customerAccountId'] = this.options['customerAccountId'];
    data['advanceFilter'] = this.options['advanceFilter'];
    data['forDropDown'] = true;

    this._unsubscribeLocation.next();
    this.locationService
      .getCompanylocationsURL(data)
      .pipe(takeUntil(this._unsubscribeLocation))
      .subscribe(
        async (data: any) => {
          if (data && data._companyLocationDto.$values) {
            this.locationRowData = data._companyLocationDto.$values;
            this.isLoading = false;
          } else {
            this.isLoading = false;
            this.locationRowData = [];
          }
        });
  }
}
