<?php
header('Content-Type: application/javascript');
ob_start('ob_gzhandler');
?>
/* 
 * JavaScript GameBoy Color Emulator
 * Copyright (C) 2010 Grant Galitz
 * 
 * Hugh added JS Workers to the code for browsers that support it.
 * Copyright (C) 2010 Hugh Nougher
 * 
 * Ported the video engine (advanced gfx one), some HDMA handling, and the double speed mode procedure (STOP opcode procedure) from MeBoy 2.2
 * http://arktos.se/meboy/
 * Copyright (C) 2005-2009 Bjorn Carlin
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */
 //"use strict";
 /**
 *TODO:
	- Working On Right Now:
		- Add a way where the sprite count on a line changes the STAT number adjustment for current clock cycle.
		- Make I/O bit reading and writing more accurate.
	- Started already, but far from merging into here:
		- Serial port link for multiplayer type stuff
		- IR port
		- GBA (ARM7TDMI CPU Core) support will be coming when I feel like working on it more.
			- Could be split off into a separate project, because the CPU is completely different.
	- Afterwards....
		- Fix some boogs.
		- A Bit Later... Byte Later... Which ever comes first :P
			- Add some more MBC support (I haven't seen any game except one so far that uses an unsupported MBC)
				- MBC7, TAMA5, HuC1, etc.
 **/
function GameBoyCore(imageData, ROMImage) {
	/*this.canvas = canvas;						//Canvas DOM object for drawing out the graphics to.
	this.canvasAlt = canvasAlt;					//Image DOM object for drawing out the graphics to as an alternate means.
	this.canvasFallbackHappened = false;		//Used for external scripts to tell if we're really using the canvas or not (Helpful with fullscreen switching).
	this.drawContext = null;*/					// LCD Context
	this.ROMImage = ROMImage;					//The game's ROM. 
	this.ROM = [];								//The full ROM file dumped to an array.
	this.inBootstrap = true;					//Whether we're in the GBC boot ROM.
	this.usedBootROM = false;					//Updated upon ROM loading...
	this.registerA = 0x01; 						// Accumulator (default is GB mode)
	this.FZero = true; 							// bit 7 - Zero
	this.FSubtract = false;						// bit 6 - Sub
	this.FHalfCarry = true;						// bit 5 - Half Carry
	this.FCarry = true;							// bit 4 - Carry
	this.registerB = 0x00;						// Register B
	this.registerC = 0x13;						// Register C
	this.registerD = 0x00;						// Register D
	this.registerE = 0xD8;						// Register E
	this.registersHL = 0x014D;					// Registers H and L
	this.memoryReader = [];						//Array of functions mapped to read back memory
	this.memoryWriter = [];						//Array of functions mapped to write to memory
	this.stackPointer = 0xFFFE;					// Stack Pointer
	this.programCounter = 0x0100;				// Program Counter
	this.halt = false;							//Has the CPU been suspended until the next interrupt?
	this.skipPCIncrement = false;				//Did we trip the DMG Halt bug?
	this.stopEmulator = 3;						//Has the emulation been paused or a frame has ended?
	this.IME = true;							//Are interrupts enabled?
	this.hdmaRunning = false;					//HDMA Transfer Flag - GBC only
	this.CPUTicks = 0;							//The number of clock cycles emulated.
	this.multiplier = 1;						//GBC Speed Multiplier
	//Main RAM, MBC RAM, GBC Main RAM, VRAM, etc.
	this.memory = [];							//Main Core Memory
	this.MBCRam = [];							//Switchable RAM (Used by games for more RAM) for the main memory range 0xA000 - 0xC000.
	this.VRAM = [];								//Extra VRAM bank for GBC.
	this.currVRAMBank = 0;						//Current VRAM bank for GBC.
	this.GBCMemory = [];						//GBC main RAM Banks
	this.MBC1Mode = false;						//MBC1 Type (4/32, 16/8)
	this.MBCRAMBanksEnabled = false;			//MBC RAM Access Control.
	this.currMBCRAMBank = 0;					//MBC Currently Indexed RAM Bank
	this.currMBCRAMBankPosition = -0xA000;		//MBC Position Adder;
	this.cGBC = false;							//GameBoy Color detection.
	this.gbcRamBank = 1;						//Currently Switched GameBoy Color ram bank
	this.gbcRamBankPosition = -0xD000;			//GBC RAM offset from address start.
	this.gbcRamBankPositionECHO = -0xF000;		//GBC RAM (ECHO mirroring) offset from address start.
	this.RAMBanks = [0, 1, 2, 4, 16];			//Used to map the RAM banks to maximum size the MBC used can do.
	this.ROMBank1offs = 0;						//Offset of the ROM bank switching.
	this.currentROMBank = 0;					//The parsed current ROM bank selection.
	this.cartridgeType = 0;						//Cartridge Type
	this.name = "";								//Name of the game
	this.gameCode = "";							//Game code (Suffix for older games)
	this.fromSaveState = false;					//A boolean to see if this was loaded in as a save state.
	this.savedStateFileName = "";				//When loaded in as a save state, this will not be empty.
	this.STATTracker = 0;						//Tracker for STAT triggering.
	this.modeSTAT = 0;							//The scan line mode (for lines 1-144 it's 2-3-0, for 145-154 it's 1)
	this.LYCMatchTriggerSTAT = false;			//Should we trigger an interrupt if LY==LYC?
	this.mode2TriggerSTAT = false;				//Should we trigger an interrupt if in mode 2?
	this.mode1TriggerSTAT = false;				//Should we trigger an interrupt if in mode 1?
	this.mode0TriggerSTAT = false;				//Should we trigger an interrupt if in mode 0?
	this.LCDisOn = false;						//Is the emulated LCD controller on?
	this.LINECONTROL = new Array(154);			//Array of functions to handle each scan line we do (onscreen + offscreen)
	this.DISPLAYOFFCONTROL = new Array(function (parentObj) {
		//Array of line 0 function to handle the LCD controller when it's off (Do nothing!).
	});
	this.LCDCONTROL = null;						//Pointer to either LINECONTROL or DISPLAYOFFCONTROL.
	this.gfxWindowY = false;
	this.gfxWindowDisplay = false;
	this.gfxSpriteShow = false;
	this.gfxSpriteDouble = false;
	this.gfxBackgroundY = false;
	this.gfxBackgroundX = false;
	this.TIMAEnabled = false;
	this.JoyPad = 0xFF;							//Joypad State (two four-bit states actually)
	//RTC:
	this.RTCisLatched = true;
	this.latchedSeconds = 0;
	this.latchedMinutes = 0;
	this.latchedHours = 0;
	this.latchedLDays = 0;
	this.latchedHDays = 0;
	this.RTCSeconds = 0;
	this.RTCMinutes = 0;
	this.RTCHours = 0;
	this.RTCDays = 0;
	this.RTCDayOverFlow = false;
	this.RTCHALT = false;
	//Sound variables:
	this.audioHandle = null;					//Audio object or the WAV PCM generator wrapper
	this.outTracker = 0;						//Buffering counter for the WAVE PCM output.
	this.outTrackerLimit = 0;					//Buffering limiter for WAVE PCM output.
	this.numSamplesTotal = 0;					//Length of the sound buffers.
	this.sampleSize = 0;						//Length of the sound buffer for one channel.
	this.dutyLookup = [0.125, 0.25, 0.5, 0.75];
	this.audioSamples = [];						//The audio buffer we're working on (When not overflowing).
	this.audioBackup = [];						//Audio overflow buffer.
	this.currentBuffer = null;					//Pointer to the sample workbench.
	this.channelLeftCount = 0;					//How many channels are being fed into the left side stereo / mono.
	this.channelRightCount = 0;					//How many channels are being fed into the right side stereo.
	this.initializeStartState();
	this.noiseTableLookup = null;
	this.smallNoiseTable = new Array(0x80);
	this.largeNoiseTable = new Array(0x8000);
	this.soundMasterEnabled = false;							//As its name implies
	this.audioType = -1;										//Track what method we're using for audio output.
	//Vin Shit:
	this.VinLeftChannelEnabled = false;
	this.VinRightChannelEnabled = false;
	this.VinLeftChannelMasterVolume = 0;
	this.VinRightChannelMasterVolume = 0;
	this.vinLeft = 1;
	this.vinRight = 1;
	//Channels Enabled:
	this.leftChannel = new Array(true, true, true, false);		//Which channels are enabled for left side stereo / mono?
	this.rightChannel = new Array(true, true, true, false);		//Which channels are enabled for right side stereo?
	//Current Samples Being Computed:
	this.currentSampleLeft = 0;
	this.currentSampleRight = 0;
	this.channel3Tracker = 0;
	//Pre-multipliers to cache some calculations:
	this.preChewedAudioComputationMultiplier = 0x20000 / settings[14];
	this.preChewedWAVEAudioComputationMultiplier = 0x200000 / settings[14];
	this.whiteNoiseFrequencyPreMultiplier = 4194300 / settings[14] / 8;
	this.samplesOut = 0;				//Premultiplier for audio samples per instructions.
	this.volumeEnvelopePreMultiplier = settings[14] / 0x40;
	this.channel1TimeSweepPreMultiplier = settings[14] / 0x80;
	this.audioTotalLengthMultiplier = settings[14] / 0x100;
	//Audio generation counters:
	this.audioOverflow = false;
	this.audioTicks = 0;				//Used to sample the audio system every x CPU instructions.
	this.audioIndex = 0;				//Used to keep alignment on audio generation.
	this.rollover = 0;					//Used to keep alignment on the number of samples to output (Realign from counter alias).
	//Timing Variables
	this.emulatorTicks = 0;				//Times for how many instructions to execute before ending the loop.
	this.DIVTicks = 14;					// DIV Ticks Counter (Invisible lower 8-bit)
	this.LCDTicks = 15;					// ScanLine Counter
	this.timerTicks = 0;				// Timer Ticks Count
	this.TACClocker = 256;			// Timer Max Ticks
	this.untilEnable = 0;				//Are the interrupts on queue to be enabled?
	this.lastIteration = 0;				//The last time we iterated the main loop.
	this.actualScanLine = 0;			//Actual scan line...
	
	//ROM Cartridge Components:
	this.cMBC1 = false;					//Does the cartridge use MBC1?
	this.cMBC2 = false;					//Does the cartridge use MBC2?
	this.cMBC3 = false;					//Does the cartridge use MBC3?
	this.cMBC5 = false;					//Does the cartridge use MBC5?
	this.cSRAM = false;					//Does the cartridge use save RAM?
	this.cMMMO1 = false;				//...
	this.cRUMBLE = false;				//Does the cartridge use the RUMBLE addressing (modified MBC5)?
	this.cCamera = false;				//...
	this.cTAMA5 = false;				//...
	this.cHuC3 = false;					//...
	this.cHuC1 = false;					//Does the cartridge use HuC1 (modified MBC1)?
	this.ROMBanks = [					// 1 Bank = 16 KBytes = 256 Kbits
		2, 4, 8, 16, 32, 64, 128, 256, 512
	];
	this.ROMBanks[0x52] = 72;
	this.ROMBanks[0x53] = 80;
	this.ROMBanks[0x54] = 96;
	this.numRAMBanks = 0;				//How many RAM banks were actually allocated?
	//Graphics Variables
	this.drewBlank = 0;					//To prevent the repeating of drawing a blank screen.
	this.tileData = [];					// tile data arrays
	this.frameBuffer = [];
	//this.scaledFrameBuffer = [];
	//this.canvasBuffer;							//HN: ImageData
	this.canvasBuffer = imageData;					//HN: ImageData
	this.canvasBufferData = imageData.data;			//HN: Array or Uint8Array
	if( supportTypedArray )
		this.canvasBufferData32 = new Uint32Array( imageData.data.buffer );		//HN: Uint32Array if available
	this.gbcRawPalette = [];
	this.tileCount = 384;				//GB: 384, GBC: 384 * 2
	this.tileCountInvalidator = this.tileCount * 4;
	this.colorCount = 12;
	this.gbPalette = [];
	this.gbColorizedPalette = [];
	this.gbcPalette = [];
	this.transparentCutoff = 4;			// min "attrib" value where transparency can occur (Default is 4 (GB mode))
	this.bgEnabled = true;
	this.spritePriorityEnabled = true;
	this.tileReadState = [];			// true if there are any images to be invalidated
	this.windowSourceLine = 0;
	this.colors = new Array(0x80EFFFDE, 0x80ADD794, 0x80529273, 0x80183442);	//"Classic" GameBoy palette colors.
	this.frameCount = settings[12];		//Frame skip tracker
	this.weaveLookup = [];
	this.width = 160;
	this.height = 144;
	this.pixelCount = this.width * this.height;
	this.rgbCount = this.pixelCount * 4;
	this.widthRatio = 160 / this.width;
	this.heightRatio = 144 / this.height;
	this.palette = null;				//Pointer to the current palette we're using (Used for palette switches during boot or so it can be done anytime)
}


// Getters/Setters that make certain that the system is correct
// TO BE ONLY USED WHILE DEBUGGING A PROBLEM!!
// 16bit Registers
/*GameBoyCore.prototype.__defineGetter__("programCounter", function(){ return this._programCounter; });
GameBoyCore.prototype.__defineSetter__("programCounter", function(val){
	if( (val & 0xFFFF) != val )
		throw( new Error( "programCounter was set to a value outside allowed range! '" + val + "'" ));
	this._programCounter = val;
	});
GameBoyCore.prototype.__defineGetter__("stackPointer", function(){ return this._stackPointer; });
GameBoyCore.prototype.__defineSetter__("stackPointer", function(val){
	if( (val & 0xFFFF) != val )
		throw( new Error( "stackPointer was set to a value outside allowed range! '" + val + "'" ));
	this._stackPointer = val;
	});
GameBoyCore.prototype.__defineGetter__("registerHL", function(){ return this._registerHL; });
GameBoyCore.prototype.__defineSetter__("registerHL", function(val){
	if( (val & 0xFFFF) != val )
		throw( new Error( "registerHL was set to a value outside allowed range! '" + val + "'" ));
	this._registerHL = val;
	});
// 8bit Registers
GameBoyCore.prototype.__defineGetter__("registerA", function(){ return this._registerA; });
GameBoyCore.prototype.__defineSetter__("registerA", function(val){
	if( (val & 0xFF) != val )
		throw( new Error( "registerA was set to a value outside allowed range! '" + val + "'" ));
	this._registerA = val;
	});
GameBoyCore.prototype.__defineGetter__("registerB", function(){ return this._registerB; });
GameBoyCore.prototype.__defineSetter__("registerB", function(val){
	if( (val & 0xFF) != val )
		throw( new Error( "registerB was set to a value outside allowed range! '" + val + "'" ));
	this._registerB = val;
	});
GameBoyCore.prototype.__defineGetter__("registerC", function(){ return this._registerC; });
GameBoyCore.prototype.__defineSetter__("registerC", function(val){
	if( (val & 0xFF) != val )
		throw( new Error( "registerC was set to a value outside allowed range! '" + val + "'" ));
	this._registerC = val;
	});
GameBoyCore.prototype.__defineGetter__("registerD", function(){ return this._registerD; });
GameBoyCore.prototype.__defineSetter__("registerD", function(val){
	if( (val & 0xFF) != val )
		throw( new Error( "registerD was set to a value outside allowed range! '" + val + "'" ));
	this._registerD = val;
	});
GameBoyCore.prototype.__defineGetter__("registerE", function(){ return this._registerE; });
GameBoyCore.prototype.__defineSetter__("registerE", function(val){
	if( (val & 0xFF) != val )
		throw( new Error( "registerE was set to a value outside allowed range! '" + val + "'" ));
	this._registerE = val;
	});
// Flags
GameBoyCore.prototype.__defineGetter__("FZero", function(){ return this._FZero; });
GameBoyCore.prototype.__defineSetter__("FZero", function(val){
	if( typeof val != "boolean" )
		throw( new Error( "FZero was not boolean! '" + val + "'" ));
	this._FZero = val;
	});
GameBoyCore.prototype.__defineGetter__("FSubtract", function(){ return this._FSubtract; });
GameBoyCore.prototype.__defineSetter__("FSubtract", function(val){
	if( typeof val != "boolean" )
		throw( new Error( "FSubtract was not boolean! '" + val + "'" ));
	this._FSubtract = val;
	});
GameBoyCore.prototype.__defineGetter__("FHalfCarry", function(){ return this._FHalfCarry; });
GameBoyCore.prototype.__defineSetter__("FHalfCarry", function(val){
	if( typeof val != "boolean" )
		throw( new Error( "FHalfCarry was not boolean! '" + val + "'" ));
	this._FHalfCarry = val;
	});
GameBoyCore.prototype.__defineGetter__("FCarry", function(){ return this._FCarry; });
GameBoyCore.prototype.__defineSetter__("FCarry", function(val){
	if( typeof val != "boolean" )
		throw( new Error( "FCarry was not boolean! '" + val + "'" ));
	this._FCarry = val;
	});*/


//Helper Functions
GameBoyCore.prototype.usbtsb = function (ubyte) {
	//Unsigned byte to signed byte:
	return (ubyte > 0x7F) ? ((ubyte & 0x7F) - 0x80) : ubyte;
}
/**
* Unsigned Byte to Signed Byte using 2's Complement.
* @author Hugh Nougher
* @todo Propergate rename of this method.
* 
* Note: This op is hard coded in OPCODEs 0x20, 0x28, 0x30 and 0x38 since they are very hot paths.
*/
GameBoyCore.prototype.UI8_to_SI8 = function( ubyte )
{
	return (ubyte & 0x7F) - (ubyte & 0x80);
};

GameBoyCore.prototype.unsbtub = function (ubyte) {
	//Keep an unsigned byte unsigned:
	if (ubyte < 0) {
		ubyte += 0x100;
	}
	return ubyte;	//If this function is called, no wrapping requested.
}
GameBoyCore.prototype.nswtuw = function (uword) {
	//Keep an unsigned word unsigned:
	if (uword < 0) {
		uword += 0x10000;
	}
	return uword & 0xFFFF;	//Wrap also...
}
GameBoyCore.prototype.unswtuw = function (uword) {
	//Keep an unsigned word unsigned:
	if (uword < 0) {
		uword += 0x10000;
	}
	return uword;	//If this function is called, no wrapping requested.
}
GameBoyCore.prototype.toTypedArray = function (baseArray, bit32, unsigned) {
	try {
		var typedArrayTemp = (bit32) ? ((unsigned) ? new Uint32Array(baseArray.length) : new Int32Array(baseArray.length)) : new Uint8Array(baseArray.length);
		for (var index = 0; index < baseArray.length; index++) {
			typedArrayTemp[index] = baseArray[index];
		}
		return typedArrayTemp;
	}
	catch (error) {
		cout("Could not convert an array to a typed array: " + error.message, 1);
		return baseArray;
	}
}
GameBoyCore.prototype.fromTypedArray = function (baseArray) {
	try {
		var arrayTemp = new Array(baseArray.length);
		for (var index = 0; index < baseArray.length; index++) {
			arrayTemp[index] = baseArray[index];
		}
		return arrayTemp;
	}
	catch (error) {
		return baseArray;
	}
}
GameBoyCore.prototype.getTypedArray = function (length, defaultValue, numberType) {
	try {
		if (settings[22]) {
			throw(new Error(""));
		}
		switch (numberType) {
			case "uint8":
				var arrayHandle = new Uint8Array(length);
				break;
			case "int8":
				var arrayHandle = new Int8Array(length);
				break;
			case "uint16":
				var arrayHandle = new Uint16Array(length);
				break;
			case "int16":
				var arrayHandle = new Int16Array(length);
				break;
			case "uint32":
				var arrayHandle = new Uint32Array(length);
				break;
			case "int32":
				var arrayHandle = new Int32Array(length);
				break;
			case "float32":
				var arrayHandle = new Float32Array(length);
		}
		if (defaultValue > 0) {
			var index = 0;
			while (index < length) {
				arrayHandle[index++] = defaultValue;
			}
		}
	}
	catch (error) {
		var arrayHandle = new Array(length);
		var index = 0;
		while (index < length) {
			arrayHandle[index++] = defaultValue;
		}
	}
	return arrayHandle;
}
GameBoyCore.prototype.ArrayPad = function (length, defaultValue) {
	var arrayHandle = new Array(length);
	var index = 0;
	while (index < length) {
		arrayHandle[index++] = defaultValue;
	}
	return arrayHandle;
}

<?php

$coreParts = scandir('./coreParts/');
foreach ($coreParts AS $corePart)
{
	if( substr($corePart,-3) == ".js" )
		require 'coreParts/' .$corePart;
}

?>
