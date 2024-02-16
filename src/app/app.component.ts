import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {latLng, Marker, tileLayer} from "leaflet";
import {HttpClient} from "@angular/common/http";
import {interval, map, Subscription, take} from "rxjs";
import * as L from "leaflet";
interface IssObject{
  name: string,
  id: number,
  latitude: number,
  longitude: number,
  altitude: number,
  velocity: number,
  visibility: string,
  footprint: number,
  timestamp: number,
  daynum: number,
  solar_lat: number,
  solar_lon: number,
  units: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy{
  private httpClient = inject(HttpClient)
  private issURL = 'https://api.wheretheiss.at/v1/satellites/25544';
  private intervalSub = new Subscription()
  center = latLng(46.879966, -121.726909)
  map: L.Map | undefined;
  marker: Marker | undefined;
  title = 'iss-watcher';
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
  };

  icon = {
    icon: L.icon({
      iconSize: [ 25, 41 ],
      iconAnchor: [ 13, 0 ],
      iconUrl: 'https://decisionfarm.ca/assets/images/marker-icon-2x.png',
      shadowUrl: 'https://decisionfarm.ca/assets/images/marker-shadow.png'
    })
  };

  ngOnInit() {
    this.intervalSub = interval(2000).subscribe(() => {
      this.httpClient.get(this.issURL).pipe(take(1),map(rawData=> rawData as IssObject)).subscribe(issObject=>{
        this.center = latLng(Number(issObject.latitude),Number(issObject.longitude));
        if(this.map){
          this.marker?.remove();
          this.marker = L.marker(this.center,this.icon).addTo(this.map);
          this.marker.bindPopup("<h3>ISS position</h3>").openPopup();
        }

      })
    });
  }

  ngOnDestroy() {
    this.intervalSub.unsubscribe();
  }

  onMapReady(map: L.Map) {
    this.map = map;
  }


}
