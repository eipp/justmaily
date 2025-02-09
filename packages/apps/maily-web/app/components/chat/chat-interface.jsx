"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInterface = ChatInterface;
const react_1 = require("react");
const resizable_1 = require("@/components/ui/resizable");
const chat_messages_1 = require("./chat-messages");
const chat_input_1 = require("./chat-input");
const chat_sidebar_1 = require("./chat-sidebar");
const chat_store_1 = require("@/store/chat-store");
const use_toast_1 = require("@/hooks/use-toast");
function ChatInterface() {
    const { messages, addMessage, updateMessage, isProcessing, setProcessing, currentOperation, setOperation, addToCommandHistory, retryMessage, } = (0, chat_store_1.useChatStore)();
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        // Clean up any ongoing operations when unmounting
        return () => {
            setOperation(null);
            setProcessing(false);
        };
    }, [setOperation, setProcessing]);
    const handleSendMessage = async (message) => {
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
                if (!currentOperation)
                    break; // Check if operation was cancelled
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
        }
        catch (error) {
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
        }
        finally {
            setProcessing(false);
            setOperation(null);
        }
    };
    const handleRetry = (id) => {
        retryMessage(id);
        // Implement retry logic here
    };
    const handleAction = (id, action) => {
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
    return (<div className="flex h-screen w-full overflow-hidden">
      <resizable_1.ResizablePanelGroup direction="horizontal">
        <resizable_1.ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <chat_sidebar_1.ChatSidebar />
        </resizable_1.ResizablePanel>
        <resizable_1.ResizablePanel defaultSize={80}>
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <chat_messages_1.ChatMessages messages={messages} onRetry={handleRetry} onAction={handleAction}/>
            </div>
            <div className="border-t p-4">
              <chat_input_1.ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} operation={currentOperation}/>
            </div>
          </div>
        </resizable_1.ResizablePanel>
      </resizable_1.ResizablePanelGroup>
    </div>);
}
