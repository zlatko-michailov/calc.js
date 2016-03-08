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
import * as Util_Errors from "../util/errors";


export class App {
    sessionState: AppSessionState = new AppSessionState(); 
    sheets: Util_Arrays.DualSparseArray<Sheet> = new Util_Arrays.DualSparseArray<Sheet>();
    
    getCellValue(cellRef: Platform_Ref.CellRef) : any {
        this.usingCell(cellRef, this.getCurrentCellValue);
    }
    
    parseCellInput(cellRef: Platform_Ref.CellRef, input?: string) : void {
        this.usingCell(cellRef, this.parseCurrentCellInput, input)
    }
    
   usingCell(cellRef: Platform_Ref.CellRef, action: (arg1?: any) => any, arg1?: any) : void {
        this.sessionState.currentCellStack.push(cellRef);
        try {
            return action(arg1);
        }
        finally {
           this.sessionState.currentCellStack.pop(); 
        }
    }
    
    getCurrentCellValue() : any {
        // TODO
    }
    
    parseCurrentCellInput(input?: string) : void {
        // TODO
    }
}


export class Sheet {
    columns: Util_Arrays.DualSparseArray<Column> = new Util_Arrays.DualSparseArray<Column>();
}


export class Column {
    cells: Util_Arrays.DualSparseArray<Cell> = new Util_Arrays.DualSparseArray<Cell>();
}


export class Cell {
    sessionState: CellSessionState = new CellSessionState();
    input: string;
    formula: () => any;
    value: any;
    
    isUnderCalc() : boolean {
        return false; // TODO:
    }
}


class AppSessionState {
    currentCellStack: Util_Arrays.Stack<Platform_Ref.CellRef> = new Util_Arrays.Stack<Platform_Ref.CellRef>();
    currentCalcRunId: number = 0;
}


class CellSessionState {
    lastCalcRunId: number = 0;
}

