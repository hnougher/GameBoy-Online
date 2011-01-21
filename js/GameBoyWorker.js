
// Find out if Typed Arrays are implemented before we start loading code
var supportTypedArray = ( 
	typeof ArrayBuffer == "function"
	&& typeof Float64Array == "function"
	&& typeof Float32Array == "function"
	&& typeof Uint32Array == "function"
	&& typeof Int32Array == "function"
	&& typeof Uint16Array == "function"
	&& typeof Int16Array == "function"
	&& typeof Uint8Array == "function"
	&& typeof Int8Array == "function"
	);
supportTypedArray = false;

/*// Flags from http://wikiti.brandonw.net/?title=Z80_Instruction_Set
var S_FLAG = 0x80;	// Bit 7: accumulator or high byte for 16-bit operations
var Z_FLAG = 0x40;	// set if result is zero
var X_FLAG = 0x20;	// Bit 5: undocumented
var H_FLAG = 0x10;	// Bit 4: half-carry / carry of low nibble
var Y_FLAG = 0x08;	// Bit 3: undocumented
var P_FLAG = 0x04;	// parity or overflow, always specified
var N_FLAG = 0x02;	// negative, set if previous op was subtraction, always specified
var C_FLAG = 0x01;	// Bit 8: carry*/


var gameboy;
var settings = [						//Some settings.
	//true, 							//0 Turn on sound.
	false, 								//0 Turn on sound.
	false,								//1 Force Mono sound.
	false,								//2 Give priority to GameBoy mode
	[39, 37, 38, 40, 88, 90, 16, 13],	//3 Keyboard button map.
	0,									//4 Frameskip Amount (Auto frameskip setting allows the script to change this.)
	false,								//5 Use the data URI BMP method over the canvas tag method?
	[16, 12],							//6 How many tiles in each direction when using the BMP method (width * height).
	//true,								//7 Auto Frame Skip
	false,								//7 Auto Frame Skip
	29,									//8 Maximum Frame Skip
	true,								//9 Override to allow for MBC1 instead of ROM only (compatibility for broken 3rd-party cartridges).
	true,								//10 Override MBC RAM disabling and always allow reading and writing to the banks.
	100,								//11 Audio granularity setting (Sampling of audio every x many machine cycles)
	10,									//12 Frameskip base factor
	17826,								//13 Target number of machine cycles per loop. (4,194,300 / 1000 * 17)
	70000,								//14 Sample Rate
	0x10,								//15 How many bits per WAV PCM sample (For browsers that fall back to WAV PCM generation)
	true,								//16 Use the GBC BIOS?
	true,								//17 Colorize GB mode?
	512,								//18 Sample size for webkit audio.
	false,								//19 Whether to display the canvas at 144x160 on fullscreen or as stretched.
	17									//20 Interval for the emulator loop.
	];
var gbRunTimeout;



var inMessages = 0;
onmessage = function( event )
{
	inMessages++;
	var args = event.data;
	switch( args[0] )
	{
		case "init":
			gameboy = new GameBoyCore( args[2], args[1] );
			dump( "imageData=" + args[2].width + "\n" );
			break;
		
		case "start":
			gameboy.start();
			break;
		
		case "run":
			gameboy.run();
			break;
		
		case "resumeEmulator":
			gameboy.stopEmulator &= 1;
			frameStart = gameboy.lastIteration = Date.now();
			cout("Starting the iterator.", 0);
			//gbRunInterval = setInterval(continueCPU, settings[20]);
			continueCPU();
			break;
		
		case "stopEmulator":
			gameboy.stopEmulator |= 2;
			clearTimeout(gbRunTimeout);
			break;
		
		case "JoyPadEvent":
			gameboy.JoyPadEvent( args[1], args[2] );
			break;
	}
};

// CPU timing loop
var frameStart;
var pauseLength;
var frameFinished;
/** This is for fastest possible since it will only react to events at one sec intervals */
/*function continueCPU()
{
	var blockMustBreakTime = frameStart + 1000;

	for( ; ; )
	{
		// Run the frame
		gameboy.run();
		
		frameFinished = (new Date()).getTime();
		pauseLength = settings[20] - (frameFinished - frameStart);
		
		if( pauseLength > 0 || frameStart > blockMustBreakTime )
		{
			// Fix the pause time if less than zero
			pauseLength = Math.max( 0, pauseLength );
			
			// Record when the next frame will start
			frameStart = frameFinished + pauseLength;
			
			// There is a pause so we use a timeout and leave loop
			gbRunTimeout = setTimeout( continueCPU, pauseLength );
			return;
		}
		
		// Record when the next frame will start
		frameStart = frameFinished;
	}
}*/
/** This one allows events after every frame */
function continueCPU()
{
	// Run the frame
	gameboy.run();
	
	frameFinished = Date.now();
	pauseLength = settings[20] - (frameFinished - frameStart);
	
	// Fix the pause time if less than zero
	pauseLength = Math.max( 0, pauseLength );
	
	// Record when the next frame will start
	frameStart = frameFinished + pauseLength;
	
	// There is a pause so we use a timeout and leave loop
	gbRunTimeout = setTimeout( continueCPU, pauseLength );
}



// ######################## Function from main thread #########################
// Write to virtual terminal
function cout(message, colorIndex) {
	postMessage([ "cout", message, colorIndex ]);
	dump( message + "\n" );
}

// Update the canvas
function update_display() {
	sentFrames++;
	postMessage([ "update_display", gameboy.canvasBuffer ]);
}

// Pause Function Forward
function pause() {
	postMessage([ "pause" ]);
}


var HNOpcode_Usage = new Array(0x1FF);
for( var i = 0; i <= 0x1FF; i++ )
	HNOpcode_Usage[i] = 1;

var sentFrames = 0;
var HNCounter = 0;
var HNTime = 0;
var HNStartTime;
var HNEndTime;
var HNExtra = 0;
/*
	HNCounter++;
	HNStartTime = new Date();
	
	
	HNEndTime = new Date();
	HNTime += ( HNEndTime - HNStartTime );
*/

setInterval(function(){
	var str = [
		"FPS=" + sentFrames,
		"PauseLength=" + pauseLength,
		"HNCounter=" + HNCounter,
		"HNTime=" + HNTime,
		"count/ms=" + ( HNTime ? (HNCounter / HNTime).toFixed(0) : ">" + HNCounter ),
		"Extra=" + HNExtra
		//"Extra=" + gameboy.UI8_to_SI8( 127 ) + " " + gameboy.UI8_to_SI8( 128 )
		];
	dump( str + "\n" );
	sentFrames = 0;
	HNCounter = 0;
	HNTime = 0;
	HNExtra = 0;
	
	// Post the Op Usage Data
	//postMessage([ "HNOpcode_Usage", HNOpcode_Usage ]);
	},1000);




/**
* Creates an array using the most efficient method it can.
* @author Hugh Nougher <hughnougher@gmail.com>
*/
var ArrayCreate = function( length, type, defaultValue )
{
	var a;
	
	// If typed arrays are not supported then we must go straight for a normal one
	if( !supportTypedArray )
		type = "";
	
	// Create the array
	switch( type )
	{
		case "UI8": // Unsigned 8bit Integer
			a = new Uint8Array(length);
			break;
		case "SI8": // Signed 8bit Integer
			a = new Int8Array(length);
			break;
		case "UI16": // Unsigned 16bit Integer
			a = new Uint16Array(length);
			break;
		case "SI16": // Signed 16bit Integer
			a = new Int16Array(length);
			break;
		case "UI32": // Unsigned 32bit Integer
			a = new Uint32Array(length);
			break;
		case "SI32": // Signed 32bit Integer
			a = new Int32Array(length);
			break;
		case "F32": // 32bit Float
			a = new Float32Array(length);
			break;
		case "F64": // 64bit Float
			a = new Float64Array(length);
			break;
		default:
			a = new Array(length);
	}
	
	// If a default value is given then we must set all values in array to it
	if( defaultValue != undefined && ( a instanceof Array || defaultValue !== 0 ) )
	{
		for( var i = 0; i < length; i++ )
			a[i] = defaultValue;
	}
	
	return a;
};

// Calculate Parity for a Byte
// Using IF and XOR was almost as fast as array lookup in FF4b7.
// Using IF and XOR was faster than "evenParity = !evenParity" also.
// Using ++ was slowest. Having 0x1 in the initial var was faster.
/*var parityByte = function(b)
{
	var evenParity = 0x1;
	if (b & 0x01) evenParity ^= 1;
	if (b & 0x02) evenParity ^= 1;
	if (b & 0x04) evenParity ^= 1;
	if (b & 0x08) evenParity ^= 1;
	if (b & 0x10) evenParity ^= 1;
	if (b & 0x20) evenParity ^= 1;
	if (b & 0x40) evenParity ^= 1;
	if (b & 0x80) evenParity ^= 1;
	return evenParity;
}*/



importScripts("GameBoyCore.js");

