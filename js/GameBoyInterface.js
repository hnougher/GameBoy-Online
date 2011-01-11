
var GameBoyCore = function( canvas, canvasAlt, ROM )
{
	var self = this;
	
	// Create new gameboy emulator
	this.worker = new Worker("js/GameBoyWorker.js");
	this.worker.onmessage = function(event){ self.onmessage(event); };
	this.worker.onerror = this.onerror;
	
	// Gather canvas
	this.canvas = document.getElementById("gbCanvas");
	this.ctx = canvas.getContext("2d");
	this.canvas.width = 160;
	this.canvas.height = 144;
	this.canvas.style.visibility = "visible";
	
	// Initialize it
	this.init( canvas, canvasAlt, ROM  );
};

Scale2x.setCallback( function( imageData ){
	gameboy.canvas.height = imageData.height;
	gameboy.canvas.width = imageData.width;
	gameboy.ctx.putImageData( imageData, 0, 0 );
	});

GameBoyCore.prototype.onmessage = function(event)
{
	var args = event.data;
	switch( args[0] )
	{
		case "cout":
			cout( args[1], args[2] );
			break;
		
		case "update_display":
			this.ctx.putImageData( args[1], 0, 0 );
			//Scale2x.scale2xID( args[1], "gameboy" );
			break;
		
		case "HNOpcode_Usage":
			HNOpcode_Usage = args[1];
			update_HNOpcode_Usage();
			break;
	}
};

GameBoyCore.prototype.onerror = function(error)
{
	throw error;
};

GameBoyCore.prototype.init = function( canvas, canvasAlt, ROM )
{
	// We cannot pass DOM objects through to worker
	// But we can pass an ImageData object or arrays
	var imageData = document.createElement("canvas").getContext("2d").createImageData( 160, 144 );
	
	this.worker.postMessage(["init", ROM, imageData]);
};

GameBoyCore.prototype.start = function()
{
	this.worker.postMessage(["start"]);
};

GameBoyCore.prototype.run = function()
{
	this.worker.postMessage(["run"]);
};

GameBoyCore.prototype.resumeEmulator = function()
{
	this.worker.postMessage(["resumeEmulator"]);
};

GameBoyCore.prototype.stopEmulator = function()
{
	this.worker.postMessage(["stopEmulator"]);
};

GameBoyCore.prototype.JoyPadEvent = function( keycode, isDown )
{
	this.worker.postMessage(["JoyPadEvent", keycode, isDown]);
};
