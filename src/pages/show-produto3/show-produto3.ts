import { StorageService } from './../../services/storage.service';
import { ProdutoDTO } from './../../models/produto.dto';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, AlertController } from 'ionic-angular';
import { HistoricoProdutoDTO } from '../../models/historico.produto.dto';
import { API_CONFIG } from './../../config/api.config';
import { sitImg_NAOCARREGADA, sitImg_NAOENCONTRADA, sitImg_ENCONTRADA } from '../../config';
import { LastUser } from '../../models/last_user';
import { Session } from '../../providers/session';
import { HistoricoProdutoService } from '../../services/domain/historico-produto.service';

@IonicPage()
@Component({
  selector: 'page-show-produto3',
  templateUrl: 'show-produto3.html',
})
export class ShowProduto3Page {
  produtoDTO : ProdutoDTO;
  ultimoHistoricoProdutoDTO : HistoricoProdutoDTO;
  novoHistoricoProdutoDTO : HistoricoProdutoDTO;
  valor : number;
  idCliente : string;
  picture : string = "assets/imgs/prod.jpg";
  percentual : number = 0;
  maior : boolean = false;

  basepath : string = "/api";
  url : string;

  // Constantes para as situações das imagens
  IMG_NAOCARREGADA  : number = sitImg_NAOCARREGADA;
  IMG_NAOENCONTRADA : number = sitImg_NAOENCONTRADA;
  IMG_ENCONTRADA    : number = sitImg_ENCONTRADA;

  IMG_NAO_CORRESPONDENTE : number = 0;

  tmpHistoricoProdutoDTO : HistoricoProdutoDTO;

  public msgNomeTmp : string = "imagem meramente ilustrativa";

  constructor(
    public platform: Platform,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private _platform : Platform,
    private storage : StorageService,
    private session : Session,
    public loadingCtrl: LoadingController,
    public historicoProdutoService: HistoricoProdutoService,
    private alertCtrl: AlertController,
    ) {
      this.idCliente  = this.navParams.get('idCliente');
      this.produtoDTO = this.navParams.get('produtoDTO') as ProdutoDTO;
      this.ultimoHistoricoProdutoDTO = this.navParams.get('ultimoHistoricoProdutoDTO') as HistoricoProdutoDTO;
      this.novoHistoricoProdutoDTO = this.navParams.get('novoHistoricoProdutoDTO') as HistoricoProdutoDTO;

      // calcular diferenças
      if ((this.ultimoHistoricoProdutoDTO != undefined) && (this.novoHistoricoProdutoDTO != undefined)) {
        // =((vlnovo-vlantigo)/vlantigo)*100
        this.percentual = ((this.novoHistoricoProdutoDTO.preco - this.ultimoHistoricoProdutoDTO.preco)/this.ultimoHistoricoProdutoDTO.preco)*100;
        this.maior = (this.novoHistoricoProdutoDTO.preco > this.ultimoHistoricoProdutoDTO.preco);
        //console.log(">>> Percentual: " + this.percentual);
      }

      this.basepath = "/api";
      if(this._platform.is("cordova")){
          this.basepath = `${API_CONFIG.bucketBaseUrl}`;
      }
      this.url = `${this.basepath}/produtos`;
      this.produtoDTO.situacaoImagem == this.IMG_ENCONTRADA ? this.picture = this.url + "/" + this.produtoDTO.barcode + ".png" : this.picture = "assets/imgs/prod.jpg";
      // console.log("*** this.picture >> " + this.picture);
  
      // Verifica sessão
      if (!this.session.verificarSessao()){
        this.navCtrl.setRoot('HomePage'); 
      }

      this.IMG_NAO_CORRESPONDENTE = this.produtoDTO.imagemNaoCorrespondente;

      ((this.produtoDTO.situacaoImagem == this.IMG_ENCONTRADA) && (this.IMG_NAO_CORRESPONDENTE == 0)) ? this.picture = this.url + "/" + this.produtoDTO.barcode + ".png" : this.picture = "assets/imgs/prod.jpg";      

      // Atualiza sessão
      this.atualizaSessao();

      // Recarregar o úlyimo registr no this.novoHistoricoProdutoDTO via serviço
      this.historicoProdutoService.findByLastBarCodeandIdCliente(this.produtoDTO.barcode, this.idCliente)
      .subscribe(response => {
        this.tmpHistoricoProdutoDTO = response as HistoricoProdutoDTO;

        this.novoHistoricoProdutoDTO.id                  = this.tmpHistoricoProdutoDTO.id;
        this.novoHistoricoProdutoDTO.cliente.id          = this.tmpHistoricoProdutoDTO.cliente.id;
        this.novoHistoricoProdutoDTO.produto.id          = this.tmpHistoricoProdutoDTO.produto.id;
        this.novoHistoricoProdutoDTO.preco               = this.tmpHistoricoProdutoDTO.preco;
        this.novoHistoricoProdutoDTO.precoPromocional    = this.tmpHistoricoProdutoDTO.precoPromocional;
        this.novoHistoricoProdutoDTO.dtHoraHistorico     = null;
        this.novoHistoricoProdutoDTO.latitude            = this.tmpHistoricoProdutoDTO.latitude;
        this.novoHistoricoProdutoDTO.longitude           = this.tmpHistoricoProdutoDTO.longitude;
        this.novoHistoricoProdutoDTO.localAumentoAbusivo = this.tmpHistoricoProdutoDTO.localAumentoAbusivo;
        this.novoHistoricoProdutoDTO.nomeTempProduto     = this.tmpHistoricoProdutoDTO.nomeTempProduto;
      }, (err) => {
        console.log(">> Não foi possível recuperar do historico do produto/cliente!/n('"+err.code+"-"+err.message+"')");
      });

      ((this.produtoDTO.situacaoImagem == this.IMG_ENCONTRADA) && (this.IMG_NAO_CORRESPONDENTE == 0)) ? this.msgNomeTmp = this.msgNomeTmp : this.msgNomeTmp = this.novoHistoricoProdutoDTO.nomeTempProduto;      

  }

  atualizaSessao() {
    //........................................................................
    // Atualiza o último acesso do usuário para o controle no tempo da sessão
    //........................................................................
    let hoje = new Date(Date.now());
    let ultimoAcesso : LastUser = <LastUser> this.storage.getLastAccess();
    ultimoAcesso.lastAccess = hoje;
    this.storage.setLastAccess(ultimoAcesso);
  }
  
  ionViewDidLoad() {
    //console.log('ionViewDidLoad ShowProduto3Page');
  }

  novaLeitura(){
    this.navCtrl.setRoot('LeitorPage');
  }

  sair(){
    if(this.platform.is("cordova")){
      this.platform.exitApp();
    } else {
      this.navCtrl.setRoot('LeitorPage');
    }
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Aguarde...",
    });
    loader.present();
    return loader;
  }

  alertRegistroAumentoAbusivoPreco(){
      let alert = this.alertCtrl.create({
        title: 'Nome do estabelecimento',
        inputs: [
          {
            name: 'local',
            placeholder: 'Informe o nome do local',
            max: '255',
            type: 'input'
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              console.log('Cancelado o registro de local com preço abusivo!');
            }
          },
          {
            text: 'Enviar',
            handler: data => {
              this.registrarAumentoAbusivoPreco(data.local);
            }
          }
        ]
      });
      alert.present();
    }

  registrarAumentoAbusivoPreco(localAbusivo : string){
    let loader : any = this.presentLoading();
      // atualiza o HistoricoProduto
      this.novoHistoricoProdutoDTO.localAumentoAbusivo = localAbusivo;
      this.historicoProdutoService.update( this.novoHistoricoProdutoDTO )
      .subscribe(response => {
        //this.showInsertOK();
        loader.dismiss();
        var btn = document.getElementById("btnAbuso");
        if (btn) {btn.style.display = "none";}
      }, (err) => {
        // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
        console.log(">>> Erro ao incluir o historico produto/cliente onde já existe outro.");
        loader.dismiss();
        this.navCtrl.setRoot('LeitorPage');
      });
  }
}