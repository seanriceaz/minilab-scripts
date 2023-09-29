var NeedsTimingInfo = true; /* needed to make beatPos work */

/* These are the settings. They allow the button lights to be controlled. */
var PluginParameters = [
	{ name: "Ctrlr Midi In Channel", type: "lin", defaultValue: 4, minValue: 1, maxValue: 16, numberOfSteps: 15 },
	{ name: "Pad 1 Color", type: "menu", defaultValue: 0, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 1 Metronome", type: "menu", defaultValue: 1, valueStrings: ["Yes", "No"] },
	{ name: "Pad 2 Color", type: "menu", defaultValue: 0, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 2 Metronome", type: "menu", defaultValue: 1, valueStrings: ["Yes", "No"] },
	{ name: "Pad 3 Color", type: "menu", defaultValue: 0, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 3 Metronome", type: "menu", defaultValue: 1, valueStrings: ["Yes", "No"] },
	{ name: "Pad 4 Color", type: "menu", defaultValue: 0, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 4 Metronome", type: "menu", defaultValue: 1, valueStrings: ["Yes", "No"] },
	{ name: "Pad 5 Color", type: "menu", defaultValue: 0, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 5 Metronome", type: "menu", defaultValue: 1, valueStrings: ["Yes", "No"] },
	{ name: "Pad 6 Color", type: "menu", defaultValue: 0, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 6 Metronome", type: "menu", defaultValue: 1, valueStrings: ["Yes", "No"] },
	{ name: "Pad 7 Color", type: "menu", defaultValue: 0, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 7 Metronome", type: "menu", defaultValue: 1, valueStrings: ["Yes", "No"] },
	{ name: "Pad 8 Color", type: "menu", defaultValue: 7, valueStrings: ["Black", "Blue", "Red", "Green", "Yellow", "Magenta", "Cyan", "White"] },
	{ name: "Pad 8 Metronome", type: "menu", defaultValue: 0, valueStrings: ["Yes", "No"] }
];


function getColorNumber(value) {
	/* Hex codes for clors: 
			00 - black = 0
		01 - Red = 1
		04 - green = 4
		05 - yellow = 5
		10 - blue = 16
		11 - magenta = 17
		14 - cyan = 20
		7F - white = 127
	*/
	var colorNumber = 0;
	switch (value) {
		case 1: //blue
			colorNumber = 16;
			break;
		case 2: //Red
			colorNumber = 1;
			break;
		case 3: //Green
			colorNumber = 4;
			break;
		case 4: //Yellow
			colorNumber = 5;
			break;
		case 5: //Magenta
			colorNumber = 17;
			break;
		case 6: //Cyan
			colorNumber = 20;
			break;
		case 7: //White
			colorNumber = 127;
			break;
		default: //black
			break;

	}
	return colorNumber;
}

/*
	Number Mappings (must match in CTRLR)
	102 - Pad 1
	103 - Pad 2
	104 - pad 3
	105 - pad 4
	106 - pad 5
	107 - pad 6
	108 - pad 7
	109 - pad 8
*/

var currentPadColors = [0, 0, 0, 0, 0, 0, 0, 0]

// On parameter change, send all the parameters over midi.

function ParameterChanged(param, value) {
	for (var i = 0; i < 8; i++) {
		// We do nothing if it's a metronome pad.
		if (GetParameter("Pad " + (i + 1) + " Metronome") == 1 && getColorNumber(GetParameter("Pad " + (i + 1) + " Color")) != currentPadColors[i]) {
			// build our message
			var message = new ControlChange;
			message.channel = GetParameter("Ctrlr Midi In Channel");
			message.number = i + 102;
			message.value = getColorNumber(GetParameter("Pad " + (i + 1) + " Color"));
			// Send our color

			// if it it was a metronome setting change, delay the send until the next beat.
			if (PluginParameters[param].name.indexOf("Metronome") > 0) {
				var info = GetTimingInfo(); /* get the timing info from the host */
				var thisBeat = Math.floor(info.blockStartBeat)
				message.sendAtBeat(thisBeat);
			} else {
				message.send();
			}

			currentPadColors[i] = getColorNumber(GetParameter("Pad " + (i + 1) + " Color"));
		}
	}
}

// Metronome Function

var currentBeat = 0;

function ProcessMIDI() {
	var info = GetTimingInfo(); /* get the timing info from the host */
	var thisBeat = Math.floor(info.blockStartBeat)

	if (currentBeat != thisBeat) {

		currentBeat = thisBeat;
		// Loop through and send pad colors
		for (var i = 0; i < 8; i++) {
			var message = new ControlChange;
			message.channel = GetParameter("Ctrlr Midi In Channel");
			message.number = i + 102;
			// If we want to use the metronome for this pad
			if (GetParameter("Pad " + (i + 1) + " Metronome") == 0) {
				// build our message
				message.value = getColorNumber(GetParameter("Pad " + (i + 1) + " Color"));
				// Send our color
				if (info.tempo < 240){
				  message.sendAtBeat(currentBeat + 1);
				  // Send black a little later
				  message.value = 0;
				  if (info.tempo < 120)
				  	message.sendAtBeat(currentBeat + 1.125); 
				  else if (info.tempo < 200)
				  	message.sendAtBeat(currentBeat + 1.25);
				  else 
				  	message.sendAtBeat(currentBeat + 1.5);
				} else if (currentBeat % 2 == 0) {
				  message.sendAtBeat(currentBeat + 1);
				  // Send black a little later
				  message.value = 0;
				  message.sendAtBeat(currentBeat + 2);
				}
				currentPadColors[i] = 0;
			} else {
				// build our message
				message.value = currentPadColors[i];
				// Send our color
				message.send();
			}

		}
	}
}