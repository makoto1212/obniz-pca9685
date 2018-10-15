# Obniz PCA9685

JavaScript of PCA9685 that can be used with obniz

```js
var pca9685 = new PCA9685(i2c);
await pca9685.init(i2c);
await pca9685.set_pwm_freq(i2c, 60);
pca9685.set_pwm(i2c, 0, 0, 375);
```

## Lisence
See [LICENSE.txt](./LICENSE.txt)