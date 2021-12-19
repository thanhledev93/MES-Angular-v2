// noinspection AngularMissingOrInvalidDeclarationInModule

import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'inventory-delivery',
  templateUrl: './inventory-delivery.component.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryDeliveryComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
