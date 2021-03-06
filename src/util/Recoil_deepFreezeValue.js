/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Deep freeze values. Do not descend into React elements, Immutable structures,
 * or in general things that respond poorly to being frozen. Follows the
 * implementation of deepFreezeValue.
 *
 * @emails oncall+comparison_view
 * @flow strict-local
 * @format
 */
'use strict';

const isNode = require('./Recoil_isNode');
const isPromise = require('./Recoil_isPromise');

function shouldNotBeFrozen(value: mixed): boolean {
  // Primitives and functions:
  if (value === null || typeof value !== 'object') {
    return true;
  }

  // React elements:
  switch (typeof value.$$typeof) {
    case 'symbol':
      return true;
    case 'number':
      return true;
  }

  // Immutable structures:
  if (
    value['@@__IMMUTABLE_ITERABLE__@@'] != null ||
    value['@@__IMMUTABLE_KEYED__@@'] != null ||
    value['@@__IMMUTABLE_INDEXED__@@'] != null ||
    value['@@__IMMUTABLE_ORDERED__@@'] != null ||
    value['@@__IMMUTABLE_RECORD__@@'] != null
  ) {
    return true;
  }

  // DOM nodes:
  if (isNode(value)) {
    return true;
  }

  if (isPromise(value)) {
    return true;
  }

  return false;
}

// Recursively freeze a value to enforce it is read-only.
// This may also have minimal performance improvements for enumerating
// objects (based on browser implementations, of course)
function deepFreezeValue(value: mixed) {
  if (typeof value !== 'object' || shouldNotBeFrozen(value)) {
    return;
  }

  Object.freeze(value); // Make all properties read-only
  for (const prop in value) {
    if (value.hasOwnProperty(prop)) {
      deepFreezeValue(value[prop]);
    }
  }
  Object.seal(value); // This also makes existing properties non-configurable.
}

module.exports = deepFreezeValue;
