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
    static testUsingCell(): boolean {
        let app: Platform_App.App = new Platform_App.App();
        Platform_App.App.currentApp = app;
        let array: Platform_Ref.CellRef[] = new Array<Platform_Ref.CellRef>();
        let passed: boolean = true;
        
        array.push(
            Lib_Global.Global.cr(21, 32, 4),
            Lib_Global.Global.cr(43, 54, 5),
            Lib_Global.Global.cr(65, 76, 6)
        )
        
        let helper: () => void = () => {
            let ref: Platform_Ref.CellRef = array.pop();
            if (ref) {
                app.usingCell(ref, () => {
                    passed = Test_Main.Framework.areEqual(JSON.stringify(ref), JSON.stringify(app.sessionState.currentCellStack.peek()), Test_Main.LogLevel.Info, "before") && passed;
                    helper();
                    passed = Test_Main.Framework.areEqual(JSON.stringify(ref), JSON.stringify(app.sessionState.currentCellStack.peek()), Test_Main.LogLevel.Info, "after") && passed;
                });
            }
        };
        helper();
        
        return passed;
    }
    
    static testParseCellInput() : boolean {
        let app: Platform_App.App = new Platform_App.App();
        Platform_App.App.currentApp = app;
        Lib_Global.Global.ensure();
        
        let passed: boolean = true;
        
        let ref : Platform_Ref.CellRef = Lib_Global.Global.cr(12, 34, 9); 
        app.parseCellInput(ref, "42");
        let val: any = app.getCell(ref).value;
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 42") && passed;
        passed = Test_Main.Framework.areEqual(42, val, Test_Main.LogLevel.Info, "42") && passed;
        
        ref = Lib_Global.Global.cr(23, 45, 9); 
        app.parseCellInput(ref, "'foo'");
        val = app.getCell(ref).value;
        passed = Test_Main.Framework.areEqual("string", typeof val, Test_Main.LogLevel.Info, "typeof 'foo'") && passed;
        passed = Test_Main.Framework.areEqual("foo", val, Test_Main.LogLevel.Info, "'foo'") && passed;
        
        ref = Lib_Global.Global.cr(34, 56, 9); 
        app.parseCellInput(ref, "[23, 34, 45]");
        val = app.getCell(ref).value;
        passed = Test_Main.Framework.areEqual("object", typeof val, Test_Main.LogLevel.Info, "typeof [23, 34, 45]") && passed;
        passed = Test_Main.Framework.areEqual(JSON.stringify([23, 34, 45]), JSON.stringify(val), Test_Main.LogLevel.Info, "[23, 34, 45]") && passed;

        ref = Lib_Global.Global.cr(45, 67, 9); 
        app.parseCellInput(ref, "{ a: 43, b: 'bar' }");
        val = app.getCell(ref).value;
        passed = Test_Main.Framework.areEqual("object", typeof val, Test_Main.LogLevel.Info, "typeof { a: 43, b: 'bar' }") && passed;
        passed = Test_Main.Framework.areEqual(JSON.stringify({ a: 43, b: "bar"}), JSON.stringify(val), Test_Main.LogLevel.Info, "{ a: 43, b: 'bar'}}") && passed;

        let json : string = Util_JSON.Serializer.toJSON(app);
        // TODO: Verify whole app

        ref = Lib_Global.Global.cr(12, 34, 9); 
        app.parseCellInput(ref, "new Date(2016, 3, 9, 21, 2, 12)");
        val = app.getCell(ref).value;
        passed = Test_Main.Framework.areEqual("object", typeof val, Test_Main.LogLevel.Info, "typeof new Date(2016, 3, 9, 21, 2, 12)") && passed;
        passed = Test_Main.Framework.areEqual(JSON.stringify(new Date(2016, 3, 9, 21, 2, 12)), JSON.stringify(val), Test_Main.LogLevel.Info, "new Date(2016, 3, 9, 21, 2, 12)") && passed;
        
        ref = Lib_Global.Global.cr(23, 45, 9); 
        app.parseCellInput(ref, "=56 + 78");
        val = app.getCell(ref).formula();
        passed = Test_Main.Framework.areEqual("function", typeof app.getCell(ref).formula, Test_Main.LogLevel.Info, "typeof =56 + 78") && passed;
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof 56 + 78") && passed;
        passed = Test_Main.Framework.areEqual(56 + 78, val, Test_Main.LogLevel.Info, "=56 + 78") && passed;

        ref = Lib_Global.Global.cr(34, 56, 9); 
        app.parseCellInput(ref, "=function () { return 'abcd'.length; }");
        val = app.getCell(ref).formula();
        let valval = val();
        passed = Test_Main.Framework.areEqual("function", typeof app.getCell(ref).formula, Test_Main.LogLevel.Info, "typeof =function() { return 'abcd'.length; }") && passed;
        passed = Test_Main.Framework.areEqual("function", typeof val, Test_Main.LogLevel.Info, "typeof function() { return 'abcd'.length; }") && passed;
        passed = Test_Main.Framework.areEqual("number", typeof valval, Test_Main.LogLevel.Info, "typeof (function() { return 'abcd'.length; })()") && passed;
        passed = Test_Main.Framework.areEqual("abcd".length, valval, Test_Main.LogLevel.Info, "(function() { return 'abcd'.length; })()") && passed;
        
        ref = Lib_Global.Global.cr(45, 67, 9); 
        app.parseCellInput(ref, "=value(cr(23, 45, 9)) + value(cr(34, 56, 9))()");
        val = app.getCell(ref).formula();
        passed = Test_Main.Framework.areEqual("function", typeof app.getCell(ref).formula, Test_Main.LogLevel.Info, "typeof =value(cr(23, 45)) + value(cr(34, 56))()") && passed;
        passed = Test_Main.Framework.areEqual("number", typeof val, Test_Main.LogLevel.Info, "typeof value(cr(23, 45)) + value(cr(34, 56))())") && passed;
        passed = Test_Main.Framework.areEqual((56 + 78) + "abcd".length, val, Test_Main.LogLevel.Info, "=value(cr(23, 45)) + value(cr(34, 56))()") && passed;
        
        json = Util_JSON.Serializer.toJSON(app);
        // TODO: Verify whole app

        return passed;
    }
}