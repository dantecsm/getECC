const fs = require('fs')
const { getEDC } = require('./edc')
const { getECC } = require('./ecc')

const sectorBuffer = fs.readFileSync('tests/sector2.bin')
const edcBuffer = getEDC(sectorBuffer)
const eccBuffer = getECC(sectorBuffer)

const edcGT = sectorBuffer.subarray(16 + 2048, 16 + 2048 + 4)
isEqual = Buffer.compare(edcBuffer, edcGT) === 0
console.log(isEqual ? 'EDC 正确' : 'EDC 错误')

const eccGT = sectorBuffer.subarray(16 + 2048 + 4 + 8)
isEqual = Buffer.compare(eccBuffer, eccGT) === 0
console.log(isEqual ? 'ECC 正确' : 'ECC 错误')
