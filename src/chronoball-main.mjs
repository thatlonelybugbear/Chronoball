import { createDialog } from './chronoball-actions.mjs';
import Constants from './chronoball-constants.mjs';
import Settings from './chronoball-settings.mjs';
export let transferEverything, createItemPile, giveItem, addItems;

Hooks.once('init', registerOnInit);
Hooks.on('getSceneControlButtons', showTokenControlsButton);
Hooks.on('ready', initializeVariables);

function registerOnInit() {
  return new Settings().registerSettings();
}

function showTokenControlsButton(controls) {
  const active = game.user.getFlag(Constants.MODULE_ID, 'dialogRendered');
  const token = controls.find((c) => c.name === 'token');
  if (token) {
    const i = token.tools.length;
    token.tools.splice(i, 0, {
      name: 'ChronoBall',
      title: 'Chrono Ball main menu',
      icon: 'fa-solid fa-bowling-ball',
      visible: true,
      toggle: true,
      onClick: createDialog,
      button: true,
      active,
    });
  }
}

function initializeVariables() {
  if (!transferEverything || !createItemPile || !addItems) ui.notifications.error(Constants.MODULE_NAME + ': Make sure that Item Piles (and Item Piles d&d5e) module is enabled');
  ({ transferEverything, createItemPile, giveItem, addItems } = game.itempiles?.API || {});
}
