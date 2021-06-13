import { ProdutoDTO } from './../../models/produto.dto';
//import { ProdutoService } from './../../services/domain/produto.service';
import { LocalUser } from './../../models/local_user';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { API_CONFIG } from '../../config/api.config';
import { StorageService } from '../../services/storage.service';
import { AvaliacaoProdutoDTO } from './../../models/avaliacao.produto.dto';
import { AvaliacaoProdutoService } from './../../services/domain/avaliacao-produto.service';
import { ProdutoValorDiaDTO } from '../../models/dashboard/produto.valor.dia.dto';
import { DashboardService } from '../../services/domain/dashboard.service';
import { LastUser } from '../../models/last_user';
import { Session } from '../../providers/session';
import { sitImg_NAOCARREGADA, sitImg_NAOENCONTRADA, sitImg_ENCONTRADA } from '../../config';
import { HistoricoProdutoDTO } from '../../models/historico.produto.dto';
import { HistoricoProdutoService } from '../../services/domain/historico-produto.service';

@IonicPage()
@Component({
  selector: 'page-biblioteca-produtos',
  templateUrl: 'biblioteca-produtos.html',
})

// SearchBar: https://www.youtube.com/watch?v=F4f4irLL2n4&feature=youtu.be
export class BibliotecaProdutosPage {
  items: HistoricoProdutoDTO[]= [];
  itemImageUrl: string;
  page : number = 0;

  cliente_id : string;

  msgFooter: string = API_CONFIG.msgFooter;

  avaliacaoProdutoDTO : AvaliacaoProdutoDTO;

  itemsGrafico: ProdutoValorDiaDTO[]= [];

  // Inicialização do caminho para as imagens
  picture  : string = "assets/imgs/prod.jpg";
  basepath : string = "/api";
  url      : string;
  
  // Constantes para as situações das imagens
  IMG_NAOCARREGADA  : number = sitImg_NAOCARREGADA;
  IMG_NAOENCONTRADA : number = sitImg_NAOENCONTRADA;
  IMG_ENCONTRADA    : number = sitImg_ENCONTRADA;

  public msgNomeTmp : string = "imagem meramente ilustrativa";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
//    private produtoService : ProdutoService,
    public historicoProdutoService: HistoricoProdutoService,
    private _platform : Platform,
    public loadingCtrl: LoadingController,
    private storage: StorageService,
    private avaliacaoProdutoService : AvaliacaoProdutoService,
    private dashboardService : DashboardService,
    private session : Session,
    ) {
      this.msgFooter = `${API_CONFIG.msgFooter}`;
      if(this._platform.is("cordova")){
          this.basepath = `${API_CONFIG.bucketBaseUrl}`;
      }
      this.url = `${this.basepath}/produtos`;

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

  ionViewDidLoad() {
    this.loadData();    
  }

  loadData() {
    let user : LocalUser = this.storage.getLocalUser();
    this.cliente_id = user.id; // this.navParams.get('cliente_id');
    let loader = this.presentLoading();
    this.historicoProdutoService.findByConsumidor(this.cliente_id, this.page, 10)
      .subscribe(response => {
        let start = this.items.length;
        this.items = this.items.concat(response['content']);
        let end = this.items.length-1;
        loader.dismiss();
        this.loadImageUrls(start, end);
      },
        error => {
          loader.dismiss();
        });
  }

  loadImageUrls(start: number, end: number) {
    for (var i = start; i < end+1; i++) {
      let item = this.items[i];
      let p : ProdutoDTO = item.produto as ProdutoDTO;

      //this.produtoService.getSmallImageFromBucket(p.barcode)
      //  .subscribe(Response => {
          // Verifica se a imagem foi liberado ou se não consta não conformidade
          ((p.situacaoImagem == this.IMG_ENCONTRADA) && (p.imagemNaoCorrespondente == 0)) ? p.imageUrl = this.url + "/" + p.barcode + ".png" : p.imageUrl = "assets/imgs/prod.jpg";
          ((p.situacaoImagem == this.IMG_ENCONTRADA) && (p.imagemNaoCorrespondente == 0)) ? item.nomeTempProduto = this.msgNomeTmp : item.nomeTempProduto = item.nomeTempProduto;
      //  },
      //    error => { 
      //      p.imageUrl = "assets/imgs/prod.jpg";
      //  });
    }
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Aguarde...",
    });
    loader.present();
    return loader;
  }

  doRefresh(refresher) {
    this.page = 0;
    this.items = [];
    this.loadData();    
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }

  doInfinite(infiniteScroll){
    this.page++;
    this.loadData();
    setTimeout(() => {
      infiniteScroll.complete();
    }, 1000);
  }

  showDetail(produto_id: string, cliente_id : string, barcode : string) {
    let loader = this.presentLoading();
    this.avaliacaoProdutoService.findDistinctByIdClienteIdProduto(cliente_id, produto_id)
      .subscribe(
        response1 => {
          this.avaliacaoProdutoDTO = response1 as AvaliacaoProdutoDTO;
          let avaliacao : string = "0";
          if (this.avaliacaoProdutoDTO != null) {
            avaliacao = this.avaliacaoProdutoDTO.avaliacao.toString();
          } else {
            this.avaliacaoProdutoDTO = {
              id              : null,
              cliente         : {id : cliente_id },  
              produto         : {id : produto_id},
              avaliacao       : 0,
              dtHoraHistorico : null
            }
          }

          // Recuperar os dados para o Gráfico de Barras
          this.dashboardService.valorProdutoDia(Number(produto_id), Number(cliente_id))
          .subscribe(
            dadosGrafico => {
              this.itemsGrafico.splice(0,this.itemsGrafico.length); // Limpa o array
              this.itemsGrafico = this.itemsGrafico.concat(dadosGrafico);
              this.navCtrl.push('ProdutoDetailPage', { 
                produto_id: produto_id, 
                cliente_id: cliente_id, 
                barcode : barcode, 
                avaliacaoProdutoDTO : this.avaliacaoProdutoDTO, 
                avaliacao : avaliacao,
                itemsGrafico : this.itemsGrafico,
               });
            }, (err3) => {
              console.log(">>> erro ao ler a avaliação do produto!/n'"+err3.code+"-"+err3.message+"')");
            });  
        }, (err3) => {
          console.log(">>> erro ao ler a avaliação do produto!/n'"+err3.code+"-"+err3.message+"')");
        });
        loader.dismiss();
  }
}