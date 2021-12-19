import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'filter'})
export class FilterPipe implements PipeTransform
{
    /**
     * Transform
     *
     * @param mainArr
     * @param searchText
     * @param property
     * @returns
     */
    transform(items: any[], field: string, value: string): any[] {
        if (!items) {return [];}
        if (!value || value.length === 0) {return items;}

        return items.filter(it =>
            this.removeAccents(it[field].toLowerCase()).indexOf(this.removeAccents(value.toLowerCase())) !== -1);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
     removeAccents(str) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const AccentsMap = [
        'aàảãáạăằẳẵắặâầẩẫấậ',
        'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
        'dđ', 'DĐ',
        'eèẻẽéẹêềểễếệ',
        'EÈẺẼÉẸÊỀỂỄẾỆ',
        'iìỉĩíị',
        'IÌỈĨÍỊ',
        'oòỏõóọôồổỗốộơờởỡớợ',
        'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
        'uùủũúụưừửữứự',
        'UÙỦŨÚỤƯỪỬỮỨỰ',
        'yỳỷỹýỵ',
        'YỲỶỸÝỴ'
    ];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < AccentsMap.length; i++) {
        const re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        const char = AccentsMap[i][0];
        str = str.replace(re, char);
    }

    return str;
}
}
