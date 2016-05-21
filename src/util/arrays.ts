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
import * as Util_JSON from "./json";


export class Stack<T> extends Array<T> {
    peek(i?: number): T {
        if (i === undefined) {
            i = 0;
        }
        
        return this.length > 0 ? this[this.length - 1 - i] : undefined;
    }
}


export class SparseArray<T> implements Util_JSON.Portable {
    [index: number]: T;
    newT: () => T;
    
    constructor(newT: () => T) {
        this.newT = newT;
    }
    
    export(format: Util_JSON.PortableFormat) : any {
        let data: any = new Object();
        this.forEach(i => {
            data[i] = Util_JSON.PortableUtil.export(this[i], format);
        });
        
        return data;
    }
    
    import(format: Util_JSON.PortableFormat, data: any) : void {
        this.forEach(i => {
            delete this[i];
        });
        
        for (let key in data) {
            let i: number = parseInt(key);
            this.importElement(i, format, data);
        }
    }
    
    importElement(i: number, format: Util_JSON.PortableFormat, data: any) : void {
        if (Util_JSON.PortableUtil.isImportable(this[i])) {
            this[i] = this.newT();
            (<Util_JSON.Portable><any>this[i]).import(format, data);
        }
        else {
            return this[i] = data[i];
        }
    }
    
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
    
    isEmpty() : boolean {
        let count1: number = this.forEachWhile((i: number) => {
           return false; 
        });
        
        return count1 > 0;
    }
    
    forEach(callback: (i: number) => void) : void {
        this.forEachWhile((i: number) => {
            callback(i);
            return true;
        });
    }

    forEachWhile(callback: (i: number) => boolean) : number {
        let count: number = 0;
        for (let s in this) {
            let i = parseInt(s);
            if (!isNaN(i)) {
                count++;
                if (!callback(i)) {
                    break;
                }
            }
        }
        
        return count;
    }
}


export class DualSparseArray<T> implements Util_JSON.Portable {
    nextId: number;
    byId: SparseArray<IndexValue<T>>;
    byIndex: SparseArray<number>;
    newT: () => T;
    
    constructor(newT: () => T) {
        this.nextId = 0;
        this.byId = new SparseArray<IndexValue<T>>(() => new IndexValue(0, newT()));
        this.byIndex = new SparseArray<number>(() => 0);
        this.newT = newT;
    }
    
    export(format: Util_JSON.PortableFormat) : any {
        let data: any = new Object();
        data.nextId = this.nextId;
        data.byId = this.byId.export(format);
        data.byIndex = this.byIndex.export(format);
        
        return data;
    }
    
    import(format: Util_JSON.PortableFormat, data: any) : void {
        this.nextId = data.nextId;
        this.byId = new SparseArray<IndexValue<T>>(() => new IndexValue(0, this.newT()));
        this.byId.import(format, data);
        this.byIndex = new SparseArray<number>(() => 0);
        this.byIndex.import(format, data);
    }
    
    shiftUp(index: number, count?: number) : void {
        if (index < 0) {
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange);
        }
        
        if (count == undefined) {
            count = 1;
        }
        
        // Shift up the indeces higher than index.
        this.byId.forEach(i => {
            if (this.byId[i].index >= index) {
                // Delete the stale index and stale id.
                let staleIndex = this.byId[i].index; 
                let staleId: number = this.byIndex[staleIndex + count];
                delete this.byIndex[staleIndex];
                delete this.byId[staleId];
                 
                this.byId[i].index += count;
                this.byIndex[this.byId[i].index] = i;
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
        this.byId.forEach(i => {
            if (this.byId[i].index >= index) {
                // Delete the stale index and stale id.
                let staleIndex = this.byId[i].index; 
                let staleId: number = this.byIndex[staleIndex - count];
                delete this.byIndex[staleIndex];
                delete this.byId[staleId];
                 
                this.byId[i].index -= count;
                this.byIndex[this.byId[i].index] = i;
            }
        });
    }
    
    getById(id: number) : T {
        let indexValue: IndexValue<T> = this.byId[id];
        return indexValue === undefined ? undefined : indexValue.value;
    }
    
    setById(id: number, value: T) : void {
        if (this.byId[id] === undefined) {
            // Add a new element by id is not supported because the index cannot be determined.
            // New elements may only be added by index.
            throw new Util_Errors.Exception(Util_Errors.ErrorCode.IndexOutOfRange);
        }
        
        this.byId[id].value = value;
    }
    
    getByIndex(index: number) : T {
        let id: number = this.byIndex[index];
        if (id === undefined) {
            return undefined;
        }
        
        return this.getById(id);
    }

    setByIndex(index: number, value: T) : void {
        let id: number = this.byIndex[index];
        if (id === undefined) {
            id = this.nextId++;
            this.byIndex[index] = id;
        }
        
        this.byId[id] = new IndexValue(index, value);
    }

    getId(index: number) : number {
        return this.byIndex[index];
    }
    
    getIndex(id: number) : number {
        return this.byId[id].index;
    }
}


class IndexValue<T> implements Util_JSON.Portable {
    index: number;
    value: T;
    
    constructor(index: number, value: T) {
        this.index = index;
        this.value = value;
    }
    
    export(format: Util_JSON.PortableFormat) : any {
        return { 
            index: this.index, 
            value: Util_JSON.PortableUtil.export(this.value, format)  
        };
    }
    
    import(format: Util_JSON.PortableFormat, data: any) : void {
        this.index = data.index;
        this.value = <T>data.value;
    }
}

