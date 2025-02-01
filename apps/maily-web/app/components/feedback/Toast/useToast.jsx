"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = void 0;
const zustand_1 = require("zustand");
const uuid_1 = require("uuid");
exports.useToast = (0, zustand_1.create)((set) => ({
    toasts: [],
    addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, Object.assign(Object.assign({}, toast), { id: (0, uuid_1.v4)() })],
    })),
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
