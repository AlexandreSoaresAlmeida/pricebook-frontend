import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { API_CONFIG } from '../../config/api.config';

@Injectable()
export class SettingsProvider {

  private theme: BehaviorSubject<String>;

  constructor() {
    this.theme = new BehaviorSubject(`${API_CONFIG.theme}`);
  }

  setActiveTheme(val) {
    this.theme.next(val);
  }

  getActiveTheme() {
    return this.theme.asObservable();
  }
}
