import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from '../../config/api.config';
import { HistoricoAcessoDTO } from "../../models/historico.acesso.dto";

@Injectable()
export class HistoricoAcessoService {

    constructor(public http: HttpClient){
    }

    insert(obj: HistoricoAcessoDTO) {        
        return this.http.post(
            `${API_CONFIG.baseUrl}/historicoacesso`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }
}