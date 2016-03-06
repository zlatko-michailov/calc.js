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
import * as Util_Arrays from "../../util/arrays";
import * as Util_Errors from "../../util/errors";
import * as Test_Main from "../main";


export class Tests {
    static testProtection() : boolean {
        let passed: boolean = true;
        let app: Platform_App.App = new Platform_App.App();

        passed = Test_Main.Framework.areEqual(false, app.isProtected(), Test_Main.LogLevel.Info, "not protected by default") && passed;
        app.removeProtection("anything");
        passed = Test_Main.Framework.areEqual(false, app.isProtected(), Test_Main.LogLevel.Info, "still not protected") && passed;
        
        app.setProtection("foOBar");
        passed = Test_Main.Framework.areEqual(true, app.isProtected(), Test_Main.LogLevel.Info, "protected") && passed;
        passed = Test_Main.Framework.throws(Util_Errors.ErrorCode.InvalidOperation, () => app.setProtection("anything"), Test_Main.LogLevel.Info, "protect protected") && passed;
        passed = Test_Main.Framework.areEqual(true, app.isProtected(), Test_Main.LogLevel.Info, "still protected (1)") && passed;
        passed = Test_Main.Framework.throws(Util_Errors.ErrorCode.InvalidArgument, () => app.removeProtection("foobar"), Test_Main.LogLevel.Info, "wrong password") && passed;
        passed = Test_Main.Framework.areEqual(true, app.isProtected(), Test_Main.LogLevel.Info, "still protected (2)") && passed;
        
        app.removeProtection("foOBar");
        passed = Test_Main.Framework.areEqual(false, app.isProtected(), Test_Main.LogLevel.Info, "remove protection") && passed;

        return passed;
    }
}