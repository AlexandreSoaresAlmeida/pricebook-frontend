import { HistoricoAcessoService } from './../services/domain/historico-acesso.service';
import { ImageUtilService } from './../services/image-util.service';
import { ClienteService } from './../services/domain/cliente.service';
import { AuthService } from './../services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ErrorInterceptorProvider } from '../interceptors/error-interceptor';
import { StorageService } from '../services/storage.service';
import { AuthInterceptorProvider } from '../interceptors/auth-interceptor';
import { ProdutoService } from '../services/domain/produto.service';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from "ng2-currency-mask/src/currency-mask.config";
import { PipesModule } from './../pipes/pipes.module';
import { SettingsProvider } from '../providers/settings/settings';
import { ComponentsModule } from '../components/components.module';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { HistoricoProdutoService } from '../services/domain/historico-produto.service';
import { UserProvider } from '../providers/user/user';
import { GeolocationProvider } from '../providers/geolocation/geolocation';
import { Geolocation } from '@ionic-native/geolocation';
//import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { HTTP } from '@ionic-native/http/ngx';

import { Network } from "@ionic-native/network";
import { DatePipe } from '@angular/common';

import { LOCALE_ID } from '@angular/core';
import localePtBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

import { ChartsModule } from 'ng2-charts'

import { AppVersion } from '@ionic-native/app-version';
import { AvaliacaoProdutoService } from '../services/domain/avaliacao-produto.service';

import { OneSignal } from "@ionic-native/onesignal";
import { ConfiguracaoService } from '../services/domain/configuracao.service';
import { DashboardService } from '../services/domain/dashboard.service';
import { Session } from '../providers/session';

registerLocaleData(localePtBr);

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
    align: "right",
    allowNegative: true,
    decimal: ",",
    precision: 2,
    prefix: "R$ ",
    suffix: "",
    thousands: "."
};

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    CurrencyMaskModule,
    PipesModule,
    ComponentsModule,
    ChartsModule,
  ],
  bootstrap: [
    IonicApp
  ],
  entryComponents: [
    MyApp, 
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: LOCALE_ID, useValue: 'pt-PT' },
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    AuthInterceptorProvider,
    ErrorInterceptorProvider,
    AuthService,
    StorageService,
    ClienteService,
    ProdutoService,
    HistoricoProdutoService,
    HistoricoAcessoService,
    AvaliacaoProdutoService,
    ImageUtilService,
    SettingsProvider,
    BarcodeScanner,
    UserProvider,
    GeolocationProvider,
    Geolocation,
    //ScreenOrientation,
    HTTP,
    Network,
    DatePipe,
    AppVersion,
    OneSignal,
    ConfiguracaoService,
    DashboardService,
    Session,
  ]
})
export class AppModule {}
