'use strict'

const seneca = require('seneca')()
const torch = require('torch')
const mathjs = require('mathjs')
const async = require('async')
const Big = require('big.js')

mathjs.config({
  number: 'BigNumber',
  precision: 20
})

const math = (expr) => mathjs.eval(expr).toString()

seneca.add({role: 'math', cmd: 'sum'},
  function ({left, right}, respond) {
    respond(null, {answer: left + right})
})

seneca.add({role: 'math', cmd: 'sum-bignum'},
  function ({left, right}, respond) {
    let expr = `${left} + ${right}`
    let answer = math(expr)
    respond(null, {answer})
})

seneca.add({role: 'math', cmd: 'sum-bigjs'},
  function ({left, right}, respond) {
    let answer = new Big(left).plus(right)
    respond(null, {answer})
})

function senBigNum(next) {
  console.time('Seneca Math.js')
  async.times(400,
    (index, next) =>
      seneca.act({role: 'math', cmd: 'sum-bignum', left: '0.1', right: '0.2'}, next),
    (err, results) => {
      if (err) return torch.red(err)
      console.timeEnd('Seneca Math.js')
      next(err, results)
    }
  )
}

function senBigJs(next) {
  console.time('Seneca Big.js')
  async.times(400,
    (index, next) =>
      seneca.act({role: 'math', cmd: 'sum-bigjs', left: '0.1', right: '0.2'}, next),
    (err, results) => {
      if (err) return torch.red(err)
      console.timeEnd('Seneca Big.js')
      next(err, results)
    }
  )
}

function senFloat(next) {
  console.time('Seneca Float')
  async.times(400,
    (index, next) =>
      seneca.act({role: 'math', cmd: 'sum', left: 0.1, right: 0.2}, next),
    (err, results) => {
      if (err) return torch.red(err)
      console.timeEnd('Seneca Float')
      next(err, results)
    }
  )
}

function asyncBigNum(next) {
  console.time('Async Math.js')
  async.times(400,
    (index, next) => next(null, math('0.1 + 0.2')),
    (err, results) => {
      console.timeEnd('Async Math.js')
      next(err, results)
    }
  )
}

function asyncBigJs(next) {
  console.time('Async BigJs')
  async.times(400,
    (index, next) => next(null, new Big('0.2').plus('0.1')),
    (err, results) => {
      console.timeEnd('Async BigJs')
      next(err, results)
    }
  )
}

function asyncFloat(next) {
  console.time('Async Float')
  async.times(400,
    (index, next) => next(null, 0.1 + 0.2),
    (err, results) => {
      console.timeEnd('Async Float')
      next(err, results)
    }
  )
}

async.series([
  senBigNum,
  senFloat,
  senBigJs,
  asyncBigNum,
  asyncFloat,
  asyncBigJs,
], (err, results) => {

  console.time('Raw Math.js')
  let bignums = []
  for (let i=0; i<400; i++) {
    bignums.push(math('0.1 + 0.2'))
  }
  console.timeEnd('Raw Math.js')



  console.time('Raw Float')
  let floats = []
  for (let i=0; i<400; i++) {
    floats.push(0.1 + 0.2)
  }
  console.timeEnd('Raw Float')



  let bd = require('bigdecimal')
  console.time('Raw BigDecimal')
  let bds = []
  for (let i=0; i<400; i++) {
    bds.push(bd.BigDecimal('0.1').add(bd.BigDecimal('0.2')))
  }
  console.timeEnd('Raw BigDecimal')



  console.time('Raw big.js')
  let bigs = []
  for (let i=0; i<400; i++) {
    bigs.push(new Big(0.2).plus(0.1))
  }
  console.timeEnd('Raw big.js')



  let Decimal = require('decimal.js')
  console.time('Raw decimal.js')
  let decimals = []
  for (let i=0; i<400; i++) {
    decimals.push(new Decimal(0.2).plus(0.1))
  }
  console.timeEnd('Raw decimal.js');






  let calcs = {bignums, floats, bds, bigs, decimals}
  for (let k in calcs) {
    torch.green(k, calcs[k][0].toString())
  }
})
