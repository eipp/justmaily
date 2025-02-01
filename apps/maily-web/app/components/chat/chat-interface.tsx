"use client";

import { useEffect } from "react";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatSidebar } from "./chat-sidebar";
import { useChatStore } from "@/store/chat-store";
import { useToast } from "@/hooks/use-toast";

export function ChatInterface() {
  const {
    messages,
    addMessage,
    updateMessage,
    isProcessing,
    setProcessing,
    currentOperation,
    setOperation,
    addToCommandHistory,
    retryMessage,
  } = useChatStore();
  const { toast } = useToast();

  useEffect(() => {
    // Clean up any ongoing operations when unmounting
    return () => {
      setOperation(null);
      setProcessing(false);
    };
  }, [setOperation, setProcessing]);

  const handleSendMessage = async (message: string) => {
    if (isProcessing) {
      toast({
        title: "Processing in progress",
        description: "Please wait for the current operation to complete.",
        variant: "destructive",
      });
      return;
    }

    const messageId = Date.now();
    addMessage({
      content: message,
      type: "user",
      status: "sending",
    });

    try {
      setProcessing(true);
      setOperation({
        type: "processing",
        progress: 0,
        status: "Initializing...",
        cancelable: true,
      });

      // Simulate AI processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        if (!currentOperation) break; // Check if operation was cancelled
        await new Promise((resolve) => setTimeout(resolve, 500));
        setOperation({
          type: "processing",
          progress: i,
          status: i < 100 ? "Processing..." : "Completing...",
          cancelable: true,
        });
      }

      // Add AI response
      addMessage({
        content: "This is a simulated AI response. Replace with actual AI integration.",
        type: "assistant",
        status: "sent",
        metadata: {
          actions: [
            {
              label: "Copy",
              action: "copy",
              type: "secondary",
            },
            {
              label: "Regenerate",
              action: "regenerate",
              type: "primary",
            },
          ],
          contextMenu: [
            {
              label: "Copy to clipboard",
              action: "copy",
            },
            {
              label: "Save as template",
              action: "save_template",
            },
          ],
        },
      });

      addToCommandHistory(message, true);
    } catch (error) {
      updateMessage(messageId, {
        status: "failed",
        metadata: {
          error: error instanceof Error ? error.message : "Failed to process message",
        },
      });
      addToCommandHistory(message, false);

      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setOperation(null);
    }
  };

  const handleRetry = (id: number) => {
    retryMessage(id);
    // Implement retry logic here
  };

  const handleAction = (id: number, action: string) => {
    switch (action) {
      case "copy":
        const message = messages.find((m) => m.id === id);
        if (message) {
          navigator.clipboard.writeText(message.content);
          toast({
            title: "Copied",
            description: "Message copied to clipboard",
          });
        }
        break;
      case "regenerate":
        // Implement regeneration logic
        break;
      case "save_template":
        // Implement template saving logic
        break;
      case "toggle":
        // Toggle message expansion is handled by the store
        break;
      default:
        console.warn("Unknown action:", action);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ChatSidebar />
        </ResizablePanel>
        <ResizablePanel defaultSize={80}>
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <ChatMessages
                messages={messages}
                onRetry={handleRetry}
                onAction={handleAction}
              />
            </div>
            <div className="border-t p-4">
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isProcessing}
                operation={currentOperation}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
} 