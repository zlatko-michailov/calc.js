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


import * as Platform_Ref from "../platform/ref";


export function cr(columnIndex: number, rowIndex: number, sheetIndex?: number) : Platform_Ref.CellRef {
    return new Platform_Ref.CellRef(
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, columnIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, rowIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, sheetIndex));
}

export function c$r(columnIndex: number, rowIndex: number, sheetIndex?: number) : Platform_Ref.CellRef {
    return new Platform_Ref.CellRef(
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, columnIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, rowIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, sheetIndex));
}

export function cr$(columnIndex: number, rowIndex: number, sheetIndex?: number) : Platform_Ref.CellRef {
    return new Platform_Ref.CellRef(
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, columnIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, rowIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, sheetIndex));
}

export function c$r$(columnIndex: number, rowIndex: number, sheetIndex?: number) : Platform_Ref.CellRef {
    return new Platform_Ref.CellRef(
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, columnIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, rowIndex), 
                new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, sheetIndex));
}


