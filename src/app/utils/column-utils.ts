export interface ColumnDefinition {
  parent: number;
  isicon: number;
  width: string;
  valuesset: null;
  isenable: boolean;
  isChildren: boolean;
  type: string;
  header: string;
  columnGroupShow: string;
  field: string;
  childHeader: string;
  colspan: number;
  parentWidth: number;
  isParentVisible: boolean;
  displayCheckboxColumns: boolean;
  isToggle: boolean;
}

export const createColumn = (
  parent: number,
  width: string,
  isChildren: boolean,
  type: string,
  header: string,
  field: string,
  childHeader: string,
  columnGroupShow: string = 'close',
  colspan: number = 1,
  parentWidth: number = 150,
  isParentVisible: boolean = true,
  displayCheckboxColumns: boolean = true,
  isToggle: boolean = true
): ColumnDefinition => ({
  parent,
  isicon: 1,
  width,
  valuesset: null,
  isenable: false,
  isChildren,
  type,
  header,
  columnGroupShow,
  field,
  childHeader,
  colspan,
  parentWidth,
  isParentVisible,
  displayCheckboxColumns,
  isToggle
}); 