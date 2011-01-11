
GameBoyCore.prototype.saveState = function () {
	return [
		this.fromTypedArray(this.ROM),
		this.inBootstrap,
		this.registerA,
		this.FZero,
		this.FSubtract,
		this.FHalfCarry,
		this.FCarry,
		this.registerB,
		this.registerC,
		this.registerD,
		this.registerE,
		this.registersHL,
		this.stackPointer,
		this.programCounter,
		this.halt,
		this.IME,
		this.hdmaRunning,
		this.CPUTicks,
		this.multiplier,
		this.fromTypedArray(this.memory),
		this.fromTypedArray(this.MBCRam),
		this.fromTypedArray(this.VRAM),
		this.currVRAMBank,
		this.fromTypedArray(this.GBCMemory),
		this.MBC1Mode,
		this.MBCRAMBanksEnabled,
		this.currMBCRAMBank,
		this.currMBCRAMBankPosition,
		this.cGBC,
		this.gbcRamBank,
		this.gbcRamBankPosition,
		this.ROMBank1offs,
		this.currentROMBank,
		this.cartridgeType,
		this.name,
		this.gameCode,
		this.modeSTAT,
		this.LYCMatchTriggerSTAT,
		this.mode2TriggerSTAT,
		this.mode1TriggerSTAT,
		this.mode0TriggerSTAT,
		this.LCDisOn,
		this.gfxWindowY,
		this.gfxWindowDisplay,
		this.gfxSpriteShow,
		this.gfxSpriteDouble,
		this.gfxBackgroundY,
		this.gfxBackgroundX,
		this.TIMAEnabled,
		this.DIVTicks,
		this.LCDTicks,
		this.timerTicks,
		this.TACClocker,
		this.untilEnable,
		this.lastIteration,
		this.cMBC1,
		this.cMBC2,
		this.cMBC3,
		this.cMBC5,
		this.cSRAM,
		this.cMMMO1,
		this.cRUMBLE,
		this.cCamera,
		this.cTAMA5,
		this.cHuC3,
		this.cHuC1,
		this.drewBlank,
		this.tileData.slice(0),
		this.fromTypedArray(this.frameBuffer),
		this.tileCount,
		this.colorCount,
		this.gbPalette,
		this.gbcRawPalette,
		this.gbcPalette,
		this.transparentCutoff,
		this.bgEnabled,
		this.spritePriorityEnabled,
		this.fromTypedArray(this.tileReadState),
		this.windowSourceLine,
		this.channel1adjustedFrequencyPrep,
		this.channel1duty,
		this.channel1lastSampleLookup,
		this.channel1adjustedDuty,
		this.channel1totalLength,
		this.channel1envelopeVolume,
		this.channel1currentVolume,
		this.channel1envelopeType,
		this.channel1envelopeSweeps,
		this.channel1consecutive,
		this.channel1frequency,
		this.channel1volumeEnvTime,
		this.channel1lastTotalLength,
		this.channel1timeSweep,
		this.channel1lastTimeSweep,
		this.channel1numSweep,
		this.channel1frequencySweepDivider,
		this.channel1decreaseSweep,
		this.channel2adjustedFrequencyPrep,
		this.channel2duty,
		this.channel2lastSampleLookup,
		this.channel2adjustedDuty,
		this.channel2totalLength,
		this.channel2envelopeVolume,
		this.channel2currentVolume,
		this.channel2envelopeType,
		this.channel2envelopeSweeps,
		this.channel2consecutive,
		this.channel2frequency,
		this.channel2volumeEnvTime,
		this.channel2lastTotalLength,
		this.channel3canPlay,
		this.channel3totalLength,
		this.channel3lastTotalLength,
		this.channel3patternType,
		this.channel3frequency,
		this.channel3consecutive,
		this.channel3PCM,
		this.channel3adjustedFrequencyPrep,
		this.channel4adjustedFrequencyPrep,
		this.channel4lastSampleLookup,
		this.channel4totalLength,
		this.channel4envelopeVolume,
		this.channel4currentVolume,
		this.channel4envelopeType,
		this.channel4envelopeSweeps,
		this.channel4consecutive,
		this.channel4volumeEnvTime,
		this.channel4lastTotalLength,
		this.soundMasterEnabled,
		this.VinLeftChannelEnabled,
		this.VinRightChannelEnabled,
		this.VinLeftChannelMasterVolume,
		this.VinRightChannelMasterVolume,
		this.vinLeft,
		this.vinRight,
		this.leftChannel,
		this.rightChannel,
		this.actualScanLine,
		this.RTCisLatched,
		this.latchedSeconds,
		this.latchedMinutes,
		this.latchedHours,
		this.latchedLDays,
		this.latchedHDays,
		this.RTCSeconds,
		this.RTCMinutes,
		this.RTCHours,
		this.RTCDays,
		this.RTCDayOverFlow,
		this.RTCHALT,
		this.gbColorizedPalette,
		this.usedBootROM,
		this.skipPCIncrement,
		this.STATTracker,
		this.gbcRamBankPositionECHO,
		this.numRAMBanks
	];
}
GameBoyCore.prototype.returnFromState = function (returnedFrom) {
	var index = 0;
	var state = returnedFrom.slice(0);
	this.ROM = this.toTypedArray(state[index++], false, false);
	this.inBootstrap = state[index++];
	this.registerA = state[index++];
	this.FZero = state[index++];
	this.FSubtract = state[index++];
	this.FHalfCarry = state[index++];
	this.FCarry = state[index++];
	this.registerB = state[index++];
	this.registerC = state[index++];
	this.registerD = state[index++];
	this.registerE = state[index++];
	this.registersHL = state[index++];
	this.stackPointer = state[index++];
	this.programCounter = state[index++];
	this.halt = state[index++];
	this.IME = state[index++];
	this.hdmaRunning = state[index++];
	this.CPUTicks = state[index++];
	this.multiplier = state[index++];
	this.memory = this.toTypedArray(state[index++], false, false);
	this.MBCRam = this.toTypedArray(state[index++], false, false);
	this.VRAM = this.toTypedArray(state[index++], false, false);
	this.currVRAMBank = state[index++];
	this.GBCMemory = this.toTypedArray(state[index++], false, false);
	this.MBC1Mode = state[index++];
	this.MBCRAMBanksEnabled = state[index++];
	this.currMBCRAMBank = state[index++];
	this.currMBCRAMBankPosition = state[index++];
	this.cGBC = state[index++];
	this.gbcRamBank = state[index++];
	this.gbcRamBankPosition = state[index++];
	this.ROMBank1offs = state[index++];
	this.currentROMBank = state[index++];
	this.cartridgeType = state[index++];
	this.name = state[index++];
	this.gameCode = state[index++];
	this.modeSTAT = state[index++];
	this.LYCMatchTriggerSTAT = state[index++];
	this.mode2TriggerSTAT = state[index++];
	this.mode1TriggerSTAT = state[index++];
	this.mode0TriggerSTAT = state[index++];
	this.LCDisOn = state[index++];
	this.gfxWindowY = state[index++];
	this.gfxWindowDisplay = state[index++];
	this.gfxSpriteShow = state[index++];
	this.gfxSpriteDouble = state[index++];
	this.gfxBackgroundY = state[index++];
	this.gfxBackgroundX = state[index++];
	this.TIMAEnabled = state[index++];
	this.DIVTicks = state[index++];
	this.LCDTicks = state[index++];
	this.timerTicks = state[index++];
	this.TACClocker = state[index++];
	this.untilEnable = state[index++];
	this.lastIteration = state[index++];
	this.cMBC1 = state[index++];
	this.cMBC2 = state[index++];
	this.cMBC3 = state[index++];
	this.cMBC5 = state[index++];
	this.cSRAM = state[index++];
	this.cMMMO1 = state[index++];
	this.cRUMBLE = state[index++];
	this.cCamera = state[index++];
	this.cTAMA5 = state[index++];
	this.cHuC3 = state[index++];
	this.cHuC1 = state[index++];
	this.drewBlank = state[index++];
	this.tileData = state[index++];
	this.frameBuffer = this.toTypedArray(state[index++], true, false);
	this.tileCount = state[index++];
	this.colorCount = state[index++];
	this.gbPalette = state[index++];
	this.gbcRawPalette = state[index++];
	this.gbcPalette = state[index++];
	this.transparentCutoff = state[index++];
	this.bgEnabled = state[index++];
	this.spritePriorityEnabled = state[index++];
	this.tileReadState = this.toTypedArray(state[index++], false, false);
	this.windowSourceLine = state[index++];
	this.channel1adjustedFrequencyPrep = state[index++];
	this.channel1duty = state[index++];
	this.channel1lastSampleLookup = state[index++];
	this.channel1adjustedDuty = state[index++];
	this.channel1totalLength = state[index++];
	this.channel1envelopeVolume = state[index++];
	this.channel1currentVolume = state[index++];
	this.channel1envelopeType = state[index++];
	this.channel1envelopeSweeps = state[index++];
	this.channel1consecutive = state[index++];
	this.channel1frequency = state[index++];
	this.channel1volumeEnvTime = state[index++];
	this.channel1lastTotalLength = state[index++];
	this.channel1timeSweep = state[index++];
	this.channel1lastTimeSweep = state[index++];
	this.channel1numSweep = state[index++];
	this.channel1frequencySweepDivider = state[index++];
	this.channel1decreaseSweep = state[index++];
	this.channel2adjustedFrequencyPrep = state[index++];
	this.channel2duty = state[index++];
	this.channel2lastSampleLookup = state[index++];
	this.channel2adjustedDuty = state[index++];
	this.channel2totalLength = state[index++];
	this.channel2envelopeVolume = state[index++];
	this.channel2currentVolume = state[index++];
	this.channel2envelopeType = state[index++];
	this.channel2envelopeSweeps = state[index++];
	this.channel2consecutive = state[index++];
	this.channel2frequency = state[index++];
	this.channel2volumeEnvTime = state[index++];
	this.channel2lastTotalLength = state[index++];
	this.channel3canPlay = state[index++];
	this.channel3totalLength = state[index++];
	this.channel3lastTotalLength = state[index++];
	this.channel3patternType = state[index++];
	this.channel3frequency = state[index++];
	this.channel3consecutive = state[index++];
	this.channel3PCM = state[index++];
	this.channel3adjustedFrequencyPrep = state[index++];
	this.channel4adjustedFrequencyPrep = state[index++];
	this.channel4lastSampleLookup = state[index++];
	this.channel4totalLength = state[index++];
	this.channel4envelopeVolume = state[index++];
	this.channel4currentVolume = state[index++];
	this.channel4envelopeType = state[index++];
	this.channel4envelopeSweeps = state[index++];
	this.channel4consecutive = state[index++];
	this.channel4volumeEnvTime = state[index++];
	this.channel4lastTotalLength = state[index++];
	this.soundMasterEnabled = state[index++];
	this.VinLeftChannelEnabled = state[index++];
	this.VinRightChannelEnabled = state[index++];
	this.VinLeftChannelMasterVolume = state[index++];
	this.VinRightChannelMasterVolume = state[index++];
	this.vinLeft = state[index++];
	this.vinRight = state[index++];
	this.leftChannel = state[index++];
	this.rightChannel = state[index++];
	this.actualScanLine = state[index++];
	this.RTCisLatched = state[index++];
	this.latchedSeconds = state[index++];
	this.latchedMinutes = state[index++];
	this.latchedHours = state[index++];
	this.latchedLDays = state[index++];
	this.latchedHDays = state[index++];
	this.RTCSeconds = state[index++];
	this.RTCMinutes = state[index++];
	this.RTCHours = state[index++];
	this.RTCDays = state[index++];
	this.RTCDayOverFlow = state[index++];
	this.RTCHALT = state[index++];
	this.gbColorizedPalette = state[index++];
	this.usedBootROM = state[index++];
	this.skipPCIncrement = state[index++];
	this.STATTracker = state[index++];
	this.gbcRamBankPositionECHO = state[index++];
	this.numRAMBanks = state[index];
	this.tileCountInvalidator = this.tileCount * 4;
	this.fromSaveState = true;
	this.checkPaletteType();
	this.convertAuxilliary();
	this.initializeLCDController();
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
	this.initLCD();
	this.initSound();
	this.drawToCanvas();
}
GameBoyCore.prototype.start = function () {
	settings[4] = 0;	//Reset the frame skip setting.
	this.initializeLCDController();	//Compile the LCD controller functions.
	this.initMemory();	//Write the startup memory.
	this.ROMLoad();		//Load the ROM into memory and get cartridge information from it.
	this.initLCD();		//Initializae the graphics.
	this.initSound();	//Sound object initialization.
	this.run();			//Start the emulation.
}

GameBoyCore.prototype.initSkipBootstrap = function () {
	//Start as an unset device:
	cout("Starting without the GBC boot ROM.", 0);
	this.programCounter = 0x100;
	this.stackPointer = 0xFFFE;
	this.IME = true;
	this.LCDTicks = 15;
	this.DIVTicks = 14;
	this.registerA = (this.cGBC) ? 0x11 : 0x1;
	this.registerB = 0;
	this.registerC = 0x13;
	this.registerD = 0;
	this.registerE = 0xD8;
	this.FZero = true;
	this.FSubtract = false;
	this.FHalfCarry = true;
	this.FCarry = true;
	this.registersHL = 0x014D;
	this.leftChannel = new Array(true, true, true, false);
	this.rightChannel = new Array(true, true, true, false);
	//Fill in the boot ROM set register values
	//Default values to the GB boot ROM values, then fill in the GBC boot ROM values after ROM loading
	var index = 0xFF;
	while (index >= 0) {
		if (index >= 0x30 && index < 0x40) {
			this.memoryWrite(0xFF00 + index, this.ffxxDump[index]);
		}
		else {
			switch (index) {
				case 0x00:
				case 0x01:
				case 0x02:
				case 0x07:
				case 0x0F:
				case 0x40:
				case 0xFF:
					this.memoryWrite(0xFF00 + index, this.ffxxDump[index]);
					break;
				default:
					this.memory[0xFF00 + index] = this.ffxxDump[index];
			}
		}
		index--;
	}
}
GameBoyCore.prototype.initBootstrap = function () {
	//Start as an unset device:
	cout("Starting the GBC boot ROM.", 0);
	this.programCounter = 0;
	this.stackPointer = 0;
	this.IME = false;
	this.LCDTicks = 0;
	this.DIVTicks = 0;
	this.registerA = 0;
	this.registerB = 0;
	this.registerC = 0;
	this.registerD = 0;
	this.registerE = 0;
	this.FZero = this.FSubtract = this.FHalfCarry = this.FCarry = false;
	this.registersHL = 0;
	this.leftChannel = this.ArrayPad(4, false);
	this.rightChannel = this.ArrayPad(4, false);
	this.channel2frequency = this.channel1frequency = 0;
	this.channel2volumeEnvTime = this.channel1volumeEnvTime = 0;
	this.channel2consecutive = this.channel1consecutive = true;
	this.memory[0xFF00] = 0xF;	//Set the joypad state.
}

GameBoyCore.prototype.JoyPadEvent = function (key, down) {
	if (down) {
		this.JoyPad &= 0xFF ^ (1 << key);
		/*if (!this.cGBC) {
			this.memory[0xFF0F] |= 0x10;	//A real GBC doesn't set this!
		}*/
	}
	else {
		this.JoyPad |= (1 << key);
	}
	this.memory[0xFF00] = (this.memory[0xFF00] & 0x30) + ((((this.memory[0xFF00] & 0x20) == 0) ? (this.JoyPad >> 4) : 0xF) & (((this.memory[0xFF00] & 0x10) == 0) ? (this.JoyPad & 0xF) : 0xF));
}


/**
* Prepair to run main loop.
* This runs once per frame at the start.
*/
GameBoyCore.prototype.run = function () {
	//The preprocessing before the actual iteration loop:
	try {
		if ((this.stopEmulator & 2) == 0) {
			if ((this.stopEmulator & 1) == 1) {
				this.stopEmulator = 0;
				this.clockUpdate();			//Frame skip and RTC code.
				this.audioUpdate();			//Lookup the rollover buffer and output WAVE PCM samples if sound is on and have fallen back to it.
				if (!this.halt) {			//If no HALT... Execute normally
					this.executeIteration();
				}
				else {						//If we bailed out of a halt because the iteration ran down its timing.
					HNOpcode_Usage[0x76]++;
					var opData = this.OPCODE[0x76];
					this.CPUTicks = opData[1];
					opData[0](this);
					/*
					this.CPUTicks = this.TICKTable[0x76];
					this.OPCODE[0x76](this);
					*/
					
					//Execute Interrupt:
					// Hugh added an extra check to this if in case an interrupt is fake then made the
					// value get directly passed to interupt handler
					var interrupts = this.memory[0xFFFF] & this.memory[0xFF0F];
					if( interrupts & 0x1F )
						this.runInterrupt( interrupts );
					//	this.runInterrupt();
					
					//Timing:
					this.updateCore();
					this.executeIteration();
				}
			}
			else {		//We can only get here if there was an internal error, but the loop was restarted.
				cout("Iterator restarted a faulted core.", 2);
				pause();
			}
		}
	}
	catch (error) {
		if (error.message != "HALT_OVERRUN") {
			cout("GameBoy runtime error: " + error.message + "; line: " + error.lineNumber, 2);
		}
	}
}

/**
* Contains the main loop for the OPCODE processing.
*/
GameBoyCore.prototype.executeIteration = function () {
	//Iterate the interpreter loop:
	var op = 0;
	while (this.stopEmulator == 0) {
		//Fetch the current opcode.
		op = this.memoryReader[this.programCounter](this, this.programCounter);
		if (!this.skipPCIncrement) {
			//Increment the program counter to the next instruction:
			//this.programCounter = (this.programCounter + 1) & 0xFFFF;
			this.programCounter++;
		}
		this.skipPCIncrement = false;
		
		HNOpcode_Usage[op]++;
		
		// Collect the OP
		var opData = this.OPCODE[op];
		//Get how many CPU cycles the current op code counts for:
		this.CPUTicks = opData[1];
		//this.CPUTicks = this.TICKTable[op];
		//Execute the OP code instruction:
		opData[0](this);
		//this.OPCODE[op]( this );
		
		//Interrupt Arming:
		switch (this.untilEnable) {
			case 1:
				this.IME = true;
			case 2:
				this.untilEnable--;
		}
		
		//Execute Interrupt:
		// Hugh added an extra check to this if in case an interrupt is fake then made the
		// value get directly passed to interupt handler
		var interrupts = this.memory[0xFFFF] & this.memory[0xFF0F];
		if (this.IME && (interrupts & 0x1F)) {
		//if (this.IME) {
			this.runInterrupt(interrupts);
		//	this.runInterrupt();
		}
		
		//Timing:
		this.updateCore();
	}
}

/**
* This method is sometimes called > 100000 times a second.
* @todo With IF around when its called it reduces to ~10000. Is there interrupts being left out in > 0x10? Or is IME set badly?
*/
GameBoyCore.prototype.runInterrupt = function (interrupts) {
//GameBoyCore.prototype.runInterrupt = function () {
	var testbit = 1;
	var interrupts = this.memory[0xFFFF] & this.memory[0xFF0F];
	while (bitShift < 5) {
		//Check to see if an interrupt is enabled AND requested.
		if ((testbit & interrupts) == testbit) {
			this.IME = false;					//Reset the interrupt enabling.
			this.memory[0xFF0F] -= testbit;		//Reset the interrupt request.
			
			//Set the stack pointer to the current program counter value:
			this.stackPointer = (this.stackPointer - 1) & 0xFFFF;
			this.memoryWriter[this.stackPointer](this, this.stackPointer, this.programCounter >> 8);
			this.stackPointer = (this.stackPointer - 1) & 0xFFFF;
			this.memoryWriter[this.stackPointer](this, this.stackPointer, this.programCounter & 0xFF);
			
			//Set the program counter to the interrupt's address:
			this.programCounter = 0x0040 + (bitShift * 0x08);
			/*
			bitShift = 0 then (0 * 0x08) = 0x00 and programCounter = 0x0040 + 0x00 = 0x0040
			bitShift = 1 then (1 * 0x08) = 0x08 and programCounter = 0x0040 + 0x08 = 0x0048
			bitShift = 2 then (2 * 0x08) = 0x10 and programCounter = 0x0040 + 0x10 = 0x0050
			bitShift = 3 then (3 * 0x08) = 0x18 and programCounter = 0x0040 + 0x18 = 0x0058
			bitShift = 4 then (4 * 0x08) = 0x20 and programCounter = 0x0040 + 0x20 = 0x0060
			*/
			
			//Interrupts have a certain clock cycle length:
			this.CPUTicks += 5;	//People say it's around 5.
			break;	//We only want the highest priority interrupt.
		}
		
		testbit <<= 1;
		/*testbit = 0x01; // bitShift 0 (before it gets here)
		testbit = 0x02; // bitShift 1
		testbit = 0x04; // bitShift 2
		testbit = 0x08; // bitShift 3
		testbit = 0x10; // bitShift 4
		testbit = 0x20; // bitShift 5 (never run)*/
	}
}


GameBoyCore.prototype.scanLineMode2 = function () { // OAM in use
	if (this.modeSTAT != 2) {
		if (this.mode2TriggerSTAT) {
			this.memory[0xFF0F] |= 0x2;// set IF bit 1
		}
		this.STATTracker = 1;
		this.modeSTAT = 2;
	}
}
GameBoyCore.prototype.scanLineMode3 = function () { // OAM in use
	if (this.modeSTAT != 3) {
		if (this.mode2TriggerSTAT && this.STATTracker == 0) {
			this.memory[0xFF0F] |= 0x2;// set IF bit 1
		}
		this.STATTracker = 1;
		this.modeSTAT = 3;
	}
}
GameBoyCore.prototype.scanLineMode0 = function () { // H-Blank 
	if (this.modeSTAT != 0) {
		if (this.hdmaRunning && !this.halt && this.LCDisOn) {
			this.performHdma();	//H-Blank DMA
		}
		if (this.mode0TriggerSTAT || (this.mode2TriggerSTAT && this.STATTracker == 0)) {
			this.memory[0xFF0F] |= 0x2; // if STAT bit 3 -> set IF bit1
		}
		this.notifyScanline();
		this.STATTracker = 2;
		this.modeSTAT = 0;
	}
}
GameBoyCore.prototype.matchLYC = function () { // LY - LYC Compare
	if (this.memory[0xFF44] == this.memory[0xFF45]) { // If LY==LCY
		this.memory[0xFF41] |= 0x04; // set STAT bit 2: LY-LYC coincidence flag
		if (this.LYCMatchTriggerSTAT) {
			this.memory[0xFF0F] |= 0x2; // set IF bit 1
		}
	} 
	else {
		this.memory[0xFF41] &= 0xFB; // reset STAT bit 2 (LY!=LYC)
	}
}
GameBoyCore.prototype.updateCore = function () {
	// DIV control
	this.DIVTicks += this.CPUTicks;
	if (this.DIVTicks >= 0x40) {
		this.DIVTicks -= 0x40;
		this.memory[0xFF04] = (this.memory[0xFF04] + 1) & 0xFF; // inc DIV
	}
	//LCD Controller Ticks
	var timedTicks = this.CPUTicks / this.multiplier;
	// LCD Timing
	this.LCDTicks += timedTicks;				//LCD timing
	this.LCDCONTROL[this.actualScanLine](this);	//Scan Line and STAT Mode Control 
	//Audio Timing
	this.audioTicks += timedTicks;				//Not the same as the LCD timing (Cannot be altered by display on/off changes!!!).
	if (this.audioTicks >= settings[11]) {		//Are we past the granularity setting?
		var amount = this.audioTicks * this.samplesOut;
		var actual = Math.floor(amount);
		this.rollover += amount - actual;
		if (this.rollover >= 1) {
			this.rollover -= 1;
			actual += 1;
		}
		if (!this.audioOverflow && actual > 0) {
			this.generateAudio(actual);
		}
		//Emulator Timing (Timed against audio for optimization):
		this.emulatorTicks += this.audioTicks;
		if (this.emulatorTicks >= settings[13]) {
			if ((this.stopEmulator & 1) == 0) {	//Make sure we don't overdo the audio.
				this.playAudio();				//Output all the samples built up.
				if (this.drewBlank == 0) {		//LCD off takes at least 2 frames.
					this.drawToCanvas();		//Display frame
				}
			}
			this.stopEmulator |= 1;				//End current loop.
			this.emulatorTicks = 0;
		}
		this.audioTicks = 0;
	}
	// Internal Timer
	if (this.TIMAEnabled) {
		this.timerTicks += this.CPUTicks;
		while (this.timerTicks >= this.TACClocker) {
			this.timerTicks -= this.TACClocker;
			if (this.memory[0xFF05] == 0xFF) {
				this.memory[0xFF05] = this.memory[0xFF06];
				this.memory[0xFF0F] |= 0x4; // set IF bit 2
			}
			else {
				this.memory[0xFF05]++;
			}
		}
	}
}

GameBoyCore.prototype.clockUpdate = function () {
	//We're tying in the same timer for RTC and frame skipping, since we can and this reduces load.
	if (settings[7] || this.cTIMER) {
		var timeElapsed = new Date().getTime() - new Date(this.lastIteration).getTime();	//Get the numnber of milliseconds since this last executed.
		if (this.cTIMER && !this.RTCHALT) {
			//Update the MBC3 RTC:
			this.RTCSeconds += timeElapsed / 1000;
			while (this.RTCSeconds >= 60) {	//System can stutter, so the seconds difference can get large, thus the "while".
				this.RTCSeconds -= 60;
				this.RTCMinutes++;
				if (this.RTCMinutes >= 60) {
					this.RTCMinutes -= 60;
					this.RTCHours++;
					if (this.RTCHours >= 24) {
						this.RTCHours -= 24
						this.RTCDays++;
						if (this.RTCDays >= 512) {
							this.RTCDays -= 512;
							this.RTCDayOverFlow = true;
						}
					}
				}
			}
		}
		if (settings[7]) {
			//Auto Frame Skip:
			if (timeElapsed > settings[20]) {
				//Did not finish in time...
				if (settings[4] < settings[8]) {
					settings[4]++;
				}
			}
			else if (settings[4] > 0) {
				//We finished on time, decrease frame skipping (throttle to somewhere just below full speed)...
				settings[4]--;
			}
		}
		this.lastIteration = new Date().getTime();
	}
}
