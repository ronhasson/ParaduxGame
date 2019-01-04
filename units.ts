class Unit {
    name: string = "default unit, testing";
    team: number;
    nativeString: string = "~";

    constructor(team: number) {
        this.team = team;
    }

    public toString = (): string => {
        //return this.nativeString;
        return " ";
    }
}
