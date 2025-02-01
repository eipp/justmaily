"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/store/chat-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ChatMessagesProps {
  messages: Message[];
  onRetry?: (id: number) => void;
  onAction?: (id: number, action: string) => void;
}

const MessageIcon = ({ type }: { type: Message["type"] }) => {
  switch (type) {
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "system":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};

export function ChatMessages({
  messages,
  onRetry,
  onAction,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAction = (messageId: number, action: string) => {
    onAction?.(messageId, action);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative flex items-start gap-4 rounded-lg p-4",
              message.type === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : message.type === "error"
                ? "bg-destructive/10"
                : message.type === "warning"
                ? "bg-yellow-500/10"
                : message.type === "success"
                ? "bg-green-500/10"
                : "bg-muted"
            )}
          >
            <div className="flex-1 space-y-2">
              {message.type !== "user" && (
                <div className="flex items-center gap-2">
                  <MessageIcon type={message.type} />
                  <span className="text-xs font-medium">
                    {message.type.charAt(0).toUpperCase() +
                      message.type.slice(1)}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {message.metadata?.expandable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => onAction?.(message.id, "toggle")}
                  >
                    {message.metadata.expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="ml-1 text-xs">
                      {message.metadata.expanded ? "Show less" : "Show more"}
                    </span>
                  </Button>
                )}

                {message.status === "generating" && (
                  <div className="space-y-2">
                    <Progress
                      value={message.metadata?.progress}
                      className="h-1"
                    />
                    <p className="text-xs opacity-70">
                      {message.metadata?.progress
                        ? `${Math.round(message.metadata.progress)}%`
                        : "Generating..."}
                    </p>
                  </div>
                )}

                {message.metadata?.actions && (
                  <div className="flex flex-wrap gap-2">
                    {message.metadata.actions.map((action) => (
                      <Button
                        key={action.action}
                        variant={
                          action.type === "destructive"
                            ? "destructive"
                            : action.type === "secondary"
                            ? "secondary"
                            : "default"
                        }
                        size="sm"
                        onClick={() =>
                          handleAction(message.id, action.action)
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {message.status === "failed" && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-destructive">
                      {message.metadata?.error || "Failed to send message"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => onRetry?.(message.id)}
                    >
                      <RefreshCcw className="mr-1 h-3 w-3" />
                      Retry
                    </Button>
                  </div>
                )}

                <p className="text-xs opacity-70">
                  {formatDistanceToNow(new Date(message.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {message.metadata?.contextMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {message.metadata.contextMenu.map((item) => (
                    <DropdownMenuItem
                      key={item.action}
                      onClick={() => handleAction(message.id, item.action)}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
} 