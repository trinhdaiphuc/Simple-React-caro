import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const boardSize = 20;

function Square(props) {
  return (
    <button className={props.className} onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
}

function calculateWinner(squares, x, y) {
  let winnerMove = [];
  let player = squares[x][y];

  // Check columns have the same value
  let under = y - 4 > 0 ? y - 4 : 0;
  let above = y + 5 < boardSize ? y + 5 : boardSize;
  for (let i = under; i < above; i++) {
    if (squares[x][i] === player) {
      winnerMove.push({ x: x, y: i });
    } else {
      winnerMove = [];
    }
    if (winnerMove.length === 5) return winnerMove;
  }

  // Check rows have the same value
  winnerMove = [];
  under = x - 4 > 0 ? x - 4 : 0;
  above = x + 5 < boardSize ? x + 5 : boardSize;
  for (let i = under; i < above; i++) {
    if (squares[i][y] === player) {
      winnerMove.push({ x: i, y: y });
    } else {
      winnerMove = [];
    }
    if (winnerMove.length === 5) return winnerMove;
  }

  // Check left diagonals have the same value
  winnerMove = [];
  under = x - 4 > 0 && y - 4 > 0 ? x - 4 : 0;
  above = x + 5 < boardSize && y + 5 < boardSize ? x + 5 : boardSize;
  if (above - under < 5) return false;
  for (let i = under; i < above; i++) {
    if (squares[i][y - x + i] === player) {
      winnerMove.push({ x: i, y: y - x + i });
    } else {
      winnerMove = [];
    }
    if (winnerMove.length === 5) return winnerMove;
  }

  // Check right diagonals have the same value
  winnerMove = [];
  under = x - 4 > 0 && y - 4 > 0 ? y - 4 : 0;
  above = x + 5 < boardSize && y + 5 < boardSize ? y + 5 : boardSize;
  if (above - under < 5) return false;
  for (let i = under; i < above; i++) {
    if (!(y + x - i < 0 || y + x - i >= boardSize)) {
      if (squares[y + x - i][i] === player) {
        winnerMove.push({ x: y + x - i, y: i });
      } else {
        winnerMove = [];
      }
      if (winnerMove.length === 5) return winnerMove;
    }
  }

  return false;
}

class Board extends React.Component {
  renderSquare(i, j, winnerSquare) {
    let className = winnerSquare ? "square-winner" : "square";
    return (
      <Square
        value={this.props.squares[i][j]}
        winnerSquare={winnerSquare}
        className={className}
        key={`${i},${j}`}
        onClick={() => this.props.onClick(i, j)}
      />
    );
  }

  renderBoard() {
    const rowsWidth = Array(boardSize).fill(null);
    const celsWidth = rowsWidth;
    const board = rowsWidth.map((row, i) => {
      const squares = celsWidth.map((cel, j) => {
        let winnerSquare = false;
        if (Array.isArray(this.props.winnerMove)) {
          this.props.winnerMove.map((item) => {
            if (item.x === i && item.y === j) {
              winnerSquare = true;
            }
            return item;
          });
        }
        return this.renderSquare(i, j, winnerSquare);
      });
      return (
        <div className="board-row" key={`row${i}`}>
          {squares}
        </div>
      );
    });
    return board;
  }

  render() {
    return <div>{this.renderBoard()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array.from(Array(boardSize), () => new Array(boardSize)),
          latestMove: null,
        },
      ],
      xIsNext: true,
      stepNumber: 0,
      winner: null,
      winnerMove: 0,
      isHistorySortAscending: true,
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
      winner: null,
      winnerMove: null,
    });
  }

  handleClick(i, j) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.map((arr) => {
      return arr.slice();
    });
    if (squares[i][j] || this.state.winner) {
      return;
    }

    squares[i][j] = this.state.xIsNext ? "X" : "O";
    let newState = {
      history: history.concat([
        {
          squares: squares,
          latestMove: { i, j },
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      winner: null,
    };

    let winnerMove = calculateWinner(squares, i, j);

    if (winnerMove) {
      newState.winner = squares[i][j];
      newState.winnerMove = winnerMove;
    }
    this.setState(newState);
  }

  toggleHistorySort() {
    const { isHistorySortAscending } = this.state;
    this.setState({ isHistorySortAscending: !isHistorySortAscending });
  }

  render() {
    const {
      history,
      stepNumber,
      winnerMove,
      winner,
      isHistorySortAscending,
    } = this.state;
    const current = history[this.state.stepNumber];
    const historyMove = history.map((step, move) => {
      const desc = move
        ? `Go to move #${move}: (${step.latestMove.i}, ${step.latestMove.j})`
        : "Go to game start";
      const buttonClass = move === stepNumber ? "current-selected" : "";
      return (
        <li key={move}>
          <button className={buttonClass} onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    const moves = isHistorySortAscending ? historyMove : historyMove.reverse()

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (stepNumber === boardSize * boardSize) {
      status = "You are draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerMove={winnerMove}
            onClick={(i, j) => this.handleClick(i, j)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.toggleHistorySort()}>
            {isHistorySortAscending ? "Ascending" : "Descending"}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
