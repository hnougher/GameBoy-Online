
GameBoyCore.prototype.OPCODE = new Array(
	//NOP
	//#0x00:
	function (parentObj) {
		//Do Nothing...
	},
	//LD BC, nn
	//#0x01:
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.programCounter]( parentObj, parentObj.programCounter );
		parentObj.programCounter++;
		parentObj.registerB = parentObj.memoryReader[parentObj.programCounter]( parentObj, parentObj.programCounter );
		parentObj.programCounter++;
	},
	//LD (BC), A
	//#0x02:
	function (parentObj) {
		var address = (parentObj.registerB << 8) | parentObj.registerC;
		parentObj.memoryWriter[address]( parentObj, address, parentObj.registerA );
	},
	//INC BC
	//#0x03:
	function (parentObj) {
		// Get BC and increment it
		var BC = (parentObj.registerB << 8) | parentObj.registerC;
		BC++;
		
		// Store BC
		parentObj.registerB = (BC >> 8) & 0xFF;
		parentObj.registerC = BC & 0xFF;
	},
	//INC B
	//#0x04:
	function (parentObj) {
		parentObj.registerB = ((parentObj.registerB + 1) & 0xFF);
		parentObj.FZero = (parentObj.registerB == 0);
		parentObj.FHalfCarry = ((parentObj.registerB & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	//DEC B
	//#0x05:
	function (parentObj) {
		parentObj.registerB = (parentObj.registerB - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerB == 0);
		parentObj.FHalfCarry = ((parentObj.registerB & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	//LD B, n
	//#0x06:
	function (parentObj) {
		parentObj.registerB = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
	},
	//RLCA
	//#0x07:
	function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x80) == 0x80);
		parentObj.registerA = ((parentObj.registerA << 1) | (parentObj.registerA >> 7)) & 0xFF;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//LD (nn), SP
	//#0x08:
	function (parentObj) {
		// Get Address
		var address = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
		address |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
		parentObj.programCounter++;
		
		parentObj.memoryWriter[address](parentObj, address, parentObj.stackPointer & 0xFF);
		address++;
		parentObj.memoryWriter[address](parentObj, address, parentObj.stackPointer >> 8);
	},
	//ADD HL, BC
	//#0x09:
	function (parentObj) {
		var dirtySum = parentObj.registersHL + ((parentObj.registerB << 8) | parentObj.registerC);
		parentObj.FHalfCarry = (dirtySum & 0xFFF) < (parentObj.registersHL & 0xFFF);
		parentObj.FCarry = (dirtySum > 0xFFFF);
		parentObj.registersHL = (dirtySum & 0xFFFF);
		parentObj.FSubtract = false;
	},
	//LD A, (BC)
	//#0x0A:
	function (parentObj) {
		var address = (parentObj.registerB << 8) | parentObj.registerC;
		parentObj.registerA = parentObj.memoryReader[address](parentObj, address);
	},
	//DEC BC
	//#0x0B:
	function (parentObj) {
		// Get BC and Decrement
		var BC = (parentObj.registerB << 8) | parentObj.registerC;
		BC = (BC - 1) & 0xFFFF;
		
		// Store BC
		parentObj.registerB = (BC >> 8);
		parentObj.registerC = (BC & 0xFF);
	},
	//INC C
	//#0x0C:
	function (parentObj) {
		parentObj.registerC = ((parentObj.registerC + 1) & 0xFF);
		parentObj.FZero = (parentObj.registerC == 0);
		parentObj.FHalfCarry = ((parentObj.registerC & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	//DEC C
	//#0x0D:
	function (parentObj) {
		parentObj.registerC = (parentObj.registerC - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerC == 0);
		parentObj.FHalfCarry = ((parentObj.registerC & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	//LD C, n
	//#0x0E:
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
	},
	//RRCA
	//#0x0F:
	function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 1);
		parentObj.registerA = ((parentObj.registerA >> 1) | (parentObj.registerA << 7)) & 0xFF;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//STOP
	//#0x10:
	function (parentObj) {
		if (parentObj.cGBC) {
			/*TODO: Emulate the speed switch delay:
				Delay Amount:
				16 ms when going to double-speed.
				32 ms when going to single-speed.
				Also, bits 4 and 5 of 0xFF00 should read as set (1), while the switch is in process.
			*/
			if ((parentObj.memory[0xFF4D] & 0x01) == 0x01) {		//Speed change requested.
				if ((parentObj.memory[0xFF4D] & 0x80) == 0x80) {	//Go back to single speed mode.
					cout("Going into single clock speed mode.", 0);
					parentObj.multiplier = 1;						//TODO: Move this into the delay done code.
					parentObj.memory[0xFF4D] &= 0x7F;				//Clear the double speed mode flag.
				}
				else {												//Go to double speed mode.
					cout("Going into double clock speed mode.", 0);
					parentObj.multiplier = 2;						//TODO: Move this into the delay done code.
					parentObj.memory[0xFF4D] |= 0x80;				//Set the double speed mode flag.
				}
				parentObj.memory[0xFF4D] &= 0xFE;					//Reset the request bit.
			}
		}
	},
	//LD DE, nn
	//#0x11:
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
		parentObj.registerD = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
	},
	//LD (DE), A
	//#0x12:
	function (parentObj) {
		var address = (parentObj.registerD << 8) | parentObj.registerE;
		parentObj.memoryWriter[address](parentObj, address, parentObj.registerA);
	},
	//INC DE
	//#0x13:
	function (parentObj) {
		// Get DE and increment it
		var DE = (parentObj.registerD << 8) | parentObj.registerE;
		DE++;
		
		// Store DE
		parentObj.registerD = (DE >> 8) & 0xFF;
		parentObj.registerE = DE & 0xFF;
	},
	//INC D
	//#0x14:
	function (parentObj) {
		parentObj.registerD = ((parentObj.registerD + 1) & 0xFF);
		parentObj.FZero = (parentObj.registerD == 0);
		parentObj.FHalfCarry = ((parentObj.registerD & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	//DEC D
	//#0x15:
	function (parentObj) {
		parentObj.registerD = (parentObj.registerD - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerD == 0);
		parentObj.FHalfCarry = ((parentObj.registerD & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	//LD D, n
	//#0x16:
	function (parentObj) {
		parentObj.registerD = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
	},
	//RLA
	//#0x17:
	function (parentObj) {
		var carry_flag = parentObj.FCarry;
		parentObj.FCarry = ((parentObj.registerA & 0x80) == 0x80);
		parentObj.registerA = ((parentObj.registerA << 1) | (carry_flag & 0x01)) & 0xFF;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//JR n
	//#0x18:
	// Add signed n to current PC
	function (parentObj) {
		// Get the Signed Jump Offset
		var jumpOffset = parentObj.memoryReader[ parentObj.programCounter ]( parentObj, parentObj.programCounter );
		jumpOffset = parentObj.UI8_to_SI8(jumpOffset);
		
		// Set the PC
		parentObj.programCounter = ( parentObj.programCounter + jumpOffset + 1 );
	},
	//ADD HL, DE
	//#0x19:
	function (parentObj) {
		var dirtySum = parentObj.registersHL + ((parentObj.registerD << 8) | parentObj.registerE);
		parentObj.FHalfCarry = (dirtySum & 0xFFF) < (parentObj.registersHL & 0xFFF);
		parentObj.FCarry = (dirtySum > 0xFFFF);
		parentObj.registersHL = (dirtySum & 0xFFFF);
		parentObj.FSubtract = false;
	},
	//LD A, (DE)
	//#0x1A:
	function (parentObj) {
		var DE = (parentObj.registerD << 8) | parentObj.registerE;
		parentObj.registerA = parentObj.memoryReader[DE](parentObj, DE);
	},
	//DEC DE
	//#0x1B:
	function (parentObj) {
		// Get DE and Decrement
		var DE = (parentObj.registerD << 8) | parentObj.registerE;
		DE = (DE - 1) & 0xFFFF;
		
		parentObj.registerD = (DE >> 8);
		parentObj.registerE = (DE & 0xFF);
	},
	//INC E
	//#0x1C:
	function (parentObj) {
		parentObj.registerE = ((parentObj.registerE + 1) & 0xFF);
		parentObj.FZero = (parentObj.registerE == 0);
		parentObj.FHalfCarry = ((parentObj.registerE & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	//DEC E
	//#0x1D:
	function (parentObj) {
		parentObj.registerE = (parentObj.registerE - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerE == 0);
		parentObj.FHalfCarry = ((parentObj.registerE & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	//LD E, n
	//#0x1E:
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
	},
	//RRA
	//#0x1F:
	function (parentObj) {
		var carry_flag = parentObj.FCarry;
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 1);
		parentObj.registerA = ((parentObj.registerA >> 1) | (carry_flag << 7)) & 0xFF;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//JR cc, n
	//#0x20:
	// JR cc[y-4], d
	// JR cc0 (ie: No Zero Flag), d (ie: Next Byte is Displacement)
	function (parentObj) {
		if (!parentObj.FZero) {
			// Get Displacement (d) Signed Integer
			var jumpOffset = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			jumpOffset = (jumpOffset & 0x7F) - (jumpOffset & 0x80); // parentObj.UI8_to_SI8( jumpOffset );
			
			// Displace PC
			//parentObj.programCounter = (parentObj.programCounter + jumpOffset + 1) & 0xFFFF;
			parentObj.programCounter += jumpOffset;
			parentObj.CPUTicks++;
		}
		//else {
		//	parentObj.programCounter++;
		// }
		
		// Happens either way
		parentObj.programCounter++;
	},
	//LD HL, nn
	//#0x21:
	function (parentObj) {
		parentObj.registersHL = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
		parentObj.registersHL |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
		parentObj.programCounter++;
	},
	//LDI (HL), A
	//#0x22:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
		parentObj.registersHL = (parentObj.registersHL + 1) & 0xFFFF;
	},
	//INC HL
	//#0x23:
	function (parentObj) {
		parentObj.registersHL = ((parentObj.registersHL + 1) & 0xFFFF);
	},
	//INC H
	//#0x24:
	function (parentObj) {
		// Get H and Increment it
		var H = (parentObj.registersHL + 0x100) & 0xFF00;
		
		// Process Flags
		parentObj.FZero = (H == 0);
		parentObj.FHalfCarry = ((H & 0xF00) == 0);
		parentObj.FSubtract = false;
		
		// Store H
		parentObj.registersHL = H | (parentObj.registersHL & 0xFF);
	},
	//DEC H
	//#0x25:
	function (parentObj) {
		// Get H and Decrement it
		var H = (parentObj.registersHL - 0x100) & 0xFF00;
		
		// Process Flags
		parentObj.FZero = (H == 0);
		parentObj.FHalfCarry = ((H & 0xF00) == 0xF00);
		parentObj.FSubtract = true;
		
		// Store H
		parentObj.registersHL = H | (parentObj.registersHL & 0xFF);
	},
	//LD H, n
	//#0x26:
	function (parentObj) {
		var newVal = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.registersHL = (newVal << 8) | (parentObj.registersHL & 0xFF);
		parentObj.programCounter++;
	},
	//DAA
	//#0x27:
	function (parentObj) {
		// Create the lookup index
		var lookupIndex = parentObj.registerA;
		lookupIndex |= (parentObj.FCarry) << 8;
		lookupIndex |= (parentObj.FHalfCarry) << 9;
		lookupIndex |= (parentObj.FSubtract) << 10;
		
		// Process Lookup
		var value = DAATable[lookupIndex];
		
		// Store A and Flags
		parentObj.registerA = value[0];
		parentObj.FZero = ((value[1] & 0x80) != 0);
		parentObj.FSubtract = ((value[1] & 0x40) != 0);
		parentObj.FHalfCarry = false;
		parentObj.FCarry = ((value[1] & 0x10) != 0);
	},
	//JR cc, n
	//#0x28:
	// JR cc[y-4], d
	// JR cc1 (ie: Zero Flag), d (ie: Next Byte is Displacement)
	function (parentObj) {
		if (parentObj.FZero) {
			// Get Displacement (d) Signed Integer
			var jumpOffset = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			
			// Convert offset to signed int and displace PC
			parentObj.programCounter += (jumpOffset & 0x7F) - (jumpOffset & 0x80); // parentObj.UI8_to_SI8( jumpOffset );
			
			// Update CPUTicks
			parentObj.CPUTicks++;
		}
		//else {
		//	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		//}
		
		// PC always increaments after above
		parentObj.programCounter++;
	},
	//ADD HL, HL
	//#0x29:
	function (parentObj) {
		parentObj.FHalfCarry = ((parentObj.registersHL & 0xFFF) > 0x7FF);
		parentObj.FCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = ((parentObj.registersHL * 2) & 0xFFFF);
		parentObj.FSubtract = false;
	},
	//LDI A, (HL)
	//#0x2A:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.registersHL = ((parentObj.registersHL + 1) & 0xFFFF);
	},
	//DEC HL
	//#0x2B:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	//INC L
	//#0x2C:
	function (parentObj) {
		// Get L and Increment it
		var L = ((parentObj.registersHL + 1) & 0xFF);
		
		// Set Flags
		parentObj.FZero = (L == 0);
		parentObj.FHalfCarry = ((L & 0xF) == 0);
		parentObj.FSubtract = false;
		
		// Put L Back
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | L;
	},
	//DEC L
	//#0x2D:
	function (parentObj) {
		// Get L and Decrement it
		var L = ((parentObj.registersHL - 1) & 0xFF);
		
		// Set Flags
		parentObj.FZero = (L == 0);
		parentObj.FHalfCarry = ((L & 0xF) == 0xF);
		parentObj.FSubtract = true;
		
		// Put L Back
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | L;
	},
	//LD L, n
	//#0x2E:
	function (parentObj) {
		var newL = parentObj.memoryReader[parentObj.programCounter]( parentObj, parentObj.programCounter );
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | newL;
		parentObj.programCounter++;
	},
	//CPL
	//#0x2F:
	function (parentObj) {
		parentObj.registerA ^= 0xFF;
		parentObj.FSubtract = parentObj.FHalfCarry = true;
	},
	//JR cc, n
	//#0x30:
	// JR cc[y-4], d
	// JR cc2 (ie: No Carry Flag), d (ie: Next Byte is Displacement)
	function (parentObj) {
		if (!parentObj.FCarry) {
			// Get Displacement (d) Signed Integer
			var jumpOffset = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			jumpOffset = (jumpOffset & 0x7F) - (jumpOffset & 0x80); // parentObj.UI8_to_SI8( jumpOffset );
			
			// Displace PC
			//parentObj.programCounter = (parentObj.programCounter + jumpOffset + 1) & 0xFFFF;
			parentObj.programCounter += jumpOffset;
			parentObj.CPUTicks++;
		}
		//else {
		//	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		//}
		
		// Happens Either Way
		parentObj.programCounter++;
	},
	//LD SP, nn
	//#0x31:
	function (parentObj) {
		parentObj.stackPointer = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
		parentObj.stackPointer |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
		parentObj.programCounter++;
	},
	//LDD (HL), A
	//#0x32:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	//INC SP
	//#0x33:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer + 1) & 0xFFFF;
	},
	//INC (HL)
	//#0x34:
	function (parentObj) {
		// Get Memory Location then Increment It
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		temp_var = (temp_var + 1) & 0xFF;
		
		// Process Flags
		parentObj.FZero = (temp_var == 0);
		parentObj.FHalfCarry = ((temp_var & 0xF) == 0);
		parentObj.FSubtract = false;
		
		// Store value back to Memory Location
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
	},
	//DEC (HL)
	//#0x35:
	function (parentObj) {
		// Get Memory Location then Decrement It
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		temp_var = (temp_var - 1) & 0xFF;
		
		// Process Flags
		parentObj.FZero = (temp_var == 0);
		parentObj.FHalfCarry = ((temp_var & 0xF) == 0xF);
		parentObj.FSubtract = true;
		
		// Store value back to Memory Location
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
	},
	//LD (HL), n
	//#0x36:
	function (parentObj) {
		var value = parentObj.memoryReader[parentObj.programCounter]( parentObj, parentObj.programCounter );
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, value );
		parentObj.programCounter++;
	},
	//SCF
	//#0x37:
	function (parentObj) {
		parentObj.FCarry = true;
		parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//JR cc, n
	//#0x38:
	// JR cc[y-4], d
	// JR cc3 (ie: Carry Flag), d (ie: Next Byte is Displacement)
	function (parentObj) {
		if (parentObj.FCarry) {
			// Get Displacement (d) Signed Integer
			var jumpOffset = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			jumpOffset = (jumpOffset & 0x7F) - (jumpOffset & 0x80); // parentObj.UI8_to_SI8( jumpOffset );
			
			// Displace PC
			//parentObj.programCounter = (parentObj.programCounter + jumpOffset + 1) & 0xFFFF;
			parentObj.programCounter += jumpOffset;
			parentObj.CPUTicks++;
		}
		//else {
		//	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		//}
		
		// Happens Either Way
		parentObj.programCounter++;
	},
	//ADD HL, SP
	//#0x39:
	function (parentObj) {
		var dirtySum = parentObj.registersHL + parentObj.stackPointer;
		parentObj.FHalfCarry = (dirtySum & 0xFFF) < (parentObj.registersHL & 0xFFF);
		parentObj.FCarry = (dirtySum > 0xFFFF);
		parentObj.registersHL = (dirtySum & 0xFFFF);
		parentObj.FSubtract = false;
	},
	// LDD A, (HL)
	//#0x3A:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj,parentObj.registersHL);
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	//DEC SP
	//#0x3B:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	},
	//INC A
	//#0x3C:
	function (parentObj) {
		parentObj.registerA = ((parentObj.registerA + 1) & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	//DEC A
	//#0x3D:
	function (parentObj) {
		parentObj.registerA = (parentObj.registerA - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	//LD A, n
	//#0x3E:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
	},
	//CCF
	//#0x3F:
	function (parentObj) {
		parentObj.FCarry = !parentObj.FCarry;
		parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//LD B, B
	//#0x40:
	function (parentObj) {
		//Do nothing...
	},
	//LD B, C
	//#0x41:
	function (parentObj) {
		parentObj.registerB = parentObj.registerC;
	},
	//LD B, D
	//#0x42:
	function (parentObj) {
		parentObj.registerB = parentObj.registerD;
	},
	//LD B, E
	//#0x43:
	function (parentObj) {
		parentObj.registerB = parentObj.registerE;
	},
	//LD B, H
	//#0x44:
	function (parentObj) {
		parentObj.registerB = (parentObj.registersHL >> 8);
	},
	//LD B, L
	//#0x45:
	function (parentObj) {
		parentObj.registerB = (parentObj.registersHL & 0xFF);
	},
	//LD B, (HL)
	//#0x46:
	function (parentObj) {
		parentObj.registerB = parentObj.memoryReader[parentObj.registersHL]( parentObj, parentObj.registersHL );
	},
	//LD B, A
	//#0x47:
	function (parentObj) {
		parentObj.registerB = parentObj.registerA;
	},
	//LD C, B
	//#0x48:
	function (parentObj) {
		parentObj.registerC = parentObj.registerB;
	},
	//LD C, C
	//#0x49:
	function (parentObj) {
		//Do nothing...
	},
	//LD C, D
	//#0x4A:
	function (parentObj) {
		parentObj.registerC = parentObj.registerD;
	},
	//LD C, E
	//#0x4B:
	function (parentObj) {
		parentObj.registerC = parentObj.registerE;
	},
	//LD C, H
	//#0x4C:
	function (parentObj) {
		parentObj.registerC = (parentObj.registersHL >> 8);
	},
	//LD C, L
	//#0x4D:
	function (parentObj) {
		parentObj.registerC = (parentObj.registersHL & 0xFF);
	},
	//LD C, (HL)
	//#0x4E:
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	//LD C, A
	//#0x4F:
	function (parentObj) {
		parentObj.registerC = parentObj.registerA;
	},
	//LD D, B
	//#0x50:
	function (parentObj) {
		parentObj.registerD = parentObj.registerB;
	},
	//LD D, C
	//#0x51:
	function (parentObj) {
		parentObj.registerD = parentObj.registerC;
	},
	//LD D, D
	//#0x52:
	function (parentObj) {
		//Do nothing...
	},
	//LD D, E
	//#0x53:
	function (parentObj) {
		parentObj.registerD = parentObj.registerE;
	},
	//LD D, H
	//#0x54:
	function (parentObj) {
		parentObj.registerD = (parentObj.registersHL >> 8);
	},
	//LD D, L
	//#0x55:
	function (parentObj) {
		parentObj.registerD = (parentObj.registersHL & 0xFF);
	},
	//LD D, (HL)
	//#0x56:
	function (parentObj) {
		parentObj.registerD = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	//LD D, A
	//#0x57:
	function (parentObj) {
		parentObj.registerD = parentObj.registerA;
	},
	//LD E, B
	//#0x58:
	function (parentObj) {
		parentObj.registerE = parentObj.registerB;
	},
	//LD E, C
	//#0x59:
	function (parentObj) {
		parentObj.registerE = parentObj.registerC;
	},
	//LD E, D
	//#0x5A:
	function (parentObj) {
		parentObj.registerE = parentObj.registerD;
	},
	//LD E, E
	//#0x5B:
	function (parentObj) {
		//Do nothing...
	},
	//LD E, H
	//#0x5C:
	function (parentObj) {
		parentObj.registerE = (parentObj.registersHL >> 8);
	},
	//LD E, L
	//#0x5D:
	function (parentObj) {
		parentObj.registerE = (parentObj.registersHL & 0xFF);
	},
	//LD E, (HL)
	//#0x5E:
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	//LD E, A
	//#0x5F:
	function (parentObj) {
		parentObj.registerE = parentObj.registerA;
	},
	//LD H, B
	//#0x60:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerB << 8) | (parentObj.registersHL & 0xFF);
	},
	//LD H, C
	//#0x61:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerC << 8) | (parentObj.registersHL & 0xFF);
	},
	//LD H, D
	//#0x62:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerD << 8) | (parentObj.registersHL & 0xFF);
	},
	//LD H, E
	//#0x63:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerE << 8) | (parentObj.registersHL & 0xFF);
	},
	//LD H, H
	//#0x64:
	function (parentObj) {
		//Do nothing...
	},
	//LD H, L
	//#0x65:
	function (parentObj) {
		parentObj.registersHL = ((parentObj.registersHL & 0xFF) << 8) | (parentObj.registersHL & 0xFF);
	},
	//LD H, (HL)
	//#0x66:
	function (parentObj) {
		var value = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.registersHL = (value << 8) | (parentObj.registersHL & 0xFF);
	},
	//LD H, A
	//#0x67:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerA << 8) | (parentObj.registersHL & 0xFF);
	},
	//LD L, B
	//#0x68:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerB;
	},
	//LD L, C
	//#0x69:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerC;
	},
	//LD L, D
	//#0x6A:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerD;
	},
	//LD L, E
	//#0x6B:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerE;
	},
	//LD L, H
	//#0x6C:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | (parentObj.registersHL >> 8);
	},
	//LD L, L
	//#0x6D:
	function (parentObj) {
		//Do nothing...
	},
	//LD L, (HL)
	//#0x6E:
	function (parentObj) {
		//parentObj.registersHL = (parentObj.registersHL & 0xFF00) + parentObj.memoryRead(parentObj.registersHL);
		var value = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | value;
	},
	//LD L, A
	//#0x6F:
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerA;
	},
	//LD (HL), B
	//#0x70:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, parentObj.registerB );
	},
	//LD (HL), C
	//#0x71:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, parentObj.registerC );
	},
	//LD (HL), D
	//#0x72:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, parentObj.registerD );
	},
	//LD (HL), E
	//#0x73:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, parentObj.registerE );
	},
	//LD (HL), H
	//#0x74:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, (parentObj.registersHL >> 8) );
	},
	//LD (HL), L
	//#0x75:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, (parentObj.registersHL & 0xFF) );
	},
	//HALT
	//#0x76:
	function (parentObj) {
		if (parentObj.untilEnable == 1) {
			/*VBA-M says this fixes Torpedo Range (Seems to work):
			Involves an edge case where an EI is placed right before a HALT.
			EI in this case actually is immediate, so we adjust (Hacky?).*/
			parentObj.programCounter = parentObj.nswtuw(parentObj.programCounter - 1);
		}
		else {
			if (!parentObj.halt && !parentObj.IME && !parentObj.cGBC && !parentObj.usedBootROM && (parentObj.memory[0xFF0F] & parentObj.memory[0xFFFF] & 0x1F) > 0) {
				parentObj.skipPCIncrement = true;
			}
			parentObj.halt = true;
			while (parentObj.halt && (parentObj.stopEmulator & 1) == 0) {
				/*We're hijacking the main interpreter loop to do this dirty business
				in order to not slow down the main interpreter loop code with halt state handling.*/
				var bitShift = 0;
				var testbit = 1;
				var interrupts = parentObj.memory[0xFFFF] & parentObj.memory[0xFF0F];
				while (bitShift < 5) {
					//Check to see if an interrupt is enabled AND requested.
					if ((testbit & interrupts) == testbit) {
						parentObj.halt = false;		//Get out of halt state if in halt state.
						return;						//Let the main interrupt handler compute the interrupt.
					}
					testbit = 1 << ++bitShift;
				}
				parentObj.CPUTicks = 1;				//1 machine cycle under HALT...
				//Timing:
				parentObj.updateCore();
			}
			throw(new Error("HALT_OVERRUN"));		//Throw an error on purpose to exit out of the loop.
		}
	},
	//LD (HL), A
	//#0x77:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL]( parentObj, parentObj.registersHL, parentObj.registerA );
	},
	//LD A, B
	//#0x78:
	function (parentObj) {
		parentObj.registerA = parentObj.registerB;
	},
	//LD A, C
	//#0x79:
	function (parentObj) {
		parentObj.registerA = parentObj.registerC;
	},
	//LD A, D
	//#0x7A:
	function (parentObj) {
		parentObj.registerA = parentObj.registerD;
	},
	//LD A, E
	//#0x7B:
	function (parentObj) {
		parentObj.registerA = parentObj.registerE;
	},
	//LD A, H
	//#0x7C:
	function (parentObj) {
		parentObj.registerA = (parentObj.registersHL >> 8);
	},
	//LD A, L
	//#0x7D:
	function (parentObj) {
		parentObj.registerA = (parentObj.registersHL & 0xFF);
	},
	//LD, A, (HL)
	//#0x7E:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL]( parentObj, parentObj.registersHL );
	},
	//LD A, A
	//#0x7F:
	function (parentObj) {
		//Do Nothing...
	},
	//ADD A, B
	//#0x80:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerB;
		parentObj.FHalfCarry = (dirtySum & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADD A, C
	//#0x81:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerC;
		parentObj.FHalfCarry = (dirtySum & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADD A, D
	//#0x82:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerD;
		parentObj.FHalfCarry = (dirtySum & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADD A, E
	//#0x83:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerE;
		parentObj.FHalfCarry = (dirtySum & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADD A, H
	//#0x84:
	function (parentObj) {
		var dirtySum = parentObj.registerA + (parentObj.registersHL >> 8);
		parentObj.FHalfCarry = (dirtySum & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADD A, L
	//#0x85:
	function (parentObj) {
		var dirtySum = parentObj.registerA + (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = (dirtySum & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADD A, (HL)
	//#0x86:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FHalfCarry = (dirtySum & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADD A, A
	//#0x87:
	function (parentObj) {
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) > 0x7);
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = (parentObj.registerA * 2) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, B
	//#0x88:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA + parentObj.registerB + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, C
	//#0x89:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA + parentObj.registerC + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, D
	//#0x8A:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA + parentObj.registerD + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, E
	//#0x8B:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA + parentObj.registerE + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, H
	//#0x8C:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA + (parentObj.registersHL >> 8) + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, L
	//#0x8D:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA + (parentObj.registersHL & 0xFF) + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, (HL)
	//#0x8E:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var tempValue = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var dirtySum = parentObj.registerA + tempValue + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, A
	//#0x8F:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA + parentObj.registerA + carry;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + carry);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//SUB A, B
	//#0x90:
	// Basically the same code as 0xB8.
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerB & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerB);
		parentObj.registerA = (parentObj.registerA - parentObj.registerB) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, C
	//#0x91:
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerC & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerC);
		parentObj.registerA = (parentObj.registerA - parentObj.registerC) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, D
	//#0x92:
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerD & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerD);
		parentObj.registerA = (parentObj.registerA - parentObj.registerD) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, E
	//#0x93:
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerE & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerE);
		parentObj.registerA = (parentObj.registerA - parentObj.registerE) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, H
	//#0x94:
	function (parentObj) {
		var H = parentObj.registersHL >> 8;
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (H & 0xF);
		parentObj.FCarry = (parentObj.registerA < H);
		parentObj.registerA = (parentObj.registerA - H) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, L
	//#0x95:
	function (parentObj) {
		var L = parentObj.registersHL & 0xFF;
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (L & 0xF);
		parentObj.FCarry = (parentObj.registerA < L);
		parentObj.registerA = (parentObj.registerA - L) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, (HL)
	//#0x96:
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (temp_var & 0xF);
		parentObj.FCarry = (parentObj.registerA < temp_var);
		parentObj.registerA = (parentObj.registerA - temp_var) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, A
	//#0x97:
	function (parentObj) {
		//number - same number == 0
		parentObj.registerA = 0;
		parentObj.FHalfCarry = parentObj.FCarry = false;
		parentObj.FZero = parentObj.FSubtract = true;
	},
	//SBC A, B
	//#0x98:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA - parentObj.registerB - carry;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerB & 0xF) - carry < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, C
	//#0x99:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA - parentObj.registerC - carry;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerC & 0xF) - carry < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, D
	//#0x9A:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA - parentObj.registerD - carry;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerD & 0xF) - carry < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, E
	//#0x9B:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var dirtySum = parentObj.registerA - parentObj.registerE - carry;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerE & 0xF) - carry < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, H
	//#0x9C:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var H = parentObj.registersHL >> 8;
		var dirtySum = parentObj.registerA - H - carry;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (H & 0xF) - carry < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, L
	//#0x9D:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var L = parentObj.registersHL & 0xFF;
		var dirtySum = parentObj.registerA - L - carry;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (L & 0xF) - carry < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, (HL)
	//#0x9E:
	function (parentObj) {
		var carry = parentObj.FCarry & 0x01;
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var dirtySum = parentObj.registerA - temp_var - carry;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - carry < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, A
	//#0x9F:
	function (parentObj) {
		//Optimized SBC A:
		if (parentObj.FCarry) {
			parentObj.FZero = false;
			// parentObj.FCarry = true; // Already True
			parentObj.FSubtract = parentObj.FHalfCarry = true;
			parentObj.registerA = 0xFF;
		}
		else {
			// parentObj.FCarry = false; // Already False
			parentObj.FHalfCarry = false;
			parentObj.FSubtract = parentObj.FZero = true;
			parentObj.registerA = 0;
		}
	},
	//AND B
	//#0xA0:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND C
	//#0xA1:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND D
	//#0xA2:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND E
	//#0xA3:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND H
	//#0xA4:
	function (parentObj) {
		parentObj.registerA &= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND L
	//#0xA5:
	function (parentObj) {
		parentObj.registerA &= (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND (HL)
	//#0xA6:
	function (parentObj) {
		parentObj.registerA &= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND A
	//#0xA7:
	function (parentObj) {
		//number & same number = same number
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//XOR B
	//#0xA8:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR C
	//#0xA9:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR D
	//#0xAA:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR E
	//#0xAB:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR H
	//#0xAC:
	function (parentObj) {
		parentObj.registerA ^= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR L
	//#0xAD:
	function (parentObj) {
		parentObj.registerA ^= (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR (HL)
	//#0xAE:
	function (parentObj) {
		parentObj.registerA ^= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR A
	//#0xAF:
	function (parentObj) {
		//number ^ same number == 0
		parentObj.registerA = 0;
		parentObj.FZero = true;
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//OR B
	//#0xB0:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR C
	//#0xB1:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR D
	//#0xB2:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR E
	//#0xB3:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR H
	//#0xB4:
	function (parentObj) {
		parentObj.registerA |= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR L
	//#0xB5:
	function (parentObj) {
		parentObj.registerA |= (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR (HL)
	//#0xB6:
	function (parentObj) {
		parentObj.registerA |= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR A
	//#0xB7:
	function (parentObj) {
		//number | same number == same number
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//CP B
	//#0xB8:
	// Compare A with B. This is basically an A - B subtraction instruction but the results are thrown away.
	// Basically the same code as 0x90.
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerB & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerB);
		parentObj.FZero = (parentObj.registerA == parentObj.registerB);
		parentObj.FSubtract = true;
	},
	//CP C
	//#0xB9:
	// Compare A with C. This is basically an A - C subtraction instruction but the results are thrown away.
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerC & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerC);
		parentObj.FZero = (parentObj.registerA == parentObj.registerC);
		parentObj.FSubtract = true;
	},
	//CP D
	//#0xBA:
	// Compare A with D. This is basically an A - D subtraction instruction but the results are thrown away.
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerD & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerD);
		parentObj.FZero = (parentObj.registerA == parentObj.registerD);
		parentObj.FSubtract = true;
	},
	//CP E
	//#0xBB:
	// Compare A with E. This is basically an A - E subtraction instruction but the results are thrown away.
	function (parentObj) {
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (parentObj.registerE & 0xF);
		parentObj.FCarry = (parentObj.registerA < parentObj.registerE);
		parentObj.FZero = (parentObj.registerA == parentObj.registerE);
		parentObj.FSubtract = true;
	},
	//CP H
	//#0xBC:
	// Compare A with H. This is basically an A - H subtraction instruction but the results are thrown away.
	function (parentObj) {
		var H = parentObj.registersHL >> 8;
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (H & 0xF);
		parentObj.FCarry = (parentObj.registerA < H);
		parentObj.FZero = (parentObj.registerA == H);
		parentObj.FSubtract = true;
	},
	//CP L
	//#0xBD:
	// Compare A with L. This is basically an A - L subtraction instruction but the results are thrown away.
	function (parentObj) {
		var L = parentObj.registersHL & 0xFF;
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (L & 0xF);
		parentObj.FCarry = (parentObj.registerA < L);
		parentObj.FZero = (parentObj.registerA == L);
		parentObj.FSubtract = true;
	},
	//CP (HL)
	//#0xBE:
	// Compare A with L. This is basically an A - L subtraction instruction but the results are thrown away.
	function (parentObj) {
		var value = parentObj.memoryReader[parentObj.registersHL]( parentObj, parentObj.registersHL );
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (value & 0xF);
		parentObj.FCarry = (parentObj.registerA < value);
		parentObj.FZero = (parentObj.registerA == value);
		parentObj.FSubtract = true;
	},
	//CP A
	//#0xBF:
	// Compare A with A. This is basically an A - A subtraction instruction but the results are thrown away.
	function (parentObj) {
		parentObj.FHalfCarry = parentObj.FCarry = false;
		parentObj.FZero = parentObj.FSubtract = true;
	},
	//RET !FZ
	//#0xC0:
	function (parentObj) {
		if (!parentObj.FZero) {
			parentObj.programCounter = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer++;
			parentObj.programCounter |= parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer) << 8;
			parentObj.stackPointer++;
			parentObj.CPUTicks += 3;
		}
	},
	//POP BC
	//#0xC1:
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.stackPointer]( parentObj, parentObj.stackPointer );
		parentObj.stackPointer++;
		parentObj.registerB = parentObj.memoryReader[parentObj.stackPointer]( parentObj, parentObj.stackPointer );
		parentObj.stackPointer++;
	},
	//JP !FZ, nn
	//#0xC2:
	function (parentObj) {
		if (!parentObj.FZero) {
			var newPC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter++;
			newPC |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
			
			parentObj.programCounter = newPC;
			parentObj.CPUTicks++;
		}
		else {
			parentObj.programCounter += 2;
		}
	},
	//JP nn
	//#0xC3:
	function (parentObj) {
		var newPC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
		newPC |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
		
		parentObj.programCounter = newPC;
	},
	//CALL !FZ, nn
	//#0xC4:
	function (parentObj) {
		if (!parentObj.FZero) {
			// Get the new PC of where we are to jump to
			var newPC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter++;
			newPC |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
			parentObj.programCounter++;
			
			// Store the Current PC
			parentObj.stackPointer--;
			parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
			parentObj.stackPointer--;
			parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
			
			// Set the new PC so we can continue
			parentObj.programCounter = newPC;
			parentObj.CPUTicks += 3;
		}
		else
		{
			//parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.programCounter += 2;
		}
	},
	//PUSH BC
	//#0xC5:
	function (parentObj) {
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.registerB );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.registerC );
	},
	//ADD, n
	//#0xC6:
	function (parentObj) {
		// Read memory and add A to it
		var newA = parentObj.memoryReader[ parentObj.programCounter ]( parentObj, parentObj.programCounter );
		newA += parentObj.registerA;
		
		// Work out flags and set A
		parentObj.FHalfCarry = (newA & 0xF) < (parentObj.registerA & 0xF);
		parentObj.FCarry = (newA > 0xFF);
		parentObj.registerA = (newA & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
		
		// increment PC
		parentObj.programCounter++;
	},
	//RST 0
	//#0xC7:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0;
	},
	//RET FZ
	//#0xC8:
	function (parentObj) {
		if (parentObj.FZero) {
			parentObj.programCounter = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer++;
			parentObj.programCounter |= parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer) << 8;
			parentObj.stackPointer++;
			parentObj.CPUTicks += 3;
		}
	},
	//RET
	//#0xC9:
	function (parentObj) {
		parentObj.programCounter = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer++;
		parentObj.programCounter |= parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer) << 8;
		parentObj.stackPointer++;
	},
	//JP FZ, nn
	//#0xCA:
	function (parentObj) {
		if (parentObj.FZero) {
			var newPC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter++;
			newPC |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
			parentObj.programCounter = newPC;
			parentObj.CPUTicks++;
		}
		else {
			parentObj.programCounter += 2;
		}
	},
	//Secondary OP Code Set:
	//#0xCB:
	function (parentObj) {
		var opcode = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		
		//Increment the program counter to the next instruction:
		parentObj.programCounter++;
		
		//HNOpcodeCounter++;
		HNOpcode_Usage[0x0100 | opcode]++;
		
		var opData = parentObj.CBOPCODE[opcode];
		//Get how many CPU cycles the current 0xCBXX op code counts for:
		parentObj.CPUTicks = opData[1];
		//Execute secondary OP codes for the 0xCB OP code call.
		opData[0](parentObj);
	},
	//CALL FZ, nn
	//#0xCC:
	function (parentObj) {
		if (parentObj.FZero) {
			// Get the new PC of where we are to jump to
			var newPC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter++;
			newPC |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
			parentObj.programCounter++;
			
			// Store the Current PC
			parentObj.stackPointer--;
			parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
			parentObj.stackPointer--;
			parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
			
			// Set the new PC so we can continue
			parentObj.programCounter = newPC;
			parentObj.CPUTicks += 3;
		}
		else {
			parentObj.programCounter += 2;
		}
	},
	//CALL nn
	//#0xCD:
	function (parentObj) {
		// Get the new PC of where we are to jump to
		var newPC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter++;
		newPC |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8;
		parentObj.programCounter++;
		
		// Store the Current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set the new PC so we can continue
		parentObj.programCounter = newPC;
	},
	//ADC A, n
	//#0xCE:
	function (parentObj) {
		var tempValue = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		var dirtySum = parentObj.registerA + tempValue + (parentObj.FCarry & 0x01);
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF) + (parentObj.FCarry & 0x01));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
		parentObj.programCounter++;
	},
	//RST 0x8
	//#0xCF:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0x8;
	},
	//RET !FC
	//#0xD0:
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer++;
			parentObj.programCounter |= parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer) << 8;
			parentObj.stackPointer++;
			parentObj.CPUTicks += 3;
		}
	},
	//POP DE
	//#0xD1:
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.stackPointer]( parentObj, parentObj.stackPointer );
		parentObj.stackPointer++;
		parentObj.registerD = parentObj.memoryReader[parentObj.stackPointer]( parentObj, parentObj.stackPointer );
		parentObj.stackPointer++;
	},
	//JP !FC, nn
	//#0xD2:
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) + parentObj.memoryRead(parentObj.programCounter);
			parentObj.CPUTicks++;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//0xD3 - Illegal
	//#0xD3:
	function (parentObj) {
		cout("Illegal op code 0xD3 called, pausing emulation.", 2);
		pause();
	},
	//CALL !FC, nn
	//#0xD4:
	function (parentObj) {
		if (!parentObj.FCarry) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) + parentObj.memoryRead(parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
			parentObj.memoryWrite(parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
			parentObj.memoryWrite(parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 3;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//PUSH DE
	//#0xD5:
	function (parentObj) {
		parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
		parentObj.memoryWrite(parentObj.stackPointer, parentObj.registerD);
		parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
		parentObj.memoryWrite(parentObj.stackPointer, parentObj.registerE);
	},
	//SUB A, n
	//#0xD6:
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		var dirtySum = parentObj.registerA - temp_var;
		parentObj.FHalfCarry = (parentObj.registerA & 0xF) < (temp_var & 0xF);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = parentObj.unsbtub(dirtySum);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//RST 0x10
	//#0xD7:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0x10;
	},
	//RET FC
	//#0xD8:
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer++;
			parentObj.programCounter |= parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer) << 8;
			parentObj.stackPointer++;
			parentObj.CPUTicks += 3;
		}
	},
	//RETI
	//#0xD9:
	function (parentObj) {
		// Return
		parentObj.programCounter = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer++;
		parentObj.programCounter |= parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer) << 8;
		parentObj.stackPointer++;
		parentObj.CPUTicks += 3;
		
		// Enable Interrupts
		parentObj.untilEnable = 2;
	},
	//JP FC, nn
	//#0xDA:
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) + parentObj.memoryRead(parentObj.programCounter);
			parentObj.CPUTicks++;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//0xDB - Illegal
	//#0xDB:
	function (parentObj) {
		cout("Illegal op code 0xDB called, pausing emulation.", 2);
		pause();
	},
	//CALL FC, nn
	//#0xDC:
	function (parentObj) {
		if (parentObj.FCarry) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) + parentObj.memoryRead(parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
			parentObj.memoryWrite(parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
			parentObj.memoryWrite(parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 3;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//0xDD - Illegal
	//#0xDD:
	function (parentObj) {
		cout("Illegal op code 0xDD called, pausing emulation.", 2);
		pause();
	},
	//SBC A, n
	//#0xDE:
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		var dirtySum = parentObj.registerA - temp_var - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = parentObj.unsbtub(dirtySum);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//RST 0x18
	//#0xDF:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0x18;
	},
	//LDH (n), A
	//#0xE0:
	function (parentObj) {
		var address = 0xFF00 | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.memoryWriter[address](parentObj, address, parentObj.registerA);
		parentObj.programCounter++;
	},
	//POP HL
	//#0xE1:
	function (parentObj) {
		parentObj.registersHL = parentObj.memoryReader[parentObj.stackPointer]( parentObj, parentObj.stackPointer );
		parentObj.stackPointer++;
		parentObj.registersHL |= parentObj.memoryReader[parentObj.stackPointer]( parentObj, parentObj.stackPointer ) << 8;
		parentObj.stackPointer++;
	},
	//LD (C), A
	//#0xE2:
	function (parentObj) {
		var address = 0xFF00 | parentObj.registerC;
		parentObj.memoryWriter[address](parentObj, address, parentObj.registerA);
	},
	//0xE3 - Illegal
	//#0xE3:
	function (parentObj) {
		cout("Illegal op code 0xE3 called, pausing emulation.", 2);
		pause();
	},
	//0xE4 - Illegal
	//#0xE4:
	function (parentObj) {
		cout("Illegal op code 0xE4 called, pausing emulation.", 2);
		pause();
	},
	//PUSH HL
	//#0xE5:
	function (parentObj) {
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registersHL >> 8);
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registersHL & 0xFF);
	},
	//AND n
	//#0xE6:
	// Do AND between A and next byte and store in A.
	function (parentObj) {
		parentObj.registerA &= parentObj.memoryReader[parentObj.programCounter]( parentObj, parentObj.programCounter );
		parentObj.programCounter++;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//RST 0x20
	//#0xE7:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0x20;
	},
	//ADD SP, n
	//#0xE8:
	function (parentObj) {
		var signedByte = parentObj.usbtsb(parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter));
		var temp_value = parentObj.nswtuw(parentObj.stackPointer + signedByte);
		parentObj.FCarry = (((parentObj.stackPointer ^ signedByte ^ temp_value) & 0x100) == 0x100);
		parentObj.FHalfCarry = (((parentObj.stackPointer ^ signedByte ^ temp_value) & 0x10) == 0x10);
		parentObj.stackPointer = temp_value;
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = parentObj.FSubtract = false;
	},
	//JP, (HL)
	//#0xE9:
	function (parentObj) {
		parentObj.programCounter = parentObj.registersHL;
	},
	//LD n, A
	//#0xEA:
	// Put A into memory address defined by next 16bits unsigned
	function (parentObj) {
		var pc = parentObj.programCounter;
		
		// Get loByte
		var address = parentObj.memoryReader[pc](parentObj, pc);
		
		// Get hiByte
		// Assuming this is safe since to have this OP there needs to be two bytes after
		pc++;
		address |= parentObj.memoryReader[pc](parentObj, pc) << 8;
		
		parentObj.memoryWriter[address]( parentObj, address, parentObj.registerA );
		parentObj.programCounter = (++pc) & 0xFFFF;
	},
	//0xEB - Illegal
	//#0xEB:
	function (parentObj) {
		cout("Illegal op code 0xEB called, pausing emulation.", 2);
		pause();
	},
	//0xEC - Illegal
	//#0xEC:
	function (parentObj) {
		cout("Illegal op code 0xEC called, pausing emulation.", 2);
		pause();
	},
	//0xED - Illegal
	//#0xED:
	function (parentObj) {
		cout("Illegal op code 0xED called, pausing emulation.", 2);
		pause();
	},
	//XOR n
	//#0xEE:
	function (parentObj) {
		parentObj.registerA ^= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//RST 0x28
	//#0xEF:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0x28;
	},
	//LDH A, (n)
	//#0xF0:
	// Put memory address $FF00+n into A
	function (parentObj) {
		var address = 0xFF00 | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.registerA = parentObj.memoryReader[address](parentObj, address);
		parentObj.programCounter++;
	},
	//POP AF
	//#0xF1:
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.FZero = ((temp_var & 0x80) == 0x80);
		parentObj.FSubtract = ((temp_var & 0x40) == 0x40);
		parentObj.FHalfCarry = ((temp_var & 0x20) == 0x20);
		parentObj.FCarry = ((temp_var & 0x10) == 0x10);
		parentObj.stackPointer++;
		
		// A
		parentObj.registerA = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer++;
	},
	//LD A, (C)
	//#0xF2:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryRead(0xFF00 + parentObj.registerC);
	},
	//DI
	//#0xF3:
	function (parentObj) {
		parentObj.IME = false;
		parentObj.untilEnable = 0;
	},
	//0xF4 - Illegal
	//#0xF4:
	function (parentObj) {
		cout("Illegal op code 0xF4 called, pausing emulation.", 2);
		pause();
	},
	//PUSH AF
	//#0xF5:
	function (parentObj) {
		parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
		parentObj.memoryWrite(parentObj.stackPointer, parentObj.registerA);
		parentObj.stackPointer = parentObj.unswtuw(parentObj.stackPointer - 1);
		parentObj.memoryWrite(parentObj.stackPointer, ((parentObj.FZero) ? 0x80 : 0) + ((parentObj.FSubtract) ? 0x40 : 0) + ((parentObj.FHalfCarry) ? 0x20 : 0) + ((parentObj.FCarry) ? 0x10 : 0));
	},
	//OR n
	//#0xF6:
	function (parentObj) {
		parentObj.registerA |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//RST 0x30
	//#0xF7:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0x30;
	},
	//LDHL SP, n
	//#0xF8:
	function (parentObj) {
		var signedByte = parentObj.usbtsb(parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter));
		parentObj.registersHL = parentObj.nswtuw(parentObj.stackPointer + signedByte);
		parentObj.FCarry = (((parentObj.stackPointer ^ signedByte ^ parentObj.registersHL) & 0x100) == 0x100);
		parentObj.FHalfCarry = (((parentObj.stackPointer ^ signedByte ^ parentObj.registersHL) & 0x10) == 0x10);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = parentObj.FSubtract = false;
	},
	//LD SP, HL
	//#0xF9:
	function (parentObj) {
		parentObj.stackPointer = parentObj.registersHL;
	},
	//LD A, (nn)
	//#0xFA:
	// Load One Byte into A from location given by an unsigned int in next two bytes.
	function (parentObj) {
		var pc = parentObj.programCounter;
		var address = parentObj.memoryReader[pc](parentObj, pc);
		
		// Assuming this is safe since to have this OP there needs to be two bytes after
		pc++;
		address |= parentObj.memoryReader[pc](parentObj, pc) << 8;
		
		parentObj.registerA = parentObj.memoryReader[address](parentObj, address);
		parentObj.programCounter = (++pc) & 0xFFFF;
	},
	//EI
	//#0xFB:
	function (parentObj) {
		parentObj.untilEnable = 2;
	},
	//0xFC - Illegal
	//#0xFC:
	function (parentObj) {
		cout("Illegal op code 0xFC called, pausing emulation.", 2);
		pause();
	},
	//0xFD - Illegal
	//#0xFD:
	function (parentObj) {
		cout("Illegal op code 0xFD called, pausing emulation.", 2);
		pause();
	},
	//CP n
	//#0xFE:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.FHalfCarry = (parentObj.unsbtub(dirtySum) & 0xF) > (parentObj.registerA & 0xF);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FSubtract = true;
	},
	//RST 0x38
	//#0xFF:
	function (parentObj) {
		// PUSH current PC
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter >> 8 );
		parentObj.stackPointer--;
		parentObj.memoryWriter[parentObj.stackPointer]( parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF );
		
		// Set PC to zero
		parentObj.programCounter = 0x38;
	}
);


GameBoyCore.prototype.TICKTable = new Array(				//Number of machine cycles for each instruction:
/*	0, 1, 2, 3, 4, 5, 6, 7,		8, 9, A, B, C, D, E, F*/
	1, 3, 2, 2, 1, 1, 2, 1,		5, 2, 2, 2, 1, 1, 2, 1,  //0
	1, 3, 2, 2, 1, 1, 2, 1,		3, 2, 2, 2, 1, 1, 2, 1,  //1
	2, 3, 2, 2, 1, 1, 2, 1,		2, 2, 2, 2, 1, 1, 2, 1,  //2
	2, 3, 2, 2, 3, 3, 3, 1,		2, 2, 2, 2, 1, 1, 2, 1,  //3

	1, 1, 1, 1, 1, 1, 2, 1,		1, 1, 1, 1, 1, 1, 2, 1,  //4
	1, 1, 1, 1, 1, 1, 2, 1,		1, 1, 1, 1, 1, 1, 2, 1,  //5
	1, 1, 1, 1, 1, 1, 2, 1,		1, 1, 1, 1, 1, 1, 2, 1,  //6
	2, 2, 2, 2, 2, 2, 1, 2,		1, 1, 1, 1, 1, 1, 2, 1,  //7

	1, 1, 1, 1, 1, 1, 2, 1,		1, 1, 1, 1, 1, 1, 2, 1,  //8
	1, 1, 1, 1, 1, 1, 2, 1,		1, 1, 1, 1, 1, 1, 2, 1,  //9
	1, 1, 1, 1, 1, 1, 2, 1,		1, 1, 1, 1, 1, 1, 2, 1,  //A
	1, 1, 1, 1, 1, 1, 2, 1,		1, 1, 1, 1, 1, 1, 2, 1,  //B

	2, 3, 3, 4, 3, 4, 2, 4,		2, 4, 3, 2, 3, 6, 2, 4,  //C
	2, 3, 3, 1, 3, 4, 2, 4,		2, 4, 3, 1, 3, 1, 2, 4,  //D
	3, 3, 2, 1, 1, 4, 2, 4,		4, 1, 4, 1, 1, 1, 2, 4,  //E
	3, 3, 2, 1, 1, 4, 2, 4,		3, 2, 4, 1, 0, 1, 2, 4   //F
);

// Merge TICKTable into OPCODE
for( var i = 0; i <= 0xFF; i++ )
{
	var func = GameBoyCore.prototype.OPCODE[i];
	var tick = GameBoyCore.prototype.TICKTable[i];
	GameBoyCore.prototype.OPCODE[i] = [ func, tick ];
}


// Clear temparary variables
delete GameBoyCore.prototype.TICKTable;