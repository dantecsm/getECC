const fs = require('fs')
const { getEDC } = require('./edc')
const { getECC } = require('./ecc')

// 用法示例
const sectorBuffer = fs.readFileSync('tests/sector2.bin')
const newSectorBuffer = setEDCAndECC(sectorBuffer)

// 校验 EDC&ECC 结果
isEqual = Buffer.compare(newSectorBuffer, sectorBuffer) === 0
console.log(isEqual ? 'EDC&ECC 正确' : 'EDC&ECC 错误')

function setEDCAndECC(sectorBuffer) {
    sectorBuffer = Buffer.from(sectorBuffer)

    // 计算 edc 并填入 sectorBuffer 中
    const edcBuffer = getEDC(sectorBuffer)
    edcBuffer.copy(sectorBuffer, 16 + 2048)
    // 在 edc 后面填入 8 个 00
    const intermediateBuffer = Buffer.alloc(8)
    intermediateBuffer.fill(0)
    intermediateBuffer.copy(sectorBuffer, 16 + 2048 + 4)

    // ecc 计算的输入包含 edc 范围，所以需要先算 edc
    // 计算 ecc并填入 sectorBuffer 中
    const eccBuffer = getECC(sectorBuffer)
    eccBuffer.copy(sectorBuffer, 16 + 2048 + 4 + 8)
    return sectorBuffer
}