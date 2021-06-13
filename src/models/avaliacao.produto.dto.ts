import { RefDTO } from './ref.dto';

export interface AvaliacaoProdutoDTO {
    id              : number;
    cliente         : RefDTO;  
    produto         : RefDTO;  
    avaliacao       : number;
    dtHoraHistorico : any;
}