"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = ChatInput;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const progress_1 = require("@/components/ui/progress");
const chat_store_1 = require("@/store/chat-store");
const command_1 = require("@/components/ui/command");
function ChatInput({ onSendMessage, disabled, operation, }) {
    const [message, setMessage] = (0, react_1.useState)("");
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [isCommandOpen, setIsCommandOpen] = (0, react_1.useState)(false);
    const fileInputRef = (0, react_1.useRef)(null);
    const textareaRef = (0, react_1.useRef)(null);
    const { suggestions, commandHistory } = (0, chat_store_1.useChatStore)();
    (0, react_1.useEffect)(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage("");
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };
    const handleFileSelect = (e) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        handleFiles(files);
    };
    const handleFiles = (files) => {
        // TODO: Implement file handling
    };
    const toggleRecording = () => {
        if (!isRecording) {
            startRecording();
        }
        else {
            stopRecording();
        }
    };
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // TODO: Implement voice recording
            setIsRecording(true);
        }
        catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };
    const stopRecording = () => {
        // TODO: Implement stop recording
        setIsRecording(false);
    };
    const handleCommandSelect = (command) => {
        setMessage(command);
        setIsCommandOpen(false);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };
    return (<>
      <form onSubmit={handleSubmit} className={(0, utils_1.cn)("relative rounded-lg border bg-background p-2 transition-colors", isDragging && "border-primary", disabled && "opacity-50")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {isDragging && (<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10 backdrop-blur-sm">
            <p className="text-sm font-medium">Drop files here</p>
          </div>)}

        {operation && (<div className="mb-2 space-y-2 rounded-md bg-muted p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{operation.status}</span>
              {operation.cancelable && (<button_1.Button variant="ghost" size="sm" onClick={() => {
                    // TODO: Implement cancel
                }}>
                  <lucide_react_1.X className="h-4 w-4"/>
                </button_1.Button>)}
            </div>
            <progress_1.Progress value={operation.progress} className="h-1"/>
          </div>)}

        <div className="flex items-center gap-2">
          <button_1.Button type="button" variant="ghost" size="icon" onClick={() => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={disabled}>
            <lucide_react_1.Paperclip className="h-5 w-5"/>
          </button_1.Button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} disabled={disabled}/>

          <div className="relative flex-1">
            <textarea ref={textareaRef} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." rows={1} className="flex max-h-32 min-h-[2.5rem] w-full resize-none bg-transparent p-2 focus:outline-none disabled:cursor-not-allowed" disabled={disabled}/>
            {suggestions.length > 0 && message && (<div className="absolute bottom-full left-0 mb-1 w-full rounded-md border bg-popover p-1 shadow-md">
                {suggestions.map((suggestion, index) => (<button key={index} className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent" onClick={() => setMessage(suggestion.text)}>
                    <span className="opacity-70">{suggestion.type}</span>
                    <span>{suggestion.text}</span>
                  </button>))}
              </div>)}
          </div>

          <button_1.Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setIsCommandOpen(true)} disabled={disabled}>
            <lucide_react_1.Command className="h-5 w-5"/>
          </button_1.Button>

          <framer_motion_1.motion.button type="button" onClick={toggleRecording} whileTap={{ scale: 0.9 }} className={(0, utils_1.cn)("shrink-0 rounded-full p-2 transition-colors", isRecording ? "bg-red-500 text-white" : "hover:bg-muted")} disabled={disabled}>
            {isRecording ? (<lucide_react_1.MicOff className="h-5 w-5"/>) : (<lucide_react_1.Mic className="h-5 w-5"/>)}
          </framer_motion_1.motion.button>

          <framer_motion_1.motion.button type="submit" whileTap={{ scale: 0.9 }} className="shrink-0 rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50" disabled={!message.trim() || disabled}>
            {disabled ? (<lucide_react_1.Loader2 className="h-5 w-5 animate-spin"/>) : (<lucide_react_1.Send className="h-5 w-5"/>)}
          </framer_motion_1.motion.button>
        </div>

        {message && (<div className="mt-1 flex items-center gap-2 px-2">
            <lucide_react_1.ChevronUp className="h-4 w-4 opacity-50"/>
            <span className="text-xs opacity-50">
              Press Enter to send, Shift + Enter for new line
            </span>
          </div>)}
      </form>

      <command_1.CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <command_1.CommandInput placeholder="Type a command or search..."/>
        <command_1.CommandList>
          <command_1.CommandEmpty>No results found.</command_1.CommandEmpty>
          <command_1.CommandGroup heading="Suggestions">
            {suggestions.map((suggestion, index) => (<command_1.CommandItem key={index} onSelect={() => handleCommandSelect(suggestion.text)}>
                {suggestion.text}
              </command_1.CommandItem>))}
          </command_1.CommandGroup>
          <command_1.CommandGroup heading="Recent Commands">
            {commandHistory.slice(0, 5).map((command, index) => (<command_1.CommandItem key={index} onSelect={() => handleCommandSelect(command.command)}>
                {command.command}
              </command_1.CommandItem>))}
          </command_1.CommandGroup>
        </command_1.CommandList>
      </command_1.CommandDialog>
    </>);
}
