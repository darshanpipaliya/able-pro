export function filterOptionsText() {

    return [
        { id: 1, name: 'contains', display: 'Contains' },
        { id: 2, name: 'notContains', display: 'Not contains' },
        { id: 3, name: 'equals', display: 'Equals' },
        { id: 4, name: 'notEqual', display: 'Not equal' },
        { id: 5, name: 'startsWith', display: 'Starts with' },
        { id: 6, name: 'endsWith', display: 'Ends with' },
    ];
}

export function filterOptionsNumber() {
    return [
        { id: 1, name: 'contains', display: 'Contains' },
        { id: 2, name: 'notContains', display: 'Not contains' },
        { id: 3, name: 'equals', display: 'Equals' },
        { id: 4, name: 'notequal', display: 'Not equal' },
        { id: 5, name: 'lessthan', display: 'Less than' },
        { id: 6, name: 'greaterthan', display: 'Greater than' },
        { id: 7, name: 'lessthanorequal', display: 'Less than or equals' },
        { id: 8, name: 'greaterthanorequal', display: 'Greater than or equals' },
        { id: 9, name: 'inrange', display: 'In range' },
    ];
}

export function filterOptionsDate() {

    return [
        { id: 1, name: 'equals', display: 'Equals' },
        { id: 2, name: 'greaterthan', display: 'Greater than' },
        { id: 3, name: 'lessthan', display: 'Less than' },
        { id: 4, name: 'Notequal', display: 'Not equal' },
        { id: 5, name: 'inrange', display: 'In range' },
    ];
}

export function handleColumnResize(event: any, displaycols: any) {
    const resizedElement = event.element.cellIndex;

    if (event.element?.attributeStyleMap?.size == 1) {
        const parentId = parseInt(event.element?.dataset?.parentId || '0', 10);
        let i = displaycols.findIndex((k: any) => k.isChildren && k.parent === parentId)
        let column = displaycols[i];
        column.width = (parseInt(column.width.replace('px', '')) + event.delta) + 'px';

        let column1 = displaycols[resizedElement];
        column1.width = (parseInt(column.width.replace('px', '')) - event.delta) + 'px';
        return;
    }
}

export function commonColumnsFn(cols: any, colsshow: any) {

    cols.forEach((col: any) => {
        if (col.isChildren) {

            const closedColumns = cols.filter((item: any) => item.parent === col.parent && item.columnGroupShow === 'close');
            col.colspan = closedColumns.length;
            if (cols.filter((item: any) => item.parent === col.parent && item.displayCheckboxColumns).length === 1 ||
                colsshow.filter((item: any) => item.parent === col.parent && item.columnGroupShow === 'open').length === 0) {
                col.isToggle = false;
            } else {
                col.isToggle = true;
            }

            if (cols.filter((item: any) => item.parent === col.parent && item.displayCheckboxColumns).length === 0) {
                col.isParentVisible = false;
            } else {
                col.isParentVisible = true;
            }

            col.Parentwidth = closedColumns.map((value: any) => parseInt(value.width.replace('px', ''))).reduce(
                (accumulator: any, currentValue: any) => accumulator + currentValue, 0) + 'px';
        }
    });
    return cols.filter((col: any) => col.columnGroupShow == 'close');
}

export function onChangeEndDate(e: any, fromFront = true) {

    const date = new Date(e);
    if (isNaN(date.getTime())) {
        return '';
    }
    if (date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        if (fromFront) {
            return `${day}-${month}-${year}`
        } else {
            return `${year}-${month}-${day}`;
        }
    } else {
        return '';
    }
}

export function extractData(item: any) {
    const fields = Object.keys(item);
    return fields.reduce((acc: any, field: any) => {
        acc[field] = item[field];
        return acc;
    }, {});
}

export function extractDataAndLeaf(item: any) {
    return {
        data: extractData(item),
        leaf: !item.HasParent,
    };
}

export function extractDataPtable(item: any) {
    return {
        data: extractData(item),
    };
}

export function nodeUnselect(e: any, cols: any, selectedFiles: any) {
    return cols.forEach((item: any) => {
        if (e.node.isparent && item.parent === e.node.parentid) {
            item.columnGroupShow = 'open';
            item.displayCheckboxColumns = false;
        } else if (!e.node.isparent && item.parent === e.node.parentid && item.childHeader === e.node.label) {

            item.columnGroupShow = 'open';
            item.displayCheckboxColumns = false;

            if (!cols.some((it: any) => it.parent === e.node.parentid && it.displayCheckboxColumns)) {
                item.isParentVisible = false;
            } else {
                item.isParentVisible = true;
                if (!cols.some((it: any) => it.parent === e.node.parentid && it.columnGroupShow === 'close')) {

                    for (let child of e.node.parent.children) {
                        if (selectedFiles.includes(child)) {
                            let i = cols.findIndex((k: any) => k.parent === e.node.parentid && k.childHeader === child.label)
                            if (i !== -1) {
                                cols[i].columnGroupShow = 'close';
                            }
                            return;
                        }
                    }
                }
            }
        }
    });
}