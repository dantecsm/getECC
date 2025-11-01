// -----------------------------------------------------------
// Reed-Solomon (26,24) encoder over GF(2^8)
// Primitive polynomial: x^8 + x^4 + x^3 + x^2 + 1  (0x11D)
// Primitive element α = 0x02
// -----------------------------------------------------------

// 生成 GF(2^8) 的指数表和对数表
const GF_SIZE = 256;
const PRIMITIVE = 0x11D;  // x^8 + x^4 + x^3 + x^2 + 1

const gf_exp = new Uint8Array(512);
const gf_log = new Uint8Array(256);

let x = 1;
for (let i = 0; i < 255; i++) {
    gf_exp[i] = x;
    gf_log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= PRIMITIVE;
}
for (let i = 255; i < 512; i++) {
    gf_exp[i] = gf_exp[i - 255];
}

// 有限域加法（异或）
function gfAdd(a, b) {
    return a ^ b;
}

// 有限域乘法
function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return gf_exp[gf_log[a] + gf_log[b]];
}

// 有限域除法
function gfDiv(a, b) {
    if (b === 0) throw new Error("Division by zero");
    if (a === 0) return 0;
    return gf_exp[(gf_log[a] + 255 - gf_log[b]) % 255];
}

// -----------------------------------------------------------
// 构造生成多项式 G(x) = (x - α^1)(x - α^2)
function rsGeneratorPoly(t = 2) {
    let g = [1];
    for (let i = 0; i < t; i++) {
        const term = [1, gf_exp[i]]; // (x - α^i)
        g = polyMul(g, term);
    }
    return g;
}

function polyMul(p, q) {
    const r = new Uint8Array(p.length + q.length - 1);
    for (let i = 0; i < p.length; i++) {
        for (let j = 0; j < q.length; j++) {
            r[i + j] ^= gfMul(p[i], q[j]);
        }
    }
    return Array.from(r);
}

// -----------------------------------------------------------
// RS(n, k) 编码器：第 1 参数 n，总码长；第 2 参数 k，信息码长；第 3 参数 dataBytes，输入数据是 k 长度的 buffer，输出是 n - k 长度的 buffer
function RS(n, k, dataBytes) {
    if (dataBytes.length !== k) throw new Error(`Expect ${k}-byte input`);

    const npar = n - k;
    const gen = rsGeneratorPoly(npar);
    const parity = new Uint8Array(npar);

    for (let i = 0; i < dataBytes.length; i++) {
        const feedback = dataBytes[i] ^ parity[0];
        // 左移 parity
        for (let j = 0; j < npar - 1; j++) {
            parity[j] = parity[j + 1] ^ gfMul(feedback, gen[j + 1]);
        }
        parity[npar - 1] = gfMul(feedback, gen[npar]);
    }

    return Uint8Array.from(parity);
}


module.exports = {
    RS,
}
