const { classifyWeather, worstWeather, calcForecast, DEFAULT_COEFFICIENTS } = require('./app.js');

function assert(cond, msg) {
  console.log((cond ? 'PASS' : 'FAIL') + ': ' + msg);
  if (!cond) process.exitCode = 1;
}

// classifyWeather
assert(classifyWeather(0) === 'sunny',  'code 0 → sunny');
assert(classifyWeather(1) === 'sunny',  'code 1 → sunny');
assert(classifyWeather(2) === 'cloudy', 'code 2 → cloudy');
assert(classifyWeather(3) === 'cloudy', 'code 3 → cloudy');
assert(classifyWeather(45) === 'cloudy','code 45 → cloudy');
assert(classifyWeather(48) === 'cloudy','code 48 → cloudy');
assert(classifyWeather(51) === 'rainy', 'code 51 → rainy');
assert(classifyWeather(67) === 'rainy', 'code 67 → rainy');
assert(classifyWeather(80) === 'rainy', 'code 80 → rainy');
assert(classifyWeather(82) === 'rainy', 'code 82 → rainy');
assert(classifyWeather(71) === 'stormy','code 71 → stormy');
assert(classifyWeather(77) === 'stormy','code 77 → stormy');
assert(classifyWeather(95) === 'stormy','code 95 → stormy');
assert(classifyWeather(99) === 'stormy','code 99 → stormy');

// worstWeather
assert(worstWeather([0, 1, 0])   === 'sunny',  'all sunny → sunny');
assert(worstWeather([0, 2, 3])   === 'cloudy', 'mix with cloudy → cloudy');
assert(worstWeather([0, 61, 2])  === 'rainy',  'mix with rainy → rainy');
assert(worstWeather([82, 95, 51]) === 'stormy', 'mix with stormy → stormy');

// calcForecast
const coef = DEFAULT_COEFFICIENTS;
assert(calcForecast('sunny',  coef).customers === 25,    'sunny: 25 customers');
assert(calcForecast('sunny',  coef).sales     === 17500, 'sunny: ¥17,500');
assert(calcForecast('cloudy', coef).customers === 15,    'cloudy: 15 customers');
assert(calcForecast('rainy',  coef).customers === 8,     'rainy: 8 customers');
assert(calcForecast('rainy',  coef).sales     === 5600,  'rainy: ¥5,600');
assert(calcForecast('stormy', coef).customers === 0,     'stormy: 0 customers');
assert(calcForecast('stormy', coef).sales     === 0,     'stormy: ¥0');

console.log('\nDone.');
