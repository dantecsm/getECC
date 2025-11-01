const fs = require('fs')
const { getECC } = require('./ecc')

// 用法示例
const buffer = fs.readFileSync('sector.bin')
const eccBuffer = getECC(buffer)

// 校验
console.log(eccBuffer)
const eccGT = buffer.subarray(16 + 2048 + 4 + 8)
isEqual = Buffer.compare(eccBuffer, eccGT) === 0
console.log(isEqual ? 'ECC 正确' : 'ECC 错误')
