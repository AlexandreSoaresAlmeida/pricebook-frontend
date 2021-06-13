import { RefDTO } from './ref.dto';

export interface ProdutoDTO {
    id : string;
    nome : string;
    descricao : string;
    preco : number;
    barcode : string;
    unidadeMedida : string;
    urlInternet : string;
    imageUrl? : string;
    cliente   : RefDTO;
    dtHoraHistorico : any;
    situacaoImagem : number;
    imagemNaoCorrespondente : number;
}