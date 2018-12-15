const bn128 = require("snarkjs").bn128;
const bigInt = require("snarkjs").bigInt;
const Web3 = require("web3");
const F = bn128.Fr;

const SEED = "iden3_mimc";
const nRounds = 91;


exports.getConstants = (seed, nRounds) => {
    const cts = new Array(nRounds);
    let c = Web3.utils.keccak256(SEED);
    for (let i=1; i<nRounds; i++) {
        c = Web3.utils.keccak256(c);

        const n1 = Web3.utils.toBN(c).mod(Web3.utils.toBN(F.q.toString()));
        const c2 = Web3.utils.padLeft(Web3.utils.toHex(n1), 64);
        cts[i] = bigInt(Web3.utils.toBN(c2).toString());
    }
    cts[0] = bigInt(0);
    return cts;
};

const cts = exports.getConstants(SEED, 91);

exports.hash =  (_x_in, _k) =>{
    const x_in = bigInt(_x_in);
    const k = bigInt(_k);
    let r;
    for (let i=0; i<nRounds; i++) {
        const c = cts[i];
        const t = (i==0) ? F.add(x_in, k) : F.add(F.add(r, k), c);
        r = F.exp(t, 7);
    }
    return F.affine(F.add(r, k));
};