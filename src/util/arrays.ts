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
    
    add(value: T) : number {
        for (let i: number = 0; i < Number.MAX_VALUE; i++) {
            if (this[i] === undefined) {
                this[i] = value;
                return i;
            }
        }
        
        throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange, "Cannot add a new value because this SparseArray is completely full.");
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
    _nextId: number = 0;
    _byId: SparseArray<IndexValue<T>> = new SparseArray<IndexValue<T>>();
    _byIndex: SparseArray<number> = new SparseArray<number>();
    
    shiftUp(index: number, count?: number) : void {
        if (index < 0) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange);
        }
        
        if (count == undefined) {
            count = 1;
        }
        
        // Shift up the indeces higher than index.
        this._byId.forEach(i => {
            if (this._byId[i].index >= index) {
                // Delete the stale index and stale id.
                let staleIndex = this._byId[i].index; 
                let staleId: number = this._byIndex[staleIndex + count];
                delete this._byIndex[staleIndex];
                delete this._byId[staleId];
                 
                this._byId[i].index += count;
                this._byIndex[this._byId[i].index] = i;
            }
        });
    }
    
    shiftDown(index: number, count?: number) : void {
        if (index < 0) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange);
        }
        
        if (count == undefined) {
            count = 1;
        }
        
        // Shift down the indeces higher than index.
        this._byId.forEach(i => {
            if (this._byId[i].index >= index) {
                // Delete the stale index and stale id.
                let staleIndex = this._byId[i].index; 
                let staleId: number = this._byIndex[staleIndex - count];
                delete this._byIndex[staleIndex];
                delete this._byId[staleId];
                 
                this._byId[i].index -= count;
                this._byIndex[this._byId[i].index] = i;
            }
        });
    }
    
    getById(id: number) : T {
        let indexValue: IndexValue<T> = this._byId[id];
        return indexValue === undefined ? undefined : indexValue.value;
    }
    
    setById(id: number, value: T) : void {
        if (this._byId[id] === undefined) {
            // Add a new element by id is not supported because the index cannot be determined.
            // New elements may only be added by index.
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange);
        }
        
        this._byId[id].value = value;
    }
    
    getByIndex(index: number) : T {
        let id: number = this._byIndex[index];
        if (id === undefined) {
            return undefined;
        }
        
        return this.getById(id);
    }

    setByIndex(index: number, value: T) : void {
        let id: number = this._byIndex[index];
        if (id === undefined) {
            id = this._nextId++;
            this._byIndex[index] = id;
        }
        
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

