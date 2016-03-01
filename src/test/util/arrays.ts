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


import * as Util_Arrays from "../../util/arrays";
import * as Test_Main from "../main";


export class Tests {
    public static testStack(): boolean {
        let stack: Util_Arrays.Stack<number> = new Util_Arrays.Stack<number>();
        let passed: boolean = true;
        
        stack.push(42);
        stack.push(2016);
        passed = Test_Main.Framework.areEqual(42, stack.peek(1), Test_Main.LogLevel.Info, "peek(1)") && passed;
        passed = Test_Main.Framework.areEqual(2016, stack.peek(), Test_Main.LogLevel.Info, "peek") && passed;
        
        stack.push(26);
        passed = Test_Main.Framework.areEqual(26, stack.pop(), Test_Main.LogLevel.Info, "pop") && passed;
        
        stack.push(2);
        stack.push(23);
        passed = Test_Main.Framework.areEqual(23, stack.pop(), Test_Main.LogLevel.Info, "pop") && passed;
        passed = Test_Main.Framework.areEqual(2, stack.pop(), Test_Main.LogLevel.Info, "pop") && passed;
        passed = Test_Main.Framework.areEqual(2016, stack.pop(), Test_Main.LogLevel.Info, "pop") && passed;
        passed = Test_Main.Framework.areEqual(42, stack.pop(), Test_Main.LogLevel.Info, "pop") && passed;
        passed = Test_Main.Framework.areEqual(0, stack.length, Test_Main.LogLevel.Info, "empty") && passed;
        
        return passed;
    }
    
    public static testSparseArray(): boolean {
        let array: Util_Arrays.SparseArray<number> = new Util_Arrays.SparseArray<number>();
        let passed: boolean = true;
        
        passed = Test_Main.Framework.isUndefined(array[99], Test_Main.LogLevel.Info, "unsset") && passed;
        
        array[2016] = 1234;
        passed = Test_Main.Framework.areEqual(1234, array[2016], Test_Main.LogLevel.Info, "get set") && passed;
        
        delete array[99];
        passed = Test_Main.Framework.isUndefined(array[99], Test_Main.LogLevel.Info, "deleted") && passed;
        for (let index in array) {
           passed = Test_Main.Framework.areEqual('2016', index, Test_Main.LogLevel.Info, "for") && passed;
        }
        
        return passed;
    }

    public static testDualSparseArray(): boolean {
        let array: Util_Arrays.DualSparseArray<number> = new Util_Arrays.DualSparseArray<number>();
        let passed: boolean = true;

        // [ 11, 12 ]        
        array.insert(0, 2);
        array.setByIndex(0, 11);
        array.setByIndex(1, 12);
        passed = Test_Main.Framework.areEqual(11, array.getByIndex(0), Test_Main.LogLevel.Info, "by index(0)") && passed;
        passed = Test_Main.Framework.areEqual(21, array.getByIndex(1), Test_Main.LogLevel.Info, "by index(1)") && passed;
        passed = Test_Main.Framework.areEqual(11, array.getById(0), Test_Main.LogLevel.Info, "by id(0)") && passed;
        passed = Test_Main.Framework.areEqual(12, array.getById(1), Test_Main.LogLevel.Info, "by id(1)") && passed;

        // [11, 21, 22, 23, 24, 12 ]
        array.insert(1, 4);
        array.setByIndex(1, 21);
        array.setByIndex(2, 22);
        array.setByIndex(3, 23);
        array.setByIndex(4, 24);
        
        // [11, 21, 24, 12 ]
        array.delete(2, 2);
        passed = Test_Main.Framework.areEqual(11, array.getByIndex(0), Test_Main.LogLevel.Info, "by index(0)") && passed;
        passed = Test_Main.Framework.areEqual(21, array.getByIndex(1), Test_Main.LogLevel.Info, "by index(1)") && passed;
        passed = Test_Main.Framework.areEqual(24, array.getByIndex(2), Test_Main.LogLevel.Info, "by index(2)") && passed;
        passed = Test_Main.Framework.areEqual(12, array.getByIndex(3), Test_Main.LogLevel.Info, "by index(3)") && passed;

        passed = Test_Main.Framework.areEqual(11, array.getById(0), Test_Main.LogLevel.Info, "by id(0)") && passed;
        passed = Test_Main.Framework.areEqual(12, array.getById(1), Test_Main.LogLevel.Info, "by id(1)") && passed;
        passed = Test_Main.Framework.areEqual(21, array.getById(2), Test_Main.LogLevel.Info, "by id(2)") && passed;
        passed = Test_Main.Framework.isUndefined(array.getById(3), Test_Main.LogLevel.Info, "by id(3)") && passed;
        passed = Test_Main.Framework.isUndefined(array.getById(4), Test_Main.LogLevel.Info, "by id(4)") && passed;
        passed = Test_Main.Framework.areEqual(24, array.getById(5), Test_Main.LogLevel.Info, "by id(5)") && passed;
        
        return passed;
    }
}