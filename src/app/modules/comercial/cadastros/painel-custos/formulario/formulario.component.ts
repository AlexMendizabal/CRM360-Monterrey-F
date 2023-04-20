import { object } from '@amcharts/amcharts4/core';
import { finalize } from 'rxjs/operators';
import { ComercialCadastroPainelCustosService } from './../painel-custos.service';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';



import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';


@Component({
  selector: 'formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastroPainelCustosFormularioComponent {
  form: FormGroup;
  breadCrumbTree: any = [];
  submittingForm: boolean;
  id: any = [];
  formChanged: boolean;
  appTitle = 'Cadastro Painel de Custos';
  loaderFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  dagda: any = [];
  editar: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private servicePainelCustos: ComercialCadastroPainelCustosService,
    private pnotifyService: PNotifyService,
    private router: Router,
  ) {
    this.form = this.formBuilder.group({
      ID: null,
      ID_ITEM: [null],
      NM_ITEM: [null],
      NM_LINH: [null],
      NM_FAMI: [null],
      AL_IPI: 0.0,
      AL_ICMS: 0.0,
      AL_ICMS_ST: 0.0,
      AL_PIS: 0.0,
      AL_COFI: 0.0,
      AL_FCP: 0.0,
      IN_STAT: 1,
    });
  }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      (params: any) => {
        const id = params.id;
        if (id > 0) {
          this.loaderFullScreen = true;
          this.servicePainelCustos.getdetailc(id)
            .pipe(
              finalize(() => {
                this.loaderFullScreen = false;
              })
            ).subscribe({
              next: response => {
                if (response.status == 200) {
                  this.setFormBuilder(response.body);
                }
                else{
                  this.pnotifyService.error('Erro ao carregar');
                }
              }
            });
        }else{
          this.loaderFullScreen = true;
          this.editar = true;
          this.servicePainelCustos.getdagda().pipe(
            finalize(() => {
              this.loaderFullScreen = false;
            })
          ).subscribe(object => this.dagda = object);
        }
      }
    );
    this.setBreadCrumb();
  }
  selectDagda(id){
    this.loaderFullScreen = true;
    this.servicePainelCustos.getdagdad(id).pipe(
      finalize(() => {
        this.loaderFullScreen = false;
      })
    ).subscribe({
      next: response => {
        if (response.status == 200) {
          this.setFormBuilderd(response.body);
        }
        else{
          this.pnotifyService.error('Erro ao carregar')
        }
      }
    });
  }
  setFormBuilderd(dagda){
    this.form.patchValue({
      ID_ITEM: dagda.COD_ITEM,
      NM_ITEM: dagda.DEN_ITEM,
      NM_LINH: dagda.DEN_ESTR_LINPROD,
      NM_FAMI: dagda.DEN_FAMILIA
    });
  }
  setFormBuilder(detalhes) {
    this.form.patchValue({
      ID: detalhes.ID,
      ID_ITEM: detalhes.ID_ITEM,
      NM_ITEM: detalhes.NM_ITEM,
      NM_LINH: detalhes.NM_LINH,
      NM_FAMI: detalhes.NM_FAMI,
      AL_IPI: detalhes.AL_IPI,
      AL_ICMS: detalhes.AL_ICMS,
      AL_ICMS_ST: detalhes.AL_ICMS_ST,
      AL_PIS: detalhes.AL_PIS,
      AL_COFI: detalhes.AL_COFI,
      AL_FCP: detalhes.AL_FCP,
      IN_STAT: detalhes.IN_STAT
    });
  };

  onInput(): void {
    this.formChanged = true;
  }

  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Painel de Custos';
      } else {
        this.appTitle = 'Cadastro Painel de Custos';
      }

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: `/comercial/home`,
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${id}`,
        },
        {
          descricao: 'Painel de Custos',
          routerLink: `/comercial/cadastros/${id}/painel-custos`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }
  onSubmit() {
    this.loaderFullScreen = true;
    this.submittingForm = true;
    if(this.appTitle == 'Cadastro Painel de Custos'){
      if (this.form.valid) {
        this.servicePainelCustos.postinclusao(this.form.value).pipe(
          finalize(() => {
            this.loaderFullScreen = false;
          })
        ).subscribe((success: any) => {
          this.pnotifyService.success();
          this.router.navigate(['../'], {
            relativeTo: this.activatedRoute,
          });
        },
          (error: any) => {
            this.pnotifyService.error('COD. ITEM já cadastrado!!!');
          });    
      }
    }else{
      if (this.form.valid) {
        this.servicePainelCustos.putalteracao(this.form.value).pipe(
          finalize(() => {
            this.loaderFullScreen = false;
          })
        ).subscribe((success: any) => {
          this.pnotifyService.success();
          this.router.navigate(['../../'], {
            relativeTo: this.activatedRoute,
          });
        },
          (error: any) => {
            this.pnotifyService.error();
          });
      }
    }
  }

  onCancel() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.router.navigate(['../../'], {
          relativeTo: this.activatedRoute,
        });
      } else {
        this.router.navigate(['../'], {
          relativeTo: this.activatedRoute,
        });
      }
    });
  }

}
