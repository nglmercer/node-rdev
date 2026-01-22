import {startListener} from '../index'

startListener((data) => {
    console.log(data)
    return data
})