import { ProdutoDTO } from "./produto.dto";
import { RefDTO } from './ref.dto';

export interface HistoricoProdutoDTO {
    id                  : number;
    cliente             : RefDTO;  
    produto             : ProdutoDTO;  
    preco               : number;
    precoPromocional    : any;
    dtHoraHistorico     : any;
    latitude            : any;
    longitude           : any;
    localAumentoAbusivo : any;
    nomeTempProduto     : any;
}