const fs = require('fs')
const { getEDC } = require('./edc')
const { getECC } = require('./ecc')

// 用法示例
const buffer = fs.readFileSync('sector.bin')
const edcBuffer = getEDC(buffer)
const eccBuffer = getECC(buffer)

// 校验 EDC 结果
console.log(edcBuffer)
const edcGT = buffer.subarray(16 + 2048, 16 + 2048 + 4)  // E5 FA 31 CB
isEqual = Buffer.compare(edcBuffer, edcGT) === 0
console.log(isEqual ? 'EDC 正确' : 'EDC 错误')

// 校验 ECC 结果
console.log(eccBuffer)
const eccGT = buffer.subarray(16 + 2048 + 4 + 8)
isEqual = Buffer.compare(eccBuffer, eccGT) === 0
console.log(isEqual ? 'ECC 正确' : 'ECC 错误')
