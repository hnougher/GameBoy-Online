
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
	this.worker.postMessage(["init", ROM]);
};

/*Scale2x.setCallback( function( imageData ){
	gameboy.canvas.height = imageData.height;
	gameboy.canvas.width = imageData.width;
	gameboy.ctx.putImageData( imageData, 0, 0 );
	});*/

GameBoyCore.prototype.onmessage = function(event)
{
	var args = event.data;
	switch( args[0] )
	{
		case "cout":
			cout( args[1], args[2] );
			break;
		
		case "draw_blank":
			this.ctx.fillStyle = "white";
			this.ctx.fillRect(0, 0, 160, 144);
			break;
		
		case "update_display":
			var frameBuffer = args[1];
			var imageData = this.ctx.getImageData(0, 0, 160, 144);
			var canvasData = imageData.data;
			var canvasIndex = 0;
			for (var i = 0; i < frameBuffer.length; i++) {
				canvasData[canvasIndex++] = (frameBuffer[i] >> 16) & 0xFF;	//Red
				canvasData[canvasIndex++] = (frameBuffer[i] >> 8) & 0xFF;	//Green
				canvasData[canvasIndex++] = frameBuffer[i] & 0xFF;			//Blue
				canvasIndex++; // Alpha is ignored
			}
			this.ctx.putImageData(imageData, 0, 0);
			//Scale2x.scale2xID( args[1], "gameboy" );
			break;
		
		case "HNOpcode_Usage":
			HNOpcode_Usage = args[1];
			update_HNOpcode_Usage();
			break;
		
		case "pause":
			pause();
			break;
	}
};

GameBoyCore.prototype.onerror = function(error)
{
	throw error;
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
