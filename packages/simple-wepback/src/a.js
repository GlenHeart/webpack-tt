import { b } from './b.js'

export function a () {
  import('./common.js').then(c => {
    console.log(c, 'b')
  })
  console.log(b, 'a')
}