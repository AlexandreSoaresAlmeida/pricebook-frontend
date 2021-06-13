import { ClienteService } from './domain/cliente.service';
import { LastUser } from './../models/last_user';
import { StorageService } from './storage.service';
import { API_CONFIG } from './../config/api.config';
import { Injectable } from "@angular/core";
import { CredenciaisDTO } from "../models/credenciais.dto";
import { HttpClient } from "@angular/common/http";
import { LocalUser } from '../models/local_user';
import { JwtHelper } from 'angular2-jwt';
import { SessaoFinalizada } from '../models/sessao_finalizada';

@Injectable()
export class AuthService {

    jwtHelper: JwtHelper = new JwtHelper();

    constructor(
        public http: HttpClient, 
        public storage: StorageService,
        public clienteService : ClienteService) {
    }

    authenticate(creds: CredenciaisDTO) {
        return this.http.post(
            `${API_CONFIG.baseUrl}/login`,
            creds,
            {
                observe: 'response',
                responseType: 'text'
            });
    }

    refreshToken() {
        // Verifica primeiramente se o usuário está logado no momento
        let localUser = this.storage.getLocalUser();
        if (localUser && localUser.email) {

            return this.http.post(
                `${API_CONFIG.baseUrl}/auth/refresh_token`,
                {},
                {
                    observe: 'response',
                    responseType: 'text'
                });
        } else {
            return '';
        }       
    }

    successfulLogin(authorizationValue: string) {
        if (authorizationValue != null) {
            let tok = authorizationValue.substr(7);
            let user: LocalUser = {
                token: tok,
                email: this.jwtHelper.decodeToken(tok).sub,
                id: null
            };
            let luser: LastUser = {
                email: this.jwtHelper.decodeToken(tok).sub,
                lastAccess: new Date(Date.now())
            }
            this.storage.setLocalUser(user);
            this.clienteService.findByEmail(user.email)
                .subscribe(response2 => {
                    user.id = response2['id'];
                    this.storage.setLocalUser(user);                
                });
            this.storage.setLastAccess(luser);  
            
            // Inicializa o controle de sessão
            let sessaoFim : SessaoFinalizada = {
                show: false,
            }
            this.storage.setSessaoFinalizada(sessaoFim);
        }    
    }

    logout() {
        this.storage.setLocalUser(null);
    }

    forgot(email : string) {
        return this.http.post(
            `${API_CONFIG.baseUrl}/auth/forgot`,
            {email}, 
            {
                observe: 'response',
                responseType: 'text'
            });
    }

    changePsw(creds: CredenciaisDTO) { 
            return this.http.post(
                `${API_CONFIG.baseUrl}/auth/change`,
                creds,
                {
                    observe: 'response',
                    responseType: 'text'
                });       
    }
}