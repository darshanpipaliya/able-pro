export function isValuesUndefined(value: any) {
  if (value === undefined || value === 'undefined') {
    return true;
  } else {
    return false;
  }
}

export function isValueExist(value: any, needToNull = false) {
  if (value !== null && value !== 'null' && value !== undefined && value !== 'undefined' && value !== '') {
    return value;
  } else {
    return needToNull ? null : '';
  }
}

export function checkIsValueExists(value: any) {
  if (value !== null && value !== 'null' && value !== undefined && value !== 'undefined' && value !== '' && value !== false && value !== 'false') {
    return true;
  } else {
    return false;
  }
}

export function checkIsValueExistswithZero(value: any) {
  if (value !== null && value !== 'null' && value !== undefined && value !== 'undefined' && value !== '' && value !== false && value !== 'false' && value !== 0 && value !== '0') {
    return true;
  } else {
    return false;
  }
}

export function setObjectValue(value: any, id: any, needToNull = false) {
  if (value !== null && value !== 'null' && value !== undefined && value !== 'undefined' && value !== '' && value !== false && value !== 'false') {
    return value[id];
  } else {
    return needToNull ? null : '';
  }
}

export function rolePermission(roles: any) {
  return roles.some((item: any) => JSON.parse(localStorage.getItem('userRoles') || '[]')?.indexOf(item) >= 0)
}

export function uniqBy(arr: any, predicate: any) {
  const cb = typeof predicate === 'function' ? predicate : (o: any) => o[predicate];
  return [...arr.reduce((map: any, item: any) => {
    const key = (item === null || item === undefined) ?
      item : cb(item);

    map.has(key) || map.set(key, item);

    return map;
  }, new Map()).values()];
};
