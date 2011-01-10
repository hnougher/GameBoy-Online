
/**
* Converts the TICK tables to Typed Arrays if possible.
* @todo Remove this method if TICKTables stay merged
*/
GameBoyCore.prototype.convertAuxilliary = function () {
	try {
		// DAA table is done at startup if possible
		//this.DAATable = new Uint16Array(this.DAATable);
		// TICKTable was merged with OPCODE
		//this.TICKTable = new Uint8Array(this.TICKTable);
		// SecondaryTICKTable was merged with CBOPCODE
		//this.SecondaryTICKTable = new Uint8Array(this.SecondaryTICKTable);
	}
	catch (error) {
		cout("Could not convert the auxilliary arrays to typed arrays (Error \"" + error.message + "\").", 1);
	}
}

GameBoyCore.prototype.initMemory = function () {
	//Initialize the RAM:
	this.memory = ArrayCreate( 0x10000, "UI8", 0 );
	this.frameBuffer = ArrayCreate( 23040, "SI32", 0x00FFFFFF );
	this.gbPalette = ArrayCreate( 12, "SI32", 0 );				//32-bit signed
	this.gbColorizedPalette = ArrayCreate( 12, "SI32", 0 );	//32-bit signed
	this.gbcRawPalette = ArrayCreate( 0x80, "SI32", -1000 );	//32-bit signed
	this.gbcPalette = ArrayCreate( 0x40, "SI32" );				//32-bit signed
	this.convertAuxilliary();
	
	//Initialize the GBC Palette:
	for (var i = 0; i < 0x20; i++)
		this.gbcPalette[i] = -1;
	for (var i = 0x20; i < 0x40; i++)
		this.gbcPalette[i] = 0;
}


GameBoyCore.prototype.setupRAM = function () {
	//Setup the auxilliary/switchable RAM to their maximum possible size (Bad headers can lie).
	if (this.cMBC2) {
		this.numRAMBanks = 1 / 16;
	}
	else if (this.cMBC1 || this.cRUMBLE || this.cMBC3 || this.cHuC3) {
		this.numRAMBanks = 4;
	}
	else if (this.cMBC5) {
		this.numRAMBanks = 16;
	}
	else if (this.cSRAM) {
		this.numRAMBanks = 1;
	}
	
	if (this.numRAMBanks > 0) {
		if (!this.MBCRAMUtilized()) {
			//For ROM and unknown MBC cartridges using the external RAM:
			this.MBCRAMBanksEnabled = true;
		}
		//Switched RAM Used
		this.MBCRam = ArrayCreate(this.numRAMBanks * 0x2000, "UI8", 0);
	}
	cout("Actual bytes of MBC RAM allocated: " + (this.numRAMBanks * 0x2000), 0);

	//Setup the RAM for GBC mode.
	if (this.cGBC) {
		this.VRAM = ArrayCreate(0x2000, "UI8", 0);
		this.GBCMemory = ArrayCreate(0x7000, "UI8", 0);
		
		this.tileCount *= 2;
		this.tileCountInvalidator = this.tileCount * 4;
		this.colorCount = 64;
		this.transparentCutoff = 32;
	}
	
	// Make tile data array and tile read state array
	this.tileData = ArrayCreate(this.tileCount * this.colorCount, "STD", null);
	this.tileReadState = ArrayCreate(this.tileCount, "UI8", 0);
	
	// Compile the read/write jumps
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
}

/** @todo Can MBCRAMUtilized be removed and just inserted inline where used? */
GameBoyCore.prototype.MBCRAMUtilized = function () {
	return this.cMBC1 || this.cMBC2 || this.cMBC3 || this.cMBC5 || this.cRUMBLE;
}

GameBoyCore.prototype.performHdma = function () {
	this.CPUTicks += 1 + (8 * this.multiplier);
	var dmaSrc = (this.memory[0xFF51] << 8) + this.memory[0xFF52];
	var dmaDstRelative = (this.memory[0xFF53] << 8) + this.memory[0xFF54];
	var dmaDstFinal = dmaDstRelative + 0x10;
	var tileRelative = this.tileData.length - this.tileCount;
	if (this.currVRAMBank == 1) {
		while (dmaDstRelative < dmaDstFinal) {
			if (dmaDstRelative < 0x1800) {		// Bkg Tile data area
				var tileIndex = (dmaDstRelative >> 4) + 384;
				if (this.tileReadState[tileIndex] == 1) {
					var r = tileRelative + tileIndex;
					do {
						this.tileData[r] = null;
						r -= this.tileCount;
					} while (r >= 0);
					this.tileReadState[tileIndex] = 0;
				}
			}
			this.VRAM[dmaDstRelative++] = this.memoryRead(dmaSrc++);
		}
	}
	else {
		while (dmaDstRelative < dmaDstFinal) {
			if (dmaDstRelative < 0x1800) {		// Bkg Tile data area
				var tileIndex = dmaDstRelative >> 4;
				if (this.tileReadState[tileIndex] == 1) {
					var r = tileRelative + tileIndex;
					do {
						this.tileData[r] = null;
						r -= this.tileCount;
					} while (r >= 0);
					this.tileReadState[tileIndex] = 0;
				}
			}
			this.memory[0x8000 + dmaDstRelative++] = this.memoryRead(dmaSrc++);
		}
	}
	this.memory[0xFF51] = ((dmaSrc & 0xFF00) >> 8);
	this.memory[0xFF52] = (dmaSrc & 0x00F0);
	this.memory[0xFF53] = ((dmaDstFinal & 0x1F00) >> 8);
	this.memory[0xFF54] = (dmaDstFinal & 0x00F0);
	if (this.memory[0xFF55] == 0) {
		this.hdmaRunning = false;
		this.memory[0xFF55] = 0xFF;	//Transfer completed ("Hidden last step," since some ROMs don't imply this, but most do).
	}
	else {
		this.memory[0xFF55]--;
	}
}

//Memory Reading:
GameBoyCore.prototype.memoryRead = function (address) {
	//Act as a wrapper for reading the returns from the compiled jumps to memory.
	return this.memoryReader[address](this, address);	//This seems to be faster than the usual if/else.
}

GameBoyCore.prototype.memoryReadJumpCompile = function () {
	//Faster in some browsers, since we are doing less conditionals overall by implementing them in advance.
	for (var index = 0x0000; index <= 0xFFFF; index++) {
		if (index < 0x4000) {
			this.memoryReader[index] = this.memoryReadNormal;
		}
		else if (index < 0x8000) {
			this.memoryReader[index] = this.memoryReadROM;
		}
		else if (index >= 0x8000 && index < 0xA000) {
			this.memoryReader[index] = (this.cGBC) ? this.VRAMReadCGBCPU : this.VRAMReadDMGCPU;
		}
		else if (index >= 0xA000 && index < 0xC000) {
			if ((this.numRAMBanks == 1 / 16 && index < 0xA200) || this.numRAMBanks >= 1) {
				if (!this.cMBC3) {
					this.memoryReader[index] = this.memoryReadMBC;
				}
				else {
					//MBC3 RTC + RAM:
					this.memoryReader[index] = this.memoryReadMBC3;
				}
			}
			else {
				this.memoryReader[index] = this.memoryReadBAD;
			}
		}
		else if (index >= 0xC000 && index < 0xE000) {
			if (!this.cGBC || index < 0xD000) {
				this.memoryReader[index] = this.memoryReadNormal;
			}
			else {
				this.memoryReader[index] = this.memoryReadGBCMemory;
			}
		}
		else if (index >= 0xE000 && index < 0xFE00) {
			if (!this.cGBC || index < 0xF000) {
				this.memoryReader[index] = this.memoryReadECHONormal;
			}
			else {
				this.memoryReader[index] = this.memoryReadECHOGBCMemory;
			}
		}
		else if (index < 0xFEA0) {
			this.memoryReader[index] = this.memoryReadOAM;
		}
		else if (this.cGBC && index >= 0xFEA0 && index < 0xFF00) {
			this.memoryReader[index] = this.memoryReadNormal;
		}
		else if (index >= 0xFF00) {
			switch (index) {
				case 0xFF00:
					this.memoryReader[0xFF00] = function (parentObj, address) {
						return 0xC0 | parentObj.memory[0xFF00];	//Top nibble returns as set.
					}
					break;
				case 0xFF01:
					this.memoryReader[0xFF01] = function (parentObj, address) {
						return ((parentObj.memory[0xFF02] & 0x1) == 0x1) ? 0xFF : parentObj.memory[0xFF01];
					}
					break;
				case 0xFF02:
					if (this.cGBC) {
						this.memoryReader[0xFF02] = function (parentObj, address) {
							return 0x7C | parentObj.memory[0xFF02];
						}
					}
					else {
						this.memoryReader[0xFF02] = function (parentObj, address) {
							return 0x7E | parentObj.memory[0xFF02];
						}
					}
					break;
				case 0xFF07:
					this.memoryReader[0xFF07] = function (parentObj, address) {
						return 0xF8 | parentObj.memory[0xFF07];
					}
					break;
				case 0xFF0F:
					this.memoryReader[0xFF0F] = function (parentObj, address) {
						return 0xE0 | parentObj.memory[0xFF0F];
					}
					break;
				case 0xFF10:
					this.memoryReader[0xFF10] = function (parentObj, address) {
						return 0x80 | parentObj.memory[0xFF10];
					}
					break;
				case 0xFF11:
					this.memoryReader[0xFF11] = function (parentObj, address) {
						return 0x3F | parentObj.memory[0xFF11];
					}
					break;
				case 0xFF14:
					this.memoryReader[0xFF14] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF14];
					}
					break;
				case 0xFF16:
					this.memoryReader[0xFF16] = function (parentObj, address) {
						return 0x3F | parentObj.memory[0xFF16];
					}
					break;
				case 0xFF19:
					this.memoryReader[0xFF19] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF19];
					}
					break;
				case 0xFF1A:
					this.memoryReader[0xFF1A] = function (parentObj, address) {
						return 0x7F | parentObj.memory[0xFF1A];
					}
					break;
				case 0xFF1B:
					this.memoryReader[0xFF1B] = function (parentObj, address) {
						return 0xFF;
					}
					break;
				case 0xFF1C:
					this.memoryReader[0xFF1C] = function (parentObj, address) {
						return 0x9F | parentObj.memory[0xFF1C];
					}
					break;
				case 0xFF1E:
					this.memoryReader[0xFF1E] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF1E];
					}
					break;
				case 0xFF20:
					this.memoryReader[0xFF20] = function (parentObj, address) {
						return 0xFF;
					}
					break;
				case 0xFF23:
					this.memoryReader[0xFF23] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF23];
					}
					break;
				case 0xFF26:
					this.memoryReader[0xFF26] = function (parentObj, address) {
						return 0x70 | parentObj.memory[0xFF26];
					}
					break;
				case 0xFF30:
				case 0xFF31:
				case 0xFF32:
				case 0xFF33:
				case 0xFF34:
				case 0xFF35:
				case 0xFF36:
				case 0xFF37:
				case 0xFF38:
				case 0xFF39:
				case 0xFF3A:
				case 0xFF3B:
				case 0xFF3C:
				case 0xFF3D:
				case 0xFF3E:
				case 0xFF3F:
					this.memoryReader[index] = function (parentObj, address) {
						return ((parentObj.memory[0xFF26] & 0x4) == 0x4) ? 0xFF : parentObj.memory[address];
					}
					break;
				case 0xFF41:
					this.memoryReader[0xFF41] = function (parentObj, address) {
						return 0x80 | parentObj.memory[0xFF41] | parentObj.modeSTAT;
					}
					break;
				case 0xFF44:
					this.memoryReader[0xFF44] = function (parentObj, address) {
						return ((parentObj.LCDisOn) ? parentObj.memory[0xFF44] : 0);
					}
					break;
				case 0xFF4F:
					this.memoryReader[0xFF4F] = function (parentObj, address) {
						return parentObj.currVRAMBank;
					}
					break;
				default:
					this.memoryReader[index] = this.memoryReadNormal;
			}
		}
		else {
			this.memoryReader[index] = this.memoryReadBAD;
		}
	}
}


GameBoyCore.prototype.memoryReadNormal = function (parentObj, address) {
	return parentObj.memory[address];
}


GameBoyCore.prototype.memoryReadROM = function (parentObj, address) {
	return parentObj.ROM[parentObj.currentROMBank + address];
}


GameBoyCore.prototype.memoryReadMBC = function (parentObj, address) {
	//Switchable RAM
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
	}
	//cout("Reading from disabled RAM.", 1);
	return 0xFF;
}

GameBoyCore.prototype.memoryReadMBC3 = function (parentObj, address) {
	//Switchable RAM
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		switch (parentObj.currMBCRAMBank) {
			case 0x00:
			case 0x01:
			case 0x02:
			case 0x03:
				return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
				break;
			case 0x08:
				return parentObj.latchedSeconds;
				break;
			case 0x09:
				return parentObj.latchedMinutes;
				break;
			case 0x0A:
				return parentObj.latchedHours;
				break;
			case 0x0B:
				return parentObj.latchedLDays;
				break;
			case 0x0C:
				return (((parentObj.RTCDayOverFlow) ? 0x80 : 0) + ((parentObj.RTCHALT) ? 0x40 : 0)) + parentObj.latchedHDays;
		}
	}
	//cout("Reading from invalid or disabled RAM.", 1);
	return 0xFF;
}

GameBoyCore.prototype.memoryReadGBCMemory = function (parentObj, address) {
	return parentObj.GBCMemory[address + parentObj.gbcRamBankPosition];
}

GameBoyCore.prototype.memoryReadOAM = function (parentObj, address) {
	return (parentObj.modeSTAT > 1) ?  0xFF : parentObj.memory[address];
}

GameBoyCore.prototype.memoryReadECHOGBCMemory = function (parentObj, address) {
	return parentObj.GBCMemory[address + parentObj.gbcRamBankPositionECHO];
}

GameBoyCore.prototype.memoryReadECHONormal = function (parentObj, address) {
	return parentObj.memory[address - 0x2000];
}

GameBoyCore.prototype.memoryReadBAD = function (parentObj, address) {
	return 0xFF;
}

GameBoyCore.prototype.VRAMReadCGBCPU = function (parentObj, address) {
	//CPU Side Reading The VRAM (Optimized for GameBoy Color)
	return (parentObj.modeSTAT > 2) ? 0xFF : ((parentObj.currVRAMBank == 0) ? parentObj.memory[address] : parentObj.VRAM[address - 0x8000]);
}

GameBoyCore.prototype.VRAMReadDMGCPU = function (parentObj, address) {
	//CPU Side Reading The VRAM (Optimized for classic GameBoy)
	return (parentObj.modeSTAT > 2) ? 0xFF : parentObj.memory[address];
}

GameBoyCore.prototype.VRAMReadGFX = function (address, gbcBank) {
	//Graphics Side Reading The VRAM
	return ((!gbcBank) ? this.memory[0x8000 + address] : this.VRAM[address]);
}

GameBoyCore.prototype.setCurrentMBC1ROMBank = function () {
	//Read the cartridge ROM data from RAM memory:
	switch (this.ROMBank1offs) {
		case 0x00:
		case 0x20:
		case 0x40:
		case 0x60:
			//Bank calls for 0x00, 0x20, 0x40, and 0x60 are really for 0x01, 0x21, 0x41, and 0x61.
			this.currentROMBank = this.ROMBank1offs * 0x4000;
			break;
		default:
			this.currentROMBank = (this.ROMBank1offs - 1) * 0x4000;
	}
	while (this.currentROMBank + 0x4000 >= this.ROM.length) {
		this.currentROMBank -= this.ROM.length;
	}
}
GameBoyCore.prototype.setCurrentMBC2AND3ROMBank = function () {
	//Read the cartridge ROM data from RAM memory:
	//Only map bank 0 to bank 1 here (MBC2 is like MBC1, but can only do 16 banks, so only the bank 0 quirk appears for MBC2):
	this.currentROMBank = Math.max(this.ROMBank1offs - 1, 0) * 0x4000;
	while (this.currentROMBank + 0x4000 >= this.ROM.length) {
		this.currentROMBank -= this.ROM.length;
	}
}
GameBoyCore.prototype.setCurrentMBC5ROMBank = function () {
	//Read the cartridge ROM data from RAM memory:
	this.currentROMBank = (this.ROMBank1offs - 1) * 0x4000;
	while (this.currentROMBank + 0x4000 >= this.ROM.length) {
		this.currentROMBank -= this.ROM.length;
	}
}


//Memory Writing:
GameBoyCore.prototype.memoryWrite = function (address, data) {
	//Act as a wrapper for writing by compiled jumps to specific memory writing functions.
	this.memoryWriter[address](this, address, data);
}

GameBoyCore.prototype.memoryWriteJumpCompile = function () {
	//Faster in some browsers, since we are doing less conditionals overall by implementing them in advance.
	for (var index = 0x0000; index <= 0xFFFF; index++) {
		if (index < 0x8000) {
			if (this.cMBC1) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC1WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.MBC1WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.MBC1WriteType;
				}
			}
			else if (this.cMBC2) {
				if (index < 0x1000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index >= 0x2100 && index < 0x2200) {
					this.memoryWriter[index] = this.MBC2WriteROMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else if (this.cMBC3) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC3WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.MBC3WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.MBC3WriteRTCLatch;
				}
			}
			else if (this.cMBC5 || this.cRUMBLE) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x3000) {
					this.memoryWriter[index] = this.MBC5WriteROMBankLow;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC5WriteROMBankHigh;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = (this.cRUMBLE) ? this.RUMBLEWriteRAMBank : this.MBC5WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else if (this.cHuC3) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC3WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.HuC3WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else if (index < 0xA000) {
			this.memoryWriter[index] = this.VRAMWrite;
		}
		else if (index < 0xC000) {
			if ((this.numRAMBanks == 1 / 16 && index < 0xA200) || this.numRAMBanks >= 1) {
				if (!this.cMBC3) {
					this.memoryWriter[index] = this.memoryWriteMBCRAM;
				}
				else {
					//MBC3 RTC + RAM:
					this.memoryWriter[index] = this.memoryWriteMBC3RAM;
				}
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else if (index < 0xE000) {
			if (this.cGBC && index >= 0xD000) {
				this.memoryWriter[index] = this.memoryWriteGBCRAM;
			}
			else {
				this.memoryWriter[index] = this.memoryWriteNormal;
			}
		}
		else if (index < 0xFE00) {
			if (this.cGBC && index >= 0xF000) {
				this.memoryWriter[index] = this.memoryWriteECHOGBCRAM;
			}
			else {
				this.memoryWriter[index] = this.memoryWriteECHONormal;
			}
		}
		else if (index <= 0xFEA0) {
			this.memoryWriter[index] = this.memoryWriteOAMRAM;
		}
		else if (index < 0xFF00) {
			if (this.cGBC) {											//Only GBC has access to this RAM.
				this.memoryWriter[index] = this.memoryWriteNormal;
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else {
			//Start the I/O initialization by filling in the slots as normal memory:
			this.memoryWriter[index] = this.memoryWriteNormal;
		}
	}
	this.registerWriteJumpCompile();				//Compile the I/O write functions separately...
}

GameBoyCore.prototype.MBCWriteEnable = function (parentObj, address, data) {
	//MBC RAM Bank Enable/Disable:
	parentObj.MBCRAMBanksEnabled = ((data & 0x0F) == 0x0A);	//If lower nibble is 0x0A, then enable, otherwise disable.
}

GameBoyCore.prototype.MBC1WriteROMBank = function (parentObj, address, data) {
	//MBC1 ROM bank switching:
	parentObj.ROMBank1offs = (parentObj.ROMBank1offs & 0x60) | (data & 0x1F);
	parentObj.setCurrentMBC1ROMBank();
}

GameBoyCore.prototype.MBC1WriteRAMBank = function (parentObj, address, data) {
	//MBC1 RAM bank switching
	if (parentObj.MBC1Mode) {
		//4/32 Mode
		parentObj.currMBCRAMBank = data & 0x3;
		parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
	}
	else {
		//16/8 Mode
		parentObj.ROMBank1offs = ((data & 0x03) << 5) | (parentObj.ROMBank1offs & 0x1F);
		parentObj.setCurrentMBC1ROMBank();
	}
}

GameBoyCore.prototype.MBC1WriteType = function (parentObj, address, data) {
	//MBC1 mode setting:
	parentObj.MBC1Mode = ((data & 0x1) == 0x1);
}

GameBoyCore.prototype.MBC2WriteROMBank = function (parentObj, address, data) {
	//MBC2 ROM bank switching:
	parentObj.ROMBank1offs = data & 0x0F;
	parentObj.setCurrentMBC2AND3ROMBank();
}

GameBoyCore.prototype.MBC3WriteROMBank = function (parentObj, address, data) {
	//MBC3 ROM bank switching:
	parentObj.ROMBank1offs = data & 0x7F;
	parentObj.setCurrentMBC2AND3ROMBank();
}

GameBoyCore.prototype.MBC3WriteRAMBank = function (parentObj, address, data) {
	parentObj.currMBCRAMBank = data;
	if (data < 4) {
		//MBC3 RAM bank switching
		parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
	}
}

GameBoyCore.prototype.MBC3WriteRTCLatch = function (parentObj, address, data) {
	if (data == 0) {
		parentObj.RTCisLatched = false;
	}
	else if (!parentObj.RTCisLatched) {
		//Copy over the current RTC time for reading.
		parentObj.RTCisLatched = true;
		parentObj.latchedSeconds = Math.floor(parentObj.RTCSeconds);
		parentObj.latchedMinutes = parentObj.RTCMinutes;
		parentObj.latchedHours = parentObj.RTCHours;
		parentObj.latchedLDays = (parentObj.RTCDays & 0xFF);
		parentObj.latchedHDays = parentObj.RTCDays >> 8;
	}
}

GameBoyCore.prototype.MBC5WriteROMBankLow = function (parentObj, address, data) {
	//MBC5 ROM bank switching:
	parentObj.ROMBank1offs = (parentObj.ROMBank1offs & 0x100) | data;
	parentObj.setCurrentMBC5ROMBank();
}

GameBoyCore.prototype.MBC5WriteROMBankHigh = function (parentObj, address, data) {
	//MBC5 ROM bank switching (by least significant bit):
	parentObj.ROMBank1offs  = ((data & 0x01) << 8) | (parentObj.ROMBank1offs & 0xFF);
	parentObj.setCurrentMBC5ROMBank();
}

GameBoyCore.prototype.MBC5WriteRAMBank = function (parentObj, address, data) {
	//MBC5 RAM bank switching
	parentObj.currMBCRAMBank = data & 0xF;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}

GameBoyCore.prototype.RUMBLEWriteRAMBank = function (parentObj, address, data) {
	//MBC5 RAM bank switching
	//Like MBC5, but bit 3 of the lower nibble is used for rumbling and bit 2 is ignored.
	parentObj.currMBCRAMBank = data & 0x3;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}

GameBoyCore.prototype.HuC3WriteRAMBank = function (parentObj, address, data) {
	//HuC3 RAM bank switching
	parentObj.currMBCRAMBank = data & 0x03;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}

GameBoyCore.prototype.cartIgnoreWrite = function (parentObj, address, data) {
	//We might have encountered illegal RAM writing or such, so just do nothing...
}

GameBoyCore.prototype.memoryWriteNormal = function (parentObj, address, data) {
	parentObj.memory[address] = data;
}

GameBoyCore.prototype.memoryWriteMBCRAM = function (parentObj, address, data) {
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition] = data;
	}
}

GameBoyCore.prototype.memoryWriteMBC3RAM = function (parentObj, address, data) {
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		switch (parentObj.currMBCRAMBank) {
			case 0x00:
			case 0x01:
			case 0x02:
			case 0x03:
				parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition] = data;
				break;
			case 0x08:
				if (data < 60) {
					parentObj.RTCSeconds = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x09:
				if (data < 60) {
					parentObj.RTCMinutes = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x0A:
				if (data < 24) {
					parentObj.RTCHours = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x0B:
				parentObj.RTCDays = (data & 0xFF) | (parentObj.RTCDays & 0x100);
				break;
			case 0x0C:
				parentObj.RTCDayOverFlow = (data & 0x80) == 0x80;
				parentObj.RTCHalt = (data & 0x40) == 0x40;
				parentObj.RTCDays = ((data & 0x1) << 8) | (parentObj.RTCDays & 0xFF);
				break;
			default:
				cout("Invalid MBC3 bank address selected: " + parentObj.currMBCRAMBank, 0);
		}
	}
}

GameBoyCore.prototype.memoryWriteGBCRAM = function (parentObj, address, data) {
	parentObj.GBCMemory[address + parentObj.gbcRamBankPosition] = data;
}

GameBoyCore.prototype.memoryWriteOAMRAM = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 2) {		//OAM RAM cannot be written to in mode 2 & 3
		parentObj.memory[address] = data;
	}
}

GameBoyCore.prototype.memoryWriteECHOGBCRAM = function (parentObj, address, data) {
	parentObj.GBCMemory[address + parentObj.gbcRamBankPositionECHO] = data;
}

GameBoyCore.prototype.memoryWriteECHONormal = function (parentObj, address, data) {
	parentObj.memory[address - 0x2000] = data;
}

GameBoyCore.prototype.VRAMWrite = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 3) {	//VRAM cannot be written to during mode 3
		if (address < 0x9800) {		// Bkg Tile data area
			var tileIndex = ((address - 0x8000) >> 4) + (384 * parentObj.currVRAMBank);
			if (parentObj.tileReadState[tileIndex] == 1) {
				var r = parentObj.tileData.length - parentObj.tileCount + tileIndex;
				do {
					parentObj.tileData[r] = null;
					r -= parentObj.tileCount;
				} while (r >= 0);
				parentObj.tileReadState[tileIndex] = 0;
			}
		}
		if (parentObj.currVRAMBank == 0) {
			parentObj.memory[address] = data;
		}
		else {
			parentObj.VRAM[address - 0x8000] = data;
		}
	}
}



GameBoyCore.prototype.registerWriteJumpCompile = function () {
	//I/O Registers (GB + GBC):
	this.memoryWriter[0xFF00] = function (parentObj, address, data) {
		parentObj.memory[0xFF00] = (data & 0x30) | ((((data & 0x20) == 0) ? (parentObj.JoyPad >> 4) : 0xF) & (((data & 0x10) == 0) ? (parentObj.JoyPad & 0xF) : 0xF));
	}
	this.memoryWriter[0xFF02] = function (parentObj, address, data) {
		if (((data & 0x1) == 0x1)) {
			//Internal clock:
			parentObj.memory[0xFF02] = (data & 0x7F);
			parentObj.memory[0xFF0F] |= 0x8;	//Get this time delayed...
		}
		else {
			//External clock:
			parentObj.memory[0xFF02] = data;
			//No connected serial device, so don't trigger interrupt...
		}
	}
	this.memoryWriter[0xFF04] = function (parentObj, address, data) {
		parentObj.memory[0xFF04] = 0;
	}
	this.memoryWriter[0xFF07] = function (parentObj, address, data) {
		parentObj.memory[0xFF07] = data & 0x07;
		parentObj.TIMAEnabled = (data & 0x04) == 0x04;
		parentObj.TACClocker = Math.pow(4, ((data & 0x3) != 0) ? (data & 0x3) : 4);	//TODO: Find a way to not make a conditional in here...
	}
	this.memoryWriter[0xFF10] = function (parentObj, address, data) {
		parentObj.channel1lastTimeSweep = parentObj.channel1timeSweep = Math.floor(((data & 0x70) >> 4) * parentObj.channel1TimeSweepPreMultiplier);
		parentObj.channel1numSweep = data & 0x07;
		parentObj.channel1frequencySweepDivider = 1 << parentObj.channel1numSweep;
		parentObj.channel1decreaseSweep = ((data & 0x08) == 0x08);
		parentObj.memory[0xFF10] = data;
	}
	this.memoryWriter[0xFF11] = function (parentObj, address, data) {
		parentObj.channel1duty = data >> 6;
		parentObj.channel1adjustedDuty = parentObj.dutyLookup[parentObj.channel1duty];
		parentObj.channel1lastTotalLength = parentObj.channel1totalLength = (0x40 - (data & 0x3F)) * parentObj.audioTotalLengthMultiplier;
		parentObj.memory[0xFF11] = data & 0xC0;
	}
	this.memoryWriter[0xFF12] = function (parentObj, address, data) {
		parentObj.channel1envelopeVolume = data >> 4;
		parentObj.channel1currentVolume = parentObj.channel1envelopeVolume / 0xF;
		parentObj.channel1envelopeType = ((data & 0x08) == 0x08);
		parentObj.channel1envelopeSweeps = data & 0x7;
		parentObj.channel1volumeEnvTime = parentObj.channel1envelopeSweeps * parentObj.volumeEnvelopePreMultiplier;
		parentObj.memory[0xFF12] = data;
	}
	this.memoryWriter[0xFF13] = function (parentObj, address, data) {
		parentObj.channel1frequency = (parentObj.channel1frequency & 0x700) | data;
			//Pre-calculate the frequency computation outside the waveform generator for speed:
		parentObj.channel1adjustedFrequencyPrep = parentObj.preChewedAudioComputationMultiplier / (0x800 - parentObj.channel1frequency);
		parentObj.memory[0xFF13] = data;
	}
	this.memoryWriter[0xFF14] = function (parentObj, address, data) {
		if ((data & 0x80) == 0x80) {
			parentObj.channel1envelopeVolume = parentObj.memory[0xFF12] >> 4;
			parentObj.channel1currentVolume = parentObj.channel1envelopeVolume / 0xF;
			parentObj.channel1envelopeSweeps = parentObj.memory[0xFF12] & 0x7;
			parentObj.channel1volumeEnvTime = parentObj.channel1envelopeSweeps * parentObj.volumeEnvelopePreMultiplier;
			parentObj.channel1totalLength = parentObj.channel1lastTotalLength;
			parentObj.channel1timeSweep = parentObj.channel1lastTimeSweep;
			parentObj.channel1numSweep = parentObj.memory[0xFF10] & 0x07;
			parentObj.channel1frequencySweepDivider = 1 << parentObj.channel1numSweep;
			if ((data & 0x40) == 0x40) {
				parentObj.memory[0xFF26] |= 0x1;
			}
		}
		parentObj.channel1consecutive = ((data & 0x40) == 0x0);
		parentObj.channel1frequency = ((data & 0x7) << 8) | (parentObj.channel1frequency & 0xFF);
		//Pre-calculate the frequency computation outside the waveform generator for speed:
		parentObj.channel1adjustedFrequencyPrep = parentObj.preChewedAudioComputationMultiplier / (0x800 - parentObj.channel1frequency);
		parentObj.memory[0xFF14] = data & 0x40;
	}
	this.memoryWriter[0xFF16] = function (parentObj, address, data) {
		parentObj.channel2duty = data >> 6;
		parentObj.channel2adjustedDuty = parentObj.dutyLookup[parentObj.channel2duty];
		parentObj.channel2lastTotalLength = parentObj.channel2totalLength = (0x40 - (data & 0x3F)) * parentObj.audioTotalLengthMultiplier;
		parentObj.memory[0xFF16] = data & 0xC0;
	}
	this.memoryWriter[0xFF17] = function (parentObj, address, data) {
		parentObj.channel2envelopeVolume = data >> 4;
		parentObj.channel2currentVolume = parentObj.channel2envelopeVolume / 0xF;
		parentObj.channel2envelopeType = ((data & 0x08) == 0x08);
		parentObj.channel2envelopeSweeps = data & 0x7;
		parentObj.channel2volumeEnvTime = parentObj.channel2envelopeSweeps * parentObj.volumeEnvelopePreMultiplier;
		parentObj.memory[0xFF17] = data;
	}
	this.memoryWriter[0xFF18] = function (parentObj, address, data) {
		parentObj.channel2frequency = (parentObj.channel2frequency & 0x700) | data;
		//Pre-calculate the frequency computation outside the waveform generator for speed:
		parentObj.channel2adjustedFrequencyPrep = parentObj.preChewedAudioComputationMultiplier / (0x800 - parentObj.channel2frequency);
		parentObj.memory[0xFF18] = data;
	}
	this.memoryWriter[0xFF19] = function (parentObj, address, data) {
		if ((data & 0x80) == 0x80) {
			parentObj.channel2envelopeVolume = parentObj.memory[0xFF17] >> 4;
			parentObj.channel2currentVolume = parentObj.channel2envelopeVolume / 0xF;
			parentObj.channel2envelopeSweeps = parentObj.memory[0xFF17] & 0x7;
			parentObj.channel2volumeEnvTime = parentObj.channel2envelopeSweeps * parentObj.volumeEnvelopePreMultiplier;
			parentObj.channel2totalLength = parentObj.channel2lastTotalLength;
			if ((data & 0x40) == 0x40) {
				parentObj.memory[0xFF26] |= 0x2;
			}
		}
		parentObj.channel2consecutive = ((data & 0x40) == 0x0);
		parentObj.channel2frequency = ((data & 0x7) << 8) | (parentObj.channel2frequency & 0xFF);
		//Pre-calculate the frequency computation outside the waveform generator for speed:
		parentObj.channel2adjustedFrequencyPrep = parentObj.preChewedAudioComputationMultiplier / (0x800 - parentObj.channel2frequency);
		parentObj.memory[0xFF19] = data & 0x40;
	}
	this.memoryWriter[0xFF1A] = function (parentObj, address, data) {
		parentObj.channel3canPlay = (data >= 0x80);
		if (parentObj.channel3canPlay && (parentObj.memory[0xFF1A] & 0x80) == 0x80) {
			parentObj.channel3totalLength = parentObj.channel3lastTotalLength;
			if (!parentObj.channel3consecutive) {
				parentObj.memory[0xFF26] |= 0x4;
			}
		}
		parentObj.memory[0xFF1A] = data & 0x80;
	}
	this.memoryWriter[0xFF1B] = function (parentObj, address, data) {
		parentObj.channel3lastTotalLength = parentObj.channel3totalLength = (0x100 - data) * parentObj.audioTotalLengthMultiplier;
		parentObj.memory[0xFF1B] = data;
	}
	this.memoryWriter[0xFF1C] = function (parentObj, address, data) {
		parentObj.memory[0xFF1C] = data & 0x60;
		parentObj.channel3patternType = parentObj.memory[0xFF1C] >> 5;
	}
	this.memoryWriter[0xFF1D] = function (parentObj, address, data) {
		parentObj.channel3frequency = (parentObj.channel3frequency & 0x700) | data;
		parentObj.channel3adjustedFrequencyPrep = parentObj.preChewedWAVEAudioComputationMultiplier / (0x800 - parentObj.channel3frequency);
		parentObj.memory[0xFF1D] = data;
	}
	this.memoryWriter[0xFF1E] = function (parentObj, address, data) {
		if ((data & 0x80) == 0x80) {
			parentObj.channel3totalLength = parentObj.channel3lastTotalLength;
			if ((data & 0x40) == 0x40) {
				parentObj.memory[0xFF26] |= 0x4;
			}
		}
		parentObj.channel3consecutive = ((data & 0x40) == 0x0);
		parentObj.channel3frequency = ((data & 0x7) << 8) | (parentObj.channel3frequency & 0xFF);
		parentObj.channel3adjustedFrequencyPrep = parentObj.preChewedWAVEAudioComputationMultiplier / (0x800 - parentObj.channel3frequency);
		parentObj.memory[0xFF1E] = data & 0x40;
	}
	this.memoryWriter[0xFF20] = function (parentObj, address, data) {
		parentObj.channel4lastTotalLength = parentObj.channel4totalLength = (0x40 - (data & 0x3F)) * parentObj.audioTotalLengthMultiplier;
		parentObj.memory[0xFF20] = data | 0xC0;
	}
	this.memoryWriter[0xFF21] = function (parentObj, address, data) {
		parentObj.channel4envelopeVolume = data >> 4;
		parentObj.channel4currentVolume = parentObj.channel4envelopeVolume / 0xF;
		parentObj.channel4envelopeType = ((data & 0x08) == 0x08);
		parentObj.channel4envelopeSweeps = data & 0x7;
		parentObj.channel4volumeEnvTime = parentObj.channel4envelopeSweeps * parentObj.volumeEnvelopePreMultiplier;
		parentObj.memory[0xFF21] = data;
	}
	this.memoryWriter[0xFF22] = function (parentObj, address, data) {
		parentObj.channel4lastSampleLookup = 0;
		parentObj.channel4adjustedFrequencyPrep = parentObj.whiteNoiseFrequencyPreMultiplier / Math.max(data & 0x7, 0.5) / Math.pow(2, (data >> 4) + 1);
		parentObj.noiseTableLookup = ((data & 0x8) == 0x8) ? parentObj.smallNoiseTable : parentObj.largeNoiseTable;
		parentObj.memory[0xFF22] = data;
	}
	this.memoryWriter[0xFF23] = function (parentObj, address, data) {
		parentObj.memory[0xFF23] = data;
		parentObj.channel4consecutive = ((data & 0x40) == 0x0);
		if ((data & 0x80) == 0x80) {
			parentObj.channel4lastSampleLookup = 0;
			parentObj.channel4envelopeVolume = parentObj.memory[0xFF21] >> 4;
			parentObj.channel4currentVolume = parentObj.channel4envelopeVolume / 0xF;
			parentObj.channel4envelopeSweeps = parentObj.memory[0xFF21] & 0x7;
			parentObj.channel4volumeEnvTime = parentObj.channel4envelopeSweeps * parentObj.volumeEnvelopePreMultiplier;
			parentObj.channel4totalLength = parentObj.channel4lastTotalLength;
			if ((data & 0x40) == 0x40) {
				parentObj.memory[0xFF26] |= 0x8;
			}
		}
	}
	this.memoryWriter[0xFF24] = function (parentObj, address, data) {
		parentObj.memory[0xFF24] = data;
		/*parentObj.VinLeftChannelEnabled = ((data >> 7) == 0x1);
		parentObj.VinRightChannelEnabled = (((data >> 3) & 0x1) == 0x1);
		parentObj.VinLeftChannelMasterVolume = ((data >> 4) & 0x07);
		parentObj.VinRightChannelMasterVolume = (data & 0x07);
		parentObj.vinLeft = (parentObj.VinLeftChannelEnabled) ? parentObj.VinLeftChannelMasterVolume / 7 : 1;
		parentObj.vinRight = (parentObj.VinRightChannelEnabled) ? parentObj.VinRightChannelMasterVolume / 7 : 1;*/
	}
	this.memoryWriter[0xFF25] = function (parentObj, address, data) {
		parentObj.memory[0xFF25] = data;
		parentObj.leftChannel = [(data & 0x01) == 0x01, (data & 0x02) == 0x02, (data & 0x04) == 0x04, (data & 0x08) == 0x08];
		parentObj.rightChannel = [(data & 0x10) == 0x10, (data & 0x20) == 0x20, (data & 0x40) == 0x40, (data & 0x80) == 0x80];
	}
	this.memoryWriter[0xFF26] = function (parentObj, address, data) {
		var soundEnabled = (data & 0x80);
		parentObj.memory[0xFF26] = soundEnabled | (parentObj.memory[0xFF26] & 0xF);
		parentObj.soundMasterEnabled = (soundEnabled == 0x80);
		if (!parentObj.soundMasterEnabled) {
			parentObj.memory[0xFF26] = 0;
			parentObj.initializeStartState();
			for (address = 0xFF30; address < 0xFF40; address++) {
				parentObj.memory[address] = 0;
			}
		}
	}
	this.memoryWriter[0xFF30] = function (parentObj, address, data) {
		parentObj.channel3PCM[0] = data >> 4;
		parentObj.channel3PCM[1] = data & 0xF;
		parentObj.memory[0xFF30] = data;
	}
	this.memoryWriter[0xFF31] = function (parentObj, address, data) {
		parentObj.channel3PCM[2] = data >> 4;
		parentObj.channel3PCM[3] = data & 0xF;
		parentObj.memory[0xFF31] = data;
	}
	this.memoryWriter[0xFF32] = function (parentObj, address, data) {
		parentObj.channel3PCM[4] = data >> 4;
		parentObj.channel3PCM[5] = data & 0xF;
		parentObj.memory[0xFF32] = data;
	}
	this.memoryWriter[0xFF33] = function (parentObj, address, data) {
		parentObj.channel3PCM[6] = data >> 4;
		parentObj.channel3PCM[7] = data & 0xF;
		parentObj.memory[0xFF33] = data;
	}
	this.memoryWriter[0xFF34] = function (parentObj, address, data) {
		parentObj.channel3PCM[8] = data >> 4;
		parentObj.channel3PCM[9] = data & 0xF;
		parentObj.memory[0xFF34] = data;
	}
	this.memoryWriter[0xFF35] = function (parentObj, address, data) {
		parentObj.channel3PCM[10] = data >> 4;
		parentObj.channel3PCM[11] = data & 0xF;
		parentObj.memory[0xFF35] = data;
	}
	this.memoryWriter[0xFF36] = function (parentObj, address, data) {
		parentObj.channel3PCM[12] = data >> 4;
		parentObj.channel3PCM[13] = data & 0xF;
		parentObj.memory[0xFF36] = data;
	}
	this.memoryWriter[0xFF37] = function (parentObj, address, data) {
		parentObj.channel3PCM[14] = data >> 4;
		parentObj.channel3PCM[15] = data & 0xF;
		parentObj.memory[0xFF37] = data;
	}
	this.memoryWriter[0xFF38] = function (parentObj, address, data) {
		parentObj.channel3PCM[16] = data >> 4;
		parentObj.channel3PCM[17] = data & 0xF;
		parentObj.memory[0xFF38] = data;
	}
	this.memoryWriter[0xFF39] = function (parentObj, address, data) {
		parentObj.channel3PCM[18] = data >> 4;
		parentObj.channel3PCM[19] = data & 0xF;
		parentObj.memory[0xFF39] = data;
	}
	this.memoryWriter[0xFF3A] = function (parentObj, address, data) {
		parentObj.channel3PCM[20] = data >> 4;
		parentObj.channel3PCM[21] = data & 0xF;
		parentObj.memory[0xFF3A] = data;
	}
	this.memoryWriter[0xFF3B] = function (parentObj, address, data) {
		parentObj.channel3PCM[22] = data >> 4;
		parentObj.channel3PCM[23] = data & 0xF;
		parentObj.memory[0xFF3B] = data;
	}
	this.memoryWriter[0xFF3C] = function (parentObj, address, data) {
		parentObj.channel3PCM[24] = data >> 4;
		parentObj.channel3PCM[25] = data & 0xF;
		parentObj.memory[0xFF3C] = data;
	}
	this.memoryWriter[0xFF3D] = function (parentObj, address, data) {
		parentObj.channel3PCM[26] = data >> 4;
		parentObj.channel3PCM[27] = data & 0xF;
		parentObj.memory[0xFF3D] = data;
	}
	this.memoryWriter[0xFF3E] = function (parentObj, address, data) {
		parentObj.channel3PCM[28] = data >> 4;
		parentObj.channel3PCM[29] = data & 0xF;
		parentObj.memory[0xFF3E] = data;
	}
	this.memoryWriter[0xFF3F] = function (parentObj, address, data) {
		parentObj.channel3PCM[30] = data >> 4;
		parentObj.channel3PCM[31] = data & 0xF;
		parentObj.memory[0xFF3F] = data;
	}
	this.memoryWriter[0xFF44] = function (parentObj, address, data) {
		//Read only
	}
	this.memoryWriter[0xFF45] = function (parentObj, address, data) {
		parentObj.memory[0xFF45] = data;
		if (parentObj.LCDisOn) {
			parentObj.matchLYC();	//Get the compare of the first scan line.
		}
	}
	this.memoryWriter[0xFF46] = function (parentObj, address, data) {
		parentObj.memory[0xFF46] = data;
		if (parentObj.cGBC || data > 0x7F) {	//DMG cannot DMA from the ROM banks.
			data <<= 8;
			address = 0xFE00;
			while (address < 0xFEA0) {
				parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
			}
		}
	}
	this.memoryWriter[0xFF47] = function (parentObj, address, data) {
		parentObj.decodePalette(0, data);
		if (parentObj.memory[0xFF47] != data) {
			parentObj.memory[0xFF47] = data;
			parentObj.invalidateAll(0);
		}
	}
	this.memoryWriter[0xFF48] = function (parentObj, address, data) {
		parentObj.decodePalette(4, data);
		if (parentObj.memory[0xFF48] != data) {
			parentObj.memory[0xFF48] = data;
			parentObj.invalidateAll(1);
		}
	}
	this.memoryWriter[0xFF49] = function (parentObj, address, data) {
		parentObj.decodePalette(8, data);
		if (parentObj.memory[0xFF49] != data) {
			parentObj.memory[0xFF49] = data;
			parentObj.invalidateAll(2);
		}
	}
	if (this.cGBC) {
		//GameBoy Color Specific I/O:
		this.memoryWriter[0xFF40] = function (parentObj, address, data) {
			var temp_var = (data & 0x80) == 0x80;
			if (temp_var != parentObj.LCDisOn) {
				//When the display mode changes...
				parentObj.LCDisOn = temp_var;
				parentObj.memory[0xFF41] &= 0xF8;
				parentObj.STATTracker = parentObj.modeSTAT = parentObj.LCDTicks = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
				if (parentObj.LCDisOn) {
					parentObj.matchLYC();	//Get the compare of the first scan line.
					parentObj.LCDCONTROL = parentObj.LINECONTROL;
				}
				else {
					parentObj.LCDCONTROL = parentObj.DISPLAYOFFCONTROL;
					parentObj.DisplayShowOff();
				}
				parentObj.memory[0xFF0F] &= 0xFD;
			}
			parentObj.gfxWindowY = (data & 0x40) == 0x40;
			parentObj.gfxWindowDisplay = (data & 0x20) == 0x20;
			parentObj.gfxBackgroundX = (data & 0x10) == 0x10;
			parentObj.gfxBackgroundY = (data & 0x08) == 0x08;
			parentObj.gfxSpriteDouble = (data & 0x04) == 0x04;
			parentObj.gfxSpriteShow = (data & 0x02) == 0x02;
			parentObj.spritePriorityEnabled = (data & 0x01) == 0x01;
			parentObj.memory[0xFF40] = data;
		}
		this.memoryWriter[0xFF41] = function (parentObj, address, data) {
			parentObj.LYCMatchTriggerSTAT = ((data & 0x40) == 0x40);
			parentObj.mode2TriggerSTAT = ((data & 0x20) == 0x20);
			parentObj.mode1TriggerSTAT = ((data & 0x10) == 0x10);
			parentObj.mode0TriggerSTAT = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF41] = (data & 0xF8);
		}
		this.memoryWriter[0xFF4D] = function (parentObj, address, data) {
			parentObj.memory[0xFF4D] = (data & 0x7F) + (parentObj.memory[0xFF4D] & 0x80);
		}
		this.memoryWriter[0xFF4F] = function (parentObj, address, data) {
			parentObj.currVRAMBank = data & 0x01;
			//Only writable by GBC.
		}
		this.memoryWriter[0xFF51] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF51] = data;
			}
		}
		this.memoryWriter[0xFF52] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF52] = data & 0xF0;
			}
		}
		this.memoryWriter[0xFF53] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF53] = data & 0x1F;
			}
		}
		this.memoryWriter[0xFF54] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF54] = data & 0xF0;
			}
		}
		this.memoryWriter[0xFF55] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				if ((data & 0x80) == 0) {
					//DMA
					parentObj.CPUTicks += 1 + ((8 * ((data & 0x7F) + 1)) * parentObj.multiplier);
					var dmaSrc = (parentObj.memory[0xFF51] << 8) + parentObj.memory[0xFF52];
					var dmaDst = 0x8000 + (parentObj.memory[0xFF53] << 8) + parentObj.memory[0xFF54];
					var endAmount = (((data & 0x7F) * 0x10) + 0x10);
					for (var loopAmount = 0; loopAmount < endAmount; loopAmount++) {
						parentObj.memoryWrite(dmaDst++, parentObj.memoryRead(dmaSrc++));
					}
					parentObj.memory[0xFF51] = ((dmaSrc & 0xFF00) >> 8);
					parentObj.memory[0xFF52] = (dmaSrc & 0x00F0);
					parentObj.memory[0xFF53] = ((dmaDst & 0x1F00) >> 8);
					parentObj.memory[0xFF54] = (dmaDst & 0x00F0);
					parentObj.memory[0xFF55] = 0xFF;	//Transfer completed.
				}
				else {
					//H-Blank DMA
					if (data > 0x80) {
						parentObj.hdmaRunning = true;
						parentObj.memory[0xFF55] = data & 0x7F;
					}
					else {
						parentObj.memory[0xFF55] = 0xFF;
					}
				}
			}
			else if ((data & 0x80) == 0) {
				//Stop H-Blank DMA
				parentObj.hdmaRunning = false;
				parentObj.memory[0xFF55] |= 0x80;
			}
		}
		this.memoryWriter[0xFF68] = function (parentObj, address, data) {
			parentObj.memory[0xFF69] = 0xFF & parentObj.gbcRawPalette[data & 0x3F];
			parentObj.memory[0xFF68] = data;
		}
		this.memoryWriter[0xFF69] = function (parentObj, address, data) {
			parentObj.setGBCPalette(parentObj.memory[0xFF68] & 0x3F, data);
			if (parentObj.usbtsb(parentObj.memory[0xFF68]) < 0) { // high bit = autoincrement
				var next = ((parentObj.usbtsb(parentObj.memory[0xFF68]) + 1) & 0x3F);
				parentObj.memory[0xFF68] = (next | 0x80);
				parentObj.memory[0xFF69] = 0xFF & parentObj.gbcRawPalette[next];
			}
			else {
				parentObj.memory[0xFF69] = data;
			}
		}
		this.memoryWriter[0xFF6A] = function (parentObj, address, data) {
			parentObj.memory[0xFF6B] = 0xFF & parentObj.gbcRawPalette[(data & 0x3F) | 0x40];
			parentObj.memory[0xFF6A] = data;
		}
		this.memoryWriter[0xFF6B] = function (parentObj, address, data) {
			parentObj.setGBCPalette((parentObj.memory[0xFF6A] & 0x3F) + 0x40, data);
			if (parentObj.usbtsb(parentObj.memory[0xFF6A]) < 0) { // high bit = autoincrement
				var next = ((parentObj.memory[0xFF6A] + 1) & 0x3F);
				parentObj.memory[0xFF6A] = (next | 0x80);
				parentObj.memory[0xFF6B] = 0xFF & parentObj.gbcRawPalette[next | 0x40];
			}
			else {
				parentObj.memory[0xFF6B] = data;
			}
		}
		this.memoryWriter[0xFF70] = function (parentObj, address, data) {
			var addressCheck = (parentObj.memory[0xFF51] << 8) | parentObj.memory[0xFF52];	//Cannot change the RAM bank while WRAM is the source of a running HDMA.
			if (!parentObj.hdmaRunning || addressCheck < 0xD000 || addressCheck >= 0xE000) {
				parentObj.gbcRamBank = Math.max(data & 0x07, 1);	//Bank range is from 1-7
				parentObj.gbcRamBankPosition = ((parentObj.gbcRamBank - 1) * 0x1000) - 0xD000;
				parentObj.gbcRamBankPositionECHO = ((parentObj.gbcRamBank - 1) * 0x1000) - 0xF000;
			}
			parentObj.memory[0xFF70] = (data | 0x40);	//Bit 6 cannot be written to.
		}
	}
	else {
		//Fill in the GameBoy Color I/O registers as normal RAM for GameBoy compatibility:
		this.memoryWriter[0xFF40] = function (parentObj, address, data) {
			var temp_var = (data & 0x80) == 0x80;
			if (temp_var != parentObj.LCDisOn) {
				//When the display mode changes...
				parentObj.LCDisOn = temp_var;
				parentObj.memory[0xFF41] &= 0xF8;
				parentObj.STATTracker = parentObj.modeSTAT = parentObj.LCDTicks = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
				if (parentObj.LCDisOn) {
					parentObj.matchLYC();	//Get the compare of the first scan line.
					parentObj.LCDCONTROL = parentObj.LINECONTROL;
				}
				else {
					parentObj.LCDCONTROL = parentObj.DISPLAYOFFCONTROL;
					parentObj.DisplayShowOff();
				}
				parentObj.memory[0xFF0F] &= 0xFD;
			}
			parentObj.gfxWindowY = (data & 0x40) == 0x40;
			parentObj.gfxWindowDisplay = (data & 0x20) == 0x20;
			parentObj.gfxBackgroundX = (data & 0x10) == 0x10;
			parentObj.gfxBackgroundY = (data & 0x08) == 0x08;
			parentObj.gfxSpriteDouble = (data & 0x04) == 0x04;
			parentObj.gfxSpriteShow = (data & 0x02) == 0x02;
			if ((data & 0x01) == 0) {
				// this emulates the gbc-in-gb-mode, not the original gb-mode
				parentObj.bgEnabled = false;
				parentObj.gfxWindowDisplay = false;
			}
			else {
				parentObj.bgEnabled = true;
			}
			parentObj.memory[0xFF40] = data;
		}
		this.memoryWriter[0xFF41] = function (parentObj, address, data) {
			parentObj.LYCMatchTriggerSTAT = ((data & 0x40) == 0x40);
			parentObj.mode2TriggerSTAT = ((data & 0x20) == 0x20);
			parentObj.mode1TriggerSTAT = ((data & 0x10) == 0x10);
			parentObj.mode0TriggerSTAT = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF41] = (data & 0xF8);
			if (parentObj.LCDisOn && parentObj.modeSTAT < 2) {
				parentObj.memory[0xFF0F] |= 0x2;
			}
		}
		this.memoryWriter[0xFF4D] = function (parentObj, address, data) {
			parentObj.memory[0xFF4D] = data;
		}
		this.memoryWriter[0xFF4F] = function (parentObj, address, data) {
			//Not writable in DMG mode.
		}
		this.memoryWriter[0xFF55] = function (parentObj, address, data) {
			parentObj.memory[0xFF55] = data;
		}
		this.memoryWriter[0xFF68] = function (parentObj, address, data) {
			parentObj.memory[0xFF68] = data;
		}
		this.memoryWriter[0xFF69] = function (parentObj, address, data) {
			parentObj.memory[0xFF69] = data;
		}
		this.memoryWriter[0xFF6A] = function (parentObj, address, data) {
			parentObj.memory[0xFF6A] = data;
		}
		this.memoryWriter[0xFF6B] = function (parentObj, address, data) {
			parentObj.memory[0xFF6B] = data;
		}
		this.memoryWriter[0xFF70] = function (parentObj, address, data) {
			parentObj.memory[0xFF70] = data;
		}
	}
	//Boot I/O Registers:
	if (this.inBootstrap) {
		this.memoryWriter[0xFF50] = function (parentObj, address, data) {
			cout("Boot ROM reads blocked: Bootstrap process has ended.", 0);
			parentObj.inBootstrap = false;
			parentObj.disableBootROM();			//Fill in the boot ROM ranges with ROM  bank 0 ROM ranges
			parentObj.memory[0xFF50] = data;	//Bits are sustained in memory?
		}
		this.memoryWriter[0xFF6C] = function (parentObj, address, data) {
			if (parentObj.inBootstrap) {
				parentObj.cGBC = (data == 0x80);
				cout("Booted to GBC Mode: " + parentObj.cGBC, 0);
			}
			parentObj.memory[0xFF6C] = data;
		}
	}
	else {
		//Lockout the ROMs from accessing the BOOT ROM control register:
		this.memoryWriter[0xFF6C] = this.memoryWriter[0xFF50] = function (parentObj, address, data) { };
	}
}
