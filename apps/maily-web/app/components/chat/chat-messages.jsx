"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessages = ChatMessages;
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const button_1 = require("@/components/ui/button");
const progress_1 = require("@/components/ui/progress");
const MessageIcon = ({ type }) => {
    switch (type) {
        case "error":
            return <lucide_react_1.XCircle className="h-4 w-4 text-destructive"/>;
        case "warning":
            return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500"/>;
        case "success":
            return <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-500"/>;
        case "system":
            return <lucide_react_1.AlertCircle className="h-4 w-4 text-blue-500"/>;
        default:
            return null;
    }
};
function ChatMessages({ messages, onRetry, onAction, }) {
    const messagesEndRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    const handleAction = (messageId, action) => {
        onAction === null || onAction === void 0 ? void 0 : onAction(messageId, action);
    };
    return (<div className="space-y-4">
      <framer_motion_1.AnimatePresence initial={false}>
        {messages.map((message) => {
            var _a, _b, _c, _d, _e, _f;
            return (<framer_motion_1.motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className={(0, utils_1.cn)("group relative flex items-start gap-4 rounded-lg p-4", message.type === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : message.type === "error"
                        ? "bg-destructive/10"
                        : message.type === "warning"
                            ? "bg-yellow-500/10"
                            : message.type === "success"
                                ? "bg-green-500/10"
                                : "bg-muted")}>
            <div className="flex-1 space-y-2">
              {message.type !== "user" && (<div className="flex items-center gap-2">
                  <MessageIcon type={message.type}/>
                  <span className="text-xs font-medium">
                    {message.type.charAt(0).toUpperCase() +
                        message.type.slice(1)}
                  </span>
                </div>)}

              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {((_a = message.metadata) === null || _a === void 0 ? void 0 : _a.expandable) && (<button_1.Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onAction === null || onAction === void 0 ? void 0 : onAction(message.id, "toggle")}>
                    {message.metadata.expanded ? (<lucide_react_1.ChevronUp className="h-4 w-4"/>) : (<lucide_react_1.ChevronDown className="h-4 w-4"/>)}
                    <span className="ml-1 text-xs">
                      {message.metadata.expanded ? "Show less" : "Show more"}
                    </span>
                  </button_1.Button>)}

                {message.status === "generating" && (<div className="space-y-2">
                    <progress_1.Progress value={(_b = message.metadata) === null || _b === void 0 ? void 0 : _b.progress} className="h-1"/>
                    <p className="text-xs opacity-70">
                      {((_c = message.metadata) === null || _c === void 0 ? void 0 : _c.progress)
                        ? `${Math.round(message.metadata.progress)}%`
                        : "Generating..."}
                    </p>
                  </div>)}

                {((_d = message.metadata) === null || _d === void 0 ? void 0 : _d.actions) && (<div className="flex flex-wrap gap-2">
                    {message.metadata.actions.map((action) => (<button_1.Button key={action.action} variant={action.type === "destructive"
                            ? "destructive"
                            : action.type === "secondary"
                                ? "secondary"
                                : "default"} size="sm" onClick={() => handleAction(message.id, action.action)}>
                        {action.label}
                      </button_1.Button>))}
                  </div>)}

                {message.status === "failed" && (<div className="flex items-center gap-2">
                    <p className="text-xs text-destructive">
                      {((_e = message.metadata) === null || _e === void 0 ? void 0 : _e.error) || "Failed to send message"}
                    </p>
                    <button_1.Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onRetry === null || onRetry === void 0 ? void 0 : onRetry(message.id)}>
                      <lucide_react_1.RefreshCcw className="mr-1 h-3 w-3"/>
                      Retry
                    </button_1.Button>
                  </div>)}

                <p className="text-xs opacity-70">
                  {(0, date_fns_1.formatDistanceToNow)(new Date(message.timestamp), {
                    addSuffix: true,
                })}
                </p>
              </div>
            </div>

            {((_f = message.metadata) === null || _f === void 0 ? void 0 : _f.contextMenu) && (<dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                  <button_1.Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                    <lucide_react_1.MoreVertical className="h-4 w-4"/>
                  </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="end">
                  {message.metadata.contextMenu.map((item) => (<dropdown_menu_1.DropdownMenuItem key={item.action} onClick={() => handleAction(message.id, item.action)}>
                      {item.label}
                    </dropdown_menu_1.DropdownMenuItem>))}
                </dropdown_menu_1.DropdownMenuContent>
              </dropdown_menu_1.DropdownMenu>)}
          </framer_motion_1.motion.div>);
        })}
      </framer_motion_1.AnimatePresence>
      <div ref={messagesEndRef}/>
    </div>);
}
