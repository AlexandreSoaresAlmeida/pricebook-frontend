import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from '../../config/api.config';
import { HistoricoProdutoDTO } from "../../models/historico.produto.dto";

@Injectable()
export class HistoricoProdutoService {

    constructor(public http: HttpClient){
    }

    findById(historicoProduto_id : string) {
        return this.http.get<HistoricoProdutoDTO>(`${API_CONFIG.baseUrl}/historicoproduto/${historicoProduto_id}`);
    }

    // Recupera o último histórico do produto para o usuário atual
    findByLastBarCodeandIdCliente(produto_barcode : string, cliente_id : string) {
        return this.http.get<HistoricoProdutoDTO>(`${API_CONFIG.baseUrl}/historicoproduto/findByLastBarCodeandIdCliente?barCode=${produto_barcode}&idCliente=${cliente_id}`);
    }

    // Recupera a último descrição para o produto que não possui imagem no histórico do produto para o usuário atual
    findByLastDescTmp(produto_barcode : string, cliente_id : string) {
        return this.http.get<HistoricoProdutoDTO>(`${API_CONFIG.baseUrl}/historicoproduto/findByLastDescTmp?barCode=${produto_barcode}&idCliente=${cliente_id}`);
    }

    findByConsumidorandProduto(cliente_id : string, produto_id : string, page : number = 0, linesPerPage : number = 24) {
        return this.http.get(`${API_CONFIG.baseUrl}/historicoproduto/findDistinctByIdProdutoandCliente?idCliente=${cliente_id}&idProduto=${produto_id}&page=${page}&linesPerPage=${linesPerPage}`);
    }

    findByConsumidor(cliente_id : string, page : number = 0, linesPerPage : number = 24) {
        return this.http.get(`${API_CONFIG.baseUrl}/historicoproduto/pageByConsumidores?idCliente=${cliente_id}&page=${page}&linesPerPage=${linesPerPage}`);
    }


    insert(obj: HistoricoProdutoDTO) {        
        return this.http.post(
            `${API_CONFIG.baseUrl}/historicoproduto`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }

    update(obj: HistoricoProdutoDTO) {        
        return this.http.put(
            `${API_CONFIG.baseUrl}/historicoproduto`,
            obj,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }

	// DEPRECATED * version <= 0.1.4 **************************************
    findDistinctByBarCodeandClient(produto_barcode : string, cliente_id : string) {
        // console.log(">>> show-produto : findDistinctByBarCodeandClient - " + `${API_CONFIG.baseUrl}/historicoproduto/barcodeidcliente?barCode=${produto_barcode}&idCliente=${cliente_id}`);
        return this.http.get<HistoricoProdutoDTO>(`${API_CONFIG.baseUrl}/historicoproduto/barcodeidcliente?barCode=${produto_barcode}&idCliente=${cliente_id}`);
    }   
}