class Board {
    field: Land[][];
    size: number = 8;

    constructor(size: number) {
        this.size = size;
        this.field = [];

        for (var i: number = 0; i < this.size; i++) {
            this.field[i] = [];
            for (var j: number = 0; j < this.size; j++) {
                this.field[i][j] = new Land(tType.Normal, i, j);
            }
        }

        //temp map
        /*
        this.field[5][2].terrain = tType.Blocked;
        this.field[2][5].terrain = tType.Blocked;

        this.field[0][0].terrain = tType.Hidden;
        this.field[0][1].terrain = tType.Hidden;
        this.field[1][0].terrain = tType.Hidden;

        this.field[7][7].terrain = tType.Hidden;
        this.field[6][7].terrain = tType.Hidden;
        this.field[7][6].terrain = tType.Hidden;
        */
        //base board
        this.field[0][0].terrain = tType.Blocked;
        this.field[0][1].terrain = tType.Blocked;
        this.field[1][0].terrain = tType.Blocked;
        this.field[1][1].terrain = tType.Blocked;
        this.field[2][0].terrain = tType.Blocked;
        this.field[0][2].terrain = tType.Blocked;

        this.field[6][6].terrain = tType.Blocked;
        this.field[5][6].terrain = tType.Blocked;
        this.field[6][5].terrain = tType.Blocked;
        this.field[5][5].terrain = tType.Blocked;
        this.field[6][4].terrain = tType.Blocked;
        this.field[4][6].terrain = tType.Blocked;

        this.field[2][3].cont = new Unit(2);
        this.field[4][3].cont = new Unit(1);
        this.field[6][3].cont = new Unit(2);
        this.field[0][3].cont = new Unit(1);
        this.field[6][2].cont = new Unit(1);
        this.field[6][1].cont = new Unit(2);
        this.field[6][0].cont = new Unit(1);
        this.field[5][4].cont = new Unit(1);
        this.field[4][5].cont = new Unit(2);
        this.field[3][6].cont = new Unit(1);
        this.field[0][4].cont = new Unit(2);
        this.field[0][5].cont = new Unit(1);
        this.field[0][6].cont = new Unit(2);
        this.field[1][2].cont = new Unit(2);
        this.field[2][1].cont = new Unit(1);
        this.field[3][0].cont = new Unit(2);
        this.field[1][6].cont = new Unit(1);
        this.field[2][6].cont = new Unit(2);
        this.field[4][0].cont = new Unit(1);
        this.field[5][0].cont = new Unit(2);
    }
}

enum tType {
    Normal,
    Hidden,
    Blocked
}

class Land {
    terrain: tType;
    cont: Unit = Object.create(null);
    x: number;
    y: number;

    constructor(terrain: tType, x: number, y: number) {
        this.terrain = terrain;
        this.x = x;
        this.y = y;
    }

    setUnit(u: Unit) {
        this.cont = u;
    }
    removeHidden() {
        if (this.terrain == tType.Hidden) {
            this.terrain = tType.Normal;
        }
    }
}