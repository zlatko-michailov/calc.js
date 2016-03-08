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


import * as Util_Errors from "../util/errors";
import * as Test_Util_Arrays from "./util/arrays";
import * as Test_Util_JSON from "./util/json";
import * as Test_Platform_App from "./platform/app";


export class Framework {
    static run(): void {
        let passed: boolean = true;
        
        passed = this._execute("util/arrays/Stack", Test_Util_Arrays.Tests.testStack) && passed;
        passed = this._execute("util/arrays/SparseArray", Test_Util_Arrays.Tests.testSparseArray) && passed;
        passed = this._execute("util/arrays/DualSparseArray", Test_Util_Arrays.Tests.testDualSparseArray) && passed;
        passed = this._execute("util/json/Serializer", Test_Util_JSON.Tests.testSerializer) && passed;
        
        this.log(LogLevel.Important);
        this.log(LogLevel.Important, "==============");
        this.log(LogLevel.Important, passed ? "    PASSED" : "+++ FAILED +++" );
        this.log(LogLevel.Important, "==============");
    }
    
    static log(level: string, message?: string, ...args: any[]): void {
        if (message) {
            let levelMessage: string = level + message;
            
            if (args && args.length > 0) {
                console.log(levelMessage, args);
            }
            else {
                console.log(levelMessage);
            }
        }
        else {
            console.log(level);
        }
    }
    
    static areEqual<T>(expected: T, actual: T, logLevel: string, message: string) : boolean {
        let passed = expected == actual;
        let text = (passed ? "P" : "F") + ": " + message;
        
        Framework.log(logLevel, text, { expected: expected, actual: actual });
        return passed;
    }
    
    static isUndefined(actual: any, logLevel: string, message: string) : boolean {
        let passed = undefined == actual;
        let text = (passed ? "P" : "F") + ": " + message;
        
        Framework.log(logLevel, text, { actual: actual });
        return passed;
    }
    
    static throws(expectedCode: Util_Errors.ErrorCode, action: () => any, logLevel: string, message: string) : boolean {
        let passed = false;
        
        try {
            action();
            
            Framework.log(logLevel, "F: " + message, { expected: expectedCode });
        }
        catch (ex) {
            passed = Framework.areEqual(expectedCode, ex.code, logLevel, message);
        }
        
        return passed;
    }
    
    static _execute(testName: string, testMethod: () => boolean): boolean {
        this.log(LogLevel.Important);
        this.log(LogLevel.Important, testName);
        this.log(LogLevel.Important, "---------------------------------------");
        var passed: boolean = testMethod();
        this.log(LogLevel.Important, passed ? "PASSED" : "+++ FAILED +++" );
        
        return passed;
    }
}

    
export class LogLevel {
    static Important: string = "";
    static Info: string = "|   ";
    static Detail: string = "|   |   ";
    static Verbose: string = "|   |   |   ";
}


Framework.run();
