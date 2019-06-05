const memorySym = Symbol('memory');
const typeSym = Symbol('type');

export interface AllowedObject extends Object {
    [key: string]: any;
};

export type AllowedTypes = AllowedObject | Array<AllowedObject | any> | any;

type ObjectMemory = {
    [key: string]: {
        action: 'added' | 'deleted' | 'updated';
        value?: any;
    };
};

type ArrayMemory = {
    initialLength: number;
    length: number;
    updates: {
        [key: number]: any;
    }
};


export const sentient = <INPUT extends AllowedTypes>(x: INPUT): INPUT => {
    if (Array.isArray(x)) {
        x[typeSym] = 'array';

        x = x.map((item: any) => sentient(item));

        const mem: ArrayMemory = x[memorySym] = {
            initialLength: x.length,
            length: x.length,
            updates: {}
        };

        return new Proxy((<any>x), {
            set: (arr: Array<any>, key: number | string, val: any) => {
                
                if (key === 'length') {

                    mem.length = val;
                    arr.length = <number>val;

                    return true;
                }

                const i: number = <number>key;
                
                mem.updates[i] = val;
                arr[i] = val;

                return true;
            },
            deleteProperty: (arr: Array<any>, key: number): boolean => {
                if (!(key in arr)) {
                    return false;
                }

                mem.updates[key] = undefined;
                delete arr[key];

                return true;
            }
        });

    } else if (x.constructor === Object) {
        x = {...x};

        x[typeSym] = 'object';

        const mem: ObjectMemory = x[memorySym] = {};

        Object.keys(x).forEach(key => {
            x[key] = sentient(x[key]);
        });

        return new Proxy((<any>x), {
            set: (obj: AllowedObject, key: string, val: any) => {
                if (key in obj || key in mem) {
                    if (obj[key] !== val) {
                        mem[key] = {
                            action: 'updated',
                            value: val
                        };
                    }
                } else {
                    mem[key] = {
                        action: 'added',
                        value: val
                    };
                }

                obj[key] = val;

                return true;
            },
            deleteProperty: (obj: AllowedObject, key: number): boolean => {
                if (!(key in obj)) {
                    return false;
                }

                mem[key] = {
                    action: 'deleted'
                };

                delete obj[key];

                return true;
            }
        });

    } else {
        return x;
    }
}

export const isSentient = (x: Object): boolean => memorySym in x;
export const getType = (x: Object): 'array' | 'object' => ((<any>x)[typeSym]);

interface ChangeInterface {
    action: 'add' | 'delete' | 'truncate' | 'update';
    key: Array<string>,
    value?:any;
}

export const getChanges = (x: AllowedTypes): Array<ChangeInterface> => {
    if (x.constructor === Object && isSentient(x)) {
        const mem: ObjectMemory = x[memorySym];
        const changes: ChangeInterface[] = [];

        Object.keys(mem).forEach((key) => {
            const val = mem[key];

            changes.push({
                action: <'delete' | 'add' | 'update'>({
                    deleted: 'delete',
                    added: 'add',
                    updated: 'update'
                }[val.action]),
                key: [key],
                value: val.value
            });
        });

        Object.keys(x).forEach((key) => {
            const val = x[key];

            getChanges(val).forEach((change: ChangeInterface) => {
                change.key.unshift(key);
                changes.push(change);
            });
        });

        return changes;

    } else if (x.constructor === Array && isSentient(x)) {
        console.log('HERE');

        const mem: ArrayMemory = x[memorySym];
        const changes: ChangeInterface[] = [];

        if (mem.initialLength > mem.length) {
            changes.push({
                action: 'truncate',
                key: [],
                value: mem.length
            });
        }

        Object
            .keys(mem.updates)
            .map(key => parseInt(key))
            .forEach(i => {
                if (i >= mem.initialLength && mem.length > mem.initialLength) {
                    changes.push({
                        action: 'add',
                        key: [],
                        value: mem.updates[i]
                    });
                } else if (i < mem.initialLength && i < mem.length) {
                    changes.push({
                        action: 'update',
                        key: [`${i}`],
                        value: mem.updates[i]
                    });
                }
            });

        x.forEach((item: AllowedTypes, i: number) => {
            getChanges(item).forEach((change: ChangeInterface) => {
                change.key.unshift(`${i}`);
                changes.push(change);
            });
        });

        return changes;
    } else {
        return [];
    }
}

export default sentient;