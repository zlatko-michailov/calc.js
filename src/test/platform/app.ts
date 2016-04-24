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


import * as Platform_App from "../../platform/app";
import * as Platform_Ref from "../../platform/ref";
import * as Util_Arrays from "../../util/arrays";
import * as Util_Errors from "../../util/errors";
import * as Util_JSON from "../../util/json";
import * as Lib_Global from "../../lib/global";
import * as Test_Main from "../main";


export class Tests {
    static testRewriteRefs() : boolean {
        let app: Platform_App.App = new Platform_App.App();
        Platform_App.App.currentApp = app;
        Lib_Global.Global.ensure();
        
        let passed: boolean = true;
        
        let input: string = "abc + rc(12,34) + rc (56, 78,90)+r$c$ ( e  ,  f , 21 ) - r$c   (a +b   ,  56   )*rc$ (  78 ,  c- d  , 90   ) /  xyz";
        let expected: string[][] = [
            [ "rc", "12", "34", undefined ],
            [ "rc", "56", "78", "90" ],
            [ "r$c$", "e  ", "f ", "21 " ]
            //[ "r$c", "a +b   ", "56   ", undefined ],
            //[ "rc$", "78 ", "c- d  ", "90   " ]
        ];
        let expectedIndex = 0;
        
        let rewritten = app.rewriteRefs(undefined, input, (dummyCellRef, matches) => {
            passed = Test_Main.Framework.areEqual(expected[expectedIndex][0], matches[Platform_App.MatchIndex.Function], Test_Main.LogLevel.Info, "function") && passed;
            passed = Test_Main.Framework.areEqual(expected[expectedIndex][1], matches[Platform_App.MatchIndex.Arg1], Test_Main.LogLevel.Info, "arg1") && passed;
            passed = Test_Main.Framework.areEqual(expected[expectedIndex][2], matches[Platform_App.MatchIndex.Arg2], Test_Main.LogLevel.Info, "arg2") && passed;
            passed = Test_Main.Framework.areEqual(expected[expectedIndex][3], matches[Platform_App.MatchIndex.Arg3], Test_Main.LogLevel.Info, "arg3") && passed;
            
            return (++expectedIndex).toString();
        })
        
        let expectedRewritten = "abc + 1 + 2+3 - r$c   (a +b   ,  56   )*rc$ (  78 ,  c- d  , 90   ) /  xyz";
        passed = Test_Main.Framework.areEqual(expectedRewritten, rewritten, Test_Main.LogLevel.Info, "rewritten") && passed;
        
        return passed;
    }
    
    static testParseCellInput() : boolean {
        let app: Platform_App.App = new Platform_App.App();
        Platform_App.App.currentApp = app;
        Lib_Global.Global.ensure();
        
        let passed: boolean = true;
        
        let ref : Platform_Ref.CellRef = Lib_Global.Global.rc(12, 34, 9); 
        app.parseCellInput(ref, "42");
        let val: any = app.ensureCell(ref).value;
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 42") && passed;
        passed = Test_Main.Framework.areEqual(42, val, Test_Main.LogLevel.Info, "42") && passed;
        
        ref = Lib_Global.Global.rc(23, 45, 9); 
        app.parseCellInput(ref, "'foo'");
        val = app.ensureCell(ref).value;
        passed = Test_Main.Framework.areEqual("string", typeof val, Test_Main.LogLevel.Info, "typeof 'foo'") && passed;
        passed = Test_Main.Framework.areEqual("foo", val, Test_Main.LogLevel.Info, "'foo'") && passed;
        
        ref = Lib_Global.Global.rc(34, 56, 9); 
        app.parseCellInput(ref, "[23, 34, 45]");
        val = app.ensureCell(ref).value;
        passed = Test_Main.Framework.areEqual("object", typeof val, Test_Main.LogLevel.Info, "typeof [23, 34, 45]") && passed;
        passed = Test_Main.Framework.areEqual(JSON.stringify([23, 34, 45]), JSON.stringify(val), Test_Main.LogLevel.Info, "[23, 34, 45]") && passed;

        ref = Lib_Global.Global.rc(45, 67, 9); 
        app.parseCellInput(ref, "{ a: 43, b: 'bar' }");
        val = app.ensureCell(ref).value;
        passed = Test_Main.Framework.areEqual("object", typeof val, Test_Main.LogLevel.Info, "typeof { a: 43, b: 'bar' }") && passed;
        passed = Test_Main.Framework.areEqual(JSON.stringify({ a: 43, b: "bar"}), JSON.stringify(val), Test_Main.LogLevel.Info, "{ a: 43, b: 'bar'}}") && passed;

        ref = Lib_Global.Global.rc(12, 34, 9); 
        app.parseCellInput(ref, "new Date(2016, 3, 9, 21, 2, 12)");
        val = app.ensureCell(ref).value;
        passed = Test_Main.Framework.areEqual("object", typeof val, Test_Main.LogLevel.Info, "typeof new Date(2016, 3, 9, 21, 2, 12)") && passed;
        passed = Test_Main.Framework.areEqual(JSON.stringify(new Date(2016, 3, 9, 21, 2, 12)), JSON.stringify(val), Test_Main.LogLevel.Info, "new Date(2016, 3, 9, 21, 2, 12)") && passed;
        
        ref = Lib_Global.Global.rc(23, 45, 9); 
        app.parseCellInput(ref, "=56 + 78");
        val = app.ensureCell(ref).formula();
        passed = Test_Main.Framework.areEqual("function", typeof app.ensureCell(ref).formula, Test_Main.LogLevel.Info, "typeof =56 + 78") && passed;
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 56 + 78") && passed;
        passed = Test_Main.Framework.areEqual(56 + 78, val, Test_Main.LogLevel.Info, "=56 + 78") && passed;

        ref = Lib_Global.Global.rc(34, 56, 9); 
        app.parseCellInput(ref, "=function () { return 'abcd'.length; }");
        val = app.ensureCell(ref).formula();
        let valval = val();
        passed = Test_Main.Framework.areEqual("function", typeof app.ensureCell(ref).formula, Test_Main.LogLevel.Info, "typeof =function() { return 'abcd'.length; }") && passed;
        passed = Test_Main.Framework.areEqual("function", typeof val, Test_Main.LogLevel.Info, "typeof function() { return 'abcd'.length; }") && passed;
        passed = Test_Main.Framework.areEqual("number", typeof valval, Test_Main.LogLevel.Info, "typeof (function() { return 'abcd'.length; })()") && passed;
        passed = Test_Main.Framework.areEqual("abcd".length, valval, Test_Main.LogLevel.Info, "(function() { return 'abcd'.length; })()") && passed;
        
        ref = Lib_Global.Global.rc(45, 67, 9); 
        app.parseCellInput(ref, "=value(rc(23, 45, 9)) + value(rc(34, 56, 9))()");
        val = app.ensureCell(ref).formula();
        passed = Test_Main.Framework.areEqual("function", typeof app.ensureCell(ref).formula, Test_Main.LogLevel.Info, "typeof =value(rc(23, 45)) + value(rc(34, 56))()") && passed;
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof value(rc(23, 45)) + value(rc(34, 56))())") && passed;
        passed = Test_Main.Framework.areEqual((56 + 78) + "abcd".length, val, Test_Main.LogLevel.Info, "=value(rc(23, 45)) + value(rc(34, 56))()") && passed;
        
        return passed;
    }
    
    static testGetCellValue() : boolean {
        let app: Platform_App.App = new Platform_App.App();
        Platform_App.App.currentApp = app;
        Lib_Global.Global.ensure();
        
        let passed: boolean = true;

        let ref1 : Platform_Ref.CellRef = Lib_Global.Global.rc(1, 1, 9); 
        app.parseCellInput(ref1, "16");
        let val: any = app.getCellValue(ref1);
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 16") && passed;
        passed = Test_Main.Framework.areEqual(16, val, Test_Main.LogLevel.Info, "16") && passed;
        
        let ref2 = Lib_Global.Global.rc(2, 2, 9); 
        app.parseCellInput(ref2, "=value(rc(1, 1, 9)) + 5");
        val = app.getCellValue(ref2);
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof =value(rc(1, 1, 9)) + 5") && passed;
        passed = Test_Main.Framework.areEqual(21, val, Test_Main.LogLevel.Info, "21") && passed;
        
        let ref3 = Lib_Global.Global.rc(3, 3, 9); 
        app.parseCellInput(ref3, "=value(rc(2, 2, 9)) + 6");
        val = app.getCellValue(ref3);
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof =value(rc(2, 2, 9)) + 6") && passed;
        passed = Test_Main.Framework.areEqual(27, val, Test_Main.LogLevel.Info, "27") && passed;
        
        // Hook to get a sample app.
        let sample = Util_JSON.Serializer.toJSON(app);
        
        // Recalc.
        app.parseCellInput(ref1, "3");
        val = app.getCellValue(ref1);
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 3") && passed;
        passed = Test_Main.Framework.areEqual(3, val, Test_Main.LogLevel.Info, "3") && passed;
        val = app.getCellValue(ref2);
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 8") && passed;
        passed = Test_Main.Framework.areEqual(8, val, Test_Main.LogLevel.Info, "8") && passed;
        val = app.getCellValue(ref3);
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 14") && passed;
        passed = Test_Main.Framework.areEqual(14, val, Test_Main.LogLevel.Info, "14") && passed;

        // Circular dependency.
        passed = Test_Main.Framework.throws(Util_Errors.ErrorCode.CircularReference, () => app.parseCellInput(ref1, "=value(rc(3, 3, 9)) + 1"), Test_Main.LogLevel.Info, "Circular ref");
        
        return passed;
    }
}