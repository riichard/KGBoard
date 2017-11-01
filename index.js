HID = require('node-hid')

function tryOpen() {
  let hidArray = HID.devices()

  for (let i = 0; i < hidArray.length; i++) {
    if (hidArray[i].vendorId === 1003 ) {
      // Check for interface nr with string in path for OSX
      if(hidArray[i].interface === 2 || (hidArray[i].path.indexOf('IOUSBHostInterface@2')) > -1) {
        return new HID.HID(hidArray[i].path)
      }
    }
  }
}

function getCrc16ccitt(buffer, size)
{
  var crc = 0

  for (i = 0; i < size; i++) {
    crc ^= (buffer[i] << 8)

    for (j = 0; j < 8; ++j) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      }
      else {
        crc = crc << 1
      }
    }
  }

  return crc & 0xFFFF
}

// Convert a RGB color value to an encoded byte to send to the keyboard
function colorToByte(color)
{
  let encode = 0

  encode |= color.red & 0xE0
  encode |= (color.green & 0xE0) >> 3
  encode |= (color.blue & 0xC0) >> 6

  return encode
}

function getRgbBuffer() {
  let buffer = [];
  for(var i = 0; i < 126; i++) {
      buffer.push(0x00)
  }

  // Set the magicWord
  buffer[0] = 0xD0
  buffer[1] = 0xDA
  // RGB report ID is 0
  buffer[2] = 0x00

  return buffer
}

function getOneColorBuffer(index, color)
{
  let buffer = getRgbBuffer()
  buffer[4 + index] = colorToByte(color)

  // FilterValue to set one color = 0x02
  buffer[100] = 0x02;
  // Add index nr to buffer
  buffer[101] = index

  return buffer
}

function getBrightnessBuffer(brightness)
{
  let buffer = getRgbBuffer()
  buffer[3] = brightness

  // FilterValue for brightness = 0x01
  buffer[100] = 0x01

  return buffer
}

// Set all keys to one color
function getSetAllBuffer(color)
{
  let buffer = getRgbBuffer()
  buffer[4] = colorToByte(color)

  // FilterValue for set all = 0x03
  buffer[100] = 0x03

  return buffer
}

function getCustomColorBuffer(colorArray, brightness) {
  let buffer = getRgbBuffer()

  buffer[3] = brightness

  for(let i = 0; i < colorArray.length; i++) {
    buffer[4 + i] = colorToByte(colorArray[i])
  }

  // FilterValue for set all = 0x03
  buffer[100] = 0x00

  return buffer
}

function applyCrc(buffer) {
  // Calculate and add CRC in Little Endian
  crc16 = getCrc16ccitt(buffer, 126)
  buffer[126] = crc16 & 0x00FF
  buffer[127] = (crc16 & 0xFF00) >> 8
}

// Open the wooting keyboard and get HID handle
var wootingKbd = tryOpen()

/*
  Pick one of these buffers to send to the keyboard
*/
// var sendBuffer = getOneColorBuffer(1, {red: 0, green: 255, blue: 0})
// var sendBuffer = getSetAllBuffer({red: 255, green: 255, blue: 0})
// var sendBuffer = getBrightnessBuffer(255)
var sendBuffer = getCustomColorBuffer([
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 0, green: 255, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 0, green: 255, blue: 255},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 255, green: 0, blue: 0},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 0, green: 255, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 0, green: 255, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 0, green: 255, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 0, green: 255, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 0, green: 255, blue: 255},
  {red: 0, green: 0, blue: 255},
  {red: 0, green: 255, blue: 0},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
  {red: 255, green: 255, blue: 255},
], 255)

// Apply CRC and add unused extra element for USB compliance
applyCrc(sendBuffer)
sendBuffer = [0x00].concat(sendBuffer)

// Write function only takes array, a buffer will be emptied for some reason
wootingKbd.write(Array.from(sendBuffer))
