const fs = require('fs')
const { getEDC } = require('./edc')
const { getECC } = require('./ecc')

// 用法示例
const romFile = 'AV Tanjou (Japan).iso'
const romBuffer = fs.readFileSync(romFile)
const newROMBuffer = updateROMEDCandECC(romBuffer)
fs.writeFileSync(`new_${romFile}`, newROMBuffer)

function updateROMEDCandECC(romBuffer) {
    console.log('开始更新 ROM EDC 和 ECC...')
    const newROMBuffer = Buffer.from(romBuffer)
    const totalSectors = Math.floor(newROMBuffer.length / 2352)
    for (let i = 0; i < newROMBuffer.length; i += 2352) {
        const sectorIdx = i / 2352
        if (sectorIdx % 1000 === 0) {
            console.log(`正在处理第 ${sectorIdx + 1} / ${totalSectors} 个扇区...`)
        }
        const sectorBuffer = newROMBuffer.subarray(i, i + 2352)
        const needUpdate = isMode1Sector(sectorBuffer)
        if (needUpdate) {
            const newSectorBuffer = updateSectorEDCandECC(sectorBuffer)
            newSectorBuffer.copy(newROMBuffer, i)
        }
    }
    console.log('ROM EDC 和 ECC 更新完成。')
    return newROMBuffer
}

function isMode1Sector(sectorBuffer) {
    // 根据前 12 字节是否为同步字节，且第 16 字节给定的 2352 字节是否为 01 判断是否为需要计算 EDC 和 ECC 的扇区
    const syncBytes = sectorBuffer.subarray(0, 12)
    const modeByte = sectorBuffer[15]
    const isSyncBytes = syncBytes.equals(Buffer.from([0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]))
    return isSyncBytes && modeByte === 0x01
}

function updateSectorEDCandECC(sectorBuffer) {
    // 复制 sectorBuffer，避免原地修改
    // sectorBuffer = Buffer.from(sectorBuffer)

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