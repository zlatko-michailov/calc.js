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


import * as Util_Errors from "./errors";


export class Stack<T> extends Array<T> {
    peek(i?: number): T {
        if (i === undefined) {
            i = 0;
        }
        
        return this.length > 0 ? this[this.length - 1 - i] : undefined;
    }
}


export class SparseArray<T> {
    [index: number]: T;
    
    indexOf(value: T) : number {
        for (let i in this) {
            if (this[i] == value) {
                return parseInt(i);
            }
        }
        
        return undefined;
    }
    
    insert(value: T) : number {
        for (let i: number = 0; i < Number.MAX_VALUE; i++) {
            if (this[i] === undefined) {
                this[i] = value;
                return i;
            }
        }
        
        throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange, "Cannot insert a new value because this SparseArray is completely full.");
    }
    
    forEach(callback: (i: number) => void) : void {
        for (let s in this) {
            let i = parseInt(s);
            if (!isNaN(i)) {
                callback(i);
            }
        }
    }
}


export class DualSparseArray<T> {
    _count: number = 0;
    _nextId: number = 0;
    _byId: SparseArray<IndexValue<T>> = new SparseArray<IndexValue<T>>();
    _byIndex: Array<number> = new Array<number>();
    
    insert(index: number, count?: number) : void {
        if (index < 0 || index > this._count) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange);
        }
        
        if (count == undefined) {
            count = 1;
        }
        
        // Shift the elements to open a gap.        
        for (let i: number = this._count - 1; index <= i; i--) {
            this._byIndex[i + count] = this._byIndex[i];
            
            let id: number = this._byIndex[i];
            this._byId[id].index += count 
        }
        
        // Init the elements in the gap.
        for (let i: number = index; i < index + count; i++) {
            this._byId[this._nextId] = { index: i, value: undefined };
            this._byIndex[i] = this._nextId;
            this._nextId++;
        }

        this._count += count;
    }
    
    delete(index: number, count?: number) : void {
        if (index < 0 || index > this._count) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange);
        }
        
        if (count == undefined) {
            count = 1;
        }
        
        // Delete elements. Open a gap.
        for (let i: number = index; i < index + count; i++) {
            let id: number = this._byIndex[i]; 
            delete this._byId[id];
            delete this._byIndex[i];
        }

        // Shift back the elements to close the gap.
        for (let i: number = index + count; i < this._count; i++) {
            let id: number = this._byIndex[i];
            this._byId[id].index -= count 

            this._byIndex[i - count] = this._byIndex[i]; 
        }
        
        // Trim the elements at the end.
        this._byIndex.splice(this._count, count);

        this._count -= count; 
    }
    
    getById(id: number) : T {
        let indexValue: IndexValue<T> = this._byId[id];
        return indexValue === undefined ? undefined : indexValue.value;
    }
    
    setById(id: number, value: T) : void {
        // TODO: Remove this method.
        
        if (this._byId[id] === undefined) {
            this._byId[id] = new IndexValue<T>();
        }
        
        this._byId[id].value = value;
    }
    
    getByIndex(index: number) : T {
        let id: number = this._byIndex[index];
        return this._byId[id].value;
    }

    setByIndex(index: number, value: T) : void {
        let id: number = this._byIndex[index];
        this._byId[id] = { index: index, value: value };
    }

    getId(index: number) : number {
        return this._byIndex[index];
    }
    
    getIndex(id: number) : number {
        return this._byId[id].index;
    }
}


class IndexValue<T> {
    index: number;
    value: T;
}

