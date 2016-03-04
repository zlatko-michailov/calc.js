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
    private sessionState: AppSessionState = new AppSessionState(); 
    private options: AppOptions = new AppOptions();
    private sheets: Util_Arrays.DualSparseArray<Sheet> = new Util_Arrays.DualSparseArray<Sheet>();
    
    public getOptions() : AppOptions {
        return this.options;
    }
    
    public getSheets() : Util_Arrays.DualSparseArray<Sheet> {
        return this.sheets;
    }
    
    public setCurrentSheet(sheetRef: Platform_Ref.RefUnit) : void {
        this.sessionState.currentSheetId = sheetRef.kind == Platform_Ref.RefKind.ByIndex ? this.sheets.getId(sheetRef.value) : sheetRef.value;
    }
    
    public getCellValue(cellRef: Platform_Ref.CellRef) : any {
        
    }
    
    public parseCellInput(cellRef: Platform_Ref.CellRef, input?: string) : void {
        
    }
}


export class Sheet {
    private columns: Util_Arrays.DualSparseArray<Column> = new Util_Arrays.DualSparseArray<Column>();

    public getColumns() : Util_Arrays.DualSparseArray<Column> {
        return this.columns;
    }
}


export class Column {
    private cells: Util_Arrays.DualSparseArray<Cell> = new Util_Arrays.DualSparseArray<Cell>();

    public getCells() : Util_Arrays.DualSparseArray<Cell> {
        return this.cells;
    }
}


export class Cell {
    private sessionState: CellSessionState = new CellSessionState();
    private input: string;
    private formula: () => any;
    private value: any;
}


export class AppOptions {
    public allowGetFormulas: boolean = true;
    public allowSetFormulas: boolean = true;
}


class AppSessionState {
    public currentSheetId: number;
    public currentCellStack: Util_Arrays.Stack<Platform_Ref.CellRef> = new Util_Arrays.Stack<Platform_Ref.CellRef>();
    public currentCalcRunId: number = 0;
}


class CellSessionState {
}

