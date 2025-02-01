"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastContainer = void 0;
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const useToast_1 = require("./useToast");
const Toast_1 = require("./Toast");
const ToastContainer = () => {
    const { toasts } = (0, useToast_1.useToast)();
    return (<div className="fixed bottom-4 right-4 z-50">
      <framer_motion_1.AnimatePresence>
        {toasts.map((toast) => (<framer_motion_1.motion.div key={toast.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }} className="mb-2">
            <Toast_1.Toast {...toast}/>
          </framer_motion_1.motion.div>))}
      </framer_motion_1.AnimatePresence>
    </div>);
};
exports.ToastContainer = ToastContainer;
