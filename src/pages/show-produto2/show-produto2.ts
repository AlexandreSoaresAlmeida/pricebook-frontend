import { StorageService } from './../../services/storage.service';
import { ProdutoService } from './../../services/domain/produto.service';
import { HistoricoProdutoDTO } from './../../models/historico.produto.dto';
import { ProdutoDTO } from './../../models/produto.dto';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Platform } from 'ionic-angular';
import { HistoricoProdutoService } from '../../services/domain/historico-produto.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ClienteDTO } from '../../models/cliente.dto';
import { Coordenadas } from '../../models/coordenadas';
import { API_CONFIG } from './../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { sitImg_NAOCARREGADA, sitImg_NAOENCONTRADA, sitImg_ENCONTRADA } from '../../config';
import { LastUser } from '../../models/last_user';
import { Session } from '../../providers/session';

@IonicPage()
@Component({
  selector: 'page-show-produto2',
  templateUrl: 'show-produto2.html',
})
export class ShowProduto2Page {
  //selectedCheckbox: any;
  produtoDTO : ProdutoDTO;
  ultimoHistoricoProdutoDTO : HistoricoProdutoDTO;

  historicoProdutoDescTmp : HistoricoProdutoDTO;

  novoHistoricoProdutoDTO : HistoricoProdutoDTO = {
    id              : null,
    cliente         : null, 
    produto         : null,
    preco           : 0.00,
    precoPromocional: false,
    dtHoraHistorico : null,
    latitude        : null,
    longitude       : null,
    localAumentoAbusivo : null,
    nomeTempProduto     : null,
  };
  preco : number;
  precoPromocional  : boolean = false;
  idCliente : string;
  picture : string = "assets/imgs/prod.jpg";

  public showProdutoForm: FormGroup;
  messagePreco  : string = "";
  errorPreco    : any = false;

  coord : Coordenadas;

  basepath : string = "/api";
  url : string;

  // Constantes para as situações das imagens
  IMG_NAOCARREGADA  : number = sitImg_NAOCARREGADA;
  IMG_NAOENCONTRADA : number = sitImg_NAOENCONTRADA;
  IMG_ENCONTRADA    : number = sitImg_ENCONTRADA;

  IMG_NAO_CORRESPONDENTE : number = 0;

  public msgNomeTmp : string = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public historicoProdutoService: HistoricoProdutoService,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    public alertController: AlertController,
    private _platform : Platform,
    public http: HttpClient,
    public produtoService : ProdutoService,
    private storage : StorageService,
    private session : Session,
    private alertCtrl: AlertController,
    ) {
      this.historicoProdutoDescTmp = this.navParams.get("historicoProdutoDescTmp") as HistoricoProdutoDTO;

      this.produtoDTO = this.navParams.get("produtoDTO") as ProdutoDTO;
      let tmp = this.navParams.get("ultimoHistoricoProdutoDTO") as HistoricoProdutoDTO;
      if ( tmp != undefined) {
        this.ultimoHistoricoProdutoDTO = tmp;
      }
      this.idCliente = this.navParams.get("idCliente");
      this.novoHistoricoProdutoDTO.cliente = {id : this.idCliente} as ClienteDTO;
      this.novoHistoricoProdutoDTO.produto = this.produtoDTO;
  
      this.coord = this.navParams.get("coordenadas") as Coordenadas;
      if (this.coord) {
        this.novoHistoricoProdutoDTO.latitude = this.coord.latitude;
        this.novoHistoricoProdutoDTO.longitude = this.coord.longitude;
      }

      this.showProdutoForm = formBuilder.group({
        preco: ['', Validators.required],
      });

      this.basepath = "/api";
      if(this._platform.is("cordova")){
        this.basepath = `${API_CONFIG.bucketBaseUrl}`;
      }
      this.url = `${this.basepath}/produtos`;

      this.IMG_NAO_CORRESPONDENTE = this.produtoDTO.imagemNaoCorrespondente;

      ((this.produtoDTO.situacaoImagem == this.IMG_ENCONTRADA) && (this.IMG_NAO_CORRESPONDENTE == 0)) ? this.picture = this.url + "/" + this.produtoDTO.barcode + ".png" : this.picture = "assets/imgs/prod.jpg";      
      if (!((this.produtoDTO.situacaoImagem == this.IMG_ENCONTRADA) && (this.IMG_NAO_CORRESPONDENTE == 0))) {
        let d = document.getElementById("msgNomeTmp");
        if (d){
          d.innerText ="imagem meramente ilustrativa";
        } else {
          this.msgNomeTmp = (this.historicoProdutoDescTmp != undefined) ? this.historicoProdutoDescTmp.nomeTempProduto : "";
        }
      }

      // Verifica sessão
      if (!this.session.verificarSessao()){
        this.navCtrl.setRoot('HomePage'); 
      }

      // Atualiza sessão
      this.atualizaSessao();
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
  
  getImageIfExists() { }
  
  ionViewDidLoad() { }

  presentAlert() {
    let alert = this.alertController.create({
      title: 'Incluir Histórico',
      subTitle: 'O campo preço é de preenchimento obrigatório!!!',
      buttons: ['OK']
    });
    alert.present();
  }

  insereHistoricoProduto(nomeTempProduto : string) {
    let loader : any;
    // Seta as informações para o histórico do produto/cliente
    this.novoHistoricoProdutoDTO.preco = this.preco;
    this.novoHistoricoProdutoDTO.precoPromocional = this.precoPromocional;
    (nomeTempProduto != null) ? this.novoHistoricoProdutoDTO.nomeTempProduto = nomeTempProduto : this.novoHistoricoProdutoDTO.nomeTempProduto = null;
    
    let { preco } = this.showProdutoForm.controls;

    if (!this.showProdutoForm.valid) {
      this.errorPreco = !preco.valid;
      if (this.errorPreco) {
        this.messagePreco = "Campo preço de preenchimento obrigatório!";
        this.presentAlert();
      } else {
        this.messagePreco = "";
      }
    } else {
      loader = this.presentLoading();
      // Se produto não tiver imagem válida, seta a descrição temporária do produto
      if ((nomeTempProduto == null) && (this.historicoProdutoDescTmp != undefined)){
        this.novoHistoricoProdutoDTO.nomeTempProduto = this.historicoProdutoDescTmp.nomeTempProduto;
      }

      // Insere o produto
      this.historicoProdutoService.insert( this.novoHistoricoProdutoDTO )
      .subscribe(response => {
        //console.log(">>> Histórico Produto incluido com sucesso.");
        //this.showInsertOK();
        loader.dismiss();
        this.navCtrl.push('ShowProduto3Page', { produtoDTO: this.produtoDTO, ultimoHistoricoProdutoDTO : this.ultimoHistoricoProdutoDTO, novoHistoricoProdutoDTO : this.novoHistoricoProdutoDTO, idCliente : this.idCliente });
      }, (err) => {
        // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
        console.log(">>> Erro ao incluir o historico produto/cliente onde já existe outro.");
        loader.dismiss();
        this.navCtrl.setRoot('LeitorPage');
      });
    }  
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Aguarde...",
    });
    loader.present();
    return loader;
  }

  getChanged(event){
    this.precoPromocional = event.checked;
    //console.log("Evento -> " + this.precoPromocional);
  }

  novaLeitura(){
    this.navCtrl.setRoot('LeitorPage');
  }

  showInsertOK() {
    let alert = this.alertController.create({
      title: 'Sucesso!',
      message: 'Cadastro efetuado com sucesso',
      enableBackdropDismiss: false,
      buttons :[
        {
          text: 'OK',
          handler: () =>{
            this.navCtrl.setRoot('LeitorPage');
          }
        }
      ]
    });
    alert.present();
  }

  atualizaImagemNaoCorrespondente(){
    let loader = this.presentLoading();

    // Atualizar Produto
    let produtoDTOTmp : ProdutoDTO = {
      id : this.produtoDTO.id,
      nome : null,
      descricao : null,
      preco : 0.00,
      barcode : this.produtoDTO.barcode,
      unidadeMedida : null,
      urlInternet : null,
      imageUrl : null,
      cliente  : { "id" : this.idCliente },
      dtHoraHistorico : null, // Seta null para ser atualizado via backend
      situacaoImagem : this.produtoDTO.situacaoImagem, // Setar como não correspondente (1 = true)
      imagemNaoCorrespondente : 1
    };

    // Atualizar o produto
    this.produtoService.update( produtoDTOTmp ).subscribe(
      response2 => {

        let i : any = document.getElementById("produtoIdImg");
        if (i) {
          i.src = "assets/imgs/prod.jpg";
        }

        let m : any = document.getElementById("msgImagemNaoCorrespondente");
        if (m){
          m.style.display = 'none';
        }

        this.produtoDTO = produtoDTOTmp;

        loader.dismiss();
      }, (err) => {
        // Deve registrar o produto no banco de dados e devois verificar para qual ágia deve ir
        loader.dismiss();
        console.log(">>> Erro ao atualizar o produto pela primeira vez./n('"+err.code+"-"+err.message+"')");
      });
  }

  // **************************
  alertNomeTempProduto(){
    if (!this.showProdutoForm.valid) {
      let { preco } = this.showProdutoForm.controls;
      this.errorPreco = !preco.valid;
      if (this.errorPreco) {
        this.messagePreco = "Campo preço de preenchimento obrigatório!";
        this.presentAlert();
        return;
      } else {
        this.messagePreco = "";
      }
    }

    let alert = this.alertCtrl.create({
      title: 'Identificação do Produto',
      inputs: [
        {
          name: 'local',
          placeholder: 'Favor identificar o produto',
          max: '255',
          type: 'input'
        },
      ],
      buttons: [
        {
          text: 'Não precisa',
          role: 'cancel',
          handler: data => {
            console.log('Cancelado o registro do produto!');
            this.insereHistoricoProduto(null);
          }
        },
        {
          text: 'Registrar',
          handler: data => {
            if (data.local == "") {
              this.showEmptyIndicadorLocal();
            } else {
              this.insereHistoricoProduto(data.local);
            }
          }
        }
      ]
    });
    alert.present();
  }

  confirmarPreco(){
    if (!((this.produtoDTO.situacaoImagem == this.IMG_ENCONTRADA) && (this.IMG_NAO_CORRESPONDENTE == 0))) {
      if (this.historicoProdutoDescTmp != undefined){
        this.insereHistoricoProduto(null);
      } else {
        this.alertNomeTempProduto();     
      }
    } else {
      this.insereHistoricoProduto(null);
    }
  }
  
  showEmptyIndicadorLocal() {
    let alert = this.alertController.create({
      title: 'Indicador do Local',
      message: 'A indicação do local não foi informada, favor preencher essa informação!',
      enableBackdropDismiss: false,
      buttons :[
        {
          text: 'OK',
          handler: () =>{
            this.alertNomeTempProduto();
            //this.insereHistoricoProduto(null);
          }
        }
      ]
    });
    alert.present();
  }
  
}