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


export class Stack<T> extends Array<T> {
    public peek(): T {
        return this.length > 0 ? this[this.length - 1] : undefined;
    }
}

export class DualSparseArray<T> {
    private nextId: number;
    private elementConstructor: () => T;
    private byId: SparseArray<T>;
    private byIndex: SparseArray<T>;
    
    public constructor(elementConstructor: () => T) {
        this.elementConstructor = elementConstructor;
    }
    
    public getElementById(id: number) : T {
        // TODO:
        return undefined;
    }
    
    public setElementById(id: number, value: T) : void {
        // TODO:
    }
    
    public getElementByIndex(index: number) : T {
        // TODO:
        return undefined;
    }
    
    public setElementByIndex(index: number, value: T) : void {
        // TODO:
    }
}


export class SparseArray<T> {
    private elementConstructor: () => T;
    [index: number]: T;
    
    public constructor(elementConstructor: () => T) {
        this.elementConstructor = elementConstructor;
    }
    
    public getElementAt(index: number) : T {
        if (!this[index]) {
            this[index] = this.elementConstructor();
        }
        
        return this[index];
    }
    
    public setElementAt(index: number, value: T) : void {
        this[index] = value;
    }
}
