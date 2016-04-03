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
import * as Util_JSON from "../../util/json";
import * as Test_Main from "../main";


export class Tests {
    static testSerializer() : boolean {
        let passed: boolean = true;
        
        let sparseArray: Util_Arrays.SparseArray<number> = new Util_Arrays.SparseArray<number>();
        sparseArray[2] = 99;
        sparseArray[42] = 88;
        sparseArray[2016] = 77;
        
        let dualSparseArray: Util_Arrays.DualSparseArray<number> = new Util_Arrays.DualSparseArray<number>();
        dualSparseArray.insert(0, 3);
        dualSparseArray.setByIndex(0, 66);
        dualSparseArray.setByIndex(1, 55);
        dualSparseArray.setByIndex(2, 44);
        
        let expectedValue: any = {
            a: 42,
            b: "foo",
            sessionState: "Must be filtered out!",
            sub: {
                x: [ 2016, 3, 2 ],
                sessionState: "Also must be filtered out!",
                y: sparseArray,
                z: dualSparseArray
            }
        };
        
        let actualJSON: string = Util_JSON.Serializer.toJSON(expectedValue);
        let expectedJSON: string = '{"a":42,"b":"foo","sub":{"x":[2016,3,2],"y":{"2":99,"42":88,"2016":77},"z":{"_count":3,"_nextId":3,"_byId":{"0":{"index":0,"value":66},"1":{"index":1,"value":55},"2":{"index":2,"value":44}},"_byIndex":{"0":0,"1":1,"2":2}}}}';
        passed = Test_Main.Framework.areEqual(expectedJSON, actualJSON, Test_Main.LogLevel.Info, "toJSON") && passed;
        
        let actualValue: any = Util_JSON.Serializer.fromJSON(actualJSON);
        passed = Test_Main.Framework.areEqual(expectedValue.a, actualValue.a, Test_Main.LogLevel.Info, "a") && passed;
        passed = Test_Main.Framework.areEqual(expectedValue.b, actualValue.b, Test_Main.LogLevel.Info, "b") && passed;
        passed = Test_Main.Framework.isUndefined(actualValue.sessionState, Test_Main.LogLevel.Info, "sessionState") && passed;
        passed = Test_Main.Framework.areEqual(Util_JSON.Serializer.toJSON(expectedValue.sub.x), Util_JSON.Serializer.toJSON(actualValue.sub.x), Test_Main.LogLevel.Info, "sub.x") && passed;
        passed = Test_Main.Framework.isUndefined(actualValue.sub.sessionState, Test_Main.LogLevel.Info, "sub.sessionState") && passed;
        passed = Test_Main.Framework.areEqual(Util_JSON.Serializer.toJSON(expectedValue.sub.y), Util_JSON.Serializer.toJSON(actualValue.sub.y), Test_Main.LogLevel.Info, "sub.y") && passed;
        passed = Test_Main.Framework.areEqual(Util_JSON.Serializer.toJSON(expectedValue.sub.z), Util_JSON.Serializer.toJSON(actualValue.sub.z), Test_Main.LogLevel.Info, "sub.z") && passed;
        
        return passed;
    }
}
