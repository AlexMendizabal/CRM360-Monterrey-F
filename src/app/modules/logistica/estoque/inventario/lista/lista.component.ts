import {
  BsModalService,
  BsModalRef,
  ModalDirective,
} from 'ngx-bootstrap/modal';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Directive,
  Input,
  TemplateRef,
} from '@angular/core';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { LogisticaEstoqueInventarioListaService } from './lista.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize, retry } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'logistica-estoque-inventario-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaEstoqueInventarioListaComponent implements OnInit {
  @ViewChild('childModal', { static: false }) childModal: ModalDirective;
  @ViewChild('childModalRo', { static: false }) childModalRo: ModalDirective;

  idInventario: number = this.activatedRoute.snapshot.params['id'];
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matriculaAuditor: any = this.currentUser['info']['matricula'];

  form: FormGroup;

  dateRef: Date;
  dataNow: any;
  cdNotaFiscal = '';
  cdNotaFiscalRo = '';
  tipoInventario = '';
  status: any;
  adminProfile = true;

  perfilLoaded: boolean;
  loaderNavbar = true;
  spinnerFullScreen = true;
  loading = false;
  noResult = false;
  compressedTable = false;
  considerarMaterialSemEstoque = 1;
  perfilTipo = '';

  listaColunas: any;
  listas = [];
  listaInfo: any = {};
  disabledBotoes = {
    finalizar: false,
    editar: false,
    aprovar: false,
    reabrir: false,
  };
  habilita = false;
  info = false;
  ativAprovar = false;
  ativFinaliza = false;
  ativReabrir = false;
  ativCancelar = false;
  ativEditar = false;
  ativSalvar = false;
  ativNotaFiscal = false;
  ativExport = false;
  inativBotoes = false;
  desabilitarBotoes = true;
  notaFiscalSelecionada: number;
  notaFiscalSelecionadaRo: number;

  modalRef: BsModalRef;
  config = {
    animated: true,
  };

  parametros = {};
  breadCrumbTree = [
    {
      descricao: 'Home',
      routerLink: '/logistica/estoque/inventario/filtro',
    },
    {
      descricao: 'Inventario',
      routerLink: '/logistica/estoque/inventario/inventario',
    },
    {
      descricao: 'Inventário',
    },
  ];

  colunas = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  beginP: number = 0;
  endP: number = 10;
  /* Paginação */

  /* Seleção de Colunas */
  itens: FormGroup;
  selectedPeople = [];
  listaMateriaisFiltro: any = [];
  notasFiscais: any;
  qtNotasFiscais: any;
  tempNotasFiscais: any;
  materiaisNotaFiscal: any = [];
  notasFiscaisRo: any;
  qtNotasFiscaisRo: any;
  tempNotasFiscaisRo: any;
  materiaisNotaFiscalRo: any = [];
  /* Seleção de Colunas */

  constructor(
    private xlsxService: XlsxService,
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService,
    private empresasService: LogisticaEstoqueInventarioListaService,
    private dateSevice: DateService,
    private route: Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private atividadesService: AtividadesService
  ) {
    this.form = this.formBuilder.group({
      cdMaterial: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.getListaMateriaisParaFiltro();
    this.changeColunas();
    this.getInfoInventario();
    this.onLoadAplication();
    this.atividadesService.registrarAcesso().subscribe();
    this.getPerfil();
  }

  onLoadAplication() {
    this.adminProfile = true;
    this.loaderNavbar = true;
    let params = {};

    if (!this.adminProfile) {
      setTimeout(() => {
        this.perfilLoaded = true;
        this.loaderNavbar = false;
      }, 500);
    } else if (this.adminProfile) {
      setTimeout(() => {
        this.perfilLoaded = false;
        this.loaderNavbar = false;
      }, 500);
    }
  }

  onToggleListaMateriais() {
    this.considerarMaterialSemEstoque =
      this.considerarMaterialSemEstoque == 1 ? 0 : 1;
    this.getLista('', this.considerarMaterialSemEstoque);
  }

  getLista(cdMaterial = '', considerarMaterialSemEstoque = 1) {
    if (this.activatedRoute.snapshot.params['id'] > 0) {
      this.idInventario = this.activatedRoute.snapshot.params['id'];
      this.spinnerFullScreen = true;

      this.listas = [];
      this.totalItems = 0;
      //Carrega a lista de materiais em inventário
      this.empresasService
        .getLista(
          this.idInventario,
          this.matriculaAuditor,
          cdMaterial,
          considerarMaterialSemEstoque
        )
        .pipe(
          finalize(() => {
            this.spinnerFullScreen = false;
            this.loaderNavbar = false;
            this.getTotal();
          })
        )
        .subscribe(
          (response: any) => {
            this.listas = response['materiais'];
            this.totalItems = response['qtRegistros'];
            this.noResult = false;
            this.listas.forEach((element) => {
              element.totalContagem =
                element.qtPecaContagem * element.pesoPeca +
                parseFloat(element.qtPesoContagem);
              this.getInfoInventarioRotativo(element.cdMaterial).subscribe(
                (response: any) => {
                  if (response.status == 204)
                    element.somaInventarioRotativo = 0;
                  else
                    element.somaInventarioRotativo = parseFloat(
                      response.body.saldoEstoque
                    );
                  element.resultadoInventario =
                    parseFloat(element.saldoEstoque) +
                    element.somaInventarioRotativo;
                }
              );
            });
          },
          (error) => {
            this.notice.notice(
              'Não há materiais cadastrados para esse inventário.'
            );
            this.noResult = true;
          }
        );
    }
  }

  getListaMateriaisParaFiltro() {
    if (this.activatedRoute.snapshot.params['id'] > 0) {
      this.idInventario = this.activatedRoute.snapshot.params['id'];

      //Carrega a lista de materiais para o filtro
      this.empresasService
        .getListaMateriaisParaFiltro(this.idInventario, this.matriculaAuditor)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe((response: any) => {
          if (response['status'] === 200)
            this.listaMateriaisFiltro = response['body']['materiais'];
        });
    }
  }

  postSalvar() {
    let materiais = [];
    let requisicao = {};
    this.loaderNavbar = true;

    this.listas.forEach((element) => {
      if (element.qtPecaContagem != null || element.qtPesoContagem != null) {
        materiais.push({
          idInventarioMaterial: element.idInventarioMaterial,
          qtPeca: element.qtPecaContagem ? element.qtPecaContagem : null,
          qtPeso: element.qtPesoContagem ? element.qtPesoContagem : null,
          cdMaterial: element.cdMaterial ? element.cdMaterial : null,
        });
      } else {
        this.getLista();
      }
    });

    if (materiais.length > 0) {
      requisicao = {
        matriculaAuditor: this.matriculaAuditor,
        materiais,
      };
      this.empresasService
        .postSalvar(requisicao, this.idInventario)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (response: any) => {
            if (response['body']['erros'].length === 0) {
              this.notice.success('Registros atualizados com sucesso!');
            } else {
              this.notice.error('Alguns registros não puderam ser atualizados');
            }
            this.getLista();
          },
          (error: any) => {
            this.notice.error('Erro ao salvar registros');
          }
        );
    } else {
      this.notice.notice('Inventário não teve alterações para ser salvo');
      this.getLista();
    }
  }

  finalizar(template) {
    if (this.dateDiff(this.dateRef, new Date()) >= 7)
      this.modalRef = this.modalService.show(template);
    else {
      let finaliza = confirm('Tem certeza que deseja finalizar o inventário?');

      if (finaliza) this.atualizarInventario('', 2);
    }
  }

  cancelar(template, valor) {
    let cancela = confirm('Tem certeza que deseja cancelar o inventário?');
    if (valor == 1)
      if (cancela) this.modalRef = this.modalService.show(template);
  }

  dateDiff(date1, date2) {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  atualizarInventario(justificativa, statusInventario) {
    this.loaderNavbar = true;
    let finalizacao = {};

    finalizacao = {
      idStatusInventario: statusInventario,
      matriculaAuditor: this.matriculaAuditor,
      idInventario: this.idInventario,
      observacao: justificativa,
    };
    this.empresasService
      .atualizarInventario(
        justificativa,
        statusInventario,
        this.idInventario,
        this.matriculaAuditor
      )
      .pipe(
        finalize(
          () => (
            (this.loaderNavbar = false),
            this.getLista(),
            this.getInfoInventario()
          )
        )
      )
      .subscribe(
        (response: any) => {
          if (response['status'] === 200)
            this.notice.success(response['body']['message']);
        },
        (error) => {
          this.notice.error(error.error.dsErro);
        }
      );
  }

  getInfoInventarioRotativo(cdMaterial) {
    return this.empresasService.getInfoInventarioRotativo(
      this.idInventario,
      cdMaterial
    );
  }

  /* TRATA HORA ATUAL */
  RetornaDataHoraAtual() {
    var dNow = new Date();
    var localdate =
      dNow.getDate() +
      '/' +
      (dNow.getMonth() + 1) +
      '/' +
      dNow.getFullYear() +
      ' ' +
      dNow.getHours() +
      ':' +
      dNow.getMinutes();
    return (this.dataNow = localdate);
  }

  /* TRATA CAMPOS DE INPUT - DESABILITA EXIGINDO O CLICK NO BOTÃO EDITAR */
  getInfoInventario() {
    this.empresasService
      .getInfoInventario(this.idInventario)
      .subscribe((response: any) => {
        this.dateRef = new Date(response.dtInclusao);
        this.status = response.siglaStatusInventario;
        this.tipoInventario = response.dsTipoInventario;
        if (
          response.siglaStatusInventario == 'LOGI_INVE_STAT_ABER' ||
          response.siglaStatusInventario == 'LOGI_INVE_STAT_FINA' ||
          response.siglaStatusInventario == 'LOGI_INVE_STAT_CANC' ||
          response.siglaStatusInventario == 'LOGI_INVE_STAT_CANC_SIST' ||
          response.siglaStatusInventario == 'LOGI_INVE_STAT_APRO'
        ) {
          this.info = true;
        } else {
          this.info;
        }

        if (response.siglaStatusInventario == 'LOGI_INVE_STAT_CANC_SIST') {
          this.noResult = true;
        }

        this.controlaAcessoBotoes();
      });
  }

  /* HABILITA CAMPOS PARA EDITAR */
  habilitaCampos() {
    if (this.listas !== null) {
      this.info = false;
      this.habilita = true;
    }
  }

  changeColunas() {
    let response = [
      { id: 1, descricao: 'Classe' },
      { id: 2, descricao: 'Código do Material' },
      { id: 3, descricao: 'Descrição do Material' },
      { id: 4, descricao: 'Endereço' },
      { id: 5, descricao: 'Estoque (Tons)' },
      { id: 6, descricao: 'Peso Por Peça' },
      { id: 7, descricao: 'Quantidade de Peças' },
      { id: 8, descricao: 'Peso físico (Tons)' },
      { id: 9, descricao: 'Total da contagem' },
      { id: 10, descricao: 'Notas Fiscais' },
      { id: 11, descricao: 'Diferença Ajustada' },
      { id: 12, descricao: 'Soma Inventário Rotativo' },
      { id: 13, descricao: 'Valor Unitário' },
      { id: 14, descricao: 'Resultado Inventário' },
      { id: 15, descricao: 'Resultado Monetário' },
    ];

    this.listaColunas = response;
  }

  esconderColunas(titulo) {
    return this.colunas.indexOf(titulo) !== -1;
  }

  exportarExcel() {
    this.xlsxService.exportFile(this.listas, 'inventario');
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  /* Pesquisa a lista de materiais para popular o filtro */
  onSearch() {
    this.loaderNavbar = true;
    if (this.form.get('cdMaterial').status == 'VALID')
      this.getLista(this.form.get('cdMaterial').value, 0);
    else this.getLista();
  }
  /* */

  getMateriaisNotasFiscais(notaFiscal) {
    this.loading = true;
    this.materiaisNotaFiscal = [];
    this.empresasService
      .getMateriaisNotasFiscais(this.idInventario, notaFiscal)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((data) => {
        if (data['status'] === 200) {
          this.materiaisNotaFiscal = data['body'];
          this.compressedTable = true;
          this.notaFiscalSelecionada = notaFiscal;
        }
      });
  }

  getMateriaisNotasFiscaisRo(notaFiscal) {
    this.loading = true;
    this.materiaisNotaFiscalRo = [];
    this.empresasService
      .getMateriaisNotasFiscaisRo(this.idInventario, notaFiscal)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((data) => {
        if (data['status'] === 200) {
          this.materiaisNotaFiscalRo = data['body'];
          this.compressedTable = true;
          this.notaFiscalSelecionadaRo = notaFiscal;
        }
      });
  }

  /* Função para abertura de modal de Notas Fiscais */
  openModalNotaFiscal() {
    this.getListaExistente();
    this.childModal.show();
  }

  /* Função para abertura de modal de Notas Fiscais relacionadas a R.O's */
  openModalRo() {
    this.getListaExistenteRo();
    this.childModalRo.show();
  }

  /* Função que verifica se a lista já foi carregada e se a nf da consulta consta na lista */
  getListaCarregadaMaisNotaFiscal() {
    let containsNotaFiscal = false;
    let isNotUndefined = typeof this.tempNotasFiscais !== 'undefined';

    if (isNotUndefined) {
      containsNotaFiscal = this.tempNotasFiscais.find(
        (element) => element.notaFiscal === this.cdNotaFiscal
      );
    }

    return isNotUndefined && containsNotaFiscal;
  }

  getListaCarregadaMaisNotaFiscalRo() {
    let containsNotaFiscal = false;
    let isNotUndefined = typeof this.tempNotasFiscais !== 'undefined';

    if (isNotUndefined) {
      containsNotaFiscal = this.tempNotasFiscais.find(
        (element) => element.notaFiscal === this.cdNotaFiscalRo
      );
    }

    return isNotUndefined && containsNotaFiscal;
  }

  /* Função que verifica se a lista já foi carregada e usa ela para pesquisa, sem a necessidade de consultar novamente */
  getListaExistente() {
    if (this.getListaCarregadaMaisNotaFiscal()) {
      const val = this.cdNotaFiscal;

      if (!val) {
        this.notasFiscais = this.tempNotasFiscais;
      }

      const temp = this.tempNotasFiscais.filter((row) => {
        return Object.keys(row).some((property) => {
          return row[property] === null
            ? null
            : row[property].toString().indexOf(val) !== -1;
        });
      });

      this.notasFiscais = temp;
      this.loading = false;
    } else this.getNotasFiscais();
  }

  getListaExistenteRo() {
    if (this.getListaCarregadaMaisNotaFiscalRo()) {
      const val = this.cdNotaFiscalRo;

      if (!val) {
        this.notasFiscaisRo = this.tempNotasFiscais;
      }

      const temp = this.tempNotasFiscais.filter((row) => {
        return Object.keys(row).some((property) => {
          return row[property] === null
            ? null
            : row[property].toString().indexOf(val) !== -1;
        });
      });

      this.notasFiscaisRo = temp;
      this.loading = false;
    } else this.getNotasFiscaisRo();
  }

  /* Função consulta lista de notas fiscais, seja ela uma lista com 1 ou mais resultados */
  getNotasFiscais() {
    this.loading = true;
    this.empresasService
      .getNotasFiscais(this.idInventario, this.cdNotaFiscal)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          if (data['status'] === 200) {
            this.notasFiscais = data['body']['notasFiscais'];
            this.tempNotasFiscais = data['body']['notasFiscais'];
            this.qtNotasFiscais = data['body']['qtRegistros'];
          } else this.notice.notice('Não houve retorno para sua consulta');
        },
        (error) => this.notice.error(error.message)
      );
  }

  /* Função consulta lista de notas fiscais, seja ela uma lista com 1 ou mais resultados */
  getNotasFiscaisRo() {
    this.loading = true;
    this.empresasService
      .getNotasFiscaisRo(this.idInventario, this.cdNotaFiscalRo)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          if (data['status'] === 200) {
            this.notasFiscaisRo = data['body']['notasFiscais'];
            this.tempNotasFiscaisRo = data['body']['notasFiscais'];
            this.qtNotasFiscaisRo = data['body']['qtRegistros'];
          } else this.notice.notice('Não houve retorno para sua consulta');
        },
        (error) => this.notice.error(error.message)
      );
  }

  hideChildModal(): void {
    this.childModal.hide();
    this.postSalvar();
  }

  hideChildModalRo(): void {
    this.childModalRo.hide();
    this.postSalvar();
  }

  onClose() {
    this.compressedTable = false;
    this.notaFiscalSelecionada = 0;
  }

  onCloseRo() {
    this.compressedTable = false;
    this.notaFiscalSelecionadaRo = 0;
  }

  /* Paginação */
  onPageChangedProduct(event: PageChangedEvent): void {
    this.beginP = (event.page - 1) * event.itemsPerPage;
    this.endP = event.page * event.itemsPerPage;
  }
  /* Paginação */

  salvarNotasFiscais() {
    let checkAlterado = [];
    this.notasFiscais.forEach((element) => {
      if (element.checkAlterado) {
        checkAlterado.push(element);
      }
    });

    let particao = 50;
    let qtEnvios = Math.ceil(checkAlterado.length / particao);
    let req: any = [];

    this.loading = true;

    for (let index = 0; index < qtEnvios; index++)
      req.push(
        this.empresasService.salvarNotasFiscais(
          this.idInventario,
          checkAlterado.slice(particao * index, particao * (index + 1)),
          this.matriculaAuditor
        )
      );

    forkJoin(req)
      .pipe(
        retry(2),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        (data) => {
          let contador = 0;
          data[0]['body'].forEach((element) => {
            if (element['responseCode'] == 200) {
              this.notice.success('Itens salvos com sucesso!');
              contador++;
            } else {
              this.notice.error(element['response']);
            }
          });
          if (contador === data.length) {
          }
        },
        (error) => {
          this.notice.error('Ocorreu um erro ao salvar os itens');
        }
      );
  }

  salvarNotasFiscaisRo() {
    let checkAlterado = [];
    this.notasFiscaisRo.forEach((element) => {
      if (element.checkAlterado) {
        checkAlterado.push(element);
      }
    });

    let particao = 50;
    let qtEnvios = Math.ceil(checkAlterado.length / particao);
    let req: any = [];

    this.loading = true;

    for (let index = 0; index < qtEnvios; index++)
      req.push(
        this.empresasService.salvarNotasFiscaisRo(
          this.idInventario,
          checkAlterado.slice(particao * index, particao * (index + 1)),
          this.matriculaAuditor
        )
      );

    forkJoin(req)
      .pipe(
        retry(2),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        (data) => {
          let contador = 0;

          this.notice.success('Itens salvos com sucesso!');
          data.forEach((element) => {
            if (element['status'] == 200) {
              contador++;
            }
          });
          if (contador === data.length) {
          }
        },
        (error) => {
          this.notice.error('Ocorreu um erro ao salvar os itens');
        }
      );
  }

  verificaCheck(notaFiscal) {
    notaFiscal.checkAlterado = !notaFiscal.checkAlterado;
    this.salvarNotasFiscais();
    this.getNotasFiscais();
  }

  getTotalContagem(material) {
    return (
      (material.pesoPeca / 1000) * material.qtPecaContagem +
      material.qtPesoContagem
    );
  }

  getSaldoInventario(material) {
    if (!material.qtPecaContagem && !material.qtPesoContagem) {
      return undefined;
    }

    const pesoFisico =
      (material.pesoPeca / 1000) * material.qtPecaContagem +
      material.qtPesoContagem;
    const estoque = material.qtPesoEstoque;
    const notasFiscais = parseFloat(material.qtMaterialNotaFiscal) ?? 0;
    const saldo = pesoFisico - estoque + notasFiscais;
    return saldo;
  }

  getResultadoInventario(material) {
    if (!material.qtPecaContagem && !material.qtPesoContagem) {
      return undefined;
    }
    return (
      (material.pesoPeca / 1000) * material.qtPecaContagem +
      material.qtPesoContagem -
      material.qtPesoEstoque +
      material.somaInventarioRotativo
    );
  }

  getResultadoMonetario(material) {
    if (!material.qtPecaContagem && !material.qtPesoContagem) {
      return undefined;
    }
    return (
      ((material.pesoPeca / 1000) * material.qtPecaContagem +
        material.qtPesoContagem -
        material.qtPesoEstoque +
        material.somaInventarioRotativo) *
      material.precoMinimo
    );
  }

  getPerfil() {
    this.empresasService
      .getPerfil(this.matriculaAuditor)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
          this.loaderNavbar = false;
          this.getLista();
        })
      )
      .subscribe(
        (response: any) => {
          this.disabledBotoes = response['disabledBotoes'];
          this.perfilTipo = response['perfilTipo'];
          this.controlaAcessoBotoes();
        },
        (error) => {
          this.notice.notice(
            'Não há vinculo de perfil para realizar inventário nesse usuário.'
          );
          this.noResult = true;
        }
      );
  }

  getTotal() {
    this.spinnerFullScreen = true;
    this.empresasService
      .getTotal(this.idInventario)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        this.listaInfo = response;
      });
  }

  controlaAcessoBotoes() {
    if (
      this.perfilTipo == 'assistente' &&
      this.status == 'LOGI_INVE_STAT_ABER'
    ) {
      this.ativExport = true;
      this.ativEditar = true;
      this.ativNotaFiscal = true;
      this.ativSalvar = true;
    } else if (this.perfilTipo == 'lider') {
      this.ativFinaliza = true;
      this.ativCancelar = true;
      this.ativEditar = true;
      this.ativNotaFiscal = true;
      this.ativSalvar = true;
      if (this.status == 'LOGI_INVE_STAT_ABER') this.ativExport = true;
    } else if (this.perfilTipo == 'coordenador') {
      if (this.status == 'LOGI_INVE_STAT_ABER') {
        this.ativFinaliza = true;
        this.ativReabrir = false;
        this.ativAprovar = false;
        this.ativCancelar = true;
        this.ativEditar = true;
        this.ativNotaFiscal = true;
        this.ativSalvar = true;
        this.ativExport = true;
      }
      if (this.status == 'LOGI_INVE_STAT_FINA') {
        this.ativFinaliza = false;
        this.ativReabrir = true;
        this.ativAprovar = true;
        this.ativCancelar = true;
        this.ativEditar = false;
        this.ativNotaFiscal = false;
        this.ativSalvar = false;
        this.ativExport = true;
      }
      if (this.status == 'LOGI_INVE_STAT_APRO') {
        this.ativFinaliza = false;
        this.ativReabrir = false;
        this.ativAprovar = false;
        this.ativCancelar = false;
        this.ativEditar = false;
        this.ativNotaFiscal = false;
        this.ativSalvar = false;
        this.ativExport = true;
      }
    }
  }
}
