export const boardSize = 7;
export const black = 2;
export const white = 1;
export const blocked = -1;

const initialRows = [
    "###2121",
    "##10002",
    "#200001",
    "1020102",
    "200001#",
    "10002##",
    "2121###"
];

export const pairDirections = [[1, 0], [0, 1], [-1, 1], [0, -1], [-1, 0], [1, -1]];
const lineDirections = [[1, 0], [0, 1], [1, -1]];

export function freshGame() {
    return {
        cells: initialRows.flatMap(row => Array.from(row, value => value === "#" ? blocked : Number(value))),
        turn: black,
        winner: null,
        winningCells: []
    };
}

export function boardIndex(position) {
    if (!position || !Number.isInteger(position.x) || !Number.isInteger(position.y) ||
        position.x < 0 || position.x >= boardSize || position.y < 0 || position.y >= boardSize) {
        return -1;
    }
    return position.y * boardSize + position.x;
}

function isDirection(dx, dy) {
    return pairDirections.some(([x, y]) => x === dx && y === dy);
}

export function isPlayablePair(cells, first, second) {
    const a = cells[boardIndex(first)];
    const b = cells[boardIndex(second)];
    return ((a === black && b === white) || (a === white && b === black)) &&
        isDirection(second.x - first.x, second.y - first.y);
}

export function slideDestinations(cells, first, second, target) {
    const targetIndex = boardIndex(target);
    if (targetIndex < 0) return null;

    const dx = target.x - first.x;
    const dy = target.y - first.y;
    if (!isDirection(dx, dy)) return null;

    const other = { x: second.x + dx, y: second.y + dy };
    const otherIndex = boardIndex(other);
    const canEnter = (index, vacated) => cells[index] === 0 || index === boardIndex(vacated);
    return canEnter(targetIndex, second) && canEnter(otherIndex, first) ? [target, other] : null;
}

function winningLine(cells, origin) {
    const index = boardIndex(origin);
    const color = cells[index];
    const winning = new Set();
    for (const [dx, dy] of lineDirections) {
        const line = [index];
        for (const direction of [-1, 1]) {
            let { x, y } = origin;
            let current;
            do {
                x += dx * direction;
                y += dy * direction;
                current = boardIndex({ x, y });
                if (cells[current] === color) line.push(current);
            } while (cells[current] === color);
        }
        if (line.length >= 4) line.forEach(position => winning.add(position));
    }
    return [...winning];
}

export function playMove(game, move) {
    if (!move || game.winner || !isPlayablePair(game.cells, move.first, move.second)) return null;

    const { first, second, target } = move;
    const destinations = target === null ? [second, first] : slideDestinations(game.cells, first, second, target);
    if (!destinations) return null;

    const cells = game.cells.slice();
    const firstIndex = boardIndex(first);
    const secondIndex = boardIndex(second);
    const firstColor = cells[firstIndex];
    const secondColor = cells[secondIndex];
    cells[firstIndex] = 0;
    cells[secondIndex] = 0;
    cells[boardIndex(destinations[0])] = firstColor;
    cells[boardIndex(destinations[1])] = secondColor;

    const firstLine = winningLine(cells, destinations[0]);
    const secondLine = winningLine(cells, destinations[1]);
    const onlyFirst = firstLine.length > 0 && secondLine.length === 0;
    const onlySecond = secondLine.length > 0 && firstLine.length === 0;
    return {
        cells,
        turn: game.turn === black ? white : black,
        winner: onlyFirst ? firstColor : onlySecond ? secondColor : null,
        winningCells: onlyFirst ? firstLine : onlySecond ? secondLine : []
    };
}
