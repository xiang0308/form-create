import {isNumeric, uniqueId, toLine, isUndef, extend, toString, deepExtend, errMsg, $set, isString} from "../core/util";

export default class Handler {

    constructor(vm, _rule, Render, options, noValue) {

        const rule = parseRule(_rule, vm, noValue);

        this.rule = rule;
        this.noValue = noValue;
        this.type = toString(rule.type).toLowerCase();
        this.isDef = true;
        this.vm = vm;
        this.el = {};
        this.watch = [];
        this.root = [];
        this.origin = [];

        if (!rule.field && noValue) {
            this.field = 'tmp' + uniqueId();
            this.isDef = false;
        } else {
            this.field = rule.field;
        }

        this.init();
        this.refresh();
        this.refName = '__' + this.field + this.id;

        if (isUndef(rule.props.elementId))
            $set(rule.props, 'elementId', this.unique);

        this.render = new Render(vm, this, options);
    }

    refresh() {
        const id = uniqueId();
        this.id = id;
        this.unique = 'fc_' + id;
        this.key = 'key_' + id;
        this.parseValue = this.toFormValue(this.rule.value);
        return this;
    }


    init() {

    }

    toFormValue(value) {
        return value;
    }

    toValue(parseValue) {
        return parseValue;
    }

    setValue(value) {
        this.rule.value = value;
        this.vm._changeValue(this.field, value);
    }

    getValue() {
        return this.vm._value(this.field);
    }

    watchValue(n) {
        $set(this.rule, 'value', n);
        this.vm._changeFormData(this.field, this.toFormValue(n));
    }

    watchFormValue(n) {
    }

    reset() {
        this.vm._changeValue(this.field, this.defaultValue);
    }

    mounted() {
        let refName = 'fItem' + this.refName, vm = this.vm, children = this.rule.children;
        this.el = vm.$refs[this.refName];
        this.defaultValue = this.toValue(vm.$refs[refName]
            ? vm.$refs[refName].initialValue : deepExtend({}, {value: this.rule.value}).value);
        if (Array.isArray(children) && children.length > 0)
            children.forEach(child => !isString(child) && child.__handler__.mounted());
    }
}

export function defRule() {
    return {
        validate: [],
        event: {},
        col: {},
        emit: [],
        props: [],
        on: {},
        options: [],
        title: '',
        value: '',
        field: '',
        className: ''
    }
}

export function parseRule(rule, vm, noVal) {

    const def = defRule();
    Object.keys(def).forEach((k) => {
        if (isUndef(rule[k]))
            $set(rule, k, def[k]);
    });

    const parseRule = {
        col: parseCol(rule.col),
        props: parseProps(rule.props),
        emitEvent: parseEmit(rule.field, rule.emitPrefix, rule.emit, vm),
        validate: parseArray(rule.validate),
        options: parseArray(rule.options)
    };

    parseRule.event = extend(parseEvent(rule.event), parseRule.emitEvent);
    parseRule.on = parseOn(rule.on, parseRule.emitEvent);

    Object.keys(parseRule).forEach((k) => {
        $set(rule, k, parseRule[k]);
    });

    if (!rule.field && !noVal) {
        console.error('规则的 field 字段不能空' + errMsg());
    }

    return rule
}

export function parseOn(on, emitEvent) {
    if (Object.keys(emitEvent).length > 0)
        extend(on, emitEvent);
    return on;
}

export function parseArray(validate) {
    return Array.isArray(validate) ? validate : []
}

export function parseEmit(field, emitPrefix, emit, vm) {
    let event = {};

    if (!Array.isArray(emit)) return event;

    emit.forEach((eventName) => {

        const fieldKey = toLine(`${field}-${eventName}`).replace('_', '-');

        const emitKey = emitPrefix ? ((`${emitPrefix}-`).toLowerCase() + toLine(eventName)) : emitPrefix;

        event[`on-${eventName}`] = event[eventName] = (...arg) => {
            vm.$emit(fieldKey, ...arg);
            if (emitKey && fieldKey !== emitKey)
                vm.$emit(emitKey, ...arg);
        };
    });

    return event
}

export function parseEvent(event) {
    Object.keys(event).forEach(function (eventName) {
        const _name = toString(eventName).indexOf('on-') === 0 ? eventName : `on-${eventName}`;

        if (_name !== eventName) {
            $set(event, _name, event[eventName]);
        }
    });

    return event
}

export function parseProps(props) {
    if (isUndef(props.hidden))
        $set(props, 'hidden', false);
    if (isUndef(props.visibility))
        $set(props, 'visibility', false);

    return props
}

export function parseCol(col) {
    if (isNumeric(col)) {
        return {span: col};
    } else if (col.span === undefined)
        $set(col, 'span', 24);

    return col
}
