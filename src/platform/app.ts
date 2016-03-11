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
    sheets: StorageArray<Sheet> = new StorageArray<Sheet>(() => new Sheet());
    
    getCellValue(cellRef: Platform_Ref.CellRef) : any {
        this.usingCell(cellRef, () => this.getCurrentCellValue());
    }
    
    parseCellInput(cellRef: Platform_Ref.CellRef, input?: string) : void {
        this.usingCell(cellRef, () => this.parseCurrentCellInput(input));
    }
    
   usingCell(cellRef: Platform_Ref.CellRef, action: () => any) : void {
        // Make sure all CellRef's in the stack are fully initialized.
        if (cellRef.sheetRef === undefined) {
            let currentCellRef: Platform_Ref.CellRef = this.sessionState.currentCellStack.peek();
            if (currentCellRef === undefined) {
                throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The first cell to be calculated must be fully identified.");
            }
            
            cellRef.sheetRef = currentCellRef.sheetRef;
        }
        
        this.sessionState.currentCellStack.push(cellRef);
        try {
            return action();
        }
        finally {
           this.sessionState.currentCellStack.pop(); 
        }
    }
    
    getCurrentCellValue() : any {
        let currentCell: Cell = this.getCurrentCell();
        // TODO
    }
    
    parseCurrentCellInput(input?: string) : void {
        let currentCell: Cell = this.getCurrentCell();
        currentCell.reset();
        
        currentCell.input = input;
        
        if (input != undefined) {
            // Check if the user input is a formula.        
            input = input.trim();
            if (input.charAt(0) === "=") {
                let formulaBody = input.substring(1);
                try {
                    currentCell.formula = () => (new Function("return " + formulaBody))();
                }
                catch (ex) {
                    currentCell.reset();
                    throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "Invalid formula.");
                }
            }
            else {
                // eval() throws on object literals. So make them explicit. 
                if (input.charAt(0) === "{" && input.charAt(input.length - 1) === "}") {
                    input = "new Object(" + input + ")";
                }
                
                try {
                    // Try to evaluate the input to get the actual type.
                    currentCell.value = eval(input);
                }
                catch(ex) {
                    // If evaluation fails, treat the user input as a string literal. 
                    currentCell.value = input;
                }
            }
        }
        
        // Recalc this cell and its consumers.
        currentCell.recalc();
    }
    
    getCurrentCell() : Cell {
        let currentCellRef: Platform_Ref.CellRef = this.sessionState.currentCellStack.peek();
        if (currentCellRef === undefined) {
            return undefined;
        }
        
        return this.getCell(currentCellRef);
    }
        
    getCell(cellRef: Platform_Ref.CellRef) : Cell {
        let sheet: Sheet = this.sheets.getByRefUnit(cellRef.sheetRef);
        let column: Column = sheet.columns.getByRefUnit(cellRef.columnRef);
        let cell: Cell = column.cells.getByRefUnit(cellRef.rowRef);
        
        return cell;
    }
}


export class Sheet {
    columns: StorageArray<Column> = new StorageArray<Column>(() => new Column());
}


export class Column {
    cells: StorageArray<Cell> = new StorageArray<Cell>(() => new Cell());
}


export class Cell {
    sessionState: CellSessionState;
    input: string;
    formula: () => any;
    value: any;
    
    constructor() {
        this.reset();
    }
    
    reset() : void {
        this.input = undefined;
        this.formula = undefined;
        this.value = undefined;
        if (this.sessionState === undefined) {
            this.sessionState = new CellSessionState();
        }
        else {
            this.sessionState.reset();
        }
    }
    
    isUnderCalc() : boolean {
        return false; // TODO:
    }
    
    recalc() : void {
        // TODO
    }
}


class AppSessionState {
    currentCellStack: Util_Arrays.Stack<Platform_Ref.CellRef>;
    currentCalcRunId: number;
    
    constructor() {
        this.reset();
    }
    
    reset() : void {
        this.currentCellStack = new Util_Arrays.Stack<Platform_Ref.CellRef>();
        this.currentCalcRunId = 0;
    }
}


class CellSessionState {
    lastCalcRunId: number;
    providerCells: Array<Platform_Ref.CellRef>; 
    consumerCells: Array<Platform_Ref.CellRef>;
    
    constructor() {
        this.reset();
    } 
    
    reset() : void {
        this.lastCalcRunId = 0;
        this.providerCells = new Array<Platform_Ref.CellRef>();
        if (this.consumerCells === undefined) {
            this.consumerCells = new Array<Platform_Ref.CellRef>();
        }
    }
}


class StorageArray<T> extends Util_Arrays.DualSparseArray<T> {
    newElement: () => T;
    
    constructor(newElement: () => T) {
        super();
        this.newElement = newElement;
    }
    
    getByRefUnit(refUnit: Platform_Ref.RefUnit) : T {
        let element: T = undefined;
        
        if (refUnit.kind == Platform_Ref.RefKind.ById) {
            element = this.getById(refUnit.value);
            if (element === undefined) {
                element = this.newElement();
                this.setById(refUnit.value, element);
            } 
        }
        else if (refUnit.kind == Platform_Ref.RefKind.ByIndex) {
            element = this.getByIndex(refUnit.value);
            if (element === undefined) {
                element = this.newElement();
                this.setByIndex(refUnit.value, element);
            } 
        }
        
        return element;
    }
}
