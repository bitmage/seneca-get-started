macro + {
  rule infix { $l:expr | $r:expr } => { Big($l).plus($r) }
}
macro - {
  rule infix { $l:expr | $r:expr } => { Big($l).minus($r) }
}

var Big = require('big.js')

console.log(0.2 + 0.1);
console.log(5 - 3);
