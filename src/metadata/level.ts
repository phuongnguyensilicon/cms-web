export const accountLevels = (): any[] => {
  let result: any[] = [];
  let score = 0;
  let pointRequired = 0;
  for(let index = 0; index <= 50; index ++) {
    if (index == 0) {
      score = 0;
      pointRequired = 0;
    } else {
      pointRequired = Math.round(100 * Math.pow(1.1, index - 1));
      score += pointRequired;
    } 
    const item = {
      level: index,
      score: score,
    };

    result.push(item);
  }
  return result;
}