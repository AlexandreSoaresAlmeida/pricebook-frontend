import { ProdutoDTO } from './../../models/produto.dto';
import { StorageService } from './../../services/storage.service';
import { AvaliacaoProdutoService } from './../../services/domain/avaliacao-produto.service';
import { ProdutoService } from './../../services/domain/produto.service';
import { HistoricoProdutoService } from './../../services/domain/historico-produto.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { API_CONFIG } from '../../config/api.config';
import { HistoricoProdutoDTO } from '../../models/historico.produto.dto';
import { AvaliacaoProdutoDTO } from '../../models/avaliacao.produto.dto';
import { ProdutoValorDiaDTO } from '../../models/dashboard/produto.valor.dia.dto';
import { DatePipe } from '@angular/common';
import { LastUser } from '../../models/last_user';
import { Session } from '../../providers/session';
import { sitImg_NAOCARREGADA, sitImg_NAOENCONTRADA, sitImg_ENCONTRADA } from '../../config';

@IonicPage()
@Component({
  selector: 'page-produto-detail',
  templateUrl: 'produto-detail.html',
})
export class ProdutoDetailPage {
  segment : any;

  cliente_id : string;
  produto_id : string;
  barcode    : string;

  items: HistoricoProdutoDTO[]= [];
  itemImageUrl: string;
  page : number = 0;


  msgFooter: string = API_CONFIG.msgFooter;
  avaliacaoLida : any = 0;
  avaliacaoLida2 : number = 3;

  avaliacaoProdutoDTO : AvaliacaoProdutoDTO = {
    id              : null,
    cliente         : {id : null}, 
    produto         : {id : null},
    avaliacao       : null,
    dtHoraHistorico : null
  }

  itemsGrafico: ProdutoValorDiaDTO[]= [];

  public barChartData:Array<any> = [{data: [], label: 'Valor'}];
  public barChartLabels:Array<any> = [];
  
  // Inicialização do caminho para as imagens
  picture  : string = "assets/imgs/prod.jpg";
  basepath : string = "/api";
  url      : string;
  
  // Constantes para as situações das imagens
  IMG_NAOCARREGADA  : number = sitImg_NAOCARREGADA;
  IMG_NAOENCONTRADA : number = sitImg_NAOENCONTRADA;
  IMG_ENCONTRADA    : number = sitImg_ENCONTRADA;

  IMG_NAO_CORRESPONDENTE : number = 0;

  public hp : HistoricoProdutoDTO;

  public msgNomeTmp : string = "imagem meramente ilustrativa";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public historicoProdutoService : HistoricoProdutoService,
    public produtoService : ProdutoService,
    public loadingCtrl: LoadingController,
    private _platform : Platform,
    private avaliacaoProdutoService : AvaliacaoProdutoService,
    private datePipe: DatePipe,
    private storage : StorageService,
    private session : Session,
    ) {
      this.msgFooter = `${API_CONFIG.msgFooter}`;

      if(this._platform.is("cordova")){
        this.basepath = `${API_CONFIG.bucketBaseUrl}`;
      }
      this.url = `${this.basepath}/produtos`;

      this.cliente_id    = this.navParams.get('cliente_id');
      this.produto_id    = this.navParams.get('produto_id');
      this.barcode       = this.navParams.get('barcode');
  
      this.avaliacaoProdutoDTO = this.navParams.get('avaliacaoProdutoDTO');
      this.avaliacaoLida2 = this.navParams.get('avaliacao');
      (this.avaliacaoProdutoDTO != undefined) ? this.avaliacaoLida = this.avaliacaoProdutoDTO.avaliacao : this.avaliacaoLida = 0;

      // Carregar itens do Gráfico
      // https://www.mundojs.com.br/2018/07/12/graficos-dinamicos-com-eventos-chart-js/
      this.itemsGrafico.splice(0,this.itemsGrafico.length); // Limpa o array
      this.itemsGrafico = this.navParams.get('itemsGrafico');  
      if ((this.itemsGrafico != undefined) && (this.itemsGrafico.length > 0)){ 
        this.barChartData[0].data.splice(0,this.barChartData[0].data.length); // Limpa o array
        this.barChartLabels.splice(0,this.barChartLabels.length); // Limpa o array
        for (var i = 0; i < this.itemsGrafico.length; i++){
          let produtoValorDiaDTO : ProdutoValorDiaDTO = this.itemsGrafico[i];
          this.barChartData[0].data.push(produtoValorDiaDTO.preco);
          let dt = this.convertDateToString( new Date(produtoValorDiaDTO.dtHistorico) );
          //console.log(dt);
          this.barChartLabels.push(dt);

          //Exemplo:          
          //public lineChartData:Array<any> = [{data: [11.87, 10.0, 15, 14.5, 11.5], label: 'Preço'}];
          //public lineChartLabels:Array<any> = ['07/05/2019', '08/05/2019', '09/05/2019', '12/05/2019', '11/05/2019'];  
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

  transformDate(date) {
    this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  public convertDateToString( date : Date ) : string {
    //return string
    var returnDate = "";
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //because January is 0! 
    var yyyy = date.getFullYear();
    //Interpolation date
    if (dd < 10) {
        returnDate += `0${dd}/`;
    } else {
        returnDate += `${dd}/`;
    }

    if (mm < 10) {
        returnDate += `0${mm}/`;
    } else {
        returnDate += `${mm}/`;
    }
    returnDate += yyyy;
    return returnDate;
  }

  ionViewDidLoad() {
    this.loadData();
  }

  private loadData() {
    let loader = this.presentLoading();
    this.historicoProdutoService.findByConsumidorandProduto(this.cliente_id, this.produto_id, this.page, 10)
      .subscribe(response => {
        this.items = this.items.concat(response['content']);
        this.hp = this.items[0] as HistoricoProdutoDTO;

        if (((this.hp.produto.situacaoImagem == this.IMG_ENCONTRADA) && (this.hp.produto.imagemNaoCorrespondente == this.IMG_NAO_CORRESPONDENTE))) {
          (this.items[0] as HistoricoProdutoDTO).nomeTempProduto = this.msgNomeTmp;
        }

        loader.dismiss();
        this.loadImageUrls(this.hp);
      },
        error => {
          loader.dismiss();
        });
  }

  loadImageUrls(hp : HistoricoProdutoDTO) {
      //this.produtoService.getSmallImageFromBucket(this.barcode)
      //  .subscribe(Response => {
          let p : ProdutoDTO = hp.produto as ProdutoDTO;
          // Verifica se a imagem foi liberado ou se não consta não conformidade
          ((p.situacaoImagem == this.IMG_ENCONTRADA) && (p.imagemNaoCorrespondente == 0)) ? p.imageUrl = this.url + "/" + p.barcode + ".png" : p.imageUrl = "assets/imgs/prod.jpg";      
          this.itemImageUrl = p.imageUrl;
      //  },
      //    error => { 
      //      this.itemImageUrl = "assets/imgs/prod.jpg";
      //    });
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
    gravarRanking(avaliacao){
      this.gravarAvaliacao(this.cliente_id, this.produto_id, avaliacao);
    }

    gravarAvaliacao(idCliente : string, idProduto : string, avaliacao : number) {
      let loader = this.presentLoading();
            if (this.avaliacaoProdutoDTO == null) {
              // Inclui avaliação
              this.avaliacaoProdutoDTO = {
                id              : null,
                cliente         : {id : idCliente },  
                produto         : {id : idProduto},
                avaliacao       : avaliacao,
                dtHoraHistorico : null
              }
              this.avaliacaoProdutoService.insert(this.avaliacaoProdutoDTO)
              .subscribe (
                response2 => {
                  console.log(">>> avaliação incluída com sucesso!");
                }, (err2) => {
                  console.log(">>> erro ao incluir a avaliação do produto!/n'"+err2.code+"-"+err2.message+"')");
                });
            } else {
              // Atualiza avaliação
              this.avaliacaoProdutoDTO.avaliacao = avaliacao;

              let avaliacaoProdutoDTO2 : AvaliacaoProdutoDTO = {
                id              : this.avaliacaoProdutoDTO.id,
                cliente         : {id : this.avaliacaoProdutoDTO.cliente.id },  
                produto         : {id : this.avaliacaoProdutoDTO.produto.id},
                avaliacao       : avaliacao,
                dtHoraHistorico : null
              }

              this.avaliacaoProdutoService.update(avaliacaoProdutoDTO2)
              .subscribe (
                response3 => {
                  console.log(">>> avaliação atualizada com sucesso!");
                }, (err3) => {
                  console.log(">>> erro ao atualizar a avaliação do produto!/n'"+err3.code+"-"+err3.message+"')");
                });
            }
            loader.dismiss();
      }

      // .................................................................................
      // Gráfico Linha
      // .................................................................................
      // https://codingthesmartway.com/angular-chart-js-with-ng2-charts/
      // https://stackoverflow.com/questions/46892906/plot-multiple-line-chart-in-ionic-3-with-chartjs
      // https://github.com/chartjs/Chart.js/issues/770
      // https://www.youtube.com/watch?v=iUjdyGe56Xg
      // https://www.youtube.com/watch?v=_KVYh9LM0eE
      // https://www.youtube.com/watch?v=4jfcxxTT8H0&list=PLWWgAcSkFKZ-JEoZ7cVdEwtfKeDX-5Iv8

      // Examples:
      // * https://tobiasahlin.com/blog/chartjs-charts-to-get-you-started/
      // https://www.chartjs.org/samples/latest/
      // https://www.chartjs.org/
      // https://colorlib.com/polygon/gentelella/chartjs.html com visão dashboard
      // https://medium.com/javascript-in-plain-english/exploring-chart-js-e3ba70b07aa4

      // Teste:
      // https://codepen.io/marshyon/pen/JKJWKY

      public lineChartOptions:any = {
        responsive: true,
       // scaleLabel: function(label){return  'R$' + label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");}  
      };
    
      public lineChartColors:Array<any> = [
        { // blue
          borderWidth:3,
          backgroundColor: 'rgba(39,101,175,0.2)',
          borderColor: 'rgba(39,101,175,0.9)',
          pointBackgroundColor: 'rgba(39,101,175,1)',
          pointHoverBorderColor: 'rgba(0,240,120,0.8)',
          pointBorderColor: 'rgba(39,101,175,1)',
          pointHoverBackgroundColor: '#fff',
        },
      ];

      public lineChartLegend:boolean = true;

      public lineChartType:string = 'line';
      
      public randomize():void {
        let _lineChartData:Array<any> = new Array(this.barChartData.length);
        for (let i = 0; i < this.barChartData.length; i++) {
          _lineChartData[i] = {data: new Array(this.barChartData[i].data.length), label: this.barChartData[i].label};
          for (let j = 0; j < this.barChartData[i].data.length; j++) {
            _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
          }
        }
        this.barChartData = _lineChartData;
      }
      
      // events
      public chartClicked(e:any):void {
        console.log(e);
      }
      
      public chartHovered(e:any):void {
        console.log(e);
      }

      // .................................................................................
      // Gráfico Barras - https://imasters.com.br/framework/graficos-com-angular2-charts-e-ionic
      // .................................................................................
      public barChartOptions:any = {
        scaleShowVerticalLines: false,
        responsive: true,

        // https://pt.stackoverflow.com/questions/129285/formatar-uma-legenda-multipla-com-r-utilizando-gr%C3%A1fico-chart-js
        // https://github.com/jtblin/angular-chart.js/issues/33
        // https://www.youtube.com/watch?v=AcoUu3bgKgM
        scaleFontFamily: "'Verdana'",
        scaleFontSize: 13,
        animation: false,
        scaleFontColor: "#484848",
        /*
        multiTooltipTemplate: function(data) {
          return this.formatar(data.value);
        },        
        scaleLabel: function(data) {
          return this.formatar(data.value);
        }
        */

       // https://www.chartjs.org/docs/latest/axes/labelling.html
       tooltips: {
        callbacks: {
            label: function(tooltipItem) {
                var moeda = 'R$';
                let valor = tooltipItem.yLabel;
                valor = ('' + valor).replace(',', '.');
                valor = ('' + valor).split('.');
                var parteInteira = valor[0];
                var parteDecimal = valor[1];
              
                // tratar a parte inteira
                var rx = /(\d+)(\d{3})/; 
                parteInteira = parteInteira.replace(/^\d+/, function(w) {
                  while (rx.test(w)) {
                    w = w.replace(rx, '$1.$2');
                  }
                  return w;
                });
         
                // tratar a parte decimal
                var formatoDecimal = 2;
        
                if (parteDecimal) parteDecimal = parteDecimal.slice(0, formatoDecimal);
                else if (!parteDecimal && formatoDecimal) {
                  parteDecimal = '';
                  while (parteDecimal.length < formatoDecimal) {
                    parteDecimal = '0' + parteDecimal;
                  }
                }
                if (parteDecimal.length < formatoDecimal) {
                  while (parteDecimal.length < formatoDecimal) {
                    parteDecimal = parteDecimal + '0';
                  }
                }
                var vlrFormat = moeda + (parteDecimal ? [parteInteira, parteDecimal].join(',') : parteInteira);
                return vlrFormat;
            }
          },

        },

        // Trata a label do eixo Y
        scales: {
          yAxes: [{ 
              ticks: {
                  // Include a dollar sign in the ticks
                  callback: function(value, index, values) {

                    var moeda = 'R$';
                    let valor = value;
                    valor = ('' + valor).replace(',', '.');
                    valor = ('' + valor).split('.');
                    var parteInteira = valor[0];
                    var parteDecimal = valor[1];
                  
                    // tratar a parte inteira
                    var rx = /(\d+)(\d{3})/; 
                    parteInteira = parteInteira.replace(/^\d+/, function(w) {
                      while (rx.test(w)) {
                        w = w.replace(rx, '$1.$2');
                      }
                      return w;
                    });
             
                    // tratar a parte decimal
                    var formatoDecimal = 2;
            
                    if (parteDecimal) parteDecimal = parteDecimal.slice(0, formatoDecimal);
                    else if (!parteDecimal && formatoDecimal) {
                      parteDecimal = '';
                      while (parteDecimal.length < formatoDecimal) {
                        parteDecimal = '0' + parteDecimal;
                      }
                    }
                    if (parteDecimal.length < formatoDecimal) {
                      while (parteDecimal.length < formatoDecimal) {
                        parteDecimal = parteDecimal + '0';
                      }
                    }
                    var vlrFormat = moeda + (parteDecimal ? [parteInteira, parteDecimal].join(',') : parteInteira);
                    return vlrFormat;
                  }
              }
          }]
        }
      };

      public barChartType:string = 'bar';
      public barChartLegend:boolean = true;
      
      public barChartColors:Array<any> = [
        { // blue
          fillColor : "rgba(151,187,205,0.5)",
          strokeColor: "rgba(151,187,205,0.8)",
          hightlightFill: "rgba(151,187,205,0.75)",
          hightlightStroke: "rgba(151,187,205,1)",

          backgroundColor: 'rgba(39,101,175,0.2)',
          borderColor: 'rgba(39,101,175,1)',
          pointBackgroundColor: 'rgba(39,101,175,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(0,240,120,0.8)' 
        },
      ];

      // events
      public chartClicked2(e:any):void {
        console.log(e);
      }
      
      public chartHovered2(e:any):void {
        console.log(e);
      }
}