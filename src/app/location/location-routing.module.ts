import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LocationComponent } from './location.component';
import { MapComponent } from '../map/map.component';

const routes: Routes = [
  {
    path: '',
    component: LocationComponent
  },
  {
    path: 'map',
    component: MapComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationRoutingModule { }
