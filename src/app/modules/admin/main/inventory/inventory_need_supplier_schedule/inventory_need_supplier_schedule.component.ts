// noinspection AngularMissingOrInvalidDeclarationInModule

import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'inventory_need_supplier_schedule',
  templateUrl: './inventory_need_supplier_schedule.component.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Inventory_need_supplier_scheduleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
