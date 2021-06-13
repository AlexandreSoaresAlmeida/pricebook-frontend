import { RefDTO } from './ref.dto';

export interface HistoricoAcessoDTO {
    id              : number;
    cliente         : RefDTO;  
    dtHoraHistorico : any;
    email           : string;
}