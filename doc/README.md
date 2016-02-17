# The calc.js Book

_Complex calculations for every device!_


* [1. Overview](#1-overview)
    * [1.1. Spreadsheet](#11-spreadsheet)
    * [1.2. Calc App](#12-calc-app)
    * [1.3. Calc User Roles](#13-calc-user-roles)
    * [1.4. Calculation as a Service](#14-calculation-as-a-service)
    * [1.5. UX](#15-ux)
    * [1.6. Extensibility](#16-extensibility)
* [2. How calc.js Can Be Used](#2-how-calcjs-can-be-used)
* [3. How calc.js Works](#3-how-calcjs-works)
* [4. Tutuorial](#4-tutorial)
    * [4.1. How to Write a Constant Value](#41-how-to-write-a-constant-value)
    * [4.2. How to Write a Formula](#42-how-to-write-a-formula)
    * [4.3. How to Write an Iterator](#43-how-to-write-an-iterator)
    * [4.4. How to Import a Custom Library](#44-how-to-import-a-custom-library)
* [5. API Reference](#5-api-reference)
    * [5.1. Global Objects and Functions](#51-global-objects-and-functions)
        * [5.1.1. Error Codes](#511-error-codes)
        * [5.1.2. ``ref`` Object](#512-ref-object)
        * [5.1.3. ``rc`` and ``cr`` Functions](#513-rc-and-cr-functions)
        * [5.1.4. ``value`` Function](#514-value-function)
        * [5.1.5. ``foreach`` Function](#515-foreach-function)
    * [5.2. Built-In Libraries](#56-built-in-libraries)
        * [5.2.1. ``libs/aggregates.js``](#521-libsaggregatesjs)
* [6. Platform Internals](#6-platform-internals)
    * [6.1. App](#61-app)
    * [6.2. App Session](#62-app-session)
    * [6.3. Processor](#63-processor)



## 1. Overview
### 1.1. Spreadsheet

Ever since the spreadsheet was invented, it's been bound to the desktop executable 
that brings it to life - Excel, Lotus, OpenOffice, etc. 
That led to two problems that we can no longer bear:
1. Calculations can only be performed on devices where the hosting executable
can (and is licensed to) run.
2. All calc apps have the same spreadhseet look an feel.      


### 1.2. Calc App

> __The most fundamental tenet in calc.js is the decoupling of the calc app from
> the calc engine and from the UI.__

First, what's a calc app? A calc app consists of spreadsheet cell definitions -
formulas and values, plus some calculation-related settings.

A calc app typically has one or more independent (input) data cells and
one or more calculation graphs that depend on the input data cells.
Some calculated cells are "interesting" for consumption (output). 


### 1.3. Calc User Roles

* __Calc Model Designer__ - a person who uses a UI tool to design or update 
a calculation model.
The calc app modeler may publish the calc app to a cloud service where it could be
executed remotely.
* __Mobile App Developer__ - a person that develops a mobile app
(that runs on devices with limited capabilities). 
A mobile app POSTs input values to a cloud service that hosts a given calc app,
and then GETs the output values from the calc app.
* __Mobile User__ - a person who's holding a mobile device where a mobile app
that calls into a calc app in the cloud is running.


### 1.4. Calculation as a Service

As already hinted, it is intended for calc apps to run in the cloud.
That way, mobile apps can consume complex calculations on any device.


### 1.5. UX

This model enables mobile apps to remain the center of UX -
they consume the calc app as a service and provide the most appropriate UX for the
problem they are solving. 


### 1.6. Extensibility

calc.js is based on JavaScript - formulas are provided as JavaScript functions
(or JavaScript expressions for convenience). 
Thus a formula can reference any JavaScript API.
Furthermore, the calc model designer can import custom JavaScript files.
Lastly, although not recommended, a formula can reference any calc.js internal API.



## 2. How calc.js Can Be Used

1. (Done once.)
A _calc model designer_ uses a UI tool to design a calc model:
    * The calc model designer saves the calc model as a _calc app_.
    * The calc model designer uploads the calc app to a _calc app store_.
2. (Done many times repeatedly and concurrently.) 
A _mobile app developer_ develops a mobile app that consumes the calc app as a service:
    * The mobile app creates a _calc app session_ at a _calc service_ that can
execute apps from the above calc app store.
    * The mobile app POSTs values to the necessary cells.
    * The mobile app GETs the values of some calculated cells.
    * The mobile app renders the result to the user in its own way. 



## 3. How calc.js Works

A calc app contains a two-dimentional JavaScript array of cells where each cell
contains a JavaScript function along with its currently calculated value.
Cell functions reference other cells' values.
Thus one or more dependency graphs are formed. 
Whenever a cell's function or value changes, the dependency graphs get recalculated.

calc.js provides 1 essential function that accesses a cell's value.
That function detects wrong references as well as circular dependencies.
Everything else is naturally handled by the JavaScript engine.   



## 4. Tutuorial
### 4.1. How to Write a Constant Value

The simplest way to write a constant value is to write a literal:
```javascript
42
"foo"

// You probably didn't think about these:
[ 42, 99.9, 1234 ]
{ "name": "foo", "value": "bar" }
```

Or, you can invoke an existing function to capture its result:
```javascript
new Date(2016, 02, 14, 21, 50, 0, 0)
(new Date()).getDay()
```

Or, you can define a function and invoke it on the spot.
This will not store the function as a formula.
It will only store its result as a value.
That function will never be executed again:
```javascript
// I bet you didn't think about this:
(function() {
    // Concatenate the first 10 Fibonacci numbers
    var result = "1 1";
    var fib2 = 1;
    var fib1 = 1;
    
    for (var i = 2; i < 10; i++) {
        var fib = fib2 + fib1;
        result += " " + fib.toString();
        fib2 = fib1;
        fib1 = fib;
    }
    
    return result;
 })()
```


### 4.2. How to Write a Formula

Formulas are simply JavaScript functions with no parameters.
```javascript
function() {
    // Write anything you wish.
    // Return whatever you wish - object, array, another function (???).
    
    // The function may have side effects on other cells (!!!)
    // though be careful with that.
    // In that case the function need not return a result.
}
``` 

In most cases you'll need to write a simple expression like: 
"_add the values of cell(r1,c1) and cell(r2,c2)_".
In that case you can take a shortcut:
```javascript
= value(rc(r1,c1) + value(rc(r2,c2))
``` 

Notice the "=" prefix.
It instructs calc.js to translate the above shortcut to the following function definition:
```javascript
function() {
    return /* the expression after the = sign */;
}
``` 


### 4.3. How to Write an Iterator

One big thing that traditional spreadhseet programs lack is callbacks.
calc.js makes JavaScript callbacks available to the calc app developer through
the ``foreach`` function.

```javascript
function sum(ref1, ref2) {
    // Initialize the sum to 0.
    var s = 0;
    
    // Iterate over the range cells
    foreach(ref1, ref2, function(ref) {
	   // If a cell has a number value, add it to the sum.
       var v = value(ref);
       if (hasValue(ref) && typeof v == "number") {
           s += v;
       } 
    });
    
    // Return the accumulated sum.
    return s;
}
```

__Note__: You can also write iterators that have side effects - 
iterators that change other cells.


### 4.4. How to Import a Custom Library

calc.js libraries are just JavaScript files.
It is recommended that a library has no dependencies or depends only on built-in libraries.
That is because calc.js has no mechanism to track function dependencies.
If you still want to break your own support functionality into smaller libraries,
name the files using a "prefix" notation that would suggest to the user that library
_foo.bar.js_ depends on library _foo.js_.


You have to explicitly import the desired libraries into the calc apps that need them.
Ultimately, that will reflect on the calc app serialization file.

To do it interactively, look up the documentation for the UI tool you are using to
design your app.
 
Keep in mind that libraries are "_referenced_", not "_embedded_", i.e.
if a library changes after the app has been written, it may affect the app's behavior.

If you plan to use the calc app that imports a particular library only locally,
then there is no restriction on the location of the JavaScript library.
However, if you plan to upload that calc app to a remote service, then the library
must be accessible from the service.
    


## 5. API Reference
### 5.1. Global Objects and Functions

#### 5.1.1. Error Codes

All error codes are strings values.

##### 5.1.1.1. ``"#REF!"``
__Bad Reference__ - a formula is trying to referece a non-existent cell. 

##### 5.1.1.2. ``"#CIRC!"``
__Circular Dependency__ - a circular dependency has been detected during calculation.

##### 5.1.1.3. ``"#EVAL!"``
__Evaluation Error__ - a formula's evaluation has thrown an exception.

##### 5.1.1.4. ``"#VOID!"``
__Void Formula__ - a formula doesn't return a result.
Most likely that formula has side effects.


#### 5.1.2. ``ref`` Object
An instance of the ``ref`` object is used to reference a cell.
All built-in functions that access cells or ranges of cells take a paramater of this type.

```javascript
{
    row: "<row id>",
    col: "<col id>"
    sheet: "<sheet id>",
}
``` 

##### Example

```javascript
{
    row: "a2s4f",
    col: "w6g1r"
    sheet: "k5j2h",
}
``` 


#### 5.1.3. ``rc`` and ``cr`` Functions

These are convenience shortcuts that construct and return a ``ref`` object.
These functions convert the row and column indeces into ID's.
That is important because the row/column index of a cell may change when rows/columns
are added/deleted while the row/column ID's a permanent.

Just like some people are half-full'ers while others are half-empty'ers, 
some people are row-col'ers while other s are col-row'ers.
That's why calc.js offers a shortcut for each kind of people.
 ``rc`` takes row first than column while ``cr`` takes column first then row.
 The sheet parameter is optional for both functions.

```javascript
function rc(row, col, sheet) ... 
function cr(col, row, sheet) ... 
```

##### Example

```javascript
// References the cell at row 10, column 15.
rc(10,15) 
```


#### 5.1.4. ``value`` Function

This function gets the value of a given cell refernced by the given ``ref`` parameter.

```javascript
function value(ref) ... 
```

##### Example

```javascript
// Gets the value of the cell at row 10, column 20.
value(rc(10,20)) 
```


#### 5.1.5. ``foreach`` Function

This function invokes the given callback for each cell of the specified range
passing in the current cell's reference.

```javascript
function foreach(ref1, ref2, callback) ... 
```

##### Example

```javascript
// Gets the maximum value in the given range.
function max(ref1, ref2) {
    // Initialize the max to "unset".
    var mx = null;
    
    // Iterate over the range cells
    foreach(ref1, ref2, function(ref) {
	   // If a cell has a number value, consider it.
       var v = value(ref);
       if (hasValue(ref) && typeof v == "number" &&
           (mx == null || mx < v)) {
           mx = v;
       } 
    });
    
    // Return the accumulated max value.
    return mx;
}
```



### 5.2. Built-In Libraries

#### 5.2.1. ``libs/aggregates.js``

This library contains essential aggregate functions.
All of these functions take two cell references that represent opposite corners
of a range.
They take into account ``number`` values and ignore all other values.

```javascript
// Average 
function avg(ref1, ref2) ...

// Count 
function count(ref1, ref2) ...

// Maximum 
function max(ref1, ref2) ...

// Minimum 
function min(ref1, ref2) ...

// Sum 
function sum(ref1, ref2) ...
```



## 6. Platform Internals

__Note__: It is not recommended for calc apps to use these internal components directly.
This section is provided for advanced calc app developers to understand how the platform works.
  
All objects belong to the ``_calcjs`` namespace. 
The namespace is intentionally prefixed with "_" to avoid any accidental use.

This section only provides an overview of the functionality exposed by each platform
component.
For details on any particular API, please refer to the header comments in the 
source tree - [src/platform/calcjs](../src/platform/calcjs).


### 6.1. App

An app represents a static calc model - values and formulas.
It also contains and manipulates a list of user-provided JavaScript libraries.

An app doesn't contain any transient state related to a current execution. 
That is stored in the app session.

#### Serialization Format
An app can be serialized and deserialized without any loss.
That's how an app can get uploaded to a store and fetched from a store.

> __TODO:__ Define the exact format here. 


### 6.2. App Session

An app session wraps around an app and adds transient state related to the app's execution.
Decoupling this state from the app allows apps to be executed concurrently
by the same hosting service.

The cell definitions from the app are expanded and stored in a two-dimentional 
JavaScript array.
That array should not be accessed directly.
There is a public function for that purpose.


### 6.3. Processor

A processor recalculates the formula graphs when needed.
It wraps a static app in a transient app session.
Thus an app can be loaded and executed as part of multiple app sessions concurrently.

