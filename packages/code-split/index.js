import { a } from './moduleB'
a() 
import('./module').then((res) => {
  console.log(res, 'fuck you')
})
