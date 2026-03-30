/**
 * mbit_Robot Extension Testing
 * This script runs through the primary functions of the 
 * Yahboom mbit_Robot master extension.
 */

// 1. Test Movement and Speed
// Move forward at half speed for 1 second, then stop.
mbit_Robot.CarCtrlSpeed(mbit_Robot.CarState.Car_Run, 128)
basic.pause(1000)
mbit_Robot.CarCtrlSpeed(mbit_Robot.CarState.Car_Stop, 0)

// 2. Test Music
// Play the 'power_up' melody to indicate the test is moving to sensors
mbit_Robot.Music_Car(mbit_Robot.enMusic.power_up)

// 3. Test Servos
// Sweep Servo 1 from 0 to 180 degrees
for (let angle = 0; angle <= 180; angle += 45) {
    mbit_Robot.Servo_Car(mbit_Robot.enServo.S1, angle)
    basic.pause(200)
}

// 4. Test Sensors (Ultrasonic & Line)
basic.forever(function () {
    // Read ultrasonic distance and display on micro:bit LED matrix
    let distance = mbit_Robot.Ultrasonic_Car()
    
    if (distance < 10) {
        // If an obstacle is close, stop and play a sound
        mbit_Robot.CarCtrlSpeed(mbit_Robot.CarState.Car_Stop, 0)
        mbit_Robot.Music_Car(mbit_Robot.enMusic.ba_ding)
    } else {
        // Otherwise, move forward slowly
        mbit_Robot.CarCtrlSpeed(mbit_Robot.CarState.Car_Run, 60)
    }
    
    basic.pause(500)
})
