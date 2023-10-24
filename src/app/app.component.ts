import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationCancel,
  NavigationError,
  NavigationEnd
} from '@angular/router';

// Services
import { TranslationService } from './shared/services/core/translation.service';
import { AuthService } from './shared/services/core/auth.service';
import { PNotifyService } from './shared/services/core/pnotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html' ,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked, OnDestroy {
  showingMenu = false;

  loadingRouteConfig = false;
  showingRouteConfigError = false;

  constructor(
    private translationService: TranslationService,
    private authService: AuthService,
    private router: Router,
    private pnotifyService: PNotifyService
  ) {
    this.translationService.setDefaultLang('es');
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.onMenuEmitter();
  }

  ngAfterViewChecked() {
    this.onRouterNavigation();
  }

  ngOnDestroy() {
    this.authService.showMenuEmitter.unsubscribe();
  }

  onMenuEmitter() {
    this.authService.showMenuEmitter.subscribe((show: boolean) => {
      this.showingMenu = show;
    });
  }

  onRouterNavigation() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingRouteConfig = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingRouteConfig = false;

        if (event instanceof NavigationError) {
          if (this.showingRouteConfigError === false) {
            this.showingRouteConfigError = true;
            this.pnotifyService.error();

            setTimeout(() => {
              this.showingRouteConfigError = false ;
            }, 5000);
          }
        }
      }
    });
  }
}
