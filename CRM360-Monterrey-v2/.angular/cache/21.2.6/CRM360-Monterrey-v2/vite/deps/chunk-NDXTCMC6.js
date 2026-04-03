import {
  MatTooltip,
  TooltipComponent
} from "./chunk-T72PKSDI.js";
import {
  OverlayModule
} from "./chunk-LOFG27YH.js";
import {
  A11yModule
} from "./chunk-6RQTJ2VQ.js";
import {
  CdkScrollableModule
} from "./chunk-HKEBMV7Q.js";
import {
  BidiModule
} from "./chunk-FFWWTXMS.js";
import {
  NgModule,
  setClassMetadata,
  ɵɵdefineNgModule
} from "./chunk-OB2PYL5S.js";
import {
  ɵɵdefineInjector
} from "./chunk-2TWCHO2A.js";

// node_modules/@angular/material/fesm2022/tooltip.mjs
var MatTooltipModule = class _MatTooltipModule {
  static ɵfac = function MatTooltipModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatTooltipModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _MatTooltipModule,
    imports: [A11yModule, OverlayModule, MatTooltip, TooltipComponent],
    exports: [MatTooltip, TooltipComponent, BidiModule, CdkScrollableModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [A11yModule, OverlayModule, BidiModule, CdkScrollableModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTooltipModule, [{
    type: NgModule,
    args: [{
      imports: [A11yModule, OverlayModule, MatTooltip, TooltipComponent],
      exports: [MatTooltip, TooltipComponent, BidiModule, CdkScrollableModule]
    }]
  }], null, null);
})();

export {
  MatTooltipModule
};
//# sourceMappingURL=chunk-NDXTCMC6.js.map
