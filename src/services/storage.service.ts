import { LastDateTimeAccess } from './../models/last_date_time_access';
import { LocalUser } from './../models/local_user';
import { LastUser } from './../models/last_user';
import { Injectable } from "@angular/core";
import { STORAGE_KEYS } from '../config/storage_keys.config';
import { ShowDicas } from '../models/show_dicas';
import { ShowCad } from '../models/show_cadastro';
import { ShowBemVindo } from '../models/show_bem_vindo';
import { SessaoFinalizada } from '../models/sessao_finalizada';

@Injectable()
export class StorageService {

    getLocalUser(): LocalUser {
        let usr = localStorage.getItem(STORAGE_KEYS.localUser);
        if (usr == null) {
            return null;
        }
        else {
            return JSON.parse(usr);
        }
    }

    setLocalUser(obj: LocalUser) {
        if (obj == null) {
            localStorage.removeItem(STORAGE_KEYS.localUser);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.localUser, JSON.stringify(obj));
        }
    } 

    getLastAccess(): LastUser {
        let usr = localStorage.getItem(STORAGE_KEYS.lastAccess);
        if (usr == null) {
            return null;
        }
        else {
            return JSON.parse(usr);
        }
    }

    setLastAccess(obj: LastUser) {
        //debugger;
        if (obj == null) {
            localStorage.removeItem(STORAGE_KEYS.lastAccess);
        }
        else {
            this.resetLastUserStorage();
            localStorage.setItem(STORAGE_KEYS.lastAccess, JSON.stringify(obj));
        }
    }
    
    resetLastUserStorage(){
        //this.local.clear();
        localStorage.removeItem(STORAGE_KEYS.lastAccess);
    }

    getShowDicas(): ShowDicas {
        let dicas = localStorage.getItem(STORAGE_KEYS.showDicas);
        console.log("### dicas -> "+dicas);
        if (dicas == null) {
            return null;
        }
        else {
            return JSON.parse(dicas);
        }
    }

    setShowDicas(obj: ShowDicas) {
        if (obj == null) {
            localStorage.removeItem(STORAGE_KEYS.showDicas);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.showDicas, JSON.stringify(obj));
        }
    }

    getShowCad(): ShowCad {
        let cad = localStorage.getItem(STORAGE_KEYS.showCad);
        if (cad == null) {
            return null;
        }
        else {
            return JSON.parse(cad);
        }
    }

    setShowCad(obj: ShowCad) {
        if (obj == null) {
            localStorage.removeItem(STORAGE_KEYS.showCad);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.showCad, JSON.stringify(obj));
        }
    }

    getLastDateTimeAccess(): LastDateTimeAccess {
        let dthraccess = localStorage.getItem(STORAGE_KEYS.lastDateTimeAccess);
        if (dthraccess == null) {
            return null;
        }
        else {
            return JSON.parse(dthraccess);
        }
    }

    setLastDateTimeAccess(obj: LastDateTimeAccess) {
        //debugger;
        if (obj == null) {
            localStorage.removeItem(STORAGE_KEYS.lastDateTimeAccess);
        }
        else {
            this.resetLastDateTimeAccessStorage();
            localStorage.setItem(STORAGE_KEYS.lastDateTimeAccess, JSON.stringify(obj));
        }
    }

    resetLastDateTimeAccessStorage(){
        //this.local.clear();
        localStorage.removeItem(STORAGE_KEYS.lastDateTimeAccess);
    }

    getShowBemVindo(): ShowBemVindo {
        let bemVindo = localStorage.getItem(STORAGE_KEYS.showBemVindo);
        if (bemVindo == null) {
            return null;
        }
        else {
            return JSON.parse(bemVindo);
        }
    }

    setShowBemVindo(obj: ShowBemVindo) {
        if (obj == null) {
            localStorage.removeItem(STORAGE_KEYS.showBemVindo);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.showBemVindo, JSON.stringify(obj));
        }
    }

    sessaoFinalizada
    getSessaoFinalizada(): SessaoFinalizada {
        let essaoFinalizada = localStorage.getItem(STORAGE_KEYS.sessaoFinalizada);
        if (essaoFinalizada == null) {
            return null;
        }
        else {
            return JSON.parse(essaoFinalizada);
        }
    }

    setSessaoFinalizada(obj: SessaoFinalizada) {
        if (obj == null) {
            localStorage.removeItem(STORAGE_KEYS.sessaoFinalizada);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.sessaoFinalizada, JSON.stringify(obj));
        }
    }
} 