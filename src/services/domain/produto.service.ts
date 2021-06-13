import { ProdutoDTO } from './../../models/produto.dto';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from './../../config/api.config';
import { Observable } from 'rxjs/RX';
import { Platform } from 'ionic-angular';

@Injectable()
export class ProdutoService {

    basepath = "/api";
    url : string;

    constructor(
        public http: HttpClient,
        private _platform : Platform,
        ){
            if(this._platform.is("cordova")){
                this.basepath = `${API_CONFIG.bucketBaseUrl}`;
            }
            this.url = `${this.basepath}/produtos`;
            //console.log(">>> url:"+this.url);
    }

    getSmallImageFromBucket(barcode : string) : Observable<any> {
        //console.log(">> produto.service > Metodo: getSmallImageFromBucket :" + this.url+"/"+`${barcode}.png`);
        return this.http.get(this.url+"/"+`${barcode}.png`, {responseType : 'blob'});
    }

    getImageFromBucket(barcode : string) : Observable<any> {
        //console.log(">> produto.service > Metodo: getImageFromBucket :" + this.url+"/"+`${barcode}.png`);
        return this.http.get(this.url+"/"+`${barcode}.png`, {responseType : 'blob'});
    }

    findById(produto_id : string) {
        return this.http.get<ProdutoDTO>(`${API_CONFIG.baseUrl}/produto/${produto_id}`);
    }

    findByBarCode(produto_barcode : string) {
        //console.log(">>>"+`${API_CONFIG.baseUrl}/produto/barcode/${produto_barcode}`);
        return this.http.get<ProdutoDTO>(`${API_CONFIG.baseUrl}/produto/barcode/${produto_barcode}`);
    }

    findByCategoria(categoria_id : string, page : number = 0, linesPerPage : number = 24) {
        return this.http.get(`${API_CONFIG.baseUrl}/produto/?categorias=${categoria_id}&page=${page}&linesPerPage=${linesPerPage}`);
    }

    findByConsumidor(cliente_id : string, page : number = 0, linesPerPage : number = 24) {
        return this.http.get(`${API_CONFIG.baseUrl}/produto/pageByConsumidores?idCliente=${cliente_id}&page=${page}&linesPerPage=${linesPerPage}`);
    }

    public insert(obj: ProdutoDTO) {        
        return this.http.post(
            `${API_CONFIG.baseUrl}/produto`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }

    public update(obj: ProdutoDTO) {        
        return this.http.put(
            `${API_CONFIG.baseUrl}/produto`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }    
}