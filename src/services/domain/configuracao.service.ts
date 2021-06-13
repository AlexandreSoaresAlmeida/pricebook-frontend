import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from '../../config/api.config';
import { ConfiguracaoDTO } from "../../models/configuracao.dto";
import { Session } from "../../providers/session";


@Injectable()
export class ConfiguracaoService {

    constructor(
        public http: HttpClient,
        private session : Session){
    }

    findByLastVersion() {
        // Verifica sessão
        this.session.verificarSessao();
        let url : string=`${API_CONFIG.baseUrl}/configuracao/findByLastVersion`;
        return this.http.get<ConfiguracaoDTO>(url);
    }

    insert(obj: ConfiguracaoDTO) {        
        return this.http.post(
            `${API_CONFIG.baseUrl}/configuracao`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }

    update(obj: ConfiguracaoDTO) {        
        return this.http.put(
            `${API_CONFIG.baseUrl}/configuracao`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }
}