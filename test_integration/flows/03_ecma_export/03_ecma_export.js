export const ecma1 = (a, b) => a + b;

const ecma2 = b => b * 3;

const ecma33 = a => a / 2;
const ecma4 = a => a / 4;

export { ecma33 as ecma3, ecma4 };

export default ecma2;
