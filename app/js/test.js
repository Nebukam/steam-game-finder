// utils
window.shuffle = function (array) {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}

// convo utils
window.listNPNCs = function () {
	var pc = undefined;
	var pcname = State.variables.name;
	var printNPCs = [];
	for (var i = 0; i < State.variables.NPC_DATABASE_ARR.length; i++) {
		var opc = State.variables.NPC_DATABASE_ARR[i];
		if (opc.name == pcname) { pc = opc; }
	}

	if (State.variables.LVL_NPCS.length > 0) {

		var list = State.variables.LVL_NPCS;

		for (var i = 0; i < list.length; i++) {

			var npc = State.variables.NPC_DATABASE[list[i]];

			if (npc.name == pcname) { continue; }

			var lineText = "#" + (i + 1) + " : Something... or someone. (approach)";
			var line = '<<linkreplace "' + lineText + '">>';
			var linkContent = "";
			var hasCustomBehavior = false;
			var convo_id = "conv_" + npc.id;

			if (npc.alreadymet) { lineText = "#" + (i + 1) + " : " + npc.name + " is there. (approach)"; }

			if (pc && (npc.hate || npc.like)) {

				convo_id += "_" + pc.id;

				if (npc.hate && npc.hate.includes(pc.id)) {
					linkContent += "That's " + npc.name + ". ";
					linkContent += npc.pronoun + " doesn't seem too happy to see you.";
					linkContent += '<<link "(engage conversation anyway)">><<set $DIALOG = "' + convo_id + '">><<goto "Dialog">><</link>>';
					hasCustomBehavior = true;
				} else if (npc.like && npc.like.includes(pc.id)) {
					linkContent += "That's " + npc.name + ". ";
					linkContent += npc.pronoun + " looks rather pleased by your presence.";
					linkContent += '<<link "(engage conversation)">><<set $DIALOG = "' + convo_id + '">><<goto "Dialog">><</link>>';
					hasCustomBehavior = true;
				}

			}

			if (!hasCustomBehavior) {
				linkContent = npc.name;
				//Engage conversation ?
				linkContent += '<<link "(engage conversation)">><<set $DIALOG = "' + convo_id + '">><<goto "Dialog">><</link>>';
			}
			linkContent += "<<set $NPC_DATABASE." + npc.id + ".alreadymet = true >>";

			line += linkContent;
			line += "<</linkreplace>><br>";

			printNPCs.push(line);

		}
	}

	State.variables.printNPCs = printNPCs;
}

//Dialog utils
window.updateDialog = function () {

	var currentDialog = State.variables.DIALOG;
	if (!currentDialog) { return; }

	var currentDialogData = State.variables.DIALOGS_DATA[currentDialog.id];
	var currentBreakpoint = State.variables.DIALOG_BREAKPOINT;
	if (!currentBreakpoint) { currentBreakpoint = "root"; }

	currentDialogData.last = currentBreakpoint;

	var dialogMain = "";
	var dialogReplies = [];

	//Fetch dialog breakpoint
	var dialog = currentDialog[currentBreakpoint];
	dialogMain = dialog.says;

	for (var i = 0, n = dialog.replies.length; i < n; i++) {
		var replyInfos = dialog.replies[i];
		dialogReplies.push('<<link "' + replyInfos.reply + '">><<set $DIALOG_BREAKPOINT = "' + replyInfos.goto + '">><<goto "DIALOG">><</link>>');
	}

	State.variables.dialogMain = dialogMain;
	State.variables.dialogReplies = dialogReplies;

}