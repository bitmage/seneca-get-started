'use strict'

const seneca = require('seneca')()
const torch = require('torch')

seneca.use('entity')
seneca.use('riak-store', {nodes: ['127.0.0.1:8098']})

seneca.ready(function() {

  let apple = seneca.make$('fruit')
  apple.name  = 'Pink Lady'
  apple.price = 0.99

  torch.cyan('saving:', {apple})
  apple.save$(function (err, apple) {
    torch.cyan({err, apple})

    seneca.make$('fruit').load$({id: apple.id}, torch.white)
  })
})
