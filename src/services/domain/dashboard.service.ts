import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_CONFIG } from '../../config/api.config';
import { Observable } from 'rxjs/RX';

@Injectable()
export class DashboardService {
    constructor( public http: HttpClient ){ }

    // Utilizado em ProdutoDetail
    // Exemplo: http://localhost:8081/db2/produtoValorDia/?idProduto=3&idCliente=2
    valorProdutoDia(idProduto : number, idCliente: number) : Observable<any> {
        return this.http.get(`${API_CONFIG.baseUrl}/db2/produtoValorDia/?idProduto=${idProduto}&idCliente=${idCliente}`);
    }

    // Utilizado em Dashboard
    // Exemplo: http://localhost:8081/db1/qtdAcessosDias?dtIni=02/04/2019&dtFim=19/05/2019
    qtdAcessosDia(dtIni : any, dtFim : any, qtd : any) : Observable<any> {
        return this.http.get(`${API_CONFIG.baseUrl}/db1/qtdAcessosDias/?dtIni=${dtIni}&dtFim=${dtFim}&qtd=${qtd}`);
    }

    // Utilizado em Dashboard
    // Exemplo: http://localhost:8081/db3/qtdProdutosNovosProdutos
    qtdProdutosNovosProdutos() : Observable<any> {
        return this.http.get(`${API_CONFIG.baseUrl}/db3/qtdProdutosNovosProdutos`);
    }

    // Pontuação do Usuário
    // Exemplo: http://localhost:8081/db4/categoriaClienteVip/?cliente_id=2
    pontuacaoUsuario(cliente_id : number) : Observable<any> {
        return this.http.get(`${API_CONFIG.baseUrl}/db4/categoriaClienteVip/?cliente_id=${cliente_id}`);
    }
}