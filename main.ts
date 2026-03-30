/*
Modified from original yahboom extension
Grouped by Sensors, Sounds, and Motors
*/

//% color="#006400" weight=20 icon="\uf1b9"
namespace mbit_Robot {

    const PCA9685_ADD = 0x41
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04

    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09

    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const PRESCALE = 0xFE

    let initialized = false

    export enum enColor {
        //% blockId="OFF" block="off"
        OFF = 0,
        //% blockId="Red" block="red"
        Red,
        //% blockId="Green" block="green"
        Green,
        //% blockId="Blue" block="blue"
        Blue,
        //% blockId="White" block="white"
        White,
        //% blockId="Cyan" block="cyan"
        Cyan,
        //% blockId="Pinkish" block="magenta"
        Pinkish,
        //% blockId="Yellow" block="yellow"
        Yellow,
    }

    export enum enMusic {
        dadadum = 0,
        entertainer,
        prelude,
        ode,
        nyan,
        ringtone,
        funk,
        blues,
        birthday,
        wedding,
        funereal,
        punchline,
        baddy,
        chase,
        ba_ding,
        wawawawaa,
        jump_up,
        jump_down,
        power_up,
        power_down
    }

    export enum enPos {
        //% blockId="LeftState" block="left state"
        LeftState = 0,
        //% blockId="RightState" block="right state"
        RightState = 1
    }

    export enum enLineState {
        //% blockId="White" block="white"
        White = 0,
        //% blockId="Black" block="black"
        Black = 1
    }
    
    export enum enAvoidState {
        //% blockId="OBSTACLE" block="with obstacles"
        OBSTACLE = 0,
        //% blockId="NOOBSTACLE" block="without obstacles"
        NOOBSTACLE = 1
    }
    
    export enum enServo {
        S1 = 1,
        S2,
        S3
    }

    export enum enLook {
        //% block="forward"
        Forward = 90,
        //% block="left"
        Left = 180,
        //% block="right"
        Right = 0
    }

    export enum CarState {
        //% blockId="Car_Run" block="forward"
        Car_Run = 1,
        //% blockId="Car_Back" block="back"
        Car_Back = 2,
        //% blockId="Car_Left" block="turn left"
        Car_Left = 3,
        //% blockId="Car_Right" block="turn right"
        Car_Right = 4,
        //% blockId="Car_Stop" block="stop"
        Car_Stop = 5,
        //% blockId="Car_SpinLeft" block="rotate left"
        Car_SpinLeft = 6,
        //% blockId="Car_SpinRight" block="rotate right"
        Car_SpinRight = 7
    }

    // ==========================================
    // SENSORS GROUP
    // ==========================================

    
    //% blockId="yahboom_robot_heading" block="robot heading"
    //% group="Sensors" weight=100
    export function robotHeading(): number {
        let x = input.magneticForce(Dimension.X);
        let z = input.magneticForce(Dimension.Z);
        let angle = Math.atan2(x, z);
        let degrees = angle * (180 / Math.PI);
        if (degrees < 0) { degrees += 360; }
        return Math.floor(degrees);
    }

    //% blockId=mbit_ultrasonic_car block="ultrasonic return distance(cm)"
    //% group="Sensors" weight=90
    export function Ultrasonic_Car(): number {
        let list:Array<number> = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
            pins.digitalWritePin(DigitalPin.P14, 0);
            control.waitMicros(2);
            pins.digitalWritePin(DigitalPin.P14, 1);
            control.waitMicros(15);
            pins.digitalWritePin(DigitalPin.P14, 0);
            let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, 43200);
            list[i] = Math.floor(d / 40)
        }
        list.sort();
        let length = (list[1] + list[2] + list[3])/3;
        return  Math.floor(length);
    }

    //% blockId=mbit_Line_Sensor block="Line_Sensor|direct %direct|value %value"
    //% group="Sensors" weight=80
    export function Line_Sensor(direct: enPos, value: enLineState): boolean {
        let temp: boolean = false;
        switch (direct) {
            case enPos.LeftState: {
                if (pins.analogReadPin(AnalogPin.P2) < 500) {
                    if (value == enLineState.White) temp = true;
                    setPwm(7, 0, 4095);
                } else {
                    if (value == enLineState.Black) temp = true;
                    setPwm(7, 0, 0);
                }
                break;
            }
            case enPos.RightState: {
                if (pins.analogReadPin(AnalogPin.P1) < 500) {
                    if (value == enLineState.White) temp = true;
                    setPwm(6, 0, 4095);
                } else {
                    if (value == enLineState.Black) temp = true;
                    setPwm(6, 0, 0);
                }
                break;
            }
        }
        return temp;
    }

    //% blockId=mbit_Avoid_Sensor block="Avoid_Sensor|value %value"
    //% group="Sensors" weight=70
    export function Avoid_Sensor(value: enAvoidState): boolean {
        let temp: boolean = false;
        pins.setPull(DigitalPin.P9, PinPullMode.PullUp)
        pins.digitalWritePin(DigitalPin.P9, 0);
        control.waitMicros(100);
        if (value == enAvoidState.OBSTACLE) {
            if (pins.analogReadPin(AnalogPin.P3) < 800) {
                temp = true;
                setPwm(8, 0, 0);
            } else {
                temp = false;
                setPwm(8, 0, 4095);
            }
        } else {
            if (pins.analogReadPin(AnalogPin.P3) > 800) {
                temp = true;
                setPwm(8, 0, 4095);
            } else {
                temp = false;
                setPwm(8, 0, 0);
            }
        }
        pins.digitalWritePin(DigitalPin.P9, 1);
        return temp;
    }

    // ==========================================
    // SOUNDS & LIGHTS GROUP
    // ==========================================

    //% blockId=mbit_Music_Car block="Music_Car|%index"
    //% group="Sounds & Lights" weight=100
    export function Music_Car(index: enMusic): void {
        switch (index) {
            case enMusic.dadadum: music.beginMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Once); break;
            case enMusic.birthday: music.beginMelody(music.builtInMelody(Melodies.Birthday), MelodyOptions.Once); break;
            case enMusic.entertainer: music.beginMelody(music.builtInMelody(Melodies.Entertainer), MelodyOptions.Once); break;
            case enMusic.prelude: music.beginMelody(music.builtInMelody(Melodies.Prelude), MelodyOptions.Once); break;
            case enMusic.ode: music.beginMelody(music.builtInMelody(Melodies.Ode), MelodyOptions.Once); break;
            case enMusic.nyan: music.beginMelody(music.builtInMelody(Melodies.Nyan), MelodyOptions.Once); break;
            case enMusic.ringtone: music.beginMelody(music.builtInMelody(Melodies.Ringtone), MelodyOptions.Once); break;
            case enMusic.funk: music.beginMelody(music.builtInMelody(Melodies.Funk), MelodyOptions.Once); break;
            case enMusic.blues: music.beginMelody(music.builtInMelody(Melodies.Blues), MelodyOptions.Once); break;
            case enMusic.wedding: music.beginMelody(music.builtInMelody(Melodies.Wedding), MelodyOptions.Once); break;
            case enMusic.funereal: music.beginMelody(music.builtInMelody(Melodies.Funeral), MelodyOptions.Once); break;
            case enMusic.punchline: music.beginMelody(music.builtInMelody(Melodies.Punchline), MelodyOptions.Once); break;
            case enMusic.baddy: music.beginMelody(music.builtInMelody(Melodies.Baddy), MelodyOptions.Once); break;
            case enMusic.chase: music.beginMelody(music.builtInMelody(Melodies.Chase), MelodyOptions.Once); break;
            case enMusic.ba_ding: music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once); break;
            case enMusic.wawawawaa: music.beginMelody(music.builtInMelody(Melodies.Wawawawaa), MelodyOptions.Once); break;
            case enMusic.jump_up: music.beginMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.Once); break;
            case enMusic.jump_down: music.beginMelody(music.builtInMelody(Melodies.JumpDown), MelodyOptions.Once); break;
            case enMusic.power_up: music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once); break;
            case enMusic.power_down: music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once); break;
        }
    }

    //% blockId=mbit_RGB_Car_Big2 block="RGB_Car_Big2|value %value"
    //% group="Sounds & Lights" weight=90
    export function RGB_Car_Big2(value: enColor): void {
        switch (value) {
            case enColor.OFF: setPwm(0, 0, 0); setPwm(1, 0, 0); setPwm(2, 0, 0); break;
            case enColor.Red: setPwm(0, 0, 4095); setPwm(1, 0, 0); setPwm(2, 0, 0); break;
            case enColor.Green: setPwm(0, 0, 0); setPwm(1, 0, 4095); setPwm(2, 0, 0); break;
            case enColor.Blue: setPwm(0, 0, 0); setPwm(1, 0, 0); setPwm(2, 0, 4095); break;
            case enColor.White: setPwm(0, 0, 4095); setPwm(1, 0, 4095); setPwm(2, 0, 4095); break;
            case enColor.Cyan: setPwm(0, 0, 0); setPwm(1, 0, 4095); setPwm(2, 0, 4095); break;
            case enColor.Pinkish: setPwm(0, 0, 4095); setPwm(1, 0, 0); setPwm(2, 0, 4095); break;
            case enColor.Yellow: setPwm(0, 0, 4095); setPwm(1, 0, 4095); setPwm(2, 0, 0); break;
        }
    }

    // ==========================================
    // MOTORS GROUP
    // ==========================================

    //% blockId=mbit_CarCtrlSpeed2 block="CarCtrlSpeed2|%index|speed1 %speed1|speed2 %speed2"
    //% group="Motors" weight=80
    //% speed1.min=0 speed1.max=255 speed2.min=0 speed2.max=255
    export function CarCtrlSpeed2(index: CarState, speed1: number, speed2: number): void {
        switch (index) {
            case CarState.Car_Run: Car_run(speed1, speed2); break;
            case CarState.Car_Back: Car_back(speed1, speed2); break;
            case CarState.Car_Left: Car_left(0, speed2); break;
            case CarState.Car_Right: Car_right(speed1, 0); break;
            case CarState.Car_Stop: Car_stop(); break;
            case CarState.Car_SpinLeft: Car_spinleft(speed1, speed2); break;
            case CarState.Car_SpinRight: Car_spinright(speed1, speed2); break;
        }
    }

    //% blockId=mbit_CarCtrlSpeed block="CarCtrlSpeed|%index|speed %speed"
    //% group="Motors" weight=70
    //% speed.min=0 speed.max=255
    export function CarCtrlSpeed(index: CarState, speed: number): void {
        CarCtrlSpeed2(index, speed, speed);
    }

    //% blockId=mbit_CarCtrl block="CarCtrl|%index"
    //% group="Motors" weight=60
    export function CarCtrl(index: CarState): void {
        CarCtrlSpeed2(index, 255, 255);
    }

    //% blockId=mbit_Servo_Car block="Servo_Car|num %num|value %value"
    //% group="Motors" weight=50
    //% num.min=1 num.max=3 value.min=0 value.max=180
    export function Servo_Car(num: enServo, value: number): void {
        let us = (value * 1800 / 180 + 600);
        let pwm = us * 4096 / 20000;
        setPwm(num + 2, 0, pwm);
    }

    /**
     * Look in a specific direction (Forward, Left, Right)
     */
    //% blockId=mbit_look block="look %direction"
    //% group="Motors" weight=40
    export function look(direction: enLook): void {
        Servo_Car(enServo.S1, direction);
    }

    /**
     * Look at a specific degree (0 is straight, -90 is left, 90 is right)
     */
    //% blockId=mbit_look_degrees block="look %degrees degrees"
    //% group="Motors" weight=30
    //% degrees.min=-90 degrees.max=90 degrees.defl=0
    export function lookDegrees(degrees: number): void {
        // Map -90 to 180 (left), 0 to 90 (center), 90 to 0 (right)
        let servoVal = 90 - degrees;
        Servo_Car(enServo.S1, servoVal);
    }

    // ==========================================
    // INTERNAL HELPER FUNCTIONS
    // ==========================================

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADD, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }

    function setFreq(freq: number): void {
        let prescaleval = 25000000 / 4096 / freq - 1;
        let oldmode = i2cread(PCA9685_ADD, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10;
        i2cwrite(PCA9685_ADD, MODE1, newmode);
        i2cwrite(PCA9685_ADD, PRESCALE, prescaleval);
        i2cwrite(PCA9685_ADD, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADD, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15) return;
        if (!initialized) initPCA9685();
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }

    function Car_run(speed1: number, speed2: number) {
        speed1 = Math.clamp(0, 4095, speed1 * 16);
        speed2 = Math.clamp(0, 4095, speed2 * 16);
        setPwm(12, 0, speed1); setPwm(13, 0, 0);
        setPwm(15, 0, speed2); setPwm(14, 0, 0);
    }

    function Car_back(speed1: number, speed2: number) {
        speed1 = Math.clamp(0, 4095, speed1 * 16);
        speed2 = Math.clamp(0, 4095, speed2 * 16);
        setPwm(12, 0, 0); setPwm(13, 0, speed1);
        setPwm(15, 0, 0); setPwm(14, 0, speed2);
    }

    function Car_left(speed1: number, speed2: number) {
        speed1 = Math.clamp(0, 4095, speed1 * 16);
        speed2 = Math.clamp(0, 4095, speed2 * 16);
        setPwm(12, 0, speed1); setPwm(13, 0, 0);
        setPwm(15, 0, speed2); setPwm(14, 0, 0);
    }

    function Car_right(speed1: number, speed2: number) {
        speed1 = Math.clamp(0, 4095, speed1 * 16);
        speed2 = Math.clamp(0, 4095, speed2 * 16);
        setPwm(12, 0, speed1); setPwm(13, 0, 0);
        setPwm(15, 0, speed2); setPwm(14, 0, 0);
    }

    function Car_stop() {
        setPwm(12, 0, 0); setPwm(13, 0, 0);
        setPwm(15, 0, 0); setPwm(14, 0, 0);
    }

    function Car_spinleft(speed1: number, speed2: number) {
        speed1 = Math.clamp(0, 4095, speed1 * 16);
        speed2 = Math.clamp(0, 4095, speed2 * 16);
        setPwm(12, 0, 0); setPwm(13, 0, speed1);
        setPwm(15, 0, speed2); setPwm(14, 0, 0);
    }

    function Car_spinright(speed1: number, speed2: number) {
        speed1 = Math.clamp(0, 4095, speed1 * 16);
        speed2 = Math.clamp(0, 4095, speed2 * 16);
        setPwm(12, 0, speed1); setPwm(13, 0, 0);
        setPwm(15, 0, 0); setPwm(14, 0, speed2);
    }
}
