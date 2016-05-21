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


export interface Portable {
    export(format: PortableFormat) : any;

    import(format: PortableFormat, data: any) : void;
}


export class PortableUtil {
    static export(x: any, format: PortableFormat) : any {
        if (this.isExportable(x)) {
            return (<Portable><any>x).export(format);
        }
        else {
            return x;
        }
    }
    
    static isExportable(x: any) : boolean {
        return (typeof x === "object" && typeof (<any>x)["export"] === "function");
    }
    
    static isImportable(x: any) : boolean {
        return (typeof x === "object" && typeof (<any>x)["import"] === "function");
    }
}


export const enum PortableFormat {
    Short = 0,
    Fast = 1
}


export class Serializer {
    static toJSON(value: any) : string {
        return JSON.stringify(value, this._replacer);
    }
     
    static fromJSON<T>(json: string) : any {
        return JSON.parse(json);
    }
    
    static _replacer(name: string, value: any) : boolean {
        return (name == "sessionState" || name == "_sessionState") ? undefined : value;
    }
}