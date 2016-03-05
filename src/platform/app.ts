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
    private sessionState: AppSessionState = new AppSessionState(); 
    private sheets: Util_Arrays.DualSparseArray<Sheet> = new Util_Arrays.DualSparseArray<Sheet>();
    private protectionPassword: string;
    
    public getSheets() : Util_Arrays.DualSparseArray<Sheet> {
        return this.sheets;
    }
    
    public getCellValue(cellRef: Platform_Ref.CellRef) : any {
        this.usingCell(cellRef, this.getCurrentCellValue);
    }
    
    public parseCellInput(cellRef: Platform_Ref.CellRef, input?: string) : void {
        this.usingCell(cellRef, this.parseCurrentCellInput, input)
    }
    
    private usingCell(cellRef: Platform_Ref.CellRef, action: (arg1?: any) => any, arg1?: any) : void {
        this.sessionState.currentCellStack.push(cellRef);
        try {
            return action(arg1);
        }
        finally {
           this.sessionState.currentCellStack.pop(); 
        }
    }
    
    private getCurrentCellValue() : any {
        // TODO
    }
    
    public parseCurrentCellInput(input?: string) : void {
        // TODO
    }
    
    public isProtected() : boolean {
        return this.protectionPassword != undefined;
    }
    
    public setProtection(password: string) {
        if (this.isProtected()) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidOperation, "This app is already protected. You must remove protection before setting it again.");
        }
        
        this.protectionPassword = password;
    }
    
    public removeProtection(password: string) {
        if (this.isProtected()) {
            if (this.protectionPassword != password) {
                throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The provided protection password doesn't match the original.");
            }
            
            this.protectionPassword = undefined;
        }
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


class AppSessionState {
    public currentCellStack: Util_Arrays.Stack<Platform_Ref.CellRef> = new Util_Arrays.Stack<Platform_Ref.CellRef>();
    public currentCalcRunId: number = 0;
}


class CellSessionState {
}

