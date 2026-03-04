/**
 * Simple seeded random number generator (sfc32)
 */
export const createRNG = (seed: string) => {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  let a = h >>> 0;
  let b = (Math.imul(h, 21) ^ 0x01) >>> 0;
  let c = (Math.imul(h, 432) ^ 0x03) >>> 0;
  let d = (Math.imul(h, 7654) ^ 0x05) >>> 0;

  return () => {
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
};

export const rollDie = (rng: () => number, sides = 6) => {
  return Math.floor(rng() * sides) + 1;
};

export const rollDice = (rng: () => number, count: number, sides = 6) => {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(rng, sides));
  }
  return rolls;
};
