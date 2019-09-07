import Controller from './src/controller.js';
import Game from './src/game.js';
import View from './src/view.js';

const root = document.querySelector('#root');
const width = 480;
const height = 640;
const rows = 20;
const cols = 10;

const game = new Game();
const view = new View(root, width, height, rows, cols);
const controller = new Controller(game, view);

window.game = game;
window.view = view;
window.controller = controller;
