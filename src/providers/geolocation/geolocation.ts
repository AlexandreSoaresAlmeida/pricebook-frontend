import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
//import JQuery from 'jquery';

@Injectable()
export class GeolocationProvider {
  those = this;
  latitude : any;
  longitude : any;
  endereco_completo : any;

  constructor(
    public http: HttpClient,
    private geolocation : Geolocation,
  ) {
    //console.log('Hello GeolocationProvider Provider');
  }

  public ativarLocalização(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      //console.log("Latitude: '" + this.latitude.toFixed(7));
      //console.log("Longitude: '" + this.longitude.toFixed(7));

      /*
      var GoogleAPI = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + this.latitude.toFixed(5) + "," + this.longitude.toFixed(5);
      let localizacao = JQuery.get(GoogleAPI);
      localizacao.done(function (data) {
        if (data.results[0]) {
					this.endereco_completo = data.results[0].formatted_address;
          console.log("  > Endereço Completo: '" + this.endereco_completo);
          this.those.cidade = data.results[0].address_components[4].long_name;
          this.estado = data.results[0].address_components[5].long_name;
          console.log("  > Cidade: '" + this.those.cidade);
          console.log("  > Estado: '" + this.estado);
        }
      }, (err) => {
        console.log("Erro ao recuperar as informações sobre o endereço", err);
      });
      */
    }, (err) => {
      console.log("Erro ao buscar a localização atual: ", err);
      return null;
    });  
  }
}