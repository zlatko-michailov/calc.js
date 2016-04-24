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
import * as Platform_App from "../platform/app";


export class Global {
    static _isEnsured: boolean = false;
    
    static ensure() : void {
        if (!Global._isEnsured) {
            let js = "var CalcJS_Lib_Global = require('../lib/global'); ";
            js += "global.value = function(cellRef) { return CalcJS_Lib_Global.Global.value(cellRef); }; ";
            js += "global.rc = function(r, c, s) { return CalcJS_Lib_Global.Global.rc(r, c, s); }; ";
            js += "global.r$c$ = function(r, c, s) { return CalcJS_Lib_Global.Global.r$c$(r, c, s); }; ";
            js += "global._rc = function(r, c, s) { return CalcJS_Lib_Global.Global._rc(r, c, s); }; ";
            
            eval(js);
            
            Global._isEnsured = true;
        }
    }
    
    static value(cellRef: Platform_Ref.CellRef) : any {
        return Platform_App.App.currentApp.getCellValue(cellRef);
    }

    static rc(rowIndex: number, columnIndex: number, sheetIndex?: number) : Platform_Ref.CellRef {
        return new Platform_Ref.CellRef(
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, rowIndex), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, columnIndex), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, sheetIndex));
    }

    static r$c$(rowIndex: number, columnIndex: number, sheetIndex?: number) : Platform_Ref.CellRef {
        return new Platform_Ref.CellRef(
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, rowIndex), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, columnIndex), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ByIndex, sheetIndex));
    }

    static _rc(rowId: number, columnId: number, sheetId?: number) : Platform_Ref.CellRef {
        return new Platform_Ref.CellRef(
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, rowId), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, columnId), 
                    new Platform_Ref.RefUnit(Platform_Ref.RefKind.ById, sheetId));
    }
}

