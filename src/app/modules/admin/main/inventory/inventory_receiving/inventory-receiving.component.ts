// noinspection AngularMissingOrInvalidDeclarationInModule

import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'inventory-receiving',
  templateUrl: './inventory-receiving.component.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryReceivingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
