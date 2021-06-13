import { PerfilDTO } from "./perfil.dto";

export interface ClienteDTO {
    id: string;
    nome: string;
    email: string;
    imageUrl?: string;
    perfis: PerfilDTO[];
    imagem: boolean;
    aceiteTermoUso: any;
    situacaoImagem : number;
}