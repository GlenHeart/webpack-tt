import * as _ from 'lodash';
import(/* webpackChunkName: 'subPageA' */'./subPageA').then(function(res){
    console.log('import()', res)
})
import(/* webpackChunkName: 'subPageB' */'./subPageB').then(function(res){
    console.log('import()', res)
})

console.log('this is pageA');
export default 'pageA';