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
    private count: number;
    private nextId: number;
    private byId: SparseArray<Link<T>> = new SparseArray<Link<T>>();
    private byIndex: SparseArray<Link<T>> = new SparseArray<Link<T>>();
    
    public insert(index: number, count?: number) : void {
        if (count == undefined) {
            count = 1;
        }
        
        for (let i: number = this.count - 1; index <= i; i--) {
            this.byIndex[i + count] = this.byIndex[i]; 
        }
        
        for (let i: number = 0; i < count; i++) {
            let value: T = undefined;
            this.byId[this.nextId] = { link: index + i, value: value };
            this.byIndex[index + i] = { link: this.nextId, value: value };
            this.nextId++;
        }
        
        this.count += count; 
    }
    
    public delete(index: number, count?: number) : void {
        if (count == undefined) {
            count = 1;
        }

        for (let i: number = 0; i < count; i++) {
            let id: number = this.byIndex[index + i].link; 
            delete this.byId[id];
            delete this.byIndex[index + i];
        }

        for (let i: number = index; i < this.count; i++) {
            this.byIndex[i + count] = this.byIndex[i]; 
        }
        
        this.count -= count; 
    }
    
    public getById(id: number) : T {
        let link: Link<T> = this.byId[id];
        return link ? link.value : undefined;
    }
    
    public setById(id: number, value: T) : void {
        this.byId[id].value = value;
    }
    
    public getByIndex(index: number) : T {
        let link: Link<T> = this.byIndex[index];
        return link ? link.value : undefined;
    }

    public setByIndex(index: number, value: T) : void {
        this.byIndex[index].value = value;
    }
}


class Link<T> {
    public link: number;
    public value: T;
}

