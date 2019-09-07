export default class Game {
  static points = {
    1: 40,
    2: 100,
    3: 300,
    4: 1200,
  };

  constructor() {
    this.reset();
  }

  get level() {
    return Math.floor(this.lines * 0.1);
  }

  getState() {
    const playfield = [];
    this.playfield.forEach((row, y) => {
      playfield[y] = [];
      row.forEach((elem, x) => (playfield[y][x] = elem));
    });
    this.activePiece.blocks.forEach((row, y) => {
      row.forEach((elem, x) => {
        if (elem) {
          playfield[this.activePiece.y + y][this.activePiece.x + x] = elem;
        }
      });
    });
    return {
      level: this.level,
      lines: this.lines,
      score: this.score,
      nextPiece: this.nextPiece,
      playfield,
      isGameOver: this.topOut,
    };
  }

  reset() {
    this.score = 0;
    this.lines = 0;
    this.topOut = false;
    this.playfield = this.createPlayfield();
    // prettier-ignore
    this.activePiece = this.createPiece();
    this.nextPiece = this.createPiece();
  }

  createPlayfield() {
    const playfield = [];
    for (let y = 0; y < 20; y++) {
      playfield[y] = [];
      for (let x = 0; x < 10; x++) {
        playfield[y][x] = 0;
      }
    }
    return playfield;
  }

  createPiece() {
    const index = Math.floor(Math.random() * 7);
    const type = 'IJLOSTZ'[index];
    const piece = {};
    switch (type) {
      case 'I':
        // prettier-ignore
        piece.blocks = [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ];
        break;
      case 'J':
        // prettier-ignore
        piece.blocks = [
          [0, 0, 0],
          [2, 2, 2],
          [0, 0, 2],
        ];
        break;
      case 'L':
        // prettier-ignore
        piece.blocks = [
            [0, 0, 0],
            [3, 3, 3],
            [3, 0, 0],
          ];
        break;
      case 'O':
        // prettier-ignore
        piece.blocks = [
            [0, 0, 0, 0],
            [0, 4, 4, 0],
            [0, 4, 4, 0],
            [0, 0, 0, 0],
          ];
        break;
      case 'S':
        // prettier-ignore
        piece.blocks = [
            [0, 0, 0],
            [0, 5, 5],
            [5, 5, 0],
          ];
        break;
      case 'T':
        // prettier-ignore
        piece.blocks = [
            [0, 0, 0],
            [6, 6, 6],
            [0, 6, 0],
          ];
        break;
      case 'Z':
        // prettier-ignore
        piece.blocks = [
            [0, 0, 0],
            [7, 7, 0],
            [0, 7, 7],
          ];
        break;
      default:
        throw new Error('Неизвестный тип фигуры');
    }
    piece.x = Math.floor((10 - piece.blocks[0].length) / 2);
    piece.y = -1;
    return piece;
  }

  movePieceLeft() {
    this.activePiece.x -= 1;

    if (this.hasCollision()) {
      this.activePiece.x += 1;
    }
  }

  movePieceRight() {
    this.activePiece.x += 1;
    if (this.hasCollision()) {
      this.activePiece.x -= 1;
    }
  }

  movePieceDown() {
    if (this.topOut) return;

    this.activePiece.y += 1;
    if (this.hasCollision()) {
      this.activePiece.y -= 1;
      this.lockPiece();
      this.clearLines();
      this.updatePieces();
    }

    if (this.hasCollision()) {
      this.topOut = true;
    }
  }

  rotatePiece() {
    this.rotateBlocks();
    if (this.hasCollision()) {
      this.rotateBlocks(false);
    }
  }

  rotateBlocks(clockwise = true) {
    const { blocks } = this.activePiece;
    const length = blocks.length;

    const x = Math.floor(length / 2);
    const y = length - 1;

    for (let i = 0; i < x; i++) {
      for (let j = i; j < y - i; j++) {
        const temp = blocks[i][j];
        if (clockwise) {
          blocks[i][j] = blocks[y - j][i];
          blocks[y - j][i] = blocks[y - i][y - j];
          blocks[y - i][y - j] = blocks[j][y - i];
          blocks[j][y - i] = temp;
        } else {
          blocks[i][j] = blocks[j][y - i];
          blocks[j][y - i] = blocks[y - i][y - j];
          blocks[y - i][y - j] = blocks[y - j][i];
          blocks[y - j][i] = temp;
        }
      }
    }
  }

  hasCollision() {
    const { y: pieceY, x: pieceX, blocks } = this.activePiece;
    return blocks.some((row, y) =>
      row.some(
        (elem, x) =>
          elem &&
          (this.playfield[pieceY + y] === undefined ||
            this.playfield[pieceY + y][pieceX + x] === undefined ||
            this.playfield[pieceY + y][pieceX + x])
      )
    );
  }

  lockPiece() {
    const { y: pieceY, x: pieceX, blocks } = this.activePiece;

    blocks.forEach((row, y) => {
      row.forEach((elem, x) => {
        if (elem) {
          this.playfield[pieceY + y][pieceX + x] = elem;
        }
      });
    });
  }

  clearLines() {
    const rows = 20;
    const columns = 10;
    const lines = [];

    for (let y = rows - 1; y >= 0; y--) {
      let numberOfBlocks = 0;
      for (let x = 0; x < columns; x++) {
        if (this.playfield[y][x]) {
          numberOfBlocks += 1;
        }
      }

      if (numberOfBlocks === 0) {
        break;
      } else if (numberOfBlocks < columns) {
        continue;
      } else {
        lines.unshift(y);
      }
    }

    lines.forEach(line => {
      this.playfield.splice(line, 1);
      this.playfield.unshift(new Array(columns).fill(0));
    });

    this.updateScore(lines.length);
  }

  updateScore(clearedLines) {
    if (clearedLines > 0) {
      this.score += Game.points[clearedLines] * (this.level + 1);
      this.lines += clearedLines;
    }
  }

  updatePieces() {
    this.activePiece = this.nextPiece;
    this.nextPiece = this.createPiece();
  }
}
