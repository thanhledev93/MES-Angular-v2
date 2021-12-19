// noinspection AngularMissingOrInvalidDeclarationInModule

import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'inventory_item_line_up',
  templateUrl: './inventory_item_line_up.component.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Inventory_item_line_upComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
