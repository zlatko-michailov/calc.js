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
    public peek(i?: number): T {
        if (!i) {
            i = 0;
        }
        
        return this.length > 0 ? this[this.length - 1 - i] : undefined;
    }
}


export class SparseArray<T> {
    [index: number]: T;
}


export class DualSparseArray<T> {
    private count: number = 0;
    private nextId: number = 0;
    private byId: SparseArray<IndexValue<T>> = new SparseArray<IndexValue<T>>();
    private byIndex: number[] = [];
    
    public insert(index: number, count?: number) : void {
        if (index < 0) {
            index = 0;
        }
        
        if (count == undefined) {
            count = 1;
        }
        
        // Shift the elements to open a gap.        
        for (let i: number = this.count - 1; index <= i; i--) {
            this.byIndex[i + count] = this.byIndex[i];
            
            let id: number = this.byIndex[i];
            this.byId[id].index += count 
        }
        
        // Init the elements in the gap.
        for (let i: number = index; i < index + count; i++) {
            this.byId[this.nextId] = { index: i, value: undefined };
            this.byIndex[i] = this.nextId;
            this.nextId++;
        }

        this.count += count;
    }
    
    public delete(index: number, count?: number) : void {
        if (index < 0) {
            index = 0;
        }
        
        if (count == undefined) {
            count = 1;
        }
        
        // Delete elements. Open a gap.
        for (let i: number = index; i < index + count; i++) {
            let id: number = this.byIndex[i]; 
            delete this.byId[id];
            delete this.byIndex[i];
        }

        // Shift back the elements to close the gap.
        for (let i: number = index; i < this.count - count; i++) {
            this.byIndex[i] = this.byIndex[i + count]; 
        }
        
        // Trim the elements at the end.
        this.byIndex.splice(this.count, count);

        this.count -= count; 
    }
    
    public getById(id: number) : T {
        let indexValue: IndexValue<T> = this.byId[id];
        return indexValue ? indexValue.value : undefined;
    }
    
    public setById(id: number, value: T) : void {
        this.byId[id].value = value;
    }
    
    public getByIndex(index: number) : T {
        let id: number = this.byIndex[index];
        return this.byId[id].value;
    }

    public setByIndex(index: number, value: T) : void {
        let id: number = this.byIndex[index];
        this.byId[id].value = value;
    }

    public getId(index: number) : number {
        return this.byIndex[index];
    }
    
    public getIndex(id: number) : number {
        return this.byId[id].index;
    }
}


class IndexValue<T> {
    public index: number;
    public value: T;
}

