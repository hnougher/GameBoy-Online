
/**
* Hugh remade this during update for use in worker.
* @author Hugh Nougher
*/
GameBoyCore.prototype.initLCD = function () {
	// min "attrib" value where transparency can occur (Default is 4 (GB mode))
	this.transparentCutoff = (settings[17] || this.cGBC) ? 32 : 4;
	
	
	//Setup the image decoding lookup table if needed
	if (this.weaveLookup.length == 0) {
		this.weaveLookup = ArrayCreate( 256, "UI16", 0 );
		
		// Set default values
		for (var i_ = 0x1; i_ <= 0xFF; i_++) {
			for (var d_ = 0; d_ < 0x8; d_++) {
				this.weaveLookup[i_] += ((i_ >> d_) & 1) << (d_ * 2);
			}
		}
	}
	
	//Create a white screen
	this.drewBlank == 0;
	this.DisplayShowOff();

	/* This will be done in update_display so not needed here.
	var canvasBufferData = this.canvasBuffer.data;
	for( var i = 0; i < canvasBufferData.length; i++ )
		canvasBufferData[i] = 0xFF;*/
	
	// Clear fameBuffer to White
	var frameBuffer = this.frameBuffer;
	for( var i = 0; i < frameBuffer.length; i++ )
		frameBuffer[i] = 0x00FFFFFF;
	
	// Update Display
	update_display();
	
	// Legacy
	/** @todo This variable is useless when in Workers. Remove it. */
	this.canvasFallbackHappened = false;
}

GameBoyCore.prototype.initializeLCDController = function () {
	//Display on hanlding:
	var line = 0;
	while (line < 154) {
		if (line < 143) {
			//We're on a normal scan line:
			this.LINECONTROL[line] = function (parentObj) {
				if (parentObj.LCDTicks < 20) {
					parentObj.scanLineMode2();	// mode2: 80 cycles
				}
				else if (parentObj.LCDTicks < 63) {
					parentObj.scanLineMode3();	// mode3: 172 cycles
				}
				else if (parentObj.LCDTicks < 114) {
					parentObj.scanLineMode0();	// mode0: 204 cycles
				}
				else {
					//We're on a new scan line:
					parentObj.LCDTicks -= 114;
					parentObj.actualScanLine = ++parentObj.memory[0xFF44];
					parentObj.matchLYC();
					if (parentObj.STATTracker != 2) {
						if (parentObj.hdmaRunning && !parentObj.halt && parentObj.LCDisOn) {
							parentObj.performHdma();	//H-Blank DMA
						}
						if (parentObj.mode0TriggerSTAT) {
							parentObj.memory[0xFF0F] |= 0x2;// set IF bit 1
						}
					}
					parentObj.STATTracker = 0;
					parentObj.scanLineMode2();	// mode2: 80 cycles
					if (parentObj.LCDTicks >= 114) {
						//We need to skip 1 or more scan lines:
						parentObj.notifyScanline();
						parentObj.LCDCONTROL[parentObj.actualScanLine](parentObj);	//Scan Line and STAT Mode Control 
					}
				}
			}
		}
		else if (line == 143) {
			//We're on the last visible scan line of the LCD screen:
			this.LINECONTROL[143] = function (parentObj) {
				if (parentObj.LCDTicks < 20) {
					parentObj.scanLineMode2();	// mode2: 80 cycles
				}
				else if (parentObj.LCDTicks < 63) {
					parentObj.scanLineMode3();	// mode3: 172 cycles
				}
				else if (parentObj.LCDTicks < 114) {
					parentObj.scanLineMode0();	// mode0: 204 cycles
				}
				else {
					//Starting V-Blank:
					//Just finished the last visible scan line:
					parentObj.LCDTicks -= 114;
					parentObj.actualScanLine = ++parentObj.memory[0xFF44];
					parentObj.matchLYC();
					if (parentObj.mode1TriggerSTAT) {
						parentObj.memory[0xFF0F] |= 0x2;// set IF bit 1
					}
					if (parentObj.STATTracker != 2) {
						if (parentObj.hdmaRunning && !parentObj.halt && parentObj.LCDisOn) {
							parentObj.performHdma();	//H-Blank DMA
						}
						if (parentObj.mode0TriggerSTAT) {
							parentObj.memory[0xFF0F] |= 0x2;// set IF bit 1
						}
					}
					parentObj.STATTracker = 0;
					parentObj.modeSTAT = 1;
					parentObj.memory[0xFF0F] |= 0x1; 	// set IF flag 0
					if (parentObj.drewBlank > 0) {		//LCD off takes at least 2 frames.
						parentObj.drewBlank--;
					}
					if (parentObj.LCDTicks >= 114) {
						//We need to skip 1 or more scan lines:
						parentObj.LCDCONTROL[parentObj.actualScanLine](parentObj);	//Scan Line and STAT Mode Control 
					}
				}
			}
		}
		else if (line < 153) {
			//In VBlank
			this.LINECONTROL[line] = function (parentObj) {
				if (parentObj.LCDTicks >= 114) {
					//We're on a new scan line:
					parentObj.LCDTicks -= 114;
					parentObj.actualScanLine = ++parentObj.memory[0xFF44];
					parentObj.matchLYC();
					if (parentObj.LCDTicks >= 114) {
						//We need to skip 1 or more scan lines:
						parentObj.LCDCONTROL[parentObj.actualScanLine](parentObj);	//Scan Line and STAT Mode Control 
					}
				}
			}
		}
		else {
			//VBlank Ending (We're on the last actual scan line)
			this.LINECONTROL[153] = function (parentObj) {
				if (parentObj.memory[0xFF44] == 153) {
					parentObj.memory[0xFF44] = 0;	//LY register resets to 0 early.
					parentObj.matchLYC();			//LY==LYC Test is early here (Fixes specific one-line glitches (example: Kirby2 intro)).
				}
				if (parentObj.LCDTicks >= 114) {
					//We reset back to the beginning:
					parentObj.LCDTicks -= 114;
					parentObj.actualScanLine = 0;
					parentObj.scanLineMode2();	// mode2: 80 cycles
					if (parentObj.LCDTicks >= 114) {
						//We need to skip 1 or more scan lines:
						parentObj.LCDCONTROL[parentObj.actualScanLine](parentObj);	//Scan Line and STAT Mode Control 
					}
				}
			}
		}
		line++;
	}
	this.LCDCONTROL = (this.LCDisOn) ? this.LINECONTROL : this.DISPLAYOFFCONTROL;
}


/**
* Clears the canvas display to all White.
*
* Hugh remade this during update for use in worker.
* @author Hugh Nougher
*/
GameBoyCore.prototype.DisplayShowOff = function () {
	if (this.drewBlank == 0) {
		var canvasBufferData;
		var newVal;
		
		// If Typed Array is supported then this is much faster
		if (supportTypedArray) {
			canvasBufferData = this.canvasBufferData32;
			newVal = 0xFFFFFFFF;
		}
		else {
			canvasBufferData = this.canvasBufferData;
			newVal = 0xFF;
		}
		
		// Set every item in array to all ones
		for( var i = 0; i < canvasBufferData.length; i++ )
			canvasBufferData[i] = newVal;
		
		// Update Display
		update_display();
		
		this.drewBlank = 2;
	}
}


/**
* Sends the framebuffer to the canvas for display.
*/
GameBoyCore.prototype.drawToCanvas = function () {
	//Draw the frame buffer to the canvas:
	if (settings[4] == 0 || this.frameCount > 0) {
		//Copy and convert the framebuffer data to the CanvasPixelArray format.
		var canvasData = this.canvasBufferData;
		var frameBuffer = this.frameBuffer;
		
		/*if( supportTypedArray )
		{
			canvasData = this.canvasBufferData32;
			// This array is ABGR for some reason
			for( var i = 0; i < frameBuffer.length; i++ )
				canvasData[i] = (frameBuffer[i] & 0x00FFFFFF) | 0xFF000000;
		}
		else*/
		{
			var canvasIndex = 0;
			for( var i = 0; i < frameBuffer.length; i++ )
			{
				canvasData[canvasIndex++] = (frameBuffer[i] >> 16) & 0xFF;	//Red
				canvasData[canvasIndex++] = (frameBuffer[i] >> 8) & 0xFF;	//Green
				canvasData[canvasIndex++] = frameBuffer[i] & 0xFF;			//Blue
				canvasIndex++; // Alpha is ignored
			}
		}
		
		//Draw out the CanvasPixelArray data:
		//this.drawContext.putImageData(this.canvasBuffer, 0, 0);
		update_display();
		if (settings[4] > 0) {
			//Increment the frameskip counter:
			this.frameCount -= settings[4];
		}
	}
	else {
		//Reset the frameskip counter:
		this.frameCount += settings[12];
	}
}

GameBoyCore.prototype.invalidateAll = function (pal) {
	var stop = (pal + 1) * this.tileCountInvalidator;
	for (var r = pal * this.tileCountInvalidator; r < stop; r++) {
		this.tileData[r] = null;
	}
}
GameBoyCore.prototype.setGBCPalettePre = function (index_, data) {
	if (this.gbcRawPalette[index_] == data) {
		return;
	}
	this.gbcRawPalette[index_] = data;
	if (index_ >= 0x40 && (index_ & 0x6) == 0) {
		// stay transparent
		return;
	}
	var value = (this.gbcRawPalette[index_ | 1] << 8) + this.gbcRawPalette[index_ & -2];
	this.gbcPalette[index_ >> 1] = 0x80000000 + ((value & 0x1F) << 19) + ((value & 0x3E0) << 6) + ((value & 0x7C00) >> 7);
	this.invalidateAll(index_ >> 3);
}
GameBoyCore.prototype.setGBCPalette = function (index_, data) {
	this.setGBCPalettePre(index_, data);
	if ((index_ & 0x6) == 0) {
		this.gbcPalette[index_ >> 1] &= 0x00FFFFFF;
	}
}
GameBoyCore.prototype.decodePalette = function (startIndex, data) {
	if (!this.cGBC) {
		this.gbPalette[startIndex] = this.colors[data & 0x03] & 0x00FFFFFF; // color 0: transparent
		this.gbPalette[startIndex + 1] = this.colors[(data >> 2) & 0x03];
		this.gbPalette[startIndex + 2] = this.colors[(data >> 4) & 0x03];
		this.gbPalette[startIndex + 3] = this.colors[data >> 6];
		if (this.usedBootROM) {	//Do palette conversions if we did the GBC bootup:
			//GB colorization:
			var startOffset = (startIndex >= 4) ? 0x20 : 0;
			var pal2 = this.gbcPalette[startOffset + ((data >> 2) & 0x03)];
			var pal3 = this.gbcPalette[startOffset + ((data >> 4) & 0x03)];
			var pal4 = this.gbcPalette[startOffset + (data >> 6)];
			this.gbColorizedPalette[startIndex] = this.gbcPalette[startOffset + (data & 0x03)] & 0x00FFFFFF;
			this.gbColorizedPalette[startIndex + 1] = (pal2 >= 0x80000000) ? pal2 : 0xFFFFFFFF;
			this.gbColorizedPalette[startIndex + 2] = (pal3 >= 0x80000000) ? pal3 : 0xFFFFFFFF;
			this.gbColorizedPalette[startIndex + 3] = (pal4 >= 0x80000000) ? pal4 : 0xFFFFFFFF;
		}
	}
}
GameBoyCore.prototype.notifyScanline = function () {
	if (this.actualScanLine == 0) {
		this.windowSourceLine = 0;
	}
	// determine the left edge of the window (160 if window is inactive)
	var windowLeft = (this.gfxWindowDisplay && this.memory[0xFF4A] <= this.actualScanLine) ? Math.min(160, this.memory[0xFF4B] - 7) : 160;
	// step 1: background+window
	var skippedAnything = this.drawBackgroundForLine(this.actualScanLine, windowLeft, 0);
	// At this point, the high (alpha) byte in the frameBuffer is 0xff for colors 1,2,3 and
	// 0x00 for color 0. Foreground sprites draw on all colors, background sprites draw on
	// top of color 0 only.
	// step 2: sprites
	this.drawSpritesForLine(this.actualScanLine);
	// step 3: prio tiles+window
	if (skippedAnything) {
		this.drawBackgroundForLine(this.actualScanLine, windowLeft, 0x80);
	}
	if (windowLeft < 160) {
		this.windowSourceLine++;
	}
}
GameBoyCore.prototype.drawBackgroundForLine = function (line, windowLeft, priority) {
	var skippedTile = false;
	var tileNum = 0, tileXCoord = 0, tileAttrib = 0;
	var sourceY = line + this.memory[0xFF42];
	var sourceImageLine = sourceY & 0x7;
	var tileX = this.memory[0xFF43] >> 3;
	var memStart = ((this.gfxBackgroundY) ? 0x1C00 : 0x1800) + ((sourceY & 0xF8) << 2);
	var screenX = -(this.memory[0xFF43] & 7);
	for (; screenX < windowLeft; tileX++, screenX += 8) {
		tileXCoord = (tileX & 0x1F);
		var baseaddr = this.memory[0x8000 + memStart + tileXCoord];
		tileNum = (this.gfxBackgroundX) ? baseaddr : ((baseaddr > 0x7F) ? ((baseaddr & 0x7F) + 0x80) : (baseaddr + 0x100));
		if (this.cGBC) {
			var mapAttrib = this.VRAM[memStart + tileXCoord];
			if ((mapAttrib & 0x80) != priority) {
				skippedTile = true;
				continue;
			}
			tileAttrib = ((mapAttrib & 0x07) << 2) + ((mapAttrib >> 5) & 0x03);
			tileNum += 384 * ((mapAttrib >> 3) & 0x01); // tile vram bank
		}
		this.drawPartCopy(tileNum, screenX, line, sourceImageLine, tileAttrib);
	}
	if (windowLeft < 160) {
		// window!
		var windowStartAddress = (this.gfxWindowY) ? 0x1C00 : 0x1800;
		var windowSourceTileY = this.windowSourceLine >> 3;
		var tileAddress = windowStartAddress + (windowSourceTileY * 0x20);
		var windowSourceTileLine = this.windowSourceLine & 0x7;
		for (screenX = windowLeft; screenX < 160; tileAddress++, screenX += 8) {
			var baseaddr = this.memory[0x8000 + tileAddress];
			tileNum = (this.gfxBackgroundX) ? baseaddr : ((baseaddr > 0x7F) ? ((baseaddr & 0x7F) + 0x80) : (baseaddr + 0x100));
			if (this.cGBC) {
				var mapAttrib = this.VRAM[tileAddress];
				if ((mapAttrib & 0x80) != priority) {
					skippedTile = true;
					continue;
				}
				tileAttrib = ((mapAttrib & 0x07) << 2) + ((mapAttrib >> 5) & 0x03); // mirroring
				tileNum += 384 * ((mapAttrib >> 3) & 0x01); // tile vram bank
			}
			this.drawPartCopy(tileNum, screenX, line, windowSourceTileLine, tileAttrib);
		}
	}
	return skippedTile;
}
GameBoyCore.prototype.drawPartCopy = function (tileIndex, x, y, sourceLine, attribs) {
	var image = this.tileData[tileIndex + this.tileCount * attribs] || this.updateImage(tileIndex, attribs);
	var dst = x + y * 160;
	var src = sourceLine * 8;
	var dstEnd = (x > 152) ? ((y + 1) * 160) : (dst + 8);  
	if (x < 0) { // adjust left
		dst -= x;
		src -= x;
	}
	while (dst < dstEnd) {
		this.frameBuffer[dst++] = image[src++];
	}
}
GameBoyCore.prototype.checkPaletteType = function () {
	//Reference the correct palette ahead of time...
	this.palette = (this.cGBC) ? this.gbcPalette : ((this.usedBootROM && settings[17]) ? this.gbColorizedPalette : this.gbPalette);
}
GameBoyCore.prototype.updateImage = function (tileIndex, attribs) {
	var index_ = tileIndex + this.tileCount * attribs;
	var otherBank = (tileIndex >= 384);
	var offset = otherBank ? ((tileIndex - 384) << 4) : (tileIndex << 4);
	var paletteStart = attribs & 0xFC;
	var transparent = attribs >= this.transparentCutoff;
	var pixix = 0;
	var pixixdx = 1;
	var pixixdy = 0;
	var tempPix = ArrayCreate( 64, "SI32", 0 );
	if ((attribs & 2) != 0) {
		pixixdy = -16;
		pixix = 56;
	}
	if ((attribs & 1) == 0) {
		pixixdx = -1;
		pixix += 7;
		pixixdy += 16;
	}
	for (var y = 8; --y >= 0;) {
		var num = this.weaveLookup[this.VRAMReadGFX(offset++, otherBank)] + (this.weaveLookup[this.VRAMReadGFX(offset++, otherBank)] << 1);
		if (num != 0) {
			transparent = false;
		}
		for (var x = 8; --x >= 0;) {
			tempPix[pixix] = this.palette[paletteStart + (num & 3)] & -1;
			pixix += pixixdx;
			num  >>= 2;
		}
		pixix += pixixdy;
	}
	this.tileData[index_] = (transparent) ? true : tempPix;
	this.tileReadState[tileIndex] = 1;
	return this.tileData[index_];
}
GameBoyCore.prototype.drawSpritesForLine = function (line) {
	if (!this.gfxSpriteShow) {
		return;
	}
	var minSpriteY = line - ((this.gfxSpriteDouble) ? 15 : 7);
	// either only do priorityFlag == 0 (all foreground),
	// or first 0x80 (background) and then 0 (foreground)
	var priorityFlag = this.spritePriorityEnabled ? 0x80 : 0;
	for (; priorityFlag >= 0; priorityFlag -= 0x80) {
		var oamIx = 159;
		while (oamIx >= 0) {
			var attributes = 0xFF & this.memory[0xFE00 + oamIx--];
			if ((attributes & 0x80) == priorityFlag || !this.spritePriorityEnabled) {
				var tileNum = (0xFF & this.memory[0xFE00 + oamIx--]);
				var spriteX = (0xFF & this.memory[0xFE00 + oamIx--]) - 8;
				var spriteY = (0xFF & this.memory[0xFE00 + oamIx--]) - 16;
				var offset = line - spriteY;
				if (spriteX >= 160 || spriteY < minSpriteY || offset < 0) {
					continue;
				}
				if (this.gfxSpriteDouble) {
					tileNum = tileNum & 0xFE;
				}
				var spriteAttrib = (attributes >> 5) & 0x03; // flipx: from bit 0x20 to 0x01, flipy: from bit 0x40 to 0x02
				if (this.cGBC) {
					spriteAttrib += 0x20 + ((attributes & 0x07) << 2); // palette
					tileNum += (384 >> 3) * (attributes & 0x08); // tile vram bank
				}
				else {
					// attributes 0x10: 0x00 = OBJ1 palette, 0x10 = OBJ2 palette
					// spriteAttrib: 0x04: OBJ1 palette, 0x08: OBJ2 palette
					spriteAttrib += 0x4 + ((attributes & 0x10) >> 2);
				}
				if (priorityFlag == 0x80) {
				// background
					if (this.gfxSpriteDouble) {
						if ((spriteAttrib & 2) != 0) {
							this.drawPartBgSprite((tileNum | 1) - (offset >> 3), spriteX, line, offset & 7, spriteAttrib);
						}
						else {
							this.drawPartBgSprite((tileNum & -2) + (offset >> 3), spriteX, line, offset & 7, spriteAttrib);
						}
					}
					else {
						this.drawPartBgSprite(tileNum, spriteX, line, offset, spriteAttrib);
					}
				}
				else {
					// foreground
					if (this.gfxSpriteDouble) {
						if ((spriteAttrib & 2) != 0) {
							this.drawPartFgSprite((tileNum | 1) - (offset >> 3), spriteX, line, offset & 7, spriteAttrib);
						}
						else {
							this.drawPartFgSprite((tileNum & -2) + (offset >> 3), spriteX, line, offset & 7, spriteAttrib);
						}
					}
					else {
						this.drawPartFgSprite(tileNum, spriteX, line, offset, spriteAttrib);
					}
				}
			}
			else {
				oamIx -= 3;
			}
		}
	}
}
GameBoyCore.prototype.drawPartFgSprite = function (tileIndex, x, y, sourceLine, attribs) {
	var im = this.tileData[tileIndex + this.tileCount * attribs] || this.updateImage(tileIndex, attribs);
	if (im === true) {
		return;
	}
	var dst = x + y * 160;
	var src = sourceLine * 8;
	var dstEnd = (x > 152) ? ((y + 1) * 160) : (dst + 8);
	if (x < 0) { // adjust left
		dst -= x;
		src -= x;
	}
	while (dst < dstEnd) {
		if (im[src] < 0) {
			this.frameBuffer[dst] = im[src];
		}
		dst++;
		src++;
	}
}
GameBoyCore.prototype.drawPartBgSprite = function (tileIndex, x, y, sourceLine, attribs) {
	var im = this.tileData[tileIndex + this.tileCount * attribs] || this.updateImage(tileIndex, attribs);
	if (im === true) {
		return;
	}
	var dst = x + y * 160;
	var src = sourceLine * 8;
	var dstEnd = (x > 152) ? ((y + 1) * 160) : (dst + 8);  
	if (x < 0) { // adjust left
		dst -= x;
		src -= x;
	}
	while (dst < dstEnd) {
		if (im[src] < 0 && this.frameBuffer[dst] >= 0) {
			this.frameBuffer[dst] = im[src];
		}
		dst++;
		src++;
	}
}


