import { createDialog } from './chronoball-actions.mjs';
import Constants from './chronoball-constants.mjs';
import Settings from './chronoball-settings.mjs';

Hooks.once('init', registerOnInit);
Hooks.on('getSceneControlButtons', showTokenControlsButton);

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
