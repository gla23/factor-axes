export const factorable = new Set<number>();

function addMultiples(factor: number) {
  factorable.add(factor);
  factorable.forEach((number) => {
    let i = number * factor;
    if (factorable.has(i)) return;
    while (i < 2000) {
      factorable.add(i);
      i = i * factor;
    }
  });
}

addMultiples(2);
addMultiples(3);
addMultiples(5);

const ans: number[][] = [];

factorable.forEach((num) => {
  const ten = Math.floor(num / 10);
  if (!ans[ten]) ans[ten] = [];
  ans[ten].push(num);
});

ans.forEach((group, index) => {
  ans[index].sort((a, b) => a - b);
});
