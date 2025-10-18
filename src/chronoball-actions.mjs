import Constants from './chronoball-constants.mjs';
import Settings from './chronoball-settings.mjs';

const settings = new Settings();

export async function createDialog() {}

const { transferEverything, createItemPile, giveItem, addItems } = game.itempiles?.API || {};

const ballTokenUuid = canvas.tokens.placeables.find((t) => t.identifier === 'chronoball')?.document.uuid;
const ballToken = fromUuidSync(ballTokenUuid)?.object;

const ballItem = await fromUuid('Compendium.chronoball.Items.Item.<changeUUID>'); // @to-do: replace after creating the compendium item;
const ballItemData = game.items.fromCompendium(ballItem);

async function createBall() {
	const spot = { center: { x: 1800, y: 3200 } };
	if (!ballTokenUuid) return dropBall({ spot });
}

async function dropBall({ spot, actor }) {
	const ball = ballToken ?? ballItem; //fromUuidSync('Actor.VObr5IfrxkWYz0DX.Item.vcNGXWcbCpEqoT2V');
	const ballData = game.items.fromCompendium(ball);
	const ownership = game.users.map((u) => ({ [u.id]: 3 }));
	const options = {
		position: { x: spot.center.x, y: spot.center.y },
		sceneId: game.scenes.current.id,
		tokenOverrides: { name: ballData.name, img: ballData.img },
		actorOverrides: { ownership },
		items: [ballData],
		createActor: false,
		pileActorName: ballData.name,
		pileSettings: { type: game.itempiles.pile_types.PILE },
	};
	await createItemPile(options);
	if (actor) await actor.update({ 'system.attributes.hp.temp': 0 });
	return;
}

async function giveBall({ target, source }) {
	const item = source.items.find((i) => i.identifier === 'chronoball');
	await addItems(target, [item]);
	await item?.delete();
	// await source.update({ 'system.attributes.hp.temp': 0 });
}

async function throwBall({ actor, token }) {
	const interceptionRange = settings.interceptionRange;
	const interceptionDistance = interceptionRange * canvas.grid.size;
	const findNearby = canvas.tokens.quadtree.getObjects(token.bounds.pad(interceptionDistance - 1)).filter((t) => t !== token && t?.actor?.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG) !== actor.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG));
	if (findNearby.length) await interceptBall({ token, findNearby });

	const skill = actor.getRollData().skills.ath.total > actor.getRollData().skills.slt.total ? 'ath' : 'slt';

	const throwRoll = await actor.rollSkill({ skill }, {}, { flavor: Constants.THROW_FLAVOR + ` ${skill === 'ath' ? 'Athletics' : 'Sleight of Hands'}` });
	const total = throwRoll.total;
	const rangeFormula = settings.throwFormula;
	const limitMaxRange = (throwRoll < rangeFormula.baseDC ? 0 : Math.floor((throwRoll - rangeFormula.baseDC) / rangeFormula.modifier)) * 2 * canvas.grid.distance;

	const crosshairOptions = {
		texture: ballItemData.img,
		location: { obj: token, showRange: true, limitMaxRange, highlighGrid: true },
	};

	const crosshair = await Sequencer.Crosshair.show(crosshairOptions);

	const clonedToken = token.document.clone({ x: crosshair.x, y: crosshair.y });

	const isTeamate = Array.from(canvas.tokens.quadtree.getObjects(clonedToken.object.bounds.pad(-1))).filter((t) => t?.actor?.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG) === actor.getFlag(Constants.MODULE_ID, Constants.TEAM_FLAG) && t.id !== token.id);

	if (isTeamate.length) {
		return giveBall({ target: isTeamate[0], source: actor });
	} else {
		const spot = { center: { x: crosshair.x, y: crosshair.y } };
		return dropBall({ spot });
	}
}

async function interceptBall({ token, findNearby }) {}
