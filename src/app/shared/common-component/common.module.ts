import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import {FuseFindByKeyPipeModule} from "../../../@fuse/pipes/find-by-key";
import {CmInputComponent} from "./cm-input-component/cm-input.component";
import {CmSelectComponent} from "./cm-select-component/cm-select.component";
import {CmSelectServerSideComponent} from "./cm-select-server-side-component/cm-select-server-side.component";
import {CmApprovalStatus} from "./cm-approval-status/cm-approval-status";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {cm_sys_approval_status_popupComponent} from "./cm-approval-status/cm_sys_approval_status_popup.component";
import {MatTabsModule} from "@angular/material/tabs";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTableModule} from "@angular/material/table";
import {cm_sys_approval_buttonComponent} from "./cm-approval-status/cm_sys_approval_button.component";
import {cm_sys_approval_popupComponent} from "./cm-approval-status/cm_sys_approval_popup.component";
import {cm_sys_approval_filterComponent} from "./cm-approval-status/cm_sys_approval_filter.component";

@NgModule({
    declarations: [
        CmSelectComponent,
        CmSelectServerSideComponent,
        CmInputComponent,
        CmApprovalStatus,
        cm_sys_approval_status_popupComponent,
        cm_sys_approval_buttonComponent,
        cm_sys_approval_popupComponent,
        cm_sys_approval_filterComponent
    ],
    imports: [
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        TranslocoModule,
        FuseFindByKeyPipeModule,
        CommonModule,
        MatDatepickerModule,
        MatTabsModule,
        MatPaginatorModule,
        MatTableModule,


    ],
    exports: [
        CmSelectComponent,
        CmSelectServerSideComponent,
        CmInputComponent,
        CmApprovalStatus,
        cm_sys_approval_status_popupComponent,
        cm_sys_approval_buttonComponent,
        cm_sys_approval_popupComponent,
        cm_sys_approval_filterComponent
    ]
})

export class commonModule {
}
