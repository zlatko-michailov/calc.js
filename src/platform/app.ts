/**
The MIT License (MIT)

Copyright (c) 2016 Zlatko Michailov 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


/// <reference path="../util/arrays.ts" />
/// <reference path="ref.ts" />

import * as Platform_Ref from "./ref";
import * as Util_Arrays from "../util/arrays";


export class AppSession {
    private app: App;
    private contextCellStack: Util_Arrays.Stack<Platform_Ref.CellRef>;
    private calcRunId: number;
}


export class App {
    public options: AppOptions;
    public sheets: Util_Arrays.DualSparseArray<Sheet>;
    
    public constructor() {
        this.sheets = new Util_Arrays.DualSparseArray<Sheet>(() => new Sheet());
    }
}


export class Sheet {
    public columns: Util_Arrays.DualSparseArray<Column>;
    
    public constructor() {
        this.columns = new Util_Arrays.DualSparseArray<Column>(() => new Column());
    }
}


export class Column {
    public cells: Util_Arrays.DualSparseArray<Cell>;
    
    public constructor() {
        this.cells = new Util_Arrays.DualSparseArray<Cell>(() => new Cell());
    }
}


export class Cell {
    public formula: () => any;
    public value: any;
}


export class AppOptions {
    // TODO:
}
