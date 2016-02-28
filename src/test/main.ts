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


import * as Arrays from "../util/arrays";


export class Framework {
    public static run(): void {
        let passed: boolean = true;
        
        passed = this.execute("util/arrays/Stack", this.testStack) && passed;
        passed = this.execute("util/arrays/SparseArray", this.testSparseArray) && passed;
        
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
    
    private static testStack(): boolean {
        let stack: Arrays.Stack<number> = new Arrays.Stack<number>();
        let passed: boolean = true;
        
        stack.push(42);
        stack.push(2016);
        stack.push(26);
        passed = Framework.areEqual(26, stack.pop(), LogLevel.Info, "pop") && passed;
        stack.push(2);
        stack.push(23);
        passed = Framework.areEqual(23, stack.pop(), LogLevel.Info, "pop") && passed;
        passed = Framework.areEqual(2, stack.pop(), LogLevel.Info, "pop") && passed;
        passed = Framework.areEqual(2016, stack.pop(), LogLevel.Info, "pop") && passed;
        passed = Framework.areEqual(42, stack.pop(), LogLevel.Info, "pop") && passed;
        passed = Framework.areEqual(0, stack.length, LogLevel.Info, "empty") && passed;
        
        return passed;
    }
    
    private static testSparseArray(): boolean {
        Framework.log(LogLevel.Info, "one"); 
        Framework.log(LogLevel.Detail, "two"); 
        Framework.log(LogLevel.Verbose, "three"); 
        Framework.log(LogLevel.Detail, "four"); 
        Framework.log(LogLevel.Info, "five"); 
        
        return true;
    }
}

    
export class LogLevel {
    public static Important: string = "";
    public static Info: string = "|   ";
    public static Detail: string = "|   |   ";
    public static Verbose: string = "|   |   |   ";
}


Framework.run();
