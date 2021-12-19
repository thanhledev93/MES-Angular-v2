import { NgModule } from '@angular/core';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import {FilterPipe} from './filter/filter.pipe';

@NgModule({
    declarations: [
        FuseFindByKeyPipe,
        FilterPipe
    ],
    exports: [
        FuseFindByKeyPipe,
        FilterPipe
    ]
})
export class FuseFindByKeyPipeModule
{
}
