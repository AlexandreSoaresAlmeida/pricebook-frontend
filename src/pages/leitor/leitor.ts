import { SessaoFinalizada } from './../../models/sessao_finalizada';
import { Coordenadas } from './../../models/coordenadas';
import { ProdutoDTO } from './../../models/produto.dto';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ToastController } from 'ionic-angular';
import { ProdutoService } from '../../services/domain/produto.service';
import { HistoricoProdutoService } from '../../services/domain/historico-produto.service';
import { ClienteService } from '../../services/domain/cliente.service';
import { StorageService } from '../../services/storage.service';
import { HistoricoProdutoDTO } from '../../models/historico.produto.dto';
import { Geolocation } from '@ionic-native/geolocation';
import { GeolocationProvider } from '../../providers/geolocation/geolocation';
import { Network } from "@ionic-native/network";
import { LastUser } from './../../models/last_user';
import { AuthService } from '../../services/auth.service';
import { Events } from 'ionic-angular';
import { versionNumber } from '../../version';
import { ConfiguracaoDTO } from '../../models/configuracao.dto';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ConfiguracaoService } from './../../services/domain/configuracao.service';
import { sitImg_NAOCARREGADA, sitImg_NAOENCONTRADA, sitImg_ENCONTRADA } from '../../config';
import { ShowBemVindo } from '../../models/show_bem_vindo';
import { API_CONFIG } from '../../config/api.config';

@IonicPage()
@Component({
  selector: 'page-leitor',
  templateUrl: 'leitor.html',
})
export class LeitorPage {
  public tempoLimiteSessao : number = 90; // Em minutos
  public barcode: string;
  public idCliente : string = null;
  public ultimoHistoricoProdutoDTO : HistoricoProdutoDTO;
  public produtoDTO : ProdutoDTO;
  public produtoDTOTmp : ProdutoDTO;
  public coord : Coordenadas = {
    "latitude"  : "",
    "longitude" : ""
  };
  latitude : any;
  longitude : any;
  versionNumber : string = versionNumber;

  // Constantes para as situações das imagens
  IMG_NAOCARREGADA  : number = sitImg_NAOCARREGADA;
  IMG_NAOENCONTRADA : number = sitImg_NAOENCONTRADA;
  IMG_ENCONTRADA    : number = sitImg_ENCONTRADA;


  ShowBemVindo : boolean = false;

  msgFooter: string = API_CONFIG.msgFooter;
    
  app_version_local : string = versionNumber;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner,
    private toastCtrl: ToastController,
    private _platform : Platform,
    private produtoService : ProdutoService,
    private historicoProdutoService: HistoricoProdutoService,
    private clienteService : ClienteService,
    private storage: StorageService,
    private loadingCtrl: LoadingController,
    private geolocation : Geolocation,
    private geolocationProvider : GeolocationProvider,
    private network : Network,
    private auth : AuthService,
    public events: Events,
    private configuracao : ConfiguracaoService,
    private alertController: AlertController,  
) {

    if (!this.verificarSessao()){
      let sbv = this.storage.getShowBemVindo(); 
      if ((sbv) && (!sbv.show)) {
        // Seta a primeira visualização do ShowDicas
        let sBVindo: ShowBemVindo = {
          show: true
        }
        this.storage.setShowBemVindo(sBVindo);
        this.ShowBemVindo = true;
      } else { this.ShowBemVindo = false; }
    }
  }

  private  verificarSessao() : any {
    // Seta o rootPage diretamente para a tela de login se
    // o usuário não estiver maislogado
    let localUser = this.storage.getLocalUser();
    if (!(localUser && localUser.email)) {
      this.auth.logout();
      this.encerrarSessao();
      this.navCtrl.setRoot('HomePage');
      return false;
    } else {
      let ultimoAcesso :LastUser = <LastUser> this.storage.getLastAccess();
      let s : string = ultimoAcesso.lastAccess;
      let d1 : Date = new Date(s);
      let d2 : Date = new Date(Date.now());
      let qtdMinutos : number = this.calcularDiferenca(d1, d2);
      console.log(">>> Qtd minutos: " + qtdMinutos);
      if ((ultimoAcesso) && ( qtdMinutos > this.tempoLimiteSessao )) {
          // seta o último acesso com o momento atual para ele ter ponto de saída
          ultimoAcesso.lastAccess = d1;
          this.storage.setLastAccess(ultimoAcesso);
          this.auth.logout();
          this.encerrarSessao();
          this.events.publish('user:loggedout');
          this.navCtrl.setRoot('HomePage');
          return false;
      } else return true;
    }
  }

  private encerrarSessao() {
    // Seta a informacao que a sessao foi encerrada
    let sessaoFim : SessaoFinalizada = <SessaoFinalizada> this.storage.getSessaoFinalizada();
    console.log(">>> " +sessaoFim.show);
    sessaoFim.show = true;
    console.log(">>> " +sessaoFim.show);
    this.storage.setSessaoFinalizada(sessaoFim);  
  }

  public calcularDiferenca(dateTime1 : Date, dateTime2 : Date) : number {
    var diff = Math.abs(dateTime1.getTime() - dateTime2.getTime());
    var qtdMinutos = Math.ceil(diff / (1000 * 60 )); 
    return qtdMinutos;
  }

  public lerLocalizacaoAtual() {
    if (this.isConnected() as boolean) {
      this.geolocationProvider.ativarLocalização();
    } else {
      console.log(">> Não há rede!");
    }
  }

  presentAlertNewVersion() {
    let alert = this.alertController.create({
      title: 'Atualização disponível',
      subTitle: 'Está disponível uma nova versão do Pricebook! (versão'+this.versionNumber+' ).<br><br>' +
      'Essa nova versão é obrigatória. Não será possível realizar as operações disponíveis no App com a versão atual.<br><br>' +
      'Deseja atualizar agora?',
      buttons: [
        {
          text: 'Atualizar',
          handler: () => {
            console.log('Confirm Okay');
            window.open('https://play.google.com/store/apps/details?id=br.com.pricebook', '_system');
          }
        },
        {
          text: 'Depois',
          role: 'cancel',
//          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel!');
          }
        }        
      ]
    });
    alert.present();
  }

  ionViewDidEnter() {
    this.toastCtrl.create({
      message: "Para o perfeito funcionamento do APP, verifique se o GPS do seu dispositivo está ativado",
      duration: 1000,
      position: 'top'
    }).present();

    if (this.storage.getLocalUser() == null) {
      this.navCtrl.setRoot('HomePage');
    }
    this.network.onConnect().subscribe(data => {
      this.toastCtrl.create({
        message: "Recurso de rede indisponível!",
        duration: 3000,
        position: 'top'
      }).present();
    }, (error) => {
      console.error(error);
    });
   
    this.network.onDisconnect().subscribe(data => {
      this.toastCtrl.create({
        message: "Erro: Recurso de rede indisponível!",
        duration: 3000,
        position: 'top'
      }).present();
    }, (error) => {
      console.error(error)
    });

    // Verifica primeiramente se a sessão está aberta e o tempo limite não foi ultrapassado
    if (!this.verificarSessao()){
      // Verifica se a versão do APP e a publicada na nuvem são compatíveis
      this.configuracao.findByLastVersion()
        .subscribe(versaoAppCloud => {
          let config = <ConfiguracaoDTO> versaoAppCloud;
          if (config && (config.versao != this.versionNumber)){
            this.presentAlertNewVersion();
          }
        }, (error) => {
          console.log(">> Erro: não foi possivel recuperar a versao do aplicativo!/n('"+error.code+"-"+error.message+"')");
        });  
      }    
  }

  scanearProduto(){
    if(this._platform.is("cordova")){
      this.barcodeScanner.scan().then((barcodeData) => {
        this.barcode = barcodeData.text;
          if (this.isConnected() as boolean) {
            console.log('>>> Rede disponível.');
            this.rotearLeituraBarCode();
          } else {
            console.log(">> Não há rede!");
          }
      }, (err) => {
        //let erro: string = JSON.stringify(err);
        this.toastCtrl.create({
          message: "Erro: Recurso disponível somente para dispositívo móvel (" + err.code+"-"+err.message + ").",
          duration: 2000,
          position: 'top'
        }).present();
      });
    } else {
      // Exemplo fixo: 
      this.barcode = "7894321722016"; // "7891000061190"; //"7891021006125";// "7891008209013"; // "7896336011383";  // "7891737204709"; // "7896336011383";  // 3 Paçoquita
          let conectado : boolean = this.isConnected() as boolean;
          if (conectado) {
            this.rotearLeituraBarCode();
          } else {
            console.log(">> Não há rede!");
          }
    }
  }

  rotearLeituraBarCode(){
    let loader = this.presentLoading();
    // localizacao - informar 
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      console.log("Latitude: '" + this.latitude.toFixed(7));
      console.log("Longitude: '" + this.longitude.toFixed(7));
      this.coord = {
        "latitude": this.latitude,
        "longitude": this.longitude
      }

      // 0 - A partir da leitura do código de barras do produto
      // 1 - Verificar se o produto não cadastrado ainda por ninguém
      this.produtoService.findByBarCode(this.barcode).subscribe(
        response1 => {
          if ((response1 as ProdutoDTO) != null) {
            this.produtoDTO = response1 as ProdutoDTO;
            // Como existe produto verificar se já existe histórico registrado para o cliente
              
            // Recuperar o idCliente
            let localUser = this.storage.getLocalUser();
            if (localUser && localUser.email) {
              if (this.idCliente == null){
                this.idCliente = localUser.id;
              }
            } 
            // Verificar se há histórico registrado para o produto e cliente
            this.historicoProdutoService.findByLastBarCodeandIdCliente(this.barcode, this.idCliente)
              .subscribe(response2 => {
                // Guarda o último histórico registrado para o produto e o cliente
                this.ultimoHistoricoProdutoDTO = response2 as HistoricoProdutoDTO;
                if ((this.ultimoHistoricoProdutoDTO == null) || (this.ultimoHistoricoProdutoDTO == undefined)) {
                  // Navega para a tela 1
                  loader.dismiss();
                  this.navCtrl.push('ShowProduto1Page', { produtoDTO: this.produtoDTO, idCliente : this.idCliente, coordenadas : this.coord });
                } else {
                  // Navega para a tela 2
                  loader.dismiss();
                  
                  // Se produto não tiver imagem válida, seta a descrição temporária do produto
                  if (this.produtoDTO.situacaoImagem != 3) {
                    this.historicoProdutoService.findByLastDescTmp(this.produtoDTO.barcode , this.idCliente)
                    .subscribe(response => {
                      let hTmp = response as HistoricoProdutoDTO;
                      this.navCtrl.push('ShowProduto2Page', { produtoDTO: this.produtoDTO, idCliente : this.idCliente, ultimoHistoricoProdutoDTO : this.ultimoHistoricoProdutoDTO, coordenadas : this.coord, historicoProdutoDescTmp : hTmp });
                    }), (err) => {
                      console.log("Não pode recuperar a última descrição do produto sem imagem no cadastro do usuário!");
                    }
                  } else {
                    this.navCtrl.push('ShowProduto2Page', { produtoDTO: this.produtoDTO, idCliente : this.idCliente, ultimoHistoricoProdutoDTO : this.ultimoHistoricoProdutoDTO, coordenadas : this.coord });
                  }  
                }
              }, (err) => {
                // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
                loader.dismiss();
                console.log(">> Não foi possível recuperar o historico do produto/cliente!/n('"+err.code+"-"+err.message+"')");
            }); 

          } else {
            //debugger;
            let localUser = this.storage.getLocalUser();
            if (localUser && localUser.email) {
              if (this.idCliente == null){
                this.idCliente = localUser.id;
              }
            }

            // Inserir Produto
            this.produtoDTO = {
              id : null,
              nome : null,
              descricao : null,
              preco : 0.00,
              barcode : this.barcode,
              unidadeMedida : null,
              urlInternet : null,
              imageUrl : null,
              cliente  : { "id" : this.idCliente },
              dtHoraHistorico : null,
              situacaoImagem : 0,
              imagemNaoCorrespondente : 0
            };

            // Insere o produto
            this.produtoService.insert( this.produtoDTO ).subscribe(
              response2 => {
                this.produtoService.findByBarCode( this.barcode ).subscribe(
                  response3 => {
                   let p : ProdutoDTO = response3 as ProdutoDTO; 
                    if (p != null) {
                      this.produtoDTO = p as ProdutoDTO;

                      // Recuperar o idCliente
                      let localUser = this.storage.getLocalUser();
                      if (localUser) {
                        this.idCliente = localUser.id;
                      }  

                      if (this.idCliente == null) {
                        if (localUser && localUser.email) {
                          this.clienteService.findByEmail(localUser.email)
                            .subscribe(response0 => {
                              this.idCliente = response0['id'];
                              loader.dismiss();
                              this.navCtrl.push('ShowProduto1Page', { produtoDTO: this.produtoDTO, idCliente : this.idCliente, coordenadas : this.coord });
                            }, (err) => {
                              // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
                              loader.dismiss();
                              console.log(">> Não foi possível recuperar o cliente!");
                          });
                        } else {
                          loader.dismiss();
                          console.log(">>> Erro1 - O produto que acabou de ser incluído não foi localizado!");
                        }
                      }  else {
                        loader.dismiss();
                        this.navCtrl.push('ShowProduto1Page', { produtoDTO: this.produtoDTO, idCliente : this.idCliente, coordenadas : this.coord });
                      }
                    } else {
                      loader.dismiss();
                      console.log("Erro");
                    }
                  }, (err) => {
                    // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
                    loader.dismiss();
                    console.log(">>> Erro2 - O produto que acabou de ser incluído não foi localizado!/n('"+err.code+"-"+err.message+"')");
                  });
              }, (err) => {
                // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
                loader.dismiss();
                console.log(">>> Erro ao incluir o produto pela primeira vez./n('"+err.code+"-"+err.message+"')");
              });
          }
        }, (err) => {
          // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
          loader.dismiss();
          console.log(">>> Erro - O produto não foi localizado!/n('"+err.code+"-"+err.message+"')");

          // Insere o produto
          this.produtoService.insert( this.produtoDTO ).subscribe(
            response2 => {
              this.produtoService.findByBarCode( this.barcode ).subscribe(
                response3 => {
                  let p : ProdutoDTO = response3 as ProdutoDTO;
                  if (p != null) {
                    this.produtoDTO = p as ProdutoDTO;
                    // Recuperar o idCliente
                    let localUser = this.storage.getLocalUser();
                    if (localUser) {
                      this.idCliente = localUser.id;
                    }  

                    if (this.idCliente == null) {
                      let localUser = this.storage.getLocalUser();
                      if (localUser && localUser.email) {
                        this.clienteService.findByEmail(localUser.email)
                          .subscribe(response2 => {
                            this.idCliente = response2['id'];
                            loader.dismiss();
                            this.navCtrl.push('ShowProduto1Page', { produtoDTO: this.produtoDTO, idCliente : this.idCliente, coordenadas : this.coord });
                          }, (err) => {
                            // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
                            loader.dismiss();
                            console.log(">>> Erro - Não foi possível recuperar o cliente!/n('"+err.code+"-"+err.message+"')");
                        });
                      } else {
                        loader.dismiss();
                        console.log(">>> Erro3 - O produto que acabou de ser incluído não foi localizado!");
                      }
                    } else {
                      loader.dismiss();
                      this.navCtrl.push('ShowProduto1Page', { produtoDTO: this.produtoDTO, idCliente : this.idCliente, coordenadas : this.coord });
                    }  
                  } else {
                      loader.dismiss();
                      console.log("Erro");
                  }
                }, (err) => {
                  // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
                    loader.dismiss();
                    console.log(">>> Erro4 - O produto que acabou de ser incluído não foi localizado!/n('"+err.code+"-"+err.message+"')");
                });
            }, (err) => {
              // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
              loader.dismiss();
              console.log(">>> Erro ao incluir o produto pela primeira vez./n('"+err.code+"-"+err.message+"')");
            });
      });
    }, (err) => {
      // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
      //debugger;
      loader.dismiss();
      console.log(">> Não foi ler a posição da coordenada cliente!/n('"+err.code+"-"+err.message+"')");
      if (err.code == 2) {
        this.toastCtrl.create({
          message: "Erro: Sem conexão com a Internet. Serviço indisponível!!!",
          duration: 3000,
          position: 'top'
        }).present();
      }
    });  
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Aguarde...",
    });
    loader.present();
    return loader;
  }

  isConnected() : boolean {
    return true;
  }

}