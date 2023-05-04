// angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// services
import { RouterService } from 'src/app/shared/services/core/router.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'logistica-dashboard-frete-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class LogisticaDashboardsAnaliseFreteCardComponent implements OnInit {


  @Input() value: number = 0;
  @Input() selectedKey: string;
  @Input() icon: string = "fas fa-truck";
  @Input() show: boolean = false;
  @Input() empty: boolean = false;
  @Input() loading: boolean = false;
  @Input() numberFormat: string = '1.0-0'
  @Input() label: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private pnotify: PNotifyService,
    private routerService: RouterService
  ) { }

  ngOnInit(): void {
    
  }

}
