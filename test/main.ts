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

console.log(getChanges(test));