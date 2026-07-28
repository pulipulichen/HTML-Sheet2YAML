/**
 * 應用程式進入點
 */

import { initUI } from './ui.js';

if (window.I18n) {
    window.I18n.initI18n();
}
initUI();
