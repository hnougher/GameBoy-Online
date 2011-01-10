

GameBoyCore.prototype.initSound = function () {
	if (settings[0]) {
		try {
			//mozAudio - Synchronous Audio API
			this.audioHandle = new Audio();
			this.audioHandle.mozSetup((!settings[1]) ? 2 : 1, settings[14]);
			cout("Mozilla Audio API Initialized:", 0);
			this.audioType = 0;
		}
		catch (error) {
			try {
				if (typeof audioContextHandle == "undefined") {									//Make sure we don't try to create more than one audio context.
					/*Get the one continuous audio loop rolling, as the loop will update
					the audio asynchronously by inspecting the gameboy object periodically.
					Variables and event handling functions have to be globally declared to prevent a bad bug in an experimental Safari build!*/
					audioContextHandle = new AudioContext();									//Create a system audio context.
					audioSource = audioContextHandle.createBufferSource();						//We need to create a false input to get the chain started.
					audioSource.loop = true;	//Keep this alive forever (Event handler will know when to ouput.)
					audioSource.buffer = audioContextHandle.createBuffer(1, 1, settings[14]);	//Create a zero'd input buffer for the input to be valid.
					audioNode = audioContextHandle.createJavaScriptNode(settings[18], 1, 2);	//Create 2 outputs and ignore the input buffer (Just copy buffer 1 over if mono)
					audioNode.onaudioprocess = audioOutputEvent;								//Connect the audio processing event to a handling function so we can manipulate output
					audioSource.connect(audioNode);												//Send and chain the input to the audio manipulation.
					audioNode.connect(audioContextHandle.destination);							//Send and chain the output of the audio manipulation to the system audio output.
					audioSource.noteOn(0);														//Start the loop!
				}
				cout("WebKit Audio API Initialized:", 0);
				this.audioType = 1;
			}
			catch (error) {
				try {
					this.audioHandle = new AudioThread((!settings[1]) ? 2 : 1, settings[14], settings[15], false);
					cout("WAV PCM Audio Wrapper Initialized:", 0);
					this.audioType = 2;
					this.outTrackerLimit = 20 * (settings[14] / 44100);
					
				}
				catch (error) {
					settings[0] = false;
					this.audioType = -1;
					cout("Audio system cannot run: " + error.message, 2);
				}
			}
		}
		if (settings[0]) {
			cout("...Audio Channels: " + ((!settings[1]) ? 2 : 1), 0);
			cout("...Sample Rate: " + settings[14], 0);
			this.initAudioBuffer();
		}
	}
}
GameBoyCore.prototype.initAudioBuffer = function () {
	this.audioIndex = 0;
	this.sampleSize = Math.floor(settings[14] / 1000 * settings[20]) + 1;
	cout("...Samples Per VBlank (Per Channel): " + this.sampleSize, 0);
	this.samplesOut = this.sampleSize / (settings[11] * Math.ceil(settings[13] / settings[11]));
	cout("...Samples Per machine cycle (Per Channel): " + this.samplesOut, 0);
	this.numSamplesTotal = (settings[1]) ? this.sampleSize : (this.sampleSize * 2);
	this.audioSamples = this.getTypedArray(this.numSamplesTotal, 0, "float32");
	this.audioBackup = this.getTypedArray(this.numSamplesTotal, 0, "float32");
	this.smallNoiseTable = this.getTypedArray(0x80, 0, "float32");
	this.largeNoiseTable = this.getTypedArray(0x8000, 0, "float32");
	//var shiftValue = 0;
	//var smallNoiseTable = new Array(0x80);
	//7-bit white noise table:
	//smallNoiseTable[0] = 0x7F;	//Seed value
	//this.smallNoiseTable[0] = 1;
	for (var index = 0; index < 0x80; index++) {
		/*shiftValue = smallNoiseTable[index - 1] >> 1;
		smallNoiseTable[index] = (((shiftValue ^ smallNoiseTable[index - 1]) & 1) << 6) | shiftValue;*/
		//this.smallNoiseTable[index] = (smallNoiseTable[index] / 0x7F);
		this.smallNoiseTable[index] = Math.random();
	}
	//15-bit white noise table:
	//var largeNoiseTable = new Array(0x8000);
	//largeNoiseTable[0] = 0x7FFF;	//Seed value
	//this.largeNoiseTable[0] = 1;
	for (var index = 0; index < 0x8000; index++) {
		/*shiftValue = largeNoiseTable[index - 1] >> 1;
		largeNoiseTable[index] = (((shiftValue ^ largeNoiseTable[index - 1]) & 1) << 14) | shiftValue;*/
		//this.largeNoiseTable[index] = largeNoiseTable[index] / 0x7FFF;
		this.largeNoiseTable[index] = Math.random();
	}
	this.noiseTableLookup = this.largeNoiseTable;
}
GameBoyCore.prototype.playAudio = function () {
	if (settings[0]) {
		if (!this.audioOverflow && this.audioIndex < this.numSamplesTotal) {
			//Make sure we don't under-run the sample generation:
			this.generateAudio((this.numSamplesTotal - this.audioIndex) / ((!settings[1]) ? 2 : 1));
		}
		if (this.audioType == 0) {
			//mozAudio
			this.audioHandle.mozWriteAudio(this.audioSamples);
		}
		else if (this.audioType == 2) {
			//WAV PCM via Data URI
			this.audioHandle = (this.outTracker++ > 0) ? this.audioHandle : new AudioThread((!settings[1]) ? 2 : 1, settings[14], settings[15], false);
			this.audioHandle.appendBatch(this.audioSamples);
		}
	}
}
GameBoyCore.prototype.audioUpdate = function () {
	if (settings[0]) {
		if (this.audioType == 2 && this.outTracker > this.outTrackerLimit) {
			try {
				this.audioHandle.outputAudio();
				this.outTracker = 0;
			}
			catch (error) {
				settings[0] = false;
				cout("Audio system cannot run: " + error.message, 2);
			}
		}
		this.currentBuffer = this.audioSamples;
		//If we generated too many samples to output from the last run, align them here:
		if (this.audioOverflow) {
			for (var sampleOverwrite = 0; sampleOverwrite < this.audioIndex; sampleOverwrite++) {
				this.currentBuffer[sampleOverwrite] = this.audioBackup[sampleOverwrite];
			}
			this.audioOverflow = false;
		}
	}
}
GameBoyCore.prototype.initializeStartState = function () {
	this.channel1adjustedFrequencyPrep = 0;
	this.channel1duty = 2;
	this.channel1lastSampleLookup = 0;
	this.channel1adjustedDuty = 0.5;
	this.channel1totalLength = 0;
	this.channel1envelopeVolume = 0;
	this.channel1currentVolume = 0;
	this.channel1envelopeType = false;
	this.channel1envelopeSweeps = 0;
	this.channel1consecutive = true;
	this.channel1frequency = 0;
	this.channel1volumeEnvTime = 0;
	this.channel1lastTotalLength = 0;
	this.channel1timeSweep = 0;
	this.channel1lastTimeSweep = 0;
	this.channel1numSweep = 0;
	this.channel1frequencySweepDivider = 0;
	this.channel1decreaseSweep = false;
	this.channel2adjustedFrequencyPrep = 0;
	this.channel2duty = 2;
	this.channel2lastSampleLookup = 0;
	this.channel2adjustedDuty = 0.5;
	this.channel2totalLength = 0;
	this.channel2envelopeVolume = 0;
	this.channel2currentVolume = 0;
	this.channel2envelopeType = false;
	this.channel2envelopeSweeps = 0;
	this.channel2consecutive = true;
	this.channel2frequency = 0;
	this.channel2volumeEnvTime = 0;
	this.channel2lastTotalLength = 0;
	this.channel3canPlay = false;
	this.channel3totalLength = 0;
	this.channel3lastTotalLength = 0;
	this.channel3patternType = 0;
	this.channel3frequency = 0;
	this.channel3consecutive = true;
	this.channel3PCM = this.getTypedArray(0x20, 0xF, "uint8");
	this.channel3adjustedFrequencyPrep = 0x20000 / settings[14];
	this.channel4adjustedFrequencyPrep = 0;
	this.channel4lastSampleLookup = 0;				//Keeps track of the audio timing.
	this.channel4totalLength = 0;
	this.channel4envelopeVolume = 0;
	this.channel4currentVolume = 0;
	this.channel4envelopeType = false;
	this.channel4envelopeSweeps = 0;
	this.channel4consecutive = true;
	this.channel4volumeEnvTime = 0;
	this.channel4lastTotalLength = 0;	
}
GameBoyCore.prototype.generateAudio = function (numSamples) {
	if (settings[0]) {
		if (this.soundMasterEnabled) {
			if (settings[1]) {						//Split Mono & Stereo into two, to avoid this if statement every iteration of the loop.
				while (--numSamples >= 0) {			//Leave as while for TraceMonkey JS engine (do while seems to be just a tad slower in tracing) (Method JIT implementations still faster though)
					//MONO
					this.channel1Compute();
					this.channel2Compute();
					this.channel3Compute();
					this.channel4Compute();
					this.currentBuffer[this.audioIndex++] = this.vinLeft * this.currentSampleLeft / Math.max(this.channelLeftCount, 1);
					if (this.audioIndex == this.numSamplesTotal) {
						this.audioIndex = 0;
						this.currentBuffer = this.audioBackup;
						this.audioOverflow = true;
					}
				}
			}
			else {
				while (--numSamples >= 0) {		//Leave as while for TraceMonkey JS engine (do while seems to be just a tad slower in tracing) (Method JIT implementations still faster though)
					//STEREO
					this.channel1Compute();
					this.channel2Compute();
					this.channel3Compute();
					this.channel4Compute();
					this.currentBuffer[this.audioIndex++] = this.vinRight * this.currentSampleRight / Math.max(this.channelRightCount, 1);
					this.currentBuffer[this.audioIndex++] = this.vinLeft * this.currentSampleLeft / Math.max(this.channelLeftCount, 1);
					if (this.audioIndex == this.numSamplesTotal) {
						this.audioIndex = 0;
						this.currentBuffer = this.audioBackup;
						this.audioOverflow = true;
					}
				}
			}
		}
		else {
			//SILENT OUTPUT:
			if (settings[1]) {
				while (--numSamples >= 0) {
					//MONO
					this.audioSamples[this.audioIndex++] = 0;
					if (this.audioIndex == this.numSamplesTotal) {
						this.audioIndex = 0;
						this.currentBuffer = this.audioBackup;
						this.audioOverflow = true;
					}
				}
			}
			else {
				while (--numSamples >= 0) {
					//STEREO
					this.audioSamples[this.audioIndex++] = this.audioSamples[this.audioIndex++] = 0;
					if (this.audioIndex == this.numSamplesTotal) {
						this.audioIndex = 0;
						this.currentBuffer = this.audioBackup;
						this.audioOverflow = true;
					}
				}
			}
		}
	}
}
GameBoyCore.prototype.channel1Compute = function () {
	if ((this.channel1consecutive || this.channel1totalLength > 0) && this.channel1frequency <= 0x7FF) {
		var duty = (this.channel1lastSampleLookup <= this.channel1adjustedDuty) ? this.channel1currentVolume : 0;
		if (this.leftChannel[0]) {
			this.currentSampleLeft = duty;
			this.channelLeftCount = 1;
		}
		else {
			this.channelLeftCount = this.currentSampleLeft = 0;
		}
		if (this.rightChannel[0]) {
			this.currentSampleRight = duty;
			this.channelRightCount = 1;
		}
		else {
			this.channelRightCount = this.currentSampleRight = 0;
		}
		if (this.channel1numSweep > 0) {
			if (--this.channel1timeSweep == 0) {
				this.channel1numSweep--;
				if (this.channel1decreaseSweep) {
					this.channel1frequency -= this.channel1frequency / this.channel1frequencySweepDivider;
				}
				else {
					this.channel1frequency += this.channel1frequency / this.channel1frequencySweepDivider;
					if (this.channel1frequency > 0x7FF) {
						this.memory[0xFF26] &= 0xFE;	//Channel #1 On Flag Off
					}
				}
				this.channel1timeSweep = this.channel1lastTimeSweep;
				//Pre-calculate the frequency computation outside the waveform generator for speed:
				this.channel1adjustedFrequencyPrep = this.preChewedAudioComputationMultiplier / (0x800 - this.channel1frequency);
			}
		}
		if (this.channel1envelopeSweeps > 0) {
			if (this.channel1volumeEnvTime > 0) {
				this.channel1volumeEnvTime--;
			}
			else {
				if (!this.channel1envelopeType) {
					if (this.channel1envelopeVolume > 0) {
						this.channel1currentVolume = --this.channel1envelopeVolume / 0xF;
						this.channel1volumeEnvTime = this.channel1envelopeSweeps * this.volumeEnvelopePreMultiplier;
					}
				}
				else {
					if (this.channel1envelopeVolume < 0xF) {
						this.channel1currentVolume = ++this.channel1envelopeVolume / 0xF;
						this.channel1volumeEnvTime = this.channel1envelopeSweeps * this.volumeEnvelopePreMultiplier;
					}
				}
			}
		}
		if (this.channel1totalLength > 0) {
			this.channel1totalLength--;
			if (this.channel1totalLength <= 0) {
				this.memory[0xFF26] &= 0xFE;	//Channel #1 On Flag Off
			}
		}
		this.channel1lastSampleLookup += this.channel1adjustedFrequencyPrep;
		while (this.channel1lastSampleLookup >= 1) {
			this.channel1lastSampleLookup -= 1;
		}
	}
	else {
		this.channelLeftCount = this.channelRightCount = this.currentSampleLeft = this.currentSampleRight = 0;
	}
}
GameBoyCore.prototype.channel2Compute = function () {
	if (this.channel2consecutive || this.channel2totalLength > 0) {
		var duty = (this.channel2lastSampleLookup <= this.channel2adjustedDuty) ? this.channel2currentVolume : 0;
		if (this.leftChannel[1]) {
			this.currentSampleLeft += duty;
			this.channelLeftCount++;
		}
		if (this.rightChannel[1]) {
			this.currentSampleRight += duty;
			this.channelRightCount++;
		}
		if (this.channel2envelopeSweeps > 0) {
			if (this.channel2volumeEnvTime > 0) {
				this.channel2volumeEnvTime--;
			}
			else {
				if (!this.channel2envelopeType) {
					if (this.channel2envelopeVolume > 0) {
						this.channel2currentVolume = --this.channel2envelopeVolume / 0xF;
						this.channel2volumeEnvTime = this.channel2envelopeSweeps * this.volumeEnvelopePreMultiplier;
					}
				}
				else {
					if (this.channel2envelopeVolume < 0xF) {
						this.channel2currentVolume = ++this.channel2envelopeVolume / 0xF;
						this.channel2volumeEnvTime = this.channel2envelopeSweeps * this.volumeEnvelopePreMultiplier;
					}
				}
			}
		}
		if (this.channel2totalLength > 0) {
			this.channel2totalLength--;
			if (this.channel2totalLength <= 0) {
				this.memory[0xFF26] &= 0xFD;	//Channel #2 On Flag Off
			}
		}
		this.channel2lastSampleLookup += this.channel2adjustedFrequencyPrep;
		while (this.channel2lastSampleLookup >= 1) {
			this.channel2lastSampleLookup -= 1;
		}
	}
}
GameBoyCore.prototype.channel3Compute = function () {
	if (this.channel3canPlay && (this.channel3consecutive || this.channel3totalLength > 0)) {
		if (this.channel3patternType > 0) {
			var PCMSample = (this.channel3PCM[Math.floor(this.channel3Tracker)] >> (this.channel3patternType - 1)) / 0xF;
			if (this.leftChannel[2]) {
				this.currentSampleLeft += PCMSample;
				this.channelLeftCount++;
			}
			if (this.rightChannel[2]) {
				this.currentSampleRight += PCMSample;
				this.channelRightCount++;
			}
		}
		this.channel3Tracker += this.channel3adjustedFrequencyPrep;
		if (this.channel3Tracker >= 0x20) {
			this.channel3Tracker -= 0x20;
		}
		if (this.channel3totalLength > 0) {
			this.channel3totalLength--;
			if (this.channel3totalLength <= 0) {
				this.memory[0xFF26] &= 0xFB;	//Channel #3 On Flag Off
			}
		}
	}
}
GameBoyCore.prototype.channel4Compute = function () {
	if (this.channel4consecutive || this.channel4totalLength > 0) {
		var duty = this.channel4currentVolume * this.noiseTableLookup[Math.floor(this.channel4lastSampleLookup)];
		if (this.leftChannel[3]) {
			this.currentSampleLeft += duty;
			this.channelLeftCount++;
		}
		if (this.rightChannel[3]) {
			this.currentSampleRight += duty;
			this.channelRightCount++;
		}
		if (this.channel4envelopeSweeps > 0) {
			if (this.channel4volumeEnvTime > 0) {
				this.channel4volumeEnvTime--;
			}
			else {
				if (!this.channel4envelopeType) {
					if (this.channel4envelopeVolume > 0) {
						this.channel4currentVolume = --this.channel4envelopeVolume / 0xF;
						this.channel4volumeEnvTime = this.channel4envelopeSweeps * this.volumeEnvelopePreMultiplier;
					}
				}
				else {
					if (this.channel4envelopeVolume < 0xF) {
						this.channel4currentVolume = ++this.channel4envelopeVolume / 0xF;
						this.channel4volumeEnvTime = this.channel4envelopeSweeps * this.volumeEnvelopePreMultiplier;
					}
				}
			}
		}
		if (this.channel4totalLength > 0) {
			this.channel4totalLength--;
			if (this.channel4totalLength <= 0) {
				this.memory[0xFF26] &= 0xF7;	//Channel #4 On Flag Off
			}
		}
		this.channel4lastSampleLookup += this.channel4adjustedFrequencyPrep;
		if (this.channel4lastSampleLookup >= this.noiseTableLookup.length) {
			this.channel4lastSampleLookup = 0;
		}
	}
}

