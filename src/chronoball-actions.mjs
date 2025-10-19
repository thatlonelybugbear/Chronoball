import Constants from './chronoball-constants.mjs';
import Settings from './chronoball-settings.mjs';
import { transferEverything, createItemPile, giveItem, addItems } from './chronoball-main.mjs';

const settings = new Settings();

export async function createDialog() {
	await game.user.setFlag(Constants.MODULE_ID, Constants.DIALOG_RENDERED, true);
	const { createFormGroup, createNumberInput } = foundry.applications.fields;

	const actor = game.user.character || canvas.tokens.controlled?.[0]?.actor;
	const token = actor?.token?.object ?? actor?.getActiveTokens?.()?.[0];
	const isCarrier = actor?.items.find((i) => i.identifier === 'chronoball');

	const buttons = [
		{ type: 'submit', action: 'create', label: 'Create Ball', hidden: game.user.isGM },
		{ type: 'submit', action: 'drop', label: 'Drop Ball', disabled: !isCarrier },
		{ type: 'submit', action: 'pick', label: 'Pick Ball', disabled: isCarrier },
		{ type: 'submit', action: 'throw', label: 'Throw Ball', disabled: !isCarrier },
	];

	const callback = (event, button) => {
		return { mode: button.dataset.action };
	};
	const { availLeft, availTop, availHeight, availWidth } = screen || {};
	const position = { top: '100', left: availLeft - availLeft * 0.5 };
	const result = await foundry.applications.api.DialogV2.wait({
		form: { closeOnSubmit: true },
		window: { title: 'Chronoball Command Center', position },
		buttons,
		callback,
		rejectClose: false,
		id: 'chronoball',
	});
	if (!result) {
		console.log('closed');
		await game.user.setFlag(Constants.MODULE_ID, Constants.DIALOG_RENDERED, false);
	}
	else {
		if (result === 'create') await createBall();
		else if (result === 'drop') await dropBall({spot: {center: {x: token.x, y: token.y}}, actor });
		else if (result === 'pick') await pickBall(actor);
		else if (result === 'throw') await throwBall({ actor, token: actor.getActiveTokens()[0] });
		//createDialog();
	}
}

async function createBall() {
	const ballTokenUuid = canvas.tokens.placeables.find((t) => t.identifier === 'chronoball')?.document.uuid;
	const spot = { center: { x: 1800, y: 3200 } };
	if (!ballTokenUuid) return dropBall({ spot, create: true });
}

async function dropBall({ spot, actor, create = false }) {
	let ballItem;
	if (create) {
		for (const token of canvas.tokens.placeables) await token.actor?.items.find((i) => i.identifier === 'chronoball')?.delete();
		canvas.tokens.placeables.filter((t)=>t.name==='Chronoball').forEach((t) => t.document.delete());
		ballItem = game.items.getName('Chronoball') ?? await fromUuid(Constants.BALL_UUID);
	}
	else {
		ballItem = actor?.items.find((i) => i.identifier === 'chronoball');
	}
	const ballItemData = game.items.fromCompendium(ballItem);
	const ownership = game.users.map((u) => ({ [u.id]: 3 }));
	const options = {
		position: { x: spot.center.x, y: spot.center.y },
		sceneId: game.scenes.current.id,
		tokenOverrides: { name: ballItemData.name, img: ballItemData.img },
		actorOverrides: { ownership },
		items: [ballItemData],
		createActor: false,
		pileActorName: ballItemData.name,
		pileSettings: { type: game.itempiles.pile_types.PILE },
	};
	await createItemPile(options);
	if (ballItem?.actor) return ballItem?.delete();
	else return;	
}

async function giveBall({ target, source }) {
	const item = source.items.find((i) => i.identifier === 'chronoball');
	await addItems(target, [item]);
	await item?.delete();
}

async function pickBall(actor) {
	const ballTokenUuid = canvas.tokens.placeables.find(t=>t.name==='Chronoball')?.document.uuid;
	await transferEverything(ballTokenUuid, actor);
}

async function throwBall({ actor, token }) {
	const ballItem = actor.items.find((i) => i.identifier === 'chronoball');
	const ballItemData = game.items.fromCompendium(ballItem);
	const interceptionRange = settings.interceptionRange;
	console.log(interceptionRange)
	const interceptionDistance = interceptionRange * canvas.grid.size;
	const findNearby = canvas.tokens.quadtree.getObjects(token.bounds.pad(interceptionDistance - 1)).filter((t) => t !== token && t?.actor?.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG) !== actor.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG));
	if (findNearby.length) await interceptBall({ token, findNearby });

	const skill = actor.getRollData().skills.ath.total > actor.getRollData().skills.slt.total ? 'ath' : 'slt';

	const throwRoll = await actor.rollSkill({ skill }, {}, { flavor: Constants.THROW_FLAVOR + ` ${skill === 'ath' ? 'Athletics' : 'Sleight of Hands'}` });
	const total = throwRoll[0].total;
	const rangeFormula = settings.throwFormula;
	const limitMaxRange = (total < rangeFormula.baseDC ? 0 : Math.floor((total - rangeFormula.baseDC) / rangeFormula.modDC)) * 2 * canvas.grid.distance;
	ui.notifications.info(`You can throw ${limitMaxRange}ft away`);
	console.log(total, total-Math.floor((total - rangeFormula.baseDC) / rangeFormula.modDC))

	const crosshairOptions = {
		texture: ballItemData.img,
		location: { obj: token, showRange: true, limitMaxRange, highlighGrid: true },
	};

	const crosshair = await Sequencer.Crosshair.show(crosshairOptions);

	const clonedToken = token.document.clone({ x: crosshair.x, y: crosshair.y });

	const isTeamate = Array.from(canvas.tokens.quadtree.getObjects(clonedToken.object.bounds.pad(-1))).filter((t) => t?.actor?.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG) === actor.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG) && t.id !== token.id);

	if (isTeamate.length) {
		ui.notifications.info(`${isTeamate[0].name} catches the ball`);
		return giveBall({ target: isTeamate[0], source: actor });
	} else {
		const spot = { center: { x: crosshair.x, y: crosshair.y } };
		return dropBall({ spot, actor });
	}
}

async function interceptBall({ token, findNearby }) {
	ui.notifications.info('someone can interceptBall');
}
