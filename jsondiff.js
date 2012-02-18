#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var log = console.log;
var exit = process.exit;
var ins = util.inspect;

function getKeysSorted(obj) {
  var keys = [];
  for (var k in obj) {
    if (obj.hasOwnProperty(k))
      keys.push(k);
  }
  return keys.sort(function (a, b) { return a > b; });
}

function twoDee(m, n) {
  var c = [];
  for (var i = 0; i < m; i++) {
    c[i] = [];
    for (var j = 0; j < n; j++)
      c[i][j] = 0;
  }
  return c;
}

function makeLCSArray(x, y) { /*X[1..m], Y[1..n]*/
  var c = twoDee(x.length + 1, y.length + 1);
  for (var i = 0; i < x.length; i++) {
    for (var j = 0; j < y.length; j++) {
      if (x[i] === y[j]) {
        c[i + 1][j + 1] = c[i][j] + 1;
      } else {
        var m = Math.max(c[i + 1][j], c[i][j + 1]);
        c[i + 1][j + 1] = m;
      }
    }
  }
  return c;
}

function whatis(x) {
  if (x === null)
    return 'null';
  if (x === undefined)
    return 'undefined';
  var tof = typeof (x);
  if (tof === 'number' || tof === 'string' || tof === 'boolean')
    return 'scalar';
  if (tof === 'object') {
    if (x.constructor === Array) {
      return 'array';
    } else {
      return 'object';
    }
  }
  return 'unknown';
}

function makeArrayKeys(a) {
  var k = [];
  for (var i = 0; i < a.length; i++)
    k.push(i);
  return k;
}

function objectDiff(a, b) {
  var keysA, keysB;
  var typeA = whatis(a);
  var typeB = whatis(b);
  var list = [];
  if (typeA !== typeB) {
    log('ERROR: top level types should be the same: had ' + typeA +
      ' and ' + typeB);
    return null;
  }
  var keyFunc = typeA === 'array' ? makeArrayKeys : getKeysSorted;
  keysA = keyFunc(a);
  keysB = keyFunc(b);
  var cc = makeLCSArray(keysA, keysB);

  function diffInternal(c, x, y, i, j) {
    if (i > 0 && j > 0 && x[i - 1] === y[j - 1]) {
      diffInternal(c, x, y, i - 1, j - 1);
      var key = x[i - 1];
      var va = a[key];
      var vb = b[key];
      var wva = whatis(va);
      var wvb = whatis(vb);
      if (wva === wvb && (wva === 'object' || wva === 'array')) {
        list.push({
          key: key,
          type: wva,
          action: 'common',
          diff: objectDiff(va, vb)
        });
      } else if (va === vb) {
        list.push({
          action: 'common',
          key: key,
          type: wva,
          value: va
        });
      } else {
        var orem = {
          action: 'remove',
          key: key,
          type: wva,
          value: va
        };
        if (orem.type === 'object')
          orem.diff = objectDiff(orem.value, {});
        else if (orem.type === 'array')
          orem.diff = objectDiff(orem.value, []);
        list.push(orem);

        var oadd = {
          action: 'add',
          key: key,
          type: wvb,
          value: vb
        };
        if (oadd.type === 'object')
          oadd.diff = objectDiff({}, oadd.value);
        else if (oadd.type === 'array')
          oadd.diff = objectDiff([], oadd.value);
        list.push(oadd);
      }
    } else {
      if (j > 0 && (i === 0 || c[i][j - 1] >= c[i - 1][j])) {
        diffInternal(c, x, y, i, j - 1);
        var key = y[j - 1];
        var o = {
          action: 'add',
          key: key,
          type: whatis(b[key]),
        };
        if (o.type === 'object')
          o.diff = objectDiff({}, b[key]);
        else if (o.type === 'array')
          o.diff = objectDiff([], b[key]);
        else
          o.value = b[key];
        list.push(o);
      } else if (i > 0 && (j === 0 || c[i][j - 1] < c[i - 1][j])) {
        diffInternal(c, x, y, i - 1, j);
        var key = x[i - 1];
        var o = {
          action: 'remove',
          key: key,
          type: whatis(a[key]),
        };
        if (o.type === 'object')
          o.diff = objectDiff(a[key], {});
        else if (o.type === 'array')
          o.diff = objectDiff(a[key], []);
        else
          o.value = a[key];
        list.push(o);
      }
    }
  }
  diffInternal(cc, keysA, keysB, cc.length - 1, cc[0].length - 1);
  return list;
}


function printDiff(a, topType) {
  var ind = 1;
  function indent() {
    var s = '';
    while (s.length < ind * 2)
      s += ' ';
    return s;
  }

  function recurs(a) {
    for (var i = 0; i < a.length; i++) {
      function comma() { return ((i + 1 < a.length) ? ',' : ''); }
      var o = a[i];
      var ch = o.action === 'add'    ? '+' :
               o.action === 'remove' ? '-' : ' ';
      if (o.type === 'object' || o.type === 'array') {
        var del = o.type === 'object' ? ['{', '}'] : ['[', ']'];
        log(ch + indent() + o.key + ': ' + del[0]);
        ind++;
        recurs(o.diff);
        ind--;
        log(ch + indent() + del[1] + comma());
      } else {
        log(ch + indent() + o.key + ': ' + JSON.stringify(o.value) + comma());
      }
    }
  }

  log(topType === 'object' ? '{' : '[');
  recurs(a);
  log(topType === 'object' ? '}' : ']');
}

/**************************************************************************
 * MAIN PROGRAM                                                           *
 **************************************************************************/

if (process.argv.length < 4) {
  log('Usage: ' + process.argv[1] + ' <jsonfile1> <jsonfile2>');
  exit(1);
}

try {
  var left = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  var right = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
} catch (err) {
  log('ERROR: while reading input files: ' + err.message);
  exit(2);
}

var od = objectDiff(left, right);
  printDiff(od, whatis(left));
exit(0);
