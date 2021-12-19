import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MAT_DATE_FORMATS} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {SharedModule} from '../../../../shared/shared.module';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {TranslocoModule} from '@ngneat/transloco';
import { inventoryRoutes } from './inventory.routing';
import {InventoryReceivingComponent} from './inventory_receiving/inventory-receiving.component';
import {InventoryReceivingListComponent} from './inventory_receiving/list/list.component';
import {MatExpansionModule} from "@angular/material/expansion";
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatTabsModule} from "@angular/material/tabs";
import {MatSidenavModule} from "@angular/material/sidenav";
import {commonModule} from "../../../../shared/common-component/common.module";
import { InventoryReceivingPopupAddComponent } from './inventory_receiving/popup-add/popup-add.component';
import {FuseFindByKeyPipeModule} from "../../../../../@fuse/pipes/find-by-key";

// @ts-ignore
@NgModule({
    declarations: [
        InventoryReceivingComponent,
        InventoryReceivingListComponent,
        InventoryReceivingPopupAddComponent
    ],
    imports: [
        RouterModule.forChild(inventoryRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        SharedModule,
        MatCardModule,
        MatDialogModule,
        TranslocoModule,
        MatExpansionModule,
        MatMomentDateModule,
        MatDividerModule,
        MatDatepickerModule,
        MatTabsModule,
        MatSidenavModule,
        commonModule,
        FuseFindByKeyPipeModule
    ],
    providers   : [
        {
            provide : MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'LL'
                },
                display: {
                    dateInput: 'DD-MM-YYYY',
                    monthYearLabel: 'YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'YYYY'
                }
            }
        }
    ]
})
export class InventoryModule {
}
