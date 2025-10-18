import Constants from './chronoball-constants.mjs';

export default class Settings {
  static THROW_FORMULA_BASE_DC = 'throwFormulaBaseDC';
  static THROW_FORMULA_MODIFIER_DC = 'throwFormulaModifierDC';
  static INTERCEPTION_RANGE = 'interceptionRange'
  static TEAM_NAME_A = 'teamNameA';
  static TEAM_NAME_B = 'teamNameB';
  static PLAYERS_NUMBER = 'playersPerTeam';

  registerSettings() {
    this._registerWorldSettings();
  }
  
  _registerWorldSettings() {
    game.settings.register(Constants.MODULE_ID, Settings.TEAM_NAME_A, {
      name: 'Team A name',
      scope: 'world',
      config: true,
      default: 'team A',
      type: String,
    });
    game.settings.register(Constants.MODULE_ID, Settings.TEAM_NAME_B, {
      name: 'Team B name',
      scope: 'world',
      config: true,
      default: 'team B',
      type: String,
    });
    game.settings.register(Constants.MODULE_ID, Settings.PLAYERS_NUMBER, {
      name: 'Player per team',
      scope: 'world',
      config: true,
      default: 3,
      type: Number,
    });
    game.settings.register(Constants.MODULE_ID, Settings.THROW_FORMULA_BASE_DC, {
      name: 'Throw formula base DC',
      scope: 'world',
      config: true,
      default: 5,
      type: Number,
    });
    game.settings.register(Constants.MODULE_ID, Settings.THROW_FORMULA_MODIFIER_DC, {
      name: 'Throw formula modifier per 10ft',
      scope: 'world',
      config: true,
      default: 2,
      type: Number,
    });
    game.settings.register(Constants.MODULE_ID, Settings.INTERCEPTION_RANGE, {
      name: 'Interception range',
      scope: 'world',
      config: true,
      default: 5,
      type: Number,
    });
  }
  get throwFormula() {
    return { baseDC: game.settings.get(Constants.MODULE_ID, Settings.THROW_FORMULA_BASE_DC), modDC: game.settings.get(Constants.MODULE_ID, Settings.THROW_FORMULA_MODIFIER_DC) };
  }
  get interceptionRange() {
    return game.settings.get(Constants.MODULE_ID, Settings.INTERCEPTION_RANGE);
  }
  get playersNumber() {
    return game.settings.get(Constants.MODULE_ID, Settings.PLAYERS_NUMBER);
  }
  get teamNameA() {
    return game.settings.get(Constants.MODULE_ID, Settings.TEAM_NAME_A);
  }
  get teamNameB() {
    return game.settings.get(Constants.MODULE_ID, Settings.TEAM_NAME_B);
  }
}
