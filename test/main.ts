import {sentient, getChanges} from '../src/SentientObject';

const test = sentient({
    a: 'Apple',
    c: {
        a: 'Animal'
    },
    d: [1, 2, {
        a: 'Acid'
    }]
});

test.a = 'Orange';
(<any>test).b = 'Beluga';
test.c.a = 'Alien';
test.d.push(4);
// test.d.pop();
// test.d.pop();

(<any>test.d[2]).a = 'Antelope';

// console.log(getChanges(test));


// import {sentient} from 'sentient-object';

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
(<any>obj.contacts).address = '221B, Baker Street, London';
delete obj.age;


console.log(getChanges(obj));