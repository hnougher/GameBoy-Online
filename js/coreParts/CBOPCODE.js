

GameBoyCore.prototype.CBOPCODE = new Array(
	//#0x00:
	function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x80) == 0x80);
		parentObj.registerB = ((parentObj.registerB << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//#0x01:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x80) == 0x80);
		parentObj.registerC = ((parentObj.registerC << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//#0x02:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x80) == 0x80);
		parentObj.registerD = ((parentObj.registerD << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//#0x03:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x80) == 0x80);
		parentObj.registerE = ((parentObj.registerE << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//#0x04:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x8000) == 0x8000);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | (parentObj.FCarry << 8) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
	}
	//#0x05:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x80) == 0x80);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0x00);
	}
	//#0x06:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x80) == 0x80);
		temp_var = ((temp_var << 1) & 0xFF) | parentObj.FCarry;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0x00);
	}
	//#0x07
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x80) == 0x80);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0x00);
	}
	//#0x08
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = (parentObj.FCarry << 7) | (parentObj.registerB >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//#0x09
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = (parentObj.FCarry << 7) | (parentObj.registerC >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//#0x0A
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = (parentObj.FCarry << 7) | (parentObj.registerD >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//#0x0B
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = (parentObj.FCarry << 7) | (parentObj.registerE >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//#0x0C
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = (parentObj.FCarry << 15) | ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
	}
	//#0x0D
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x01) == 0x01);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | (parentObj.FCarry << 7) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0x00);
	}
	//#0x0E
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		temp_var = (parentObj.FCarry << 7) | (temp_var >> 1);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0x00);
	}
	//#0x0F
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = (parentObj.FCarry << 7) | (parentObj.registerA >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0x00);
	}
	//#0x10
	,function (parentObj) {
		var newFCarry = ((parentObj.registerB & 0x80) == 0x80);
		parentObj.registerB = ((parentObj.registerB << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//#0x11
	,function (parentObj) {
		var newFCarry = ((parentObj.registerC & 0x80) == 0x80);
		parentObj.registerC = ((parentObj.registerC << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//#0x12
	,function (parentObj) {
		var newFCarry = ((parentObj.registerD & 0x80) == 0x80);
		parentObj.registerD = ((parentObj.registerD << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//#0x13
	,function (parentObj) {
		var newFCarry = ((parentObj.registerE & 0x80) == 0x80);
		parentObj.registerE = ((parentObj.registerE << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//#0x14
	,function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x8000) == 0x8000);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | (parentObj.FCarry << 8) | (parentObj.registersHL & 0xFF);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
	}
	//#0x15
	,function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x80) == 0x80);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0x00);
	}
	//#0x16
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var newFCarry = ((temp_var & 0x80) == 0x80);
		temp_var = ((temp_var << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FCarry = newFCarry;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0x00);
	}
	//#0x17
	,function (parentObj) {
		var newFCarry = ((parentObj.registerA & 0x80) == 0x80);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | parentObj.FCarry;
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0x00);
	}
	//#0x18
	,function (parentObj) {
		var newFCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = (parentObj.FCarry << 7) | (parentObj.registerB >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//#0x19
	,function (parentObj) {
		var newFCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = (parentObj.FCarry << 7) | (parentObj.registerC >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//#0x1A
	,function (parentObj) {
		var newFCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = (parentObj.FCarry << 7) | (parentObj.registerD >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//#0x1B
	,function (parentObj) {
		var newFCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = (parentObj.FCarry << 7) | (parentObj.registerE >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//#0x1C
	,function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = (parentObj.FCarry << 15) | ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
	}
	//#0x1D
	,function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x01) == 0x01);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | (parentObj.FCarry << 7) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0x00);
	}
	//#0x1E
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var newFCarry = ((temp_var & 0x01) == 0x01);
		temp_var = (parentObj.FCarry << 7) | (temp_var >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0x00);
	}
	//#0x1F
	,function (parentObj) {
		var newFCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = (parentObj.FCarry << 7) | (parentObj.registerA >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0x00);
	}
	//#0x20
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x80) == 0x80);
		parentObj.registerB = (parentObj.registerB << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//#0x21
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x80) == 0x80);
		parentObj.registerC = (parentObj.registerC << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//#0x22
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x80) == 0x80);
		parentObj.registerD = (parentObj.registerD << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//#0x23
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x80) == 0x80);
		parentObj.registerE = (parentObj.registerE << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//#0x24
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x8000) == 0x8000);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
	}
	//#0x25
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0080) == 0x0080);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0x00);
	}
	//#0x26
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x80) == 0x80);
		temp_var = (temp_var << 1) & 0xFF;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0x00);
	}
	//#0x27
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x80) == 0x80);
		parentObj.registerA = (parentObj.registerA << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0x00);
	}
	//#0x28
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = (parentObj.registerB & 0x80) | (parentObj.registerB >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//#0x29
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = (parentObj.registerC & 0x80) | (parentObj.registerC >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//#0x2A
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = (parentObj.registerD & 0x80) | (parentObj.registerD >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//#0x2B
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = (parentObj.registerE & 0x80) | (parentObj.registerE >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//#0x2C
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0x80FF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
	}
	//#0x2D
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0001) == 0x0001);
		parentObj.registersHL = (parentObj.registersHL & 0xFF80) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0x00);
	}
	//#0x2E
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		temp_var = (temp_var & 0x80) | (temp_var >> 1);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0x00);
	}
	//#0x2F
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = (parentObj.registerA & 0x80) | (parentObj.registerA >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0x00);
	}
	//#0x30
	,function (parentObj) {
		parentObj.registerB = ((parentObj.registerB & 0xF) << 4) | (parentObj.registerB >> 4);
		parentObj.FZero = (parentObj.registerB == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x31
	,function (parentObj) {
		parentObj.registerC = ((parentObj.registerC & 0xF) << 4) | (parentObj.registerC >> 4);
		parentObj.FZero = (parentObj.registerC == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x32
	,function (parentObj) {
		parentObj.registerD = ((parentObj.registerD & 0xF) << 4) | (parentObj.registerD >> 4);
		parentObj.FZero = (parentObj.registerD == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x33
	,function (parentObj) {
		parentObj.registerE = ((parentObj.registerE & 0xF) << 4) | (parentObj.registerE >> 4);
		parentObj.FZero = (parentObj.registerE == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x34
	,function (parentObj) {
		parentObj.registersHL = ((parentObj.registersHL & 0xF00) << 4) | ((parentObj.registersHL & 0xF000) >> 4) | (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x35
	,function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL & 0xF) << 4) | ((parentObj.registersHL & 0xF0) >> 4);
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x36
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		temp_var = ((temp_var & 0xF) << 4) | (temp_var >> 4);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FZero = (temp_var == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x37
	,function (parentObj) {
		parentObj.registerA = ((parentObj.registerA & 0xF) << 4) | (parentObj.registerA >> 4);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//#0x38
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//#0x39
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//#0x3A
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//#0x3B
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//#0x3C
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL <= 0xFF);
	}
	//#0x3D
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0001) == 0x0001);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0x00);
	}
	//#0x3E
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var >>= 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0x00);
	}
	//#0x3F
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0x00);
	}
	//#0x40
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x01) == 0);
	}
	//#0x41
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x01) == 0);
	}
	//#0x42
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x01) == 0);
	}
	//#0x43
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x01) == 0);
	}
	//#0x44
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0100) == 0);
	}
	//#0x45
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0001) == 0);
	}
	//#0x46
	// BIT 1, (HL)
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x01) == 0);
	}
	//#0x47
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x01) == 0);
	}
	//#0x48
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x02) == 0);
	}
	//#0x49
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x02) == 0);
	}
	//#0x4A
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x02) == 0);
	}
	//#0x4B
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x02) == 0);
	}
	//#0x4C
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0200) == 0);
	}
	//#0x4D
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0002) == 0);
	}
	//#0x4E
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x02) == 0);
	}
	//#0x4F
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x02) == 0);
	}
	//#0x50
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x04) == 0);
	}
	//#0x51
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x04) == 0);
	}
	//#0x52
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x04) == 0);
	}
	//#0x53
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x04) == 0);
	}
	//#0x54
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0400) == 0);
	}
	//#0x55
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0004) == 0);
	}
	//#0x56
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x04) == 0);
	}
	//#0x57
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x04) == 0);
	}
	//#0x58
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x08) == 0);
	}
	//#0x59
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x08) == 0);
	}
	//#0x5A
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x08) == 0);
	}
	//#0x5B
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x08) == 0);
	}
	//#0x5C
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0800) == 0);
	}
	//#0x5D
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0008) == 0);
	}
	//#0x5E
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x08) == 0);
	}
	//#0x5F
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x08) == 0);
	}
	//#0x60
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x10) == 0);
	}
	//#0x61
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x10) == 0);
	}
	//#0x62
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x10) == 0);
	}
	//#0x63
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x10) == 0);
	}
	//#0x64
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x1000) == 0);
	}
	//#0x65
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0010) == 0);
	}
	//#0x66
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x10) == 0);
	}
	//#0x67
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x10) == 0);
	}
	//#0x68
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x20) == 0);
	}
	//#0x69
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x20) == 0);
	}
	//#0x6A
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x20) == 0);
	}
	//#0x6B
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x20) == 0);
	}
	//#0x6C
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x2000) == 0);
	}
	//#0x6D
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0020) == 0);
	}
	//#0x6E
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x20) == 0);
	}
	//#0x6F
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x20) == 0);
	}
	//#0x70
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x40) == 0);
	}
	//#0x71
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x40) == 0);
	}
	//#0x72
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x40) == 0);
	}
	//#0x73
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x40) == 0);
	}
	//#0x74
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x4000) == 0);
	}
	//#0x75
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0040) == 0);
	}
	//#0x76
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x40) == 0);
	}
	//#0x77
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x40) == 0);
	}
	//#0x78
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x80) == 0);
	}
	//#0x79
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x80) == 0);
	}
	//#0x7A
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x80) == 0);
	}
	//#0x7B
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x80) == 0);
	}
	//#0x7C
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x8000) == 0);
	}
	//#0x7D
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0080) == 0);
	}
	//#0x7E
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x80) == 0);
	}
	//#0x7F
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x80) == 0);
	}
	//#0x80
	,function (parentObj) {
		parentObj.registerB &= 0xFE;
	}
	//#0x81
	,function (parentObj) {
		parentObj.registerC &= 0xFE;
	}
	//#0x82
	,function (parentObj) {
		parentObj.registerD &= 0xFE;
	}
	//#0x83
	,function (parentObj) {
		parentObj.registerE &= 0xFE;
	}
	//#0x84
	,function (parentObj) {
		parentObj.registersHL &= 0xFEFF;
	}
	//#0x85
	,function (parentObj) {
		parentObj.registersHL &= 0xFFFE;
	}
	//#0x86
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0xFE);
	}
	//#0x87
	,function (parentObj) {
		parentObj.registerA &= 0xFE;
	}
	//#0x88
	,function (parentObj) {
		parentObj.registerB &= 0xFD;
	}
	//#0x89
	,function (parentObj) {
		parentObj.registerC &= 0xFD;
	}
	//#0x8A
	,function (parentObj) {
		parentObj.registerD &= 0xFD;
	}
	//#0x8B
	,function (parentObj) {
		parentObj.registerE &= 0xFD;
	}
	//#0x8C
	,function (parentObj) {
		parentObj.registersHL &= 0xFDFF;
	}
	//#0x8D
	,function (parentObj) {
		parentObj.registersHL &= 0xFFFD;
	}
	//#0x8E
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0xFD);
	}
	//#0x8F
	,function (parentObj) {
		parentObj.registerA &= 0xFD;
	}
	//#0x90
	,function (parentObj) {
		parentObj.registerB &= 0xFB;
	}
	//#0x91
	,function (parentObj) {
		parentObj.registerC &= 0xFB;
	}
	//#0x92
	,function (parentObj) {
		parentObj.registerD &= 0xFB;
	}
	//#0x93
	,function (parentObj) {
		parentObj.registerE &= 0xFB;
	}
	//#0x94
	,function (parentObj) {
		parentObj.registersHL &= 0xFBFF;
	}
	//#0x95
	,function (parentObj) {
		parentObj.registersHL &= 0xFFFB;
	}
	//#0x96
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0xFB);
	}
	//#0x97
	,function (parentObj) {
		parentObj.registerA &= 0xFB;
	}
	//#0x98
	,function (parentObj) {
		parentObj.registerB &= 0xF7;
	}
	//#0x99
	,function (parentObj) {
		parentObj.registerC &= 0xF7;
	}
	//#0x9A
	,function (parentObj) {
		parentObj.registerD &= 0xF7;
	}
	//#0x9B
	,function (parentObj) {
		parentObj.registerE &= 0xF7;
	}
	//#0x9C
	,function (parentObj) {
		parentObj.registersHL &= 0xF7FF;
	}
	//#0x9D
	,function (parentObj) {
		parentObj.registersHL &= 0xFFF7;
	}
	//#0x9E
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0xF7);
	}
	//#0x9F
	,function (parentObj) {
		parentObj.registerA &= 0xF7;
	}
	//#0xA0
	,function (parentObj) {
		parentObj.registerB &= 0xEF;
	}
	//#0xA1
	,function (parentObj) {
		parentObj.registerC &= 0xEF;
	}
	//#0xA2
	,function (parentObj) {
		parentObj.registerD &= 0xEF;
	}
	//#0xA3
	,function (parentObj) {
		parentObj.registerE &= 0xEF;
	}
	//#0xA4
	,function (parentObj) {
		parentObj.registersHL &= 0xEFFF;
	}
	//#0xA5
	,function (parentObj) {
		parentObj.registersHL &= 0xFFEF;
	}
	//#0xA6
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0xEF);
	}
	//#0xA7
	,function (parentObj) {
		parentObj.registerA &= 0xEF;
	}
	//#0xA8
	,function (parentObj) {
		parentObj.registerB &= 0xDF;
	}
	//#0xA9
	,function (parentObj) {
		parentObj.registerC &= 0xDF;
	}
	//#0xAA
	,function (parentObj) {
		parentObj.registerD &= 0xDF;
	}
	//#0xAB
	,function (parentObj) {
		parentObj.registerE &= 0xDF;
	}
	//#0xAC
	,function (parentObj) {
		parentObj.registersHL &= 0xDFFF;
	}
	//#0xAD
	,function (parentObj) {
		parentObj.registersHL &= 0xFFDF;
	}
	//#0xAE
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0xDF);
	}
	//#0xAF
	,function (parentObj) {
		parentObj.registerA &= 0xDF;
	}
	//#0xB0
	,function (parentObj) {
		parentObj.registerB &= 0xBF;
	}
	//#0xB1
	,function (parentObj) {
		parentObj.registerC &= 0xBF;
	}
	//#0xB2
	,function (parentObj) {
		parentObj.registerD &= 0xBF;
	}
	//#0xB3
	,function (parentObj) {
		parentObj.registerE &= 0xBF;
	}
	//#0xB4
	,function (parentObj) {
		parentObj.registersHL &= 0xBFFF;
	}
	//#0xB5
	,function (parentObj) {
		parentObj.registersHL &= 0xFFBF;
	}
	//#0xB6
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0xBF);
	}
	//#0xB7
	,function (parentObj) {
		parentObj.registerA &= 0xBF;
	}
	//#0xB8
	,function (parentObj) {
		parentObj.registerB &= 0x7F;
	}
	//#0xB9
	,function (parentObj) {
		parentObj.registerC &= 0x7F;
	}
	//#0xBA
	,function (parentObj) {
		parentObj.registerD &= 0x7F;
	}
	//#0xBB
	,function (parentObj) {
		parentObj.registerE &= 0x7F;
	}
	//#0xBC
	,function (parentObj) {
		parentObj.registersHL &= 0x7FFF;
	}
	//#0xBD
	,function (parentObj) {
		parentObj.registersHL &= 0xFF7F;
	}
	//#0xBE
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var & 0x7F);
	}
	//#0xBF
	,function (parentObj) {
		parentObj.registerA &= 0x7F;
	}
	//#0xC0
	,function (parentObj) {
		parentObj.registerB |= 0x01;
	}
	//#0xC1
	,function (parentObj) {
		parentObj.registerC |= 0x01;
	}
	//#0xC2
	,function (parentObj) {
		parentObj.registerD |= 0x01;
	}
	//#0xC3
	,function (parentObj) {
		parentObj.registerE |= 0x01;
	}
	//#0xC4
	,function (parentObj) {
		parentObj.registersHL |= 0x0100;
	}
	//#0xC5
	,function (parentObj) {
		parentObj.registersHL |= 0x01;
	}
	//#0xC6
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x01);
	}
	//#0xC7
	,function (parentObj) {
		parentObj.registerA |= 0x01;
	}
	//#0xC8
	,function (parentObj) {
		parentObj.registerB |= 0x02;
	}
	//#0xC9
	,function (parentObj) {
		parentObj.registerC |= 0x02;
	}
	//#0xCA
	,function (parentObj) {
		parentObj.registerD |= 0x02;
	}
	//#0xCB
	,function (parentObj) {
		parentObj.registerE |= 0x02;
	}
	//#0xCC
	,function (parentObj) {
		parentObj.registersHL |= 0x0200;
	}
	//#0xCD
	,function (parentObj) {
		parentObj.registersHL |= 0x02;
	}
	//#0xCE
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x02);
	}
	//#0xCF
	,function (parentObj) {
		parentObj.registerA |= 0x02;
	}
	//#0xD0
	,function (parentObj) {
		parentObj.registerB |= 0x04;
	}
	//#0xD1
	,function (parentObj) {
		parentObj.registerC |= 0x04;
	}
	//#0xD2
	,function (parentObj) {
		parentObj.registerD |= 0x04;
	}
	//#0xD3
	,function (parentObj) {
		parentObj.registerE |= 0x04;
	}
	//#0xD4
	,function (parentObj) {
		parentObj.registersHL |= 0x0400;
	}
	//#0xD5
	,function (parentObj) {
		parentObj.registersHL |= 0x04;
	}
	//#0xD6
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x04);
	}
	//#0xD7
	,function (parentObj) {
		parentObj.registerA |= 0x04;
	}
	//#0xD8
	,function (parentObj) {
		parentObj.registerB |= 0x08;
	}
	//#0xD9
	,function (parentObj) {
		parentObj.registerC |= 0x08;
	}
	//#0xDA
	,function (parentObj) {
		parentObj.registerD |= 0x08;
	}
	//#0xDB
	,function (parentObj) {
		parentObj.registerE |= 0x08;
	}
	//#0xDC
	,function (parentObj) {
		parentObj.registersHL |= 0x0800;
	}
	//#0xDD
	,function (parentObj) {
		parentObj.registersHL |= 0x08;
	}
	//#0xDE
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x08);
	}
	//#0xDF
	,function (parentObj) {
		parentObj.registerA |= 0x08;
	}
	//#0xE0
	,function (parentObj) {
		parentObj.registerB |= 0x10;
	}
	//#0xE1
	,function (parentObj) {
		parentObj.registerC |= 0x10;
	}
	//#0xE2
	,function (parentObj) {
		parentObj.registerD |= 0x10;
	}
	//#0xE3
	,function (parentObj) {
		parentObj.registerE |= 0x10;
	}
	//#0xE4
	,function (parentObj) {
		parentObj.registersHL |= 0x1000;
	}
	//#0xE5
	,function (parentObj) {
		parentObj.registersHL |= 0x10;
	}
	//#0xE6
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x10);
	}
	//#0xE7
	,function (parentObj) {
		parentObj.registerA |= 0x10;
	}
	//#0xE8
	,function (parentObj) {
		parentObj.registerB |= 0x20;
	}
	//#0xE9
	,function (parentObj) {
		parentObj.registerC |= 0x20;
	}
	//#0xEA
	,function (parentObj) {
		parentObj.registerD |= 0x20;
	}
	//#0xEB
	,function (parentObj) {
		parentObj.registerE |= 0x20;
	}
	//#0xEC
	,function (parentObj) {
		parentObj.registersHL |= 0x2000;
	}
	//#0xED
	,function (parentObj) {
		parentObj.registersHL |= 0x20;
	}
	//#0xEE
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x20);
	}
	//#0xEF
	,function (parentObj) {
		parentObj.registerA |= 0x20;
	}
	//#0xF0
	,function (parentObj) {
		parentObj.registerB |= 0x40;
	}
	//#0xF1
	,function (parentObj) {
		parentObj.registerC |= 0x40;
	}
	//#0xF2
	,function (parentObj) {
		parentObj.registerD |= 0x40;
	}
	//#0xF3
	,function (parentObj) {
		parentObj.registerE |= 0x40;
	}
	//#0xF4
	,function (parentObj) {
		parentObj.registersHL |= 0x4000;
	}
	//#0xF5
	,function (parentObj) {
		parentObj.registersHL |= 0x40;
	}
	//#0xF6
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x40);
	}
	//#0xF7
	,function (parentObj) {
		parentObj.registerA |= 0x40;
	}
	//#0xF8
	,function (parentObj) {
		parentObj.registerB |= 0x80;
	}
	//#0xF9
	,function (parentObj) {
		parentObj.registerC |= 0x80;
	}
	//#0xFA
	,function (parentObj) {
		parentObj.registerD |= 0x80;
	}
	//#0xFB
	,function (parentObj) {
		parentObj.registerE |= 0x80;
	}
	//#0xFC
	,function (parentObj) {
		parentObj.registersHL |= 0x8000;
	}
	//#0xFD
	,function (parentObj) {
		parentObj.registersHL |= 0x80;
	}
	//#0xFE
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var | 0x80);
	}
	//#0xFF
	,function (parentObj) {
		parentObj.registerA |= 0x80;
	}
);


GameBoyCore.prototype.SecondaryTICKTable = new Array(		//Number of machine cycles for each 0xCBXX instruction:
/*	0, 1, 2, 3, 4, 5, 6, 7,		8, 9, A, B, C, D, E, F*/
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //0
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //1
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //2
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //3

	2, 2, 2, 2, 2, 2, 3, 2,		2, 2, 2, 2, 2, 2, 3, 2,  //4
	2, 2, 2, 2, 2, 2, 3, 2,		2, 2, 2, 2, 2, 2, 3, 2,  //5
	2, 2, 2, 2, 2, 2, 3, 2,		2, 2, 2, 2, 2, 2, 3, 2,  //6
	2, 2, 2, 2, 2, 2, 3, 2,		2, 2, 2, 2, 2, 2, 3, 2,  //7

	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //8
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //9
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //A
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //B

	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //C
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //D
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2,  //E
	2, 2, 2, 2, 2, 2, 4, 2,		2, 2, 2, 2, 2, 2, 4, 2   //F
);

// Merge SecondaryTICKTable into CBOPCODE
for( var i = 0; i <= 0xFF; i++ )
{
	var func = GameBoyCore.prototype.CBOPCODE[i];
	var tick = GameBoyCore.prototype.SecondaryTICKTable[i];
	GameBoyCore.prototype.CBOPCODE[i] = [ func, tick ];
}

// Clear temparary variables
delete GameBoyCore.prototype.SecondaryTICKTable;
