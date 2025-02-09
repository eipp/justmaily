"use client";

import { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Paperclip,
  Send,
  Loader2,
  X,
  Command,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useChatStore } from "@/store/chat-store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  operation?: {
    type: string;
    progress: number;
    status: string;
    cancelable: boolean;
  } | null;
}

export function ChatInput({
  onSendMessage,
  disabled,
  operation,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { suggestions, commandHistory } = useChatStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    // TODO: Implement file handling
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // TODO: Implement voice recording
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    // TODO: Implement stop recording
    setIsRecording(false);
  };

  const handleCommandSelect = (command: string) => {
    setMessage(command);
    setIsCommandOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative rounded-lg border bg-background p-2 transition-colors",
          isDragging && "border-primary",
          disabled && "opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10 backdrop-blur-sm">
            <p className="text-sm font-medium">Drop files here</p>
          </div>
        )}

        {operation && (
          <div className="mb-2 space-y-2 rounded-md bg-muted p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{operation.status}</span>
              {operation.cancelable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement cancel
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Progress value={operation.progress} className="h-1" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />

          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex max-h-32 min-h-[2.5rem] w-full resize-none bg-transparent p-2 focus:outline-none disabled:cursor-not-allowed"
              disabled={disabled}
            />
            {suggestions.length > 0 && message && (
              <div className="absolute bottom-full left-0 mb-1 w-full rounded-md border bg-popover p-1 shadow-md">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent"
                    onClick={() => setMessage(suggestion.text)}
                  >
                    <span className="opacity-70">{suggestion.type}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setIsCommandOpen(true)}
            disabled={disabled}
          >
            <Command className="h-5 w-5" />
          </Button>

          <motion.button
            type="button"
            onClick={toggleRecording}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "shrink-0 rounded-full p-2 transition-colors",
              isRecording ? "bg-red-500 text-white" : "hover:bg-muted"
            )}
            disabled={disabled}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </motion.button>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.9 }}
            className="shrink-0 rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={!message.trim() || disabled}
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {message && (
          <div className="mt-1 flex items-center gap-2 px-2">
            <ChevronUp className="h-4 w-4 opacity-50" />
            <span className="text-xs opacity-50">
              Press Enter to send, Shift + Enter for new line
            </span>
          </div>
        )}
      </form>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {suggestions.map((suggestion, index) => (
              <CommandItem
                key={index}
                onSelect={() => handleCommandSelect(suggestion.text)}
              >
                {suggestion.text}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Recent Commands">
            {commandHistory.slice(0, 5).map((command, index) => (
              <CommandItem
                key={index}
                onSelect={() => handleCommandSelect(command.command)}
              >
                {command.command}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
} 