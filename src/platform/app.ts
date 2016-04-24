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
        
        // Each cell must keep its own ref by id.
        let cellRefById = this.makeCellRefById(cellRef);
        
        // Rewrite refs, and reset cell.
        cell.reset(cellRefById);
        let internalInput = this.rewriteRefs(cellRefById, input, 
                                            (cellRef: Platform_Ref.CellRef, matches: RegExpMatchArray) => { 
                                                return this.externalRefRewriter(cellRef, matches); 
                                            });
        cell.input = internalInput;

        cell.parseInput(internalInput);
    }
    
    getCellInput(cellRef: Platform_Ref.CellRef) : string {
        if (cellRef.sheetRef === undefined) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The cellRef must be fully qualified, i.e. sheetRef must be set.");
        }
        
        // If the cell doesn't exist, don't create it.
        let externalInput: string = undefined;
        let cell: Cell = this.getCell(cellRef);
        if (cell !== undefined) {
            // Rewrite refs.
            externalInput = this.rewriteRefs(cell.ref, cell.input, 
                                            (cellRef: Platform_Ref.CellRef, matches: RegExpMatchArray) => { 
                                                return this.internalRefRewriter(cellRef, matches); 
                                            });
        }
        
        return externalInput;
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

        let cell: Cell = this.getCell(cellRef);
        let cellValue: any = undefined;
        if (cell !== undefined) {
            cellValue = cell.getValue();
        }
        
        return cellValue;
    }
    
    ensureCell(cellRef: Platform_Ref.CellRef) : Cell {
        if (cellRef.sheetRef.kind == Platform_Ref.RefKind.ById
            || cellRef.rowRef.kind == Platform_Ref.RefKind.ById
            || cellRef.columnRef.kind == Platform_Ref.RefKind.ById) {
                throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The CellRef value may not contain a ById unit.");
            }
            
        let sheet: Sheet = this.sheets.ensureByRefUnit(cellRef.sheetRef);
        let row: Row = sheet.rows.ensureByRefUnit(cellRef.rowRef);
        let cell: Cell = row.cells.ensureByRefUnit(cellRef.columnRef);
        
        return cell;
    }
    
    getCell(cellRef: Platform_Ref.CellRef) : Cell {
        if (cellRef.sheetRef === undefined) {
            let currentCellRef: Platform_Ref.CellRef = this.sessionState.calcStack.peek();
            if (currentCellRef === undefined) {
                throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The first cell to be accessed must be fully identified.");
            }
            
            cellRef.sheetRef = currentCellRef.sheetRef;
        }
        
        let sheet: Sheet = this.sheets.getByRefUnit(cellRef.sheetRef);
        
        let row: Row = undefined;
        if (sheet !== undefined) {
            row = sheet.rows.getByRefUnit(cellRef.rowRef);
        }
        
        let cell: Cell = undefined;
        if (row !== undefined) {
            cell = row.cells.getByRefUnit(cellRef.columnRef);
        }
        
        return cell;
    }
    
    makeCellRefById(cellRef: Platform_Ref.CellRef) : Platform_Ref.CellRef {
        let sheetId: number = cellRef.sheetRef.kind == Platform_Ref.RefKind.ById 
                                    ? cellRef.sheetRef.value 
                                    : this.sheets.getId(cellRef.sheetRef.value);
        let sheet: Sheet = this.sheets.getById(sheetId);
         
        let rowId: number = cellRef.rowRef.kind == Platform_Ref.RefKind.ById 
                                    ? cellRef.rowRef.value 
                                    : sheet.rows.getId(cellRef.rowRef.value);
        let row: Row = sheet.rows.getById(rowId);
        
        let columnId: number = cellRef.columnRef.kind == Platform_Ref.RefKind.ById 
                                    ? cellRef.columnRef.value 
                                    : row.cells.getId(cellRef.columnRef.value);

        return new Platform_Ref.CellRef(
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, rowId), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, columnId), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, sheetId));
    }
    
    rewriteRefs(cellRef: Platform_Ref.CellRef, input: string, rewriter: (cellRef: Platform_Ref.CellRef, matches: RegExpMatchArray) => string) : string {
        const argumentPattern: string = "\\s*([^,\\)]+)\\s*";
        const optionalArgumentPattern: string = "(," + argumentPattern + ")?"
        const functionNamePattern: string = "(rc|_rc|r\\$c\\$)";
        const refPattern: string = functionNamePattern + "\\s*\\(" + argumentPattern + "," + argumentPattern + optionalArgumentPattern + "\\)";
        const regexp: RegExp = new RegExp(refPattern);
        
        let rewrittenInput: string = "";
        
        while (true) {
            let matches: RegExpMatchArray = input.match(regexp);
            if (matches != null && matches.length > 0) {
                let rewrittenRef = rewriter(cellRef, matches);
                
                rewrittenInput += input.substring(0, matches.index) + rewrittenRef;
                input = input.substring(matches.index + matches[0].length);
            }
            else {
                rewrittenInput += input;
                break;
            }
        }
        
        return rewrittenInput;
    }
    
    externalRefRewriter(cellRef: Platform_Ref.CellRef, matches: RegExpMatchArray) : string {
        let rewrittenRef: string = matches[MatchIndex.Whole];
        
        if (matches[MatchIndex.Function] == "rc") {
            let sheetIndex: number = undefined;
            let sheetId: number = undefined;
            if (matches[MatchIndex.Arg3] !== undefined) {
                sheetIndex = this.getArgumentValue(matches, MatchIndex.Arg3, 3);
                sheetId = this.sheets.getId(sheetIndex);
            }
            else {
                sheetId = cellRef.sheetRef.value; // The cell ref must be by id.
            }
        
            let rowIndex: number = this.getArgumentValue(matches, MatchIndex.Arg1, 1);
            let rowId: number = this.sheets.getById(sheetId).rows.getId(rowIndex);
            
            let columnIndex: number = this.getArgumentValue(matches, MatchIndex.Arg2, 2);
            let columnId: number = this.sheets.getById(sheetId).rows.getById(rowId).cells.getId(columnIndex);
            
            rewrittenRef = "_rc(" + rowId.toString() + ", " + columnId.toString() + ", " + sheetId.toString() + ")";
        }
        
        return rewrittenRef;
    }
    
    internalRefRewriter(cellRef: Platform_Ref.CellRef, matches: RegExpMatchArray) : string {
        let rewrittenRef: string = matches[MatchIndex.Whole];
        
        if (matches[MatchIndex.Function] == "_rc") {
            let sheetId: number = this.getArgumentValue(matches, MatchIndex.Arg3, 3);
            let sheetIndex: number = this.sheets.getIndex(sheetId);
        
            let rowId: number = this.getArgumentValue(matches, MatchIndex.Arg1, 1);
            let rowIndex: number = this.sheets.getById(sheetId).rows.getIndex(rowId);
            
            let columnId: number = this.getArgumentValue(matches, MatchIndex.Arg2, 2);
            let columnIndex: number = this.sheets.getById(sheetId).rows.getById(rowId).cells.getIndex(columnId);
            
            rewrittenRef = "rc(" + rowIndex.toString() + ", " + columnIndex.toString();
            if (cellRef.sheetRef.value != sheetId) {
                rewrittenRef += ", " + sheetIndex.toString();
            }
            rewrittenRef += ")";
        }
        
        return rewrittenRef;
    }
    
    getArgumentValue(matches: RegExpMatchArray, matchIndex: number, argumentIndex: number) : number {
        const errorMessage: string = "Argument " + argumentIndex + " must be a integer number literal - '" + matches[MatchIndex.Whole] + "'.";
        
        let numberValue: number = parseFloat(matches[matchIndex]);
        let intValue: number;
        if (isNaN(numberValue)) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, errorMessage);
        }
        
        intValue = Math.floor(numberValue); 
        
        if (intValue != numberValue) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, errorMessage);
        }    
        
        return intValue;
    }
    
}

export const enum MatchIndex {
    Whole = 0,
    Function = 1,
    Arg1 = 2,
    Arg2 = 3,
    Arg3 = 5
}

export class Sheet {
    rows: StorageArray<Row> = new StorageArray<Row>(() => new Row());
}


export class Row {
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
                let providerCell = app.getCell(this.providerCellRefs[i]);
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
    
    parseInput(input?: string) : void {
        if (input !== undefined) {
            // Check if the input is a formula.        
            input = input.trim();
            if (input.charAt(0) === "=") {
                let formulaBody = input.substring(1);
                try {
                    this.formula = new Function("return ".concat(formulaBody));
                }
                catch (ex) {
                    this.reset();
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
                    this.value = eval(input);
                }
                catch(ex) {
                    // If evaluation fails, treat the user input as a string literal. 
                    this.value = input;
                }
            }
        }
        
        // Recalc this cell and its consumers.
        this.recalc();
    }
    
    recalc() : void {
        // Recalc this value.
        this.recalcValue();            
                
        // Recalc each consumer cell.
        this.consumerCellRefs.forEach(i => {
            App.currentApp.getCell(this.consumerCellRefs[i]).recalc();
        });
    }
    
    getValue() : any {
        // If there is an active recalc, update the dependency graph and recalc the value.
        if (App.currentApp.sessionState.calcStack.length > 0) {
            let app: App = App.currentApp;
            
            // Add the direct consumer to this cell's consumers list.
            let consumerCellRef: Platform_Ref.CellRef = app.sessionState.calcStack.peek(); 
            this.consumerCellRefs.add(consumerCellRef);
            
            // Add this cell to the consumer's provider list.
            let consumerCell: Cell = app.getCell(consumerCellRef);
            consumerCell.providerCellRefs.add(this.ref);

            // Recalc the value.
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
                    
                    throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidFormula, App.currentApp.getCellInput(this.ref));
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
    
    ensureByRefUnit(refUnit: Platform_Ref.RefUnit) : T {
        if (refUnit.kind == Platform_Ref.RefKind.ById) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.InvalidArgument, "The RefUnit value may not be ById.");
        }

        let element: T = this.getByIndex(refUnit.value);
        if (element === undefined) {
            element = this.newElement();
            this.setByIndex(refUnit.value, element);
        } 
        
        return element;
    }
    
    getByRefUnit(refUnit: Platform_Ref.RefUnit) : T {
        let element: T = undefined;
        
        if (refUnit.kind == Platform_Ref.RefKind.ById) {
            element = this.getById(refUnit.value);
        }
        else {
            element = this.getByIndex(refUnit.value);
        }
        
        return element;
    }
}
