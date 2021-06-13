import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from '../../config/api.config';
import { AvaliacaoProdutoDTO } from "../../models/avaliacao.produto.dto";

@Injectable()
export class AvaliacaoProdutoService {

    constructor(public http: HttpClient){
    }

    findDistinctByIdClienteIdProduto(cliente_id : string, produto_id : string) {
        let url : string=`${API_CONFIG.baseUrl}/avaliacaoProduto/ByIdClienteandIdProduto/?idCliente=${cliente_id}&idProduto=${produto_id}`;
        return this.http.get<AvaliacaoProdutoDTO>(url);
    }

    insert(obj: AvaliacaoProdutoDTO) {        
        return this.http.post(
            `${API_CONFIG.baseUrl}/avaliacaoProduto`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }

    update(obj: AvaliacaoProdutoDTO) {        
        return this.http.put(
            `${API_CONFIG.baseUrl}/avaliacaoProduto`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }
}