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
import * as Lib_Global from "../../lib/global";
import * as Test_Main from "../main";


export class Tests {
    static testUsingCell(): boolean {
        let app: Platform_App.App = new Platform_App.App();
        let array: Platform_Ref.CellRef[] = new Array<Platform_Ref.CellRef>();
        let passed: boolean = true;
        
        array.push(
            Lib_Global.cr(21, 32, 4),
            Lib_Global.cr(43, 54, 5),
            Lib_Global.cr(65, 76, 6)
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
}