/**
 * Лисин Сергей lisin2@yandex.ru
 */

"use strict";

document.head.insertAdjacentHTML('beforeEnd', '<link rel="stylesheet" href="sapper.css">');

class Sapper {
  constructor (width = 16, height = 16, mines = 40, sizeField = 20) {
    this.defaultValues = {
      width: width,
      height: height,
      mines: mines,
    };

    this.sizeField = sizeField;

    this.cells = [
      ...Array(this.defaultValues.mines).fill(true),
      ...Array(this.defaultValues.width * this.defaultValues.height - this.defaultValues.mines).fill(false)
    ];
  }

  run () {
    this._randomizeValues();
    this._setHelpNumbers();
    this._drawGameField();
  }

  _randomizeValues () {
    let x = 0;
    let y = 0;

    this.cells = this.cells
      .sort(() => Math.random() - 0.5)
      .map(value => {

        if (x === this.defaultValues.width) {
          x = 0;
          y++;
        }

        return {
          x: x++,
          y: y,
          mine: value,
          status: 'close'
        };
      });
  }

  _setHelpNumbers () {
    this.cells.forEach(cell => {
      if (cell.mine === true) {
        return;
      }

      let counter = this._aroundCells(this._findMine)(cell.x, cell.y);

      if (counter > 0) {
        cell.hint = counter;
      }
    });
  }

  _aroundCells (f) {
    let counter = 0;

    return (x, y) => {
      for (let lX = -1; lX <= 1; lX++) {
        for (let lY = -1; lY <= 1; lY++) {
          if (lY !== 0 || lX !== 0) {
            counter += f.apply(this, [x, y, lX, lY]);
          }
        }
      }
      return counter;
    }
  }

  _findMine (x, y, lX, lY) {
    let find = this.cells.filter(cellAround => cellAround.mine === true)
      .filter(cellAround => cellAround.x === x + lX)
      .filter(cellAround => cellAround.y === y + lY);
    return find.length;
  }

  _openEmptyCell (x, y, lX, lY) {
    let find = this.cells.filter(cellAround => cellAround.mine === false)
      .filter(cellAround => cellAround.x === lX + x)
      .filter(cellAround => cellAround.y === lY + y);

    find.forEach(cell => {
      if (cell.status === 'open') {
        return;
      } else {
        cell.status = 'open';
      }
      if (cell.hint) {
        return;
      }
      this._aroundCells(this._openEmptyCell)(cell.x, cell.y);
    })
  }

  _drawGameField () {
    let gameField = document.getElementById('sapper');
    let html = '';

    gameField.innerHTML = '';

    this.cells.forEach((item, i) => {
      let g = '';
      if (item.status === 'close') {
        g = `
              <g data-id="${i}" class="cell">
                  <rect
                    class="cell-close"
                    x="${item.x * this.sizeField}"
                    y="${item.y * this.sizeField}"
                    width="${this.sizeField}"
                    height="${this.sizeField}">
                  </rect>
                  <text
                    class="cell-text mark"
                    text-anchor="middle"
                    x="${item.x * this.sizeField + this.sizeField / 2}"
                    y="${item.y * this.sizeField + this.sizeField / 2 + 5}">
                      ${(item.mark) ? 'b' : ''}
                  </text>
              </g>
            `;
      } else {
        g = `
              <g data-id="${i}" class="cell">
                  <rect
                    class="cell-rect ${(item.mine) ? 'cell-mine' : 'card-square-empty'}"
                    x="${item.x * this.sizeField}"
                    y="${item.y * this.sizeField}"
                    width="${this.sizeField}"
                    height="${this.sizeField}">
                  </rect>
                  <text
                    class="cell-text ${(item.mine) ? 'mine' : ''}"
                    text-anchor="middle"
                    x="${item.x * this.sizeField + this.sizeField / 2}"
                    y="${item.y * this.sizeField + this.sizeField / 2 + 5}">
                      ${(item.mine) ? 'x' : (item.hint || '')}
                  </text>
              </g>
            `;
      }
      html += g;
    });

    gameField.innerHTML = html;

    let cellElements = document.getElementsByClassName('cell');

    for (let i = 0; i < cellElements.length; i++) {
      cellElements[i].onclick = (e) => this._clickCell(e.currentTarget.dataset.id);
      cellElements[i].oncontextmenu = (e) => this._labelCell(e.currentTarget.dataset.id);
    }
  };

  _clickCell (id) {
    let cell = this.cells[id];

    if (cell.status === 'open' || cell.mark === true) {
      return false;
    }

    if (cell.mine === true) {
      this._gameOver();
    } else if (cell.hint === undefined && cell.mine === false) {
      this._aroundCells(this._openEmptyCell)(cell.x, cell.y);
    } else {
      cell.status = 'open';
    }

    this._drawGameField();
  }

  _labelCell (id) {
    let cell = this.cells[id];

    if (cell.status === 'open') {
      return false;
    }

    if (cell.mark === true) {
      delete cell.mark;
    } else {
      cell.mark = true;
    }

    this._drawGameField();
    return false;
  }

  _gameOver () {
    this.cells.forEach(cell => {
      cell.status = 'open';
    });
  }
}

new Sapper().run();
