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
    * [4.1. How to write a constant value](#41-how-to-write-a-constant-value)
    * [4.2. How to write a formula](#42-how-to-write-a-formula)
    * [4.3. How to write an iterator](#43-how-to-write-an-iterator)
* [5. API Reference](#5-api-reference)
    * [5.1. Error codes](#51-error-codes)
    * [5.2. __ _ref_ __ Object](#52-ref-objects)
    * [5.3. __ _value_ __ Function](#53-value-function)
    * [5.4. __ _foreach_ __ Function](#54-foreach-function)
    * [5.5. Built-In Libraries](#55-built-in-libraries)
        * [5.5.1. __ _libs/aggregates.js_ __ Library](#551-aggregates)
        * [5.5.2. __ _libs/fillers.js_ __ Library](#552-fillers)
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
### 4.1. How to write a constant value

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


### 4.2. How to write a formula

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
"_add the values of cell(x,y) and cell(v,w)_".
In that case you can take a shortcut:
```javascript
= value({ "row": x, "col": y }) + value({ "row": v, "col": w })
``` 

Notice the "=" prefix.
It instructs calc.js to translate the above shortcut to the following function definition:
```javascript
function() {
    return /* the expression after the = sign */;
}
``` 


### 4.3. How to write an iterator



## 6. Platform Internals

__Note__: It is not recommended for calc apps to use these internal components directly.
This section is provided for advanced calc app developers to understand how the platform works.
  
All objects belong to the ___calcjs__ namespace. 
The namespace is intentionally prefixed with "_" to avoid any accidental use.

This section only provides an overview of the functionality exposed by each platform
component.
For details on any particular API, please refer to the header comments in the 
source tree - [src/platform/calcjs](../src/platform/calcjs).


### 6.1. App

This component represents a static calc model - values and formulas.

This component also contains and manipulates a list of user-provided libraries.
In order to upload an app to a store, any such user-provided library must
be referenced using an absolute URI or it must be built-in.  

This component doesn't contain any transient state related to a current execution. 
That is stored in the app session.

#### Serialization Format
This component can be serialized and deserialized without any loss.

> __TODO:__ Define the exact format here. 


### 6.2. App Session

This component wraps around an app and adds transient state related to the app's execution.
Decoupling this state from the app allows apps to be executed concurrently
by the same hosting service.

The cell definitions from the app are expanded and stored in a two-dimentional 
JavaScript array.
That array should not be accessed directly.
There is a public function for that purpose.


### 6.3. Processor

This component recalculates the formula graphs when needed.
It wraps a static app in a transient app session.
Thus an app can be loaded and executed as part of multiple app sessions concurrently.

