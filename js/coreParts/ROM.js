
/**
* Hugh remade this during update for use in worker.
* @author Hugh Nougher
*/
GameBoyCore.prototype.ROMLoad = function () {
	// Create the Array to hold the ROM
	this.ROM = ArrayCreate(this.ROMImage.length, "UI8", 0);
	
	// Did we use the GBC BIOS?
	this.usedBootROM = settings[16];
	
	// Copy ROM into Array from RAW Data
	for (var romIndex = 0; romIndex < this.ROMImage.length; romIndex++)
		this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
	
	// Load the first two ROM banks (0x0000 - 0x7FFF) into regular gameboy memory:
	var tmpEnd = Math.min( this.ROMImage.length, 0x8000 );
	for (var romIndex = 0; romIndex < tmpEnd; romIndex++) {
		if (!this.usedBootROM || romIndex >= 0x900 || (romIndex >= 0x100 && romIndex < 0x200)) {
			this.memory[romIndex] = this.ROM[romIndex];		//Load in the game ROM.
		}
		else {
			this.memory[romIndex] = this.GBCBOOTROM[romIndex];	//Load in the GameBoy Color BOOT ROM.
		}
	}
	delete tmpEnd;
	
	// ROM name
	this.name = "";
	for (var index = 0x134; index < 0x13F; index++) {
		if (this.ROM[index] > 0)
			this.name += this.ROMImage[index];
	}
	
	// ROM game code (for newer games)
	this.gameCode = "";
	for (var index = 0x13F; index < 0x143; index++) {
		if (this.ROM[index] > 0)
			this.gameCode += this.ROMImage[index];
	}
	
	// Cartridge type
	this.cartridgeType = this.ROM[0x147];
	
	// Output some trace about the ROM we are loading
	cout("Game Title[Code]: " + this.name + "[" + this.gameCode + "][" + this.ROMImage[0x143] + "], Cartridge type #" + this.cartridgeType, 0);

	//Map out ROM cartridge sub-types.
	var MBCType = "";
	switch (this.cartridgeType) {
		case 0x00:
			//ROM w/o bank switching
			if (!settings[9]) {
				MBCType = "ROM";
				break;
			}
		case 0x01:
			this.cMBC1 = true;
			MBCType = "MBC1";
			break;
		case 0x02:
			this.cMBC1 = true;
			this.cSRAM = true;
			MBCType = "MBC1 + SRAM";
			break;
		case 0x03:
			this.cMBC1 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC1 + SRAM + BATT";
			break;
		case 0x05:
			this.cMBC2 = true;
			MBCType = "MBC2";
			break;
		case 0x06:
			this.cMBC2 = true;
			this.cBATT = true;
			MBCType = "MBC2 + BATT";
			break;
		case 0x08:
			this.cSRAM = true;
			MBCType = "ROM + SRAM";
			break;
		case 0x09:
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "ROM + SRAM + BATT";
			break;
		case 0x0B:
			this.cMMMO1 = true;
			MBCType = "MMMO1";
			break;
		case 0x0C:
			this.cMMMO1 = true;
			this.cSRAM = true;
			MBCType = "MMMO1 + SRAM";
			break;
		case 0x0D:
			this.cMMMO1 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MMMO1 + SRAM + BATT";
			break;
		case 0x0F:
			this.cMBC3 = true;
			this.cTIMER = true;
			this.cBATT = true;
			MBCType = "MBC3 + TIMER + BATT";
			break;
		case 0x10:
			this.cMBC3 = true;
			this.cTIMER = true;
			this.cBATT = true;
			this.cSRAM = true;
			MBCType = "MBC3 + TIMER + BATT + SRAM";
			break;
		case 0x11:
			this.cMBC3 = true;
			MBCType = "MBC3";
			break;
		case 0x12:
			this.cMBC3 = true;
			this.cSRAM = true;
			MBCType = "MBC3 + SRAM";
			break;
		case 0x13:
			this.cMBC3 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC3 + SRAM + BATT";
			break;
		case 0x19:
			this.cMBC5 = true;
			MBCType = "MBC5";
			break;
		case 0x1A:
			this.cMBC5 = true;
			this.cSRAM = true;
			MBCType = "MBC5 + SRAM";
			break;
		case 0x1B:
			this.cMBC5 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC5 + SRAM + BATT";
			break;
		case 0x1C:
			this.cRUMBLE = true;
			MBCType = "RUMBLE";
			break;
		case 0x1D:
			this.cRUMBLE = true;
			this.cSRAM = true;
			MBCType = "RUMBLE + SRAM";
			break;
		case 0x1E:
			this.cRUMBLE = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "RUMBLE + SRAM + BATT";
			break;
		case 0x1F:
			this.cCamera = true;
			MBCType = "GameBoy Camera";
			break;
		case 0xFD:
			this.cTAMA5 = true;
			MBCType = "TAMA5";
			break;
		case 0xFE:
			this.cHuC3 = true;
			MBCType = "HuC3";
			break;
		case 0xFF:
			this.cHuC1 = true;
			MBCType = "HuC1";
			break;
		default:
			MBCType = "Unknown";
			cout("Cartridge type is unknown.", 2);
			pause();
	}
	cout("Cartridge Type: " + MBCType + ".", 0);
	
	// ROM and RAM banks
	/** @todo Can ROMBanks and RAMBanks be changed to a Math.pow() call? */
	this.numROMBanks = this.ROMBanks[this.ROM[0x148]];
	cout(this.numROMBanks + " ROM banks.", 0);
	switch (this.RAMBanks[this.ROM[0x149]]) {
		case 0:
			cout("No RAM banking requested for allocation or MBC is of type 2.", 0);
			break;
		case 2:
			cout("1 RAM bank requested for allocation.", 0);
			break;
		case 3:
			cout("4 RAM banks requested for allocation.", 0);
			break;
		case 4:
			cout("16 RAM banks requested for allocation.", 0);
			break;
		default:
			cout("RAM bank amount requested is unknown, will use maximum allowed by specified MBC type.", 0);
	}
	//Check the GB/GBC mode byte:
	if (!this.usedBootROM) {
		switch (this.ROM[0x143]) {
			case 0x00:	//Only GB mode
				this.cGBC = false;
				cout("Only GB mode detected.", 0);
				break;
			case 0x80:	//Both GB + GBC modes
				this.cGBC = !settings[2];
				cout("GB and GBC mode detected.", 0);
				break;
			case 0xC0:	//Only GBC mode
				this.cGBC = true;
				cout("Only GBC mode detected.", 0);
				break;
			default:
				this.cGBC = false;
				cout("Unknown GameBoy game type code #" + this.ROM[0x143] + ", defaulting to GB mode (Old games don't have a type code).", 1);
		}
		this.inBootstrap = false;
		this.setupRAM();	//CPU/(V)RAM initialization.
		this.initSkipBootstrap();
	}
	else {
		this.cGBC = true;	//Allow the GBC boot ROM to run in GBC mode...
		this.setupRAM();	//CPU/(V)RAM initialization.
		this.initBootstrap();
	}
	this.checkPaletteType();
	
	//License Code Lookup:
	var cOldLicense = this.ROM[0x14B];
	var cNewLicense = (this.ROM[0x144] & 0xFF00) | (this.ROM[0x145] & 0xFF);
	if (cOldLicense != 0x33) {
		//Old Style License Header
		cout("Old style license code: " + cOldLicense, 0);
	}
	else {
		//New Style License Header
		cout("New style license code: " + cNewLicense, 0);
	}
}


GameBoyCore.prototype.disableBootROM = function () {
	//Remove any traces of the boot ROM from ROM memory.
	for (var index = 0; index < 0x900; index++) {
		if (index < 0x100 || index >= 0x200) {		//Skip the already loaded in ROM header.
			this.memory[index] = this.ROM[index];	//Replace the GameBoy Color boot ROM with the game ROM.
		}
	}
	this.checkPaletteType();
	if (!this.cGBC) {
		//Clean up the post-boot (GB mode only) state:
		cout("Stepping down from GBC mode.", 0);
		this.tileCount /= 2;
		this.tileCountInvalidator = this.tileCount * 4;
		if (!settings[17]) {
			this.transparentCutoff = 4;
		}
		this.colorCount = 12;
		this.tileData.length = this.tileCount * this.colorCount;
		delete this.VRAM;
		delete this.GBCMemory;
		//Possible Extra: shorten some gfx arrays to the length that we need (Remove the unused indices)
	}
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
}


