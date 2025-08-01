
"use client";

import { forwardRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Strikethrough,
  ChevronDown,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WordEditorProps {
  editorContent: string;
  setEditorContent: (content: string) => void;
}

const ToolbarButton = ({
  children,
  tooltip,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
        disabled={disabled}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

const TableSelector = ({ onSelect }: { onSelect: (rows: number, cols: number) => void }) => {
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
  const grid = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="grid grid-cols-10 gap-1 p-2 bg-background">
      {grid.map((rowIndex) =>
        grid.map((colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              "w-4 h-4 border border-muted-foreground/50 cursor-pointer",
              rowIndex < hovered.rows && colIndex < hovered.cols
                ? "bg-primary/50 border-primary"
                : "bg-muted/25"
            )}
            onMouseEnter={() => setHovered({ rows: rowIndex + 1, cols: colIndex + 1 })}
            onClick={() => onSelect(hovered.rows, hovered.cols)}
          />
        ))
      )}
      <div className="col-span-10 text-center text-sm mt-1">
        {hovered.rows > 0 && hovered.cols > 0
          ? `${hovered.cols} x ${hovered.rows}`
          : "Select table size"}
      </div>
    </div>
  );
};

export const WordEditor = forwardRef<HTMLDivElement, WordEditorProps>(
  ({ editorContent, setEditorContent }, ref) => {
    const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false);

    // Note: execCommand is deprecated but is the simplest way to demonstrate functionality
    // for a prototype. A production app should use a robust rich text editor library.
    const applyCommand = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      const editor = (ref as React.RefObject<HTMLDivElement>)?.current;
      if (editor) {
        editor.focus();
        setEditorContent(editor.innerHTML);
      }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      setEditorContent(e.currentTarget.innerHTML);
    };

    const insertTable = (rows: number, cols: number) => {
      let tableHtml = '<table style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < rows; i++) {
        tableHtml += '<tr style="border: 1px solid #ccc;">';
        for (let j = 0; j < cols; j++) {
          tableHtml += '<td style="border: 1px solid #ccc; padding: 8px;"><br></td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table><br>';
      applyCommand('insertHTML', tableHtml);
      setIsTablePopoverOpen(false);
    };

    const FONT_FACES = ["Arial", "Courier New", "Georgia", "Times New Roman", "Trebuchet MS", "Verdana"];
    const FONT_SIZES = [
        { label: "8", value: "1" },
        { label: "10", value: "2" },
        { label: "12", value: "3" },
        { label: "14", value: "4" },
        { label: "18", value: "5" },
        { label: "24", value: "6" },
        { label: "36", value: "7" },
    ];


    return (
      <TooltipProvider>
        <div className="h-full flex flex-col rounded-lg border bg-card shadow-sm">
          <div className="p-2 border-b flex items-center flex-wrap gap-1">
            <ToolbarButton tooltip="Undo (Ctrl+Z)" onClick={() => applyCommand("undo")}>
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Redo (Ctrl+Y)" onClick={() => applyCommand("redo")}>
              <Redo className="h-4 w-4" />
            </ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />

            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-auto px-2">
                                Text Styles
                                <ChevronDown className="h-4 w-4 ml-1"/>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Text Styles</p></TooltipContent>
                </Tooltip>
                <DropdownMenuContent>
                    <DropdownMenuItem onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("formatBlock", "<p>")}>Normal Text</DropdownMenuItem>
                    <DropdownMenuItem onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("formatBlock", "<h1>")}>
                        <Heading1 className="h-4 w-4 mr-2"/> Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("formatBlock", "<h2>")}>
                        <Heading2 className="h-4 w-4 mr-2"/> Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("formatBlock", "<h3>")}>
                        <Heading3 className="h-4 w-4 mr-2"/> Heading 3
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-auto px-2">
                                Font
                                <ChevronDown className="h-4 w-4 ml-1"/>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Font Family</p></TooltipContent>
                </Tooltip>
                <DropdownMenuContent>
                    {FONT_FACES.map(font => (
                         <DropdownMenuItem key={font} onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("fontName", font)}>
                            <span style={{fontFamily: font}}>{font}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

             <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-auto px-2">
                                Size
                                <ChevronDown className="h-4 w-4 ml-1"/>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Font Size</p></TooltipContent>
                </Tooltip>
                <DropdownMenuContent>
                    {FONT_SIZES.map(size => (
                         <DropdownMenuItem key={size.value} onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand("fontSize", size.value)}>
                            {size.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarButton
              tooltip="Bold (Ctrl+B)"
              onClick={() => applyCommand("bold")}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Italic (Ctrl+I)"
              onClick={() => applyCommand("italic")}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Underline (Ctrl+U)"
              onClick={() => applyCommand("underline")}
            >
              <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              tooltip="Strikethrough"
              onClick={() => applyCommand("strikeThrough")}
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarButton tooltip="Bulleted List" onClick={() => applyCommand("insertUnorderedList")}>
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Numbered List" onClick={() => applyCommand("insertOrderedList")}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarButton tooltip="Align Left" onClick={() => applyCommand("justifyLeft")}>
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Align Center" onClick={() => applyCommand("justifyCenter")}>
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Align Right" onClick={() => applyCommand("justifyRight")}>
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Justify" onClick={() => applyCommand("justifyFull")}>
              <AlignJustify className="h-4 w-4" />
            </ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Insert Table</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-auto p-0">
                <TableSelector onSelect={insertTable} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1 p-4 bg-background/50 rounded-b-lg overflow-y-auto focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div
              ref={ref}
              contentEditable
              onInput={handleInput}
              dangerouslySetInnerHTML={{ __html: editorContent }}
              className="w-full h-full resize-none border-0 outline-none p-8 shadow-inner bg-card prose dark:prose-invert max-w-none"
              style={{ lineHeight: '1.75' }}
            />
          </div>
        </div>
      </TooltipProvider>
    );
  }
);

WordEditor.displayName = "WordEditor";
