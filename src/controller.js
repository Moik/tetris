export default class Controller {
  constructor(game, view) {
    this.game = game;
    this.view = view;
    this.isPlaying = false;
    this.intervalId = null;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    this.view.renderStartScreen();
  }

  update() {
    this.game.movePieceDown();
    this.updateView();
  }

  play() {
    this.isPlaying = true;
    this.startTimer();
    this.updateView();
  }

  pause() {
    this.isPlaying = false;
    this.stopTimer();
    this.updateView();
  }

  reset() {
    this.game.reset();
    this.stopTimer();
    this.play();
  }

  startTimer() {
    const speed = 1000 - this.game.getState().level * 100;
    if (!this.intervalId) {
      this.intervalId = setInterval(
        () => this.update(),
        speed > 0 ? speed : 100
      );
    }
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  updateView() {
    const state = this.game.getState();
    if (state.isGameOver) {
      this.view.renderEndScreen(state);
    } else if (!this.isPlaying) {
      this.view.renderPauseScreen();
    } else {
      this.view.renderMainScreen(state);
    }
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
      case 13: // ENTER
        if (this.game.getState().isGameOver) {
          this.reset();
        } else {
          this.isPlaying ? this.pause() : this.play();
        }
        break;
      case 37: // LEFT ARROW
        if (this.isPlaying) {
          this.game.movePieceLeft();
          this.updateView();
        }
        break;
      case 38: // UP ARROW
        if (this.isPlaying) {
          this.game.rotatePiece();
          this.updateView();
        }
        break;
      case 39: // RIGHT ARROW
        if (this.isPlaying) {
          this.game.movePieceRight();
          this.updateView();
        }
        break;
      case 40: // DOWN ARROW
        if (this.isPlaying) {
          this.stopTimer();
          this.game.movePieceDown();
          this.updateView();
        }
        break;
    }
  }

  handleKeyUp(event) {
    switch (event.keyCode) {
      case 38: // UP ARROW
      case 40: // DOWN ARROW
        if (this.isPlaying) {
          this.startTimer();
        }
        break;
    }
  }
}
