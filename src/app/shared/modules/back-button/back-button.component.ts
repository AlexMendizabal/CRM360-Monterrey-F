import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Services
import { RouterService } from '../../services/core/router.service';

@Component({
  selector: 'back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {
  @Output() btnClicked: EventEmitter<boolean> = new EventEmitter();

  isDisabled: boolean = false;

  previousUrl: string;
  currentUrl: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private routerService: RouterService
  ) {}

  ngOnInit() {
    this.setRouter();
  }

  setRouter() {
    this.previousUrl = this.routerService.getPreviousUrl();
    this.currentUrl = this.routerService.getCurrentUrl();
    this.isDisabled = this.previousUrl === this.currentUrl ? true : false;
    this.onRouterChange();
  }

  onRouterChange() {
    this.router.events.subscribe(event => {
      this.previousUrl = this.routerService.getPreviousUrl();
      this.currentUrl = this.routerService.getCurrentUrl();
      this.isDisabled = this.previousUrl === this.currentUrl ? true : false;
    });
  }

  onClick() {
    this.btnClicked.emit(true);

    if (this.isDisabled) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute
      });
    } else {
      this.location.back();
    }
  }
}
