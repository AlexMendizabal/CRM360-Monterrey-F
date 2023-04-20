import { Injectable } from '@angular/core';

import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Circle from 'ol/geom/Circle';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private layers = [];

  private map: Map;
  colors = {
    blue: {
      fill: 'rgba(0, 0, 255, 0.5)',
      stroke: 'rgba(0, 0, 255, 0.8)',
    },
    yellow: {
      fill: 'rgba(255, 255, 0, 0.8)',
      stroke: 'rgba(255, 255, 0, 1)',
    },
    red: {
      fill: 'rgba(255, 0, 0, 0.8)',
      stroke: 'rgba(255, 0, 0, 1)',
    }
  }

  constructor() { }

  /**
   * 
   * @param id O id contido na div, a div deve ter altura(heigth) e largura(width) definidos
   */
  create(id: string){

    if(this.map != undefined)
      return

    this.map = new Map({
      target: id,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        //Piracicaba
        center: olProj.fromLonLat([-47.652042, -22.7038956]),
        zoom: 10
      })
    });

  }

  getMap(): Map{
    return this.map;
  }

  onAddCircleLayer(lonLat: [number, number], radius: number, color: string = 'blue'){

    const layer = new VectorLayer({
      source: new VectorSource({
        /* projection: 'EPSG:4326', */
        features: [new Feature(new Circle(olProj.fromLonLat(lonLat), radius))]
      }),
      style: [
        new Style({
          stroke: new Stroke({
            color: this.colors[color].stroke,
            width: 1
          }),
          fill: new Fill({
            color: this.colors[color].fill
          })
        })
      ]
    }) 
    
    this.map.addLayer(layer);
    this.layers.push(layer);
  }

  removeLayers(){
    this.layers.forEach(layer => this.map.removeLayer(layer))
  }

  setCenter(lonLat: [number, number]){
    this.map.getView().setCenter(olProj.fromLonLat(lonLat))
  }

  setZoom(zoom: number){
    this.map.getView().setZoom(zoom);
  }


}
