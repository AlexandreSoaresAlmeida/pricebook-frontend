import { StorageService } from './../../services/storage.service';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { API_CONFIG } from '../../config/api.config';
import { QtdAcessosDiaDTO } from '../../models/dashboard/qtd.acessos.dia.dto';
import { DashboardService } from '../../services/domain/dashboard.service';
import { Component } from '@angular/core';
import { LastUser } from '../../models/last_user';
import { Session } from '../../providers/session';
import { QtdProdutosNovosProdutosDTO } from '../../models/dashboard/qtd.produtos.novos.produtos.dto.1';

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})

// https://www.javascripttuts.com/using-charts-ionic-app/
// https://edupala.com/how-to-add-chart-from-chart-js-to-ionic-apps/
// https://ilovecode.com.br/ionic-graficos-com-angular2-charts/
// https://edupala.com/how-to-add-chart-from-chart-js-to-ionic-apps/
// http://masteringionic.com/blog/2017-05-30-adding-charts-to-an-ionic-project/
// * https://github.com/yannbf/ionic3-components/blob/master/src/pages/miscellaneous/charts/charts.ts
// https://www.djamware.com/post/598953f880aca768e4d2b12b/creating-beautiful-charts-easily-using-ionic-3-and-angular-4
// * https://edupala.com/how-to-add-chart-from-chart-js-to-ionic-apps/
export class DashboardPage {
  public segment : any;
  public msgFooter: string = API_CONFIG.msgFooter;
  public itemsGraficoBar: QtdAcessosDiaDTO[]= [];
  public itemsGraficoDoughnut: QtdProdutosNovosProdutosDTO[]= [];
//  public itemsGraficoLine : any[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private dashboardService : DashboardService,
    private storage : StorageService,
    private session : Session,
    ) {
      // Carrega o Gráfico de linhas
      let qtdDiasApuracao : number = 15;
      let hoje = new Date(Date.now());
      let passado = new Date(Date.now()); //new Date( hoje - 30)
      passado.setDate(passado.getDate() - qtdDiasApuracao);
      let dtIni : string = this.convertDateToString( passado );
      let dtFim : any = this.convertDateToString( hoje );

      // Carrega os dados do Gráfico de Barras
      this.loadDataBar(dtIni, dtFim); // qtdAcessosDia

      // Carrega os dados do Gráfico Doughnut
      this.loadDataDoughnut(); // qtdProdutosNovosProdutos

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

  // Disparado somente quando uma visão é armazenada na memória. Este evento NÃO é disparado ao entrar em uma exibição que já está em cache. É um bom lugar para tarefas relacionadas ao init.
  ionViewDidLoad() {
    
  }

  // É acionado ao entrar em uma página antes de se tornar a ativa. Use-o para tarefas que você deseja fazer toda vez que entrar na visualização (definindo ouvintes de eventos, atualizando uma tabela, etc.).
  ionViewWillEnter() {

    // Verifica primeiramente se a sessão está aberta e o tempo limite não foi ultrapassado
    //this.session.verificarSessao();
  }

  // Disparado ao entrar em uma página, depois que ela se torna a página ativa. Bastante semelhante ao anterior.
  ionViewDidEnter(){
    //this.randomize();
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

  updateGraph(tipo){
    if (tipo === 'bar') {
        this.refreshBar();
    } else {
      this.refreshDoughnut();
    }  
  }
   
  // ====================================================================
  // Configuração do Gráfico de Barras
  // ====================================================================
  barChartOptions: any = [{
    scales: {
       yAxes: [
        {
            display: true,
            ticks: {
              beginAtZero: true,
              fontSize: 10,
              colors: '#fff',
//              min:0,
            }
        }
      ]
    }
  }];

  barChartLabels = [];
  barChartType:string = 'bar';
  barChartLegend:boolean = true;
  barChartData:any;
  barChartColors:Array<any> = [
    {
      backgroundColor: 'rgba(134,199,243,0.8)',
      borderColor: 'rgba(134,199,243,0.9)',
      pointBackgroundColor: 'rgba(134,199,243,1)',
      pointBorderColor: 'rgba(134,199,243,1)',
      pointHoverBackgroundColor: 'rgba(134,199,243,0.8)',
      pointHoverBorderColor: 'rgba(134,199,243,0.8)',
      labels: '#3F51B5'
    },
    {
      backgroundColor: 'rgba(181,249,183,0.8)',
      borderColor: 'rgba(181,249,183,0.9)',
      pointBackgroundColor: 'rgba(181,249,183,1)',
      pointBorderColor: 'rgba(181,249,183,1)',
      pointHoverBackgroundColor: 'rgba(181,249,183,0.8)',
      pointHoverBorderColor: 'rgba(181,249,183,0.8)',
      labels: '#3F51B5'
    }
  ];

  // events
  public chartBarClicked(e:any):void {
    console.log(e);
  }
  
  public chartBarHovered(e:any):void {
    console.log(e);
  }

  refreshBar(){
    this.barChartLabels = [];
    this.barChartData = [{data: [], label: 'Acessos'}, {data: [], label: 'Registros'}];
    eval(this.sBarLab);
    eval(this.sBarData);
  }

  public barChartDataTmp:Array<any> = [{data: [], label: 'Acessos'}, {data: [], label: 'Registros'}];
  public barChartLabelsTmp:Array<any> = [];
  public sBarLab : string = "";
  public sBarData : string = "";

  private loadDataBar(dtIni : any, dtFim : any) {
    // Recuperar os dados para o Gráfico de Barras
    let qtdShowRegistros : number = 5; // Mostra a qtd de registros no gráfico
    this.dashboardService.qtdAcessosDia(dtIni, dtFim, qtdShowRegistros)
    .subscribe(
      dadosGrafico => {
        this.itemsGraficoBar.splice(0,this.itemsGraficoBar.length); // Limpa o array
        this.itemsGraficoBar = this.itemsGraficoBar.concat(dadosGrafico);
        this.loadDataBarChart();
        
    }, (err3) => {
      console.log(">>> erro ao ler os dados para carga do dashboard!/n'"+err3.code+"-"+err3.message+"')");
    });
  }
  
  private loadDataBarChart() {
    if ((this.itemsGraficoBar != undefined) && (this.itemsGraficoBar.length > 0)){ 
      this.barChartDataTmp[0].data.splice(0,this.barChartDataTmp[0].data.length); // Limpa o array
      this.barChartDataTmp[1].data.splice(0,this.barChartDataTmp[1].data.length); // Limpa o array
      this.barChartLabelsTmp.splice(0,this.barChartLabelsTmp.length); // Limpa o array

      this.sBarLab = "this.barChartLabels = ['";
      let s1 : string = "";
      let s2 : string = "";
      let sdt1 : string = "this.barChartData = [{data: [";
      let sdt2 : string = "], label: 'Acessos'},{data: [";
      let sdt3 : string = "], label: 'Registros'}]";

      for (var i = 0; i < this.itemsGraficoBar.length; i++){
        let qtdAcessosDiaDTO : QtdAcessosDiaDTO = this.itemsGraficoBar[i];
        this.barChartDataTmp[0].data.push(qtdAcessosDiaDTO.qtdAcessos);
        this.barChartDataTmp[1].data.push(qtdAcessosDiaDTO.qtdRegistros);
        let dt = this.convertDateToString( new Date(qtdAcessosDiaDTO.dtHistorico) );
        this.sBarLab += dt + "','";
        this.barChartLabelsTmp.push(dt);
        s1 += qtdAcessosDiaDTO.qtdAcessos + ",";
        s2 += qtdAcessosDiaDTO.qtdRegistros + ",";
      }
      this.sBarLab = this.sBarLab.substring(0, this.sBarLab.length-2);
      this.sBarLab += "];";
      s1 = s1.substring(0, s1.length-1);
      s2 = s2.substring(0, s2.length-1);
      this.sBarData = sdt1 + s1 + sdt2 + s2 + sdt3;
    } 
  }

  // ====================================================================
  // Configuração do Gráfico de LineChart
  // ====================================================================
  /*
  public lineChartData:Array<any> = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Preço'},
  ];
  public lineChartLabels:Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions:any = {
    responsive: true
  };
  public lineChartColors:Array<any> = [
    { // grey
      //backgroundColor: '#ffffff', //'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';
  
  public randomize():void {  }
  
  // events
  public lineChartClicked(e:any):void {
    console.log(e);
  }
  
  public lineChartHovered(e:any):void {
    console.log(e);
  }

  refreshLine(){
    this.lineChartLabels = [];
    this.lineChartData = [{data: [], label: 'Acessos'}, {data: [], label: 'Registros'}];
    eval(this.sBarLab);
    eval(this.sBarData);
  }

  public lineChartDataTmp:Array<any> = [{data: [], label: 'Acessos'}, {data: [], label: 'Registros'}];
  public lineChartLabelsTmp:Array<any> = [];
  public sLineLab : string = "";
  public sLineData : string = "";

  private loadDataLine(dtIni : any, dtFim : any) {
    // Recuperar os dados para o Gráfico de Barras
    /*
    let qtdShowRegistros : number = 5; // Mostra a qtd de registros no gráfico
    this.dashboardService.(dtIni, dtFim, qtdShowRegistros)
    .subscribe(
      dadosGrafico => {
        this.itemsGrafico.splice(0,this.itemsGrafico.length); // Limpa o array
        this.itemsGrafico = this.itemsGrafico.concat(dadosGrafico);
        
        this.loadDataLineChart();
        
    }, (err3) => {
      console.log(">>> erro ao ler os dados para carga do dashboard!/n'"+err3.code+"-"+err3.message+"')");
    });
    
  }
  
  private loadDataLineChart() {
    if ((this.itemsGraficoLine != undefined) && (this.itemsGraficoLine.length > 0)){ 
      this.lineChartDataTmp[0].data.splice(0,this.lineChartDataTmp[0].data.length); // Limpa o array
      this.lineChartDataTmp[1].data.splice(0,this.lineChartDataTmp[1].data.length); // Limpa o array
      this.lineChartLabelsTmp.splice(0,this.lineChartLabelsTmp.length); // Limpa o array

      this.sBarLab = "this.barChartLabels = ['";
      let s1 : string = "";
      let s2 : string = "";
      let sdt1 : string = "this.barChartData = [{data: [";
      let sdt2 : string = "], label: 'Acessos'},{data: [";
      let sdt3 : string = "], label: 'Registros'}]";

      for (var i = 0; i < this.itemsGraficoLine.length; i++){
        let qtdAcessosDiaDTO : QtdAcessosDiaDTO = this.itemsGraficoLine[i];
        this.lineChartDataTmp[0].data.push(qtdAcessosDiaDTO.qtdAcessos);
        this.lineChartDataTmp[1].data.push(qtdAcessosDiaDTO.qtdRegistros);
        let dt = this.convertDateToString( new Date(qtdAcessosDiaDTO.dtHistorico) );
        this.sBarLab += dt + "','";
        this.lineChartLabelsTmp.push(dt);
        s1 += qtdAcessosDiaDTO.qtdAcessos + ",";
        s2 += qtdAcessosDiaDTO.qtdRegistros + ",";
      }
      this.sBarLab = this.sBarLab.substring(0, this.sBarLab.length-2);
      this.sBarLab += "];";
      s1 = s1.substring(0, s1.length-1);
      s2 = s2.substring(0, s2.length-1);
      this.sBarData = sdt1 + s1 + sdt2 + s2 + sdt3;
    } 
  }
*/
  // ====================================================================
  // Configuração do Gráfico de Doughnut
  // ====================================================================
    // Doughnut
    public doughnutChartLabels:string[] = ['Produtos Existentes', 'Novos Produtos'];
    public doughnutChartData:number[] = [65, 1];
    public doughnutChartType:string = 'doughnut';
    public doughnutColors:Array<any> = [
        { backgroundColor: ['rgba(134,199,243,0.8)', 'rgba(181,249,183,0.8)'] },
        { borderColor: ['rgba(134,199,243,0.8)', 'rgba(181,249,183,1)'] }
    ];

    refreshDoughnut(){
      //this.doughnutChartLabels = [];
      this.doughnutChartData = [];
      eval(this.sDoughnutData);
    }

    // events
    public chartDoughnutClicked(e:any):void {
      console.log(e);
    }
  
    public chartDoughnutHovered(e:any):void {
      console.log(e);
    }

    public sDoughnutLab : string = "";
    public sDoughnutData : string = "";
  
  private loadDataDoughnut() {
    // Recuperar os dados para o Gráfico de Doughnut
    this.dashboardService.qtdProdutosNovosProdutos()
    .subscribe(
      dadosGrafico => {
        this.itemsGraficoDoughnut.splice(0,this.itemsGraficoDoughnut.length); // Limpa o array
        this.itemsGraficoDoughnut = this.itemsGraficoDoughnut.concat(dadosGrafico);
        this.loadDataDoughnutChart();
        
    }, (err3) => {
      console.log(">>> erro ao ler os dados para carga (qtdProdutosNovosProdutos) do dashboard!/n'"+err3.code+"-"+err3.message+"')");
    });
  }
  
  private loadDataDoughnutChart() {
    if ((this.itemsGraficoDoughnut != undefined) && (this.itemsGraficoDoughnut.length > 0)){ 
      this.barChartDataTmp[0].data.splice(0,this.barChartDataTmp[0].data.length); // Limpa o array
      this.barChartDataTmp[1].data.splice(0,this.barChartDataTmp[1].data.length); // Limpa o array
      this.barChartLabelsTmp.splice(0,this.barChartLabelsTmp.length); // Limpa o array

      // this.doughnutChartData = [65, 1];

      this.sDoughnutData = "this.doughnutChartData = [";

      if (this.itemsGraficoDoughnut.length > 0){
        let qtdProdutosNovosProdutosDTO : QtdProdutosNovosProdutosDTO = this.itemsGraficoDoughnut[0];
        this.barChartDataTmp[0].data.push(qtdProdutosNovosProdutosDTO.qtdProdutos);
        this.barChartDataTmp[1].data.push(qtdProdutosNovosProdutosDTO.qtdNovosProdutos);
        this.sDoughnutData += qtdProdutosNovosProdutosDTO.qtdProdutos + "," + qtdProdutosNovosProdutosDTO.qtdNovosProdutos;
      }
      this.sDoughnutData += "];";
    } 
  }
}