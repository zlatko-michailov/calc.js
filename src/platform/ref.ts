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


// These functions are for user's convenience. 
// They must remain in the global namesapce.
export function cr(colIndex: CalcJS.RefValue, rowIndex: CalcJS.RefValue, sheetIndex?: CalcJS.RefValue) : CalcJS.CellRef {
    return new CalcJS.CellRef(
                new CalcJS.RefUnit(CalcJS.RefKind.ById, colIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ById, rowIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ById, sheetIndex));
}

export function c$r(colIndex: CalcJS.RefValue, rowIndex: CalcJS.RefValue, sheetIndex?: CalcJS.RefValue) : CalcJS.CellRef {
    return new CalcJS.CellRef(
                new CalcJS.RefUnit(CalcJS.RefKind.ByIndex, colIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ById, rowIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ById, sheetIndex));
}

export function cr$(colIndex: CalcJS.RefValue, rowIndex: CalcJS.RefValue, sheetIndex?: CalcJS.RefValue) : CalcJS.CellRef {
    return new CalcJS.CellRef(
                new CalcJS.RefUnit(CalcJS.RefKind.ById, colIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ByIndex, rowIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ById, sheetIndex));
}

export function c$r$(colIndex: CalcJS.RefValue, rowIndex: CalcJS.RefValue, sheetIndex?: CalcJS.RefValue) : CalcJS.CellRef {
    return new CalcJS.CellRef(
                new CalcJS.RefUnit(CalcJS.RefKind.ByIndex, colIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ByIndex, rowIndex), 
                new CalcJS.RefUnit(CalcJS.RefKind.ById, sheetIndex));
}


namespace CalcJS {
    export class CellRef {
        public constructor(colRef: RefUnit, rowRef: RefUnit, sheetRef?: RefUnit) {
            this.colRef = colRef;
            this.rowRef = rowRef;
            this.sheetRef = sheetRef;
        }
        
        public colRef: RefUnit;
        public rowRef: RefUnit;
        public sheetRef: RefUnit;
    }
    
    
    export class RefUnit {
        public constructor (kind: RefKind, value: RefValue) {
            this.kind = kind;
            this.value = value;
        }
        
        public kind: RefKind;
        public value: RefValue;
    }
    
    export type RefValue = number;
    
    export const enum RefKind {
        ById = 0,
        ByIndex = 1,
    }
}
