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
import * as Util_JSON from "../util/json";


export class App {
    static currentApp: App;
    sessionState: AppSessionState = new AppSessionState(); 
    sheets: StorageArray<Sheet> = new StorageArray<Sheet>(() => new Sheet());
    
    parseCellInput(cellRef: Platform_Ref.CellRef, input?: string) : void {
        if (cellRef.sheetRef === undefined) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The cellRef must be fully qualified, i.e. sheetRef must be set.");
        }
        
        // Make sure the cell exists.
        let cell: Cell = this.ensureCell(cellRef);
        
        // Each cell must keep its own ref by ID.
        cellRef = this.makeCellRefById(cellRef);
        cell.reset(cellRef);
        
        cell.input = input;
        
        if (input != undefined) {
            // Check if the input is a formula.        
            input = input.trim();
            if (input.charAt(0) === "=") {
                let formulaBody = input.substring(1);
                try {
                    cell.formula = new Function("return ".concat(formulaBody));
                }
                catch (ex) {
                    cell.reset();
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
                    cell.value = eval(input);
                }
                catch(ex) {
                    // If evaluation fails, treat the user input as a string literal. 
                    cell.value = input;
                }
            }
        }
        
        // Recalc the cell and its consumers.
        cell.recalc();
    }
    
    getCellValue(cellRef: Platform_Ref.CellRef) : any {
        // Make sure all CellRef's in the stack are fully initialized.
        if (cellRef.sheetRef === undefined) {
            let currentCellRef: Platform_Ref.CellRef = this.sessionState.calcStack.peek();
            if (currentCellRef === undefined) {
                throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The first cell to be calculated must be fully identified.");
            }
            
            cellRef.sheetRef = currentCellRef.sheetRef;
        }

        let cell: Cell = this.ensureCell(cellRef);
        
        // Add the direct consumer to the consumers list.
        let consumerCellRef: Platform_Ref.CellRef = this.sessionState.calcStack.peek(); 
        if (consumerCellRef != undefined) {
             cell.consumerCellRefs.insert(consumerCellRef);
             
             let consumerCell: Cell = this.ensureCell(consumerCellRef);
             consumerCell.providerCellRefs.insert(cell.ref);
        }
        
        return cell.getValue();
    }
    
    recalcCell(cell: Cell) {
        cell.recalc();
    }
    
    getCurrentCell() : Cell {
        let currentCellRef: Platform_Ref.CellRef = this.getCurrentCellRef();
        if (currentCellRef === undefined) {
            return undefined;
        }
        
        return this.ensureCell(currentCellRef);
    }
        
    getCurrentCellRef() : Platform_Ref.CellRef {
        return this.sessionState.calcStack.peek();
    }
        
    ensureCell(cellRef: Platform_Ref.CellRef) : Cell {
        let sheet: Sheet = this.sheets.getByRefUnit(cellRef.sheetRef);
        let column: Column = sheet.columns.getByRefUnit(cellRef.columnRef);
        let cell: Cell = column.cells.getByRefUnit(cellRef.rowRef);
        
        return cell;
    }
    
    makeCellRefById(cellRef: Platform_Ref.CellRef) : Platform_Ref.CellRef {
        let sheetId: number = cellRef.sheetRef.kind == Platform_Ref.RefKind.ById 
                                    ? cellRef.sheetRef.value 
                                    : this.sheets.getId(cellRef.sheetRef.value);
        let sheet: Sheet = this.sheets.getById(sheetId);
         
        let columnId: number = cellRef.columnRef.kind == Platform_Ref.RefKind.ById 
                                    ? cellRef.columnRef.value 
                                    : sheet.columns.getId(cellRef.columnRef.value);
        let column: Column = sheet.columns.getById(columnId);
        
        let rowId: number = cellRef.rowRef.kind == Platform_Ref.RefKind.ById 
                                    ? cellRef.rowRef.value 
                                    : column.cells.getId(cellRef.rowRef.value);

        return new Platform_Ref.CellRef(
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, columnId), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, rowId), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, sheetId));
    }
}


export class Sheet {
    columns: StorageArray<Column> = new StorageArray<Column>(() => new Column());
}


export class Column {
    cells: StorageArray<Cell> = new StorageArray<Cell>(() => new Cell());
}

export class Cell {
    ref: Platform_Ref.CellRef;
    input: string;
    formula: Function;
    value: any;
    providerCellRefs: Util_Arrays.SparseArray<Platform_Ref.CellRef>; 
    consumerCellRefs: Util_Arrays.SparseArray<Platform_Ref.CellRef>;
    sessionState: CellSessionState;
    
    constructor() {
        this.reset();
    }
    
    reset(ref?: Platform_Ref.CellRef) : void {
        this.ref = ref;
        this.input = undefined;
        this.formula = undefined;
        this.value = undefined;
        
        if (this.providerCellRefs === undefined) {
            this.providerCellRefs = new Util_Arrays.SparseArray<Platform_Ref.CellRef>();
        }
        else {
            let app = App.currentApp;
            
            // Remove this cell from each provider before removing the provider.
            this.providerCellRefs.forEach(i => {
                let providerCell = app.ensureCell(this.providerCellRefs[i]);
                let consumerCellRefs: Util_Arrays.SparseArray<Platform_Ref.CellRef> = providerCell.consumerCellRefs;
                let consumerIndex: number = consumerCellRefs.indexOf(this.ref); 
                if (consumerIndex != undefined) {
                    delete consumerCellRefs[consumerIndex];
                }
                
                delete this.providerCellRefs[i];
            });
        }
        
        // Keep the consumers if the collection has been initialized.
        if (this.consumerCellRefs === undefined) {
            this.consumerCellRefs = new Util_Arrays.SparseArray<Platform_Ref.CellRef>();
        }
        
        if (this.sessionState === undefined) {
            this.sessionState = new CellSessionState();
        }
        else {
            this.sessionState.reset();
        }
    }
    
    recalc() : void {
        // Recalc this value.
        this.recalcValue();            
                
        // Recalc each consumer cell.
        this.consumerCellRefs.forEach(i => {
            App.currentApp.ensureCell(this.consumerCellRefs[i]).recalc();
        });
    }
    
    getValue() : any {
        // If there is an active recalc, recalc this value.
        if (App.currentApp.sessionState.calcStack.length > 0) {
            this.recalcValue();
        }
        
        return this.value;
    }
    
    recalcValue() : void {
        // If this cell has a formula, recalc it.
        if (this.formula != undefined) {
            this.executeStackOperation(() => {
                try {
                    this.value = this.formula();
                }
                catch (ex) {
                    if (Util_Errors.Exception.isException(ex)) {
                        throw ex;
                    }
                    
                    throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidFormula, this.input);
                }
            });
        }
    }
    
    executeStackOperation(operation: () => any) : any {
        // This cell must not be already under calc.
        if (this.sessionState.isUnderCalc) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.CircularReference, Util_JSON.Serializer.toJSON(this));
        }
    
        try {
            // Push this cell into the stack.
            this.sessionState.isUnderCalc = true;
            App.currentApp.sessionState.calcStack.push(this.ref);
            
            return operation();
        }
        finally {
            // Pop this cell out of the stack.
            App.currentApp.sessionState.calcStack.pop();
            this.sessionState.isUnderCalc = false; 
        }
    }
}


class AppSessionState {
    calcStack: Util_Arrays.Stack<Platform_Ref.CellRef>;
    
    constructor() {
        this.reset();
    }
    
    reset() : void {
        this.calcStack = new Util_Arrays.Stack<Platform_Ref.CellRef>();
    }
}


class CellSessionState {
    isUnderCalc : boolean;
    
    constructor() {
        this.reset();
    } 
    
    reset() : void {
        this.isUnderCalc = false;
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
