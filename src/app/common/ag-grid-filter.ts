
// Filter processing functions
export function processDateFilter(key: string, data: any) {
    const getDateValue = (dateValue: any) => {
      return dateValue && dateValue !== null ? dateValue.split(' ')[0].toString() : null;
    };
  
    return {
      filterKey: key,
      filterOptionType1: data['type'] ? data['type'] : data['condition1']?.type ? data['condition1'].type : null,
      filterOptionValue1: getDateValue(data?.dateFrom) || getDateValue(data['condition1']?.dateFrom) || null,
      filterOptionValue1_2: getDateValue(data?.dateTo) || getDateValue(data['condition1']?.dateTo) || null,
      filterOperationType: data['operator'] ? data['operator'] : 'AND',
      filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
      filterOptionValue2: getDateValue(data['condition2']?.dateFrom) || null,
      filterOptionValue2_2: getDateValue(data['condition2']?.dateTo) || null
    };
}
  
export function processNumberFilter(key: string, data: any) {
    return {
      filterKey: key,
      filterOptionType1: data['type'] ? data['type'] : data['condition1']?.type ? data['condition1'].type : null,
      filterOptionValue1: data['filter'] != null ? data['filter'] : data['condition1']?.filter != null ? data['condition1'].filter : null,
      filterOptionValue1_2: data['filterTo'] != null ? data['filterTo'] : data['condition1']?.filterTo != null ? data['condition1'].filterTo : null,
      filterOperationType: data['operator'] ? data['operator'] : 'AND',
      filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
      filterOptionValue2: data['condition2']?.filter != null ? data['condition2'].filter : null,
      filterOptionValue2_2: data['condition2']?.filterTo != null ? data['condition2'].filterTo : null
    };
}
  
export function processTextFilter(key: string, data: any) {
    return {
      filterKey: key,
      filterOptionType1: data['type'] ? data['type'] : data['condition1']?.type ? data['condition1'].type : null,
      filterOptionValue1: data['filter'] ? data['filter'] : data['condition1']?.filter ? data['condition1'].filter : null,
      filterOperationType: data['operator'] ? data['operator'] : 'AND',
      filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
      filterOptionValue2: data['condition2']?.filter ? data['condition2']?.filter : null
    };
}
  
  