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


import * as Test_Util_Arrays from "./util/arrays";


export class Framework {
    public static run(): void {
        let passed: boolean = true;
        
        passed = this.execute("util/arrays/Stack", Test_Util_Arrays.Tests.testStack) && passed;
        passed = this.execute("util/arrays/SparseArray", Test_Util_Arrays.Tests.testSparseArray) && passed;
        passed = this.execute("util/arrays/DualSparseArray", Test_Util_Arrays.Tests.testDualSparseArray) && passed;
        
        this.log(LogLevel.Important);
        this.log(LogLevel.Important, "=================");
        this.log(LogLevel.Important, passed ? "[Passed]" : "[+++ FAILED +++]" );
    }
    
    public static log(level: string, message?: string, ...args: any[]): void {
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
    
    public static areEqual<T>(expected: T, actual: T, logLevel: string, message: string) : boolean {
        let passed = expected == actual;
        if (!passed) {
            logLevel = LogLevel.Important;
        }
        
        Framework.log(logLevel, message, { expected: expected, actual: actual});
        return passed;
    }
    
    private static execute(testName: string, testMethod: () => boolean): boolean {
        this.log(LogLevel.Important);
        this.log(LogLevel.Important, testName);
        this.log(LogLevel.Important, "---------------------------------------");
        var passed: boolean = testMethod();
        this.log(LogLevel.Important, passed ? "PASSED" : "+++ FAILED +++" );
        
        return passed;
    }
}

    
export class LogLevel {
    public static Important: string = "";
    public static Info: string = "|   ";
    public static Detail: string = "|   |   ";
    public static Verbose: string = "|   |   |   ";
}


Framework.run();
