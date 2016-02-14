# The calc.js Book

_Calculations on every device!_


* [1. Overview](#1-overview)
    * [1.1. Spreadsheet](#11-spreadsheet)
    * [1.2. Calc App](#12-calc-app)
    * [1.3. Calc User Roles](#13-calc-user-roles)
    * [1.4. Calculation as a Service](#14-calculation-as-a-service)
    * [1.5. UX](#15-ux)
    * [1.6. Extensibility](#16-extensibility)
* [2. Use Case](#2-use-case)
* [3. Platform Specification](#3-platform-specification)
* [4. API Reference](#4-api-reference)



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



## 2. Use Case

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



## 3. Platform Specification

__Note__: It is not recommended for calc apps to use these internal components directly.
It is provided for advanced calc app developers to understand how the platform works.
  
All objects belong to the ___calcjs__ namespace. 
The namespace is intentionally prefixed with "_" to avoid any accidental use.

This section only provides an overview of the functionality exposed by each platform
component.
For details on any particular API, please refer to the header comments in the source tree.


### 3.1. App

#### Source Code Location
[src/calcjs/app.ts](../src/calcjs/app.ts)

#### Purpose
This component contains and manipulates everything related to values and formulas.
The cells are stored in a 2-dimentional array.
However, that array should not be accessed directly.
There is a public function for that purpose.

This component also contains and manipulates a list of user-provided libraries.
In order to upload an app to a [store](#34-store), any such user-provided library must
be referenced using an absolute URI.  

This component doesn't contain any transient state related to a current execution. 
That is stored in the [app session](#32-app-session).

#### Dependencies
This component has no dependencies.

[App session](#32-app-session), [Processor](#33-processor), [Store](#34-store), and 
[Designer](#35-designer) depend on this component.

#### Serialization
This component can be serialized and deserialized without any loss.

> __TODO:__ Define the exact format here. 


### 3.2. App Session

### 3.3. Processor
 
### 3.4. Store

### 3.5. Designer



## 4. API Reference
