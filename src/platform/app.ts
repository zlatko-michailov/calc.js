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


import * as Platform_Ref from "./ref";
import * as Util_Arrays from "../util/arrays";


export class App {
    public sessionState: AppSessionState = new AppSessionState(); 
    public options: AppOptions = new AppOptions();
    public sheets: Util_Arrays.DualSparseArray<Sheet> = new Util_Arrays.DualSparseArray<Sheet>();
    
}


export class Sheet {
    public columns: Util_Arrays.DualSparseArray<Column> = new Util_Arrays.DualSparseArray<Column>();
}


export class Column {
    public cells: Util_Arrays.DualSparseArray<Cell> = new Util_Arrays.DualSparseArray<Cell>();
}


export class Cell {
    public sessionState: CellSessionState = new CellSessionState();
    public input: string;
    public formula: () => any;
    public value: any;
}


export class AppOptions {
    public allowGetFormulas: boolean = true;
    public allowSetFormulas: boolean = true;
}


class AppSessionState {
    public contextCellStack: Util_Arrays.Stack<Platform_Ref.CellRef> = new Util_Arrays.Stack<Platform_Ref.CellRef>();
    public calcRunId: number = 0;
}

class CellSessionState {
}

