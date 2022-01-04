const { SyncHook } = require('tapable')

const hook = new SyncHook(['name'])
hook.tap('hello', (name) => {
  console.log(`hello ${name}`)
})
hook.call('111')