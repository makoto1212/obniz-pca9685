class PCA9685 {
  constructor() {
    // Registers/etc:
    this.PCA9685_ADDRESS  = 0x40;
    this.MODE1        = 0x00;
    this.MODE2        = 0x01;
    this.SUBADR1      = 0x02;
    this.SUBADR2      = 0x03;
    this.SUBADR3      = 0x04;
    this.PRESCALE       = 0xFE;
    this.LED0_ON_L      = 0x06;
    this.LED0_ON_H      = 0x07;
    this.LED0_OFF_L     = 0x08;
    this.LED0_OFF_H     = 0x09;
    this.ALL_LED_ON_L     = 0xFA;
    this.ALL_LED_ON_H     = 0xFB;
    this.ALL_LED_OFF_L    = 0xFC;
    this.ALL_LED_OFF_H    = 0xFD;

    // Bits:
    this.RESTART      = 0x80;
    this.SLEEP        = 0x10;
    this.ALLCALL      = 0x01;
    this.INVRT        = 0x10;
    this.OUTDRV       = 0x04;
  }

  async init(i2c) {
    this.set_all_pwm(i2c, 0, 0);

    i2c.write(this.PCA9685_ADDRESS, [this.MODE2, this.OUTDRV]);
    i2c.write(this.PCA9685_ADDRESS, [this.MODE1, this.ALLCALL]);

    obniz.wait(5);

    var mode1 = await i2c.readWait(this.PCA9685_ADDRESS, 1);
    mode1 = mode1[0];

    mode1 = mode1 & ~this.SLEEP;
    i2c.write(this.PCA9685_ADDRESS, [this.MODE1, mode1]);
    obniz.wait(5);
  }

  async set_pwm_freq(i2c, freq_hz) {
    var prescaleval = 25000000.0; // 25MHz
    prescaleval /= 4096.0; //12bit
    prescaleval /= parseFloat(freq_hz);
    prescaleval -= 1.0;

    console.log('Setting PWM frequency to '+freq_hz+' Hz');
    console.log('Estimated pre-scale: '+ prescaleval);

    var prescale = parseInt(Math.floor(prescaleval + 0.5));

    console.log('Final pre-scale: '+ prescale);

    var oldmode = await i2c.readWait(this.PCA9685_ADDRESS, 1);
    oldmode = oldmode[0];

    var newmode = (oldmode & 0x7F) | 0x10 //sleep

    i2c.write(this.PCA9685_ADDRESS, [this.MODE1, newmode]);
    i2c.write(this.PCA9685_ADDRESS, [this.PRESCALE, prescale]);
    i2c.write(this.PCA9685_ADDRESS, [this.MODE1, oldmode]);

    obniz.wait(5);

    i2c.write(this.PCA9685_ADDRESS, [this.MODE1, oldmode | 0x80]);
  }

  set_all_pwm(i2c, on, off) {
    i2c.write(this.PCA9685_ADDRESS, [this.ALL_LED_ON_L, on & 0xFF]);
    i2c.write(this.PCA9685_ADDRESS, [this.ALL_LED_ON_H, on >> 8]);
    i2c.write(this.PCA9685_ADDRESS, [this.ALL_LED_OFF_L, off & 0xFF]);
    i2c.write(this.PCA9685_ADDRESS, [this.ALL_LED_OFF_H, off >> 8]);
  }

  set_pwm(i2c, channel, on, off) {
    i2c.write(this.PCA9685_ADDRESS, [this.LED0_ON_L+4*channel, on & 0xFF]);
    i2c.write(this.PCA9685_ADDRESS, [this.LED0_ON_H+4*channel, on >> 8]);
    i2c.write(this.PCA9685_ADDRESS, [this.LED0_OFF_L+4*channel, off & 0xFF]);
    i2c.write(this.PCA9685_ADDRESS, [this.LED0_OFF_H+4*channel, off >> 8]);
  }
}
