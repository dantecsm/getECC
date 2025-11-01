const { RS } = require('./rs')

function getECC(sectorBuffer) {
    const inputBuffer = sectorBuffer.subarray(12, 12 + 2064)
    const PParityBuffer = getPParity(inputBuffer)
    const QParityBuffer = getQParity(Buffer.concat([inputBuffer, PParityBuffer]))
    const eccBuffer = Buffer.concat([PParityBuffer, QParityBuffer])
    return eccBuffer
}

// groups = [
//     { idx: 0, pos: "LSB", input: 24 字节 buffer, output: 2 字节 buffer },  // 第 1 组左边
//     { idx: 0, pos: "MSB", input: 24 字节 buffer, output: 2 字节 buffer }   // 第 1 组右边
//     ...
//     { idx: 85, pos: "LSB", input: 24 字节 buffer, output: 2 字节 buffer },  // 第 86 组左边
//     { idx: 85, pos: "MSB", input: 24 字节 buffer, output: 2 字节 buffer }   // 第 86 组右边
//     ]
function getPParity(inputBuffer) {
    const groups = getPParityGroups(inputBuffer)
    groups.forEach(group => {
        group.output = RS(26, 24, group.input)
    })
    const result = []
    groups.forEach(group => {
        result.push(group.output[0])
    })
    groups.forEach(group => {
        result.push(group.output[1])
    })
    return Buffer.from(result)
}

function getPParityGroups(inputBuffer) {
    if (inputBuffer.length !== 2064) {
        throw new Error`计算 P-Parity 的字节数应等于 2064，实际 ${inputBuffer.length}`
    }
    const groups = []
    for (let i = 0; i < 43; i++) {
        groups.push({ idx: i, pos: "LSB", input: [], output: [] })
        groups.push({ idx: i, pos: "MSB", input: [], output: [] })
    }
    let curIdx = 0
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 86; j++) {
            const group = groups[j]
            group.input[i] = inputBuffer[curIdx]
            curIdx += 1
        }
    }
    groups.forEach(group => group.input = Buffer.from(group.input))
    return groups
}

// groups = [
//     { idx: 0, pos: "LSB", input: 43 字节 buffer, output: 2 字节 buffer },  // 第 1 组左边
//     { idx: 0, pos: "MSB", input: 43 字节 buffer, output: 2 字节 buffer }   // 第 1 组右边
//     ...
//     { idx: 25, pos: "LSB", input: 43 字节 buffer, output: 2 字节 buffer },  // 第 26 组左边
//     { idx: 25, pos: "MSB", input: 43 字节 buffer, output: 2 字节 buffer }   // 第 26 组右边
//     ]
function getQParity(inputBuffer) {
    const groups = getQParityGroups(inputBuffer)
    groups.forEach(group => {
        group.output = RS(45, 43, group.input)
    })
    const result = []
    groups.forEach(group => {
        result.push(group.output[0])
    })
    groups.forEach(group => {
        result.push(group.output[1])
    })
    return Buffer.from(result)
}

function getQParityGroups(inputBuffer) {
    if (inputBuffer.length !== 2236) {
        throw new Error`计算 Q-Parity 的字节数应等于 2236，实际 ${inputBuffer.length}`
    }
    const groups = []
    for (let i = 0; i < 26; i++) {
        groups.push({ idx: i, pos: "LSB", input: [], output: [] })
        groups.push({ idx: i, pos: "MSB", input: [], output: [] })
    }
    // 52 组对角线，每组 43 字节
    for (let i = 0; i < 26; i++) {
        for (let j = 0; j < 43; j++) {
            const group0 = groups[i * 2]
            const group1 = groups[i * 2 + 1]
            const index = (i * 43 + j * 44) * 2 % 2236
            group0.input.push(inputBuffer[index])
            group1.input.push(inputBuffer[index + 1])
        }
    }
    groups.forEach(group => group.input = Buffer.from(group.input))
    return groups
}

// 用法示例
// const fs = require('fs')
// const buffer = fs.readFileSync('sector.bin')
// const eccBuffer = getECC(buffer)
// 校验
// console.log(eccBuffer)
// const eccGT = buffer.subarray(16 + 2048 + 4 + 8)
// isEqual = Buffer.compare(eccBuffer, eccGT) === 0
// console.log(isEqual ? 'ECC 正确' : 'ECC 错误')


module.exports = {
    getECC
}
