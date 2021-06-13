import { ImageUtilService } from './../image-util.service';
import { API_CONFIG } from './../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Rx';
import { ClienteDTO } from "../../models/cliente.dto";
import { StorageService } from './../storage.service';
import { Platform } from 'ionic-angular';

@Injectable()
export class ClienteService {
    basepath = "/api";
    url : string;

    constructor(
        public http: HttpClient,
        public storage: StorageService,
        public imageUtilService: ImageUtilService,
        private _platform : Platform,
        ) {
            if(this._platform.is("cordova")){
              this.basepath = `${API_CONFIG.bucketBaseUrl}`;
            }
            this.url = `${this.basepath}/consumidores`;
            //console.log(">>> url:"+this.url);
    }

    findByEmail(email: string) {
        //console.log(">> cliente.service > Metodo: findByEmail - " + `${API_CONFIG.baseUrl}/clientes/email?value=${email}`);
        return this.http.get(
            `${API_CONFIG.baseUrl}/clientes/email?value=${email}`);
    }

    findById(id: string) {
        //console.log(">> cliente.service > Metodo: findById");
        return this.http.get(
            `${API_CONFIG.baseUrl}/clientes/${id}`);
    }

    getImageFromBucket(id: string):  Observable<any> {
        console.log(">> cliente.service > Metodo: getImageFromBucket :" + `${this.url}/cons${id}.png`);
        return this.http.get(`${this.url}/cons${id}.png`, {responseType : 'blob'});
    }

    insert(obj: ClienteDTO) {
        //console.log(">> cliente.service > Metodo: insert");
        return this.http.post(
            `${API_CONFIG.baseUrl}/clientes`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        );
    }

    uploadPicture(picture) {
        let pictureBlob = this.imageUtilService.dataUriToBlob(picture);
        let formData: FormData = new FormData();
        formData.set('file', pictureBlob, 'file.png');
        return this.http.post(
            `${this.url}`,
            formData,
            {
                observe: 'response',
                responseType: 'text'
            }
        );
    }
}