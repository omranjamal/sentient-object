
# SentientObject
> WHEN OBJECTS COME ALIVVVEEEEE IN THE NIGHT

Javascript objects (object literals and arrays) that keep track of the changes made to them using Proxies and Symbols with no need for diffing or keeping a copy to compare with.

Initially written to sync object changes to a MongoDB persistence layer.

![demo](https://i.imgur.com/pdZH446.png)

## Installation
```bash
yarn add sentient-object
```


## Usage
Just call the exported `sentient` function on an object. This will return a copy of the original object but with tracking.

```Javascript
import {sentient, getChanges} from 'sentient-object';

const obj = sentient({
    name: 'John Doe',
    contacts: {
        email: 'john.doe@does.org',
        phones: ['01043129105', '01016105527']
    },
    age: 32
});

obj.name = 'John H. Doe';
obj.contacts.email = 'john.h.doe@gmail.com';
obj.contacts.phones[0] = '01016105526';
obj.contacts.phones.push('01016105529');
obj.contacts.address = '221B, Baker Street, London';
delete obj.age;


console.log(getChanges(obj));
```
Call the `getChanges` function on the returned object after changes to get an array of changes made to the object.

Output

```Javascript
[
  {
	action: 'update',
	key: [ 'name' ],
	value: 'John H. Doe'
  },
  {
    action: 'delete',
    key: [ 'age' ],
    value: undefined
  },
  {
    action: 'update',
    key: [ 'contacts', 'email' ],
    value: 'john.h.doe@gmail.com'
  },
  {
    action: 'add',
    key: [ 'contacts', 'address' ],
    value: '221B, Baker Street, London'
  },
  {
    action: 'update',
    key: [ 'contacts', 'phones', '0' ],
    value: '01016105526'
  },
  {
    action: 'add',
    key: [ 'contacts', 'phones' ],
    value: '01016105529'
  }
]
```

### Discarding Changes

Calling the exported `clearChanges` function on a sentient object will
discard all changes and simultaneously turn any object in the tree that
supports sentience into an sentient object.

```Typescript
import { sentient, getChanges, clearChanges } from 'sentient-object';

const obj = sentient({
  name: 'Narmo Lamaj'
});

obj.name = 'Simon Baker';

clearChanges(obj);

console.log(getChanges(obj)); // []
```

## Explanation

Every change is an instance of:

```Typescript
interface  ChangeInterface  {
	action:  'add'  |  'delete'  |  'truncate'  |  'update';
	key: Array<string>,
	value?: any;
}
```

Keys are not strings but arrays of strings as keys themselves might have `.` (dot) in them.

Only arrays have the `truncate` action and it only occurs when the final resulting array is smaller than the initial length of the array. If truncation by one is followed by a push no truncation operation is reported in the changes.

## Warnings

Using unshift or doing anything to the start of an array will cause `n` number of changes to be reported about the array due to the very nature of how they operate.

## License
MIT