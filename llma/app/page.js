"use client";

import { useEffect, useRef, useState } from "react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import debounce from "lodash.debounce";
import Chunks from "./_components/Chunks";
import Responses from "./_components/Responses";

export const PROMPT_INPUT_EVENT = "set_prompt_input";
const MAX_EDIT_STACK_SIZE = 100;
const bg = "bg-[#1b1b1e]";

const INFERENCE_ENDPOINT = "http://35.232.48.58:8000";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [message, setMessage] = useState("");
  const [promptInput, setPromptInput] = useState("");

  const formRef = useRef(null);
  const textareaRef = useRef(null);

  const [_, setFocused] = useState(false);
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  function handlePromptUpdate(e) {
    setPromptInput(e?.detail ?? "");
  }

  // Maintain state of message from whatever is in PromptInput
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  function resetTextAreaHeight() {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
  }
  useEffect(() => {
    if (!window)
      window.addEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate);
    return () =>
      window?.removeEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFocused(false);
    setData(null);

    if (!message || message === "") return false;

    setLoading(true);
    const res = await fetch(`${INFERENCE_ENDPOINT}?query=${message}`, {
      method: "GET",
    }).then((res) => res.json());

    setLoading(false);

    setData(res);
    reset();
  };

  function saveCurrentState(adjustment = 0) {
    if (undoStack.current.length >= MAX_EDIT_STACK_SIZE)
      undoStack.current.shift();
    undoStack.current.push({
      value: promptInput,
      cursorPositionStart: textareaRef.current.selectionStart + adjustment,
      cursorPositionEnd: textareaRef.current.selectionEnd + adjustment,
    });
  }

  useEffect(() => {
    if (!loading && textareaRef.current) textareaRef.current.focus();
    resetTextAreaHeight();
  }, [loading]);

  const debouncedSaveState = debounce(saveCurrentState, 250);

  function adjustTextArea(event) {
    const element = event.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }

  function handleChange(e) {
    debouncedSaveState(-1);
    handleMessageChange(e);
    adjustTextArea(e);
    setPromptInput(e.target.value);
  }

  function captureEnterOrUndo(event) {
    // Is simple enter key press w/o shift key
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      return handleSubmit(event);
    }

    // Is undo with Ctrl+Z or Cmd+Z + Shift key = Redo
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "z" &&
      event.shiftKey
    ) {
      event.preventDefault();
      if (redoStack.current.length === 0) return;

      const nextState = redoStack.current.pop();
      if (!nextState) return;

      undoStack.current.push({
        value: promptInput,
        cursorPositionStart: textareaRef.current.selectionStart,
        cursorPositionEnd: textareaRef.current.selectionEnd,
      });
      setPromptInput(nextState.value);
      setTimeout(() => {
        textareaRef.current.setSelectionRange(
          nextState.cursorPositionStart,
          nextState.cursorPositionEnd
        );
      }, 0);
    }

    // Undo with Ctrl+Z or Cmd+Z
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "z" &&
      !event.shiftKey
    ) {
      if (undoStack.current.length === 0) return;
      const lastState = undoStack.current.pop();
      if (!lastState) return;

      redoStack.current.push({
        value: promptInput,
        cursorPositionStart: textareaRef.current.selectionStart,
        cursorPositionEnd: textareaRef.current.selectionEnd,
      });
      setPromptInput(lastState.value);
      setTimeout(() => {
        textareaRef.current.setSelectionRange(
          lastState.cursorPositionStart,
          lastState.cursorPositionEnd
        );
      }, 0);
    }
  }

  function handlePasteEvent(e) {
    e.preventDefault();
    if (e.clipboardData.items.length === 0) return false;

    const pasteText = e.clipboardData.getData("text/plain");
    if (pasteText) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newPromptInput =
        promptInput.substring(0, start) +
        pasteText +
        promptInput.substring(end);
      setPromptInput(newPromptInput);
      handleMessageChange({ target: { value: newPromptInput } });

      // Set the cursor position after the pasted text
      // we need to use setTimeout to prevent the cursor from being set to the end of the text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + pasteText.length;
      }, 0);
    }
    return;
  }

  const reset = () => {
    setPromptInput("");
    setMessage("");
    textareaRef.current.innnerText = "";
  };

  return (
    <div
      className={`min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col ${
        data ? "justify-between" : "justify-center"
      } items-center transition-all ease-in-out duration-500`}
    >
      {/* chat */}

      <div
        className={`grid grid-cols-12 gap-4 ${
          loading || !data
            ? "h-0 opacity-0 overflow-hidden"
            : "h-[80vh] opacity-100 overflow-visible"
        } w-full transition-all ease-in-out duration-500`}
      >
        <div className="col-span-3 h-full overflow-hidden">
          <p className="font-bold mb-1 uppercase text-center text-xl ">
            Context
          </p>
          <div className="h-[96%]">
            <Chunks data={data} />
          </div>
        </div>
        <div className="col-span-9 h-full overflow-hidden overflow-y-auto pe-2 scrollbar">
          <Responses data={data} />
        </div>
      </div>

      {/* chat input */}
      <div
        className={`w-full fixed md:absolute ${
          data ? "bottom-0 left-0" : "top-1/2 transform -translate-y-1/2"
        } z-10 md:z-0 flex justify-center items-center transition-all ease-in-out duration-700`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col rounded-t-lg w-full mx-auto max-w-xl"
        >
          {loading && <p className="text-start ps-2">Generating Response...</p>}
          <div className="flex items-center rounded-lg md:mb-4">
            <div className="w-[95vw] md:w-[635px] bg-[#27282a]/5 light:bg-white light:border-solid light:border-[1px] light:[#525355] shadow-sm rounded-2xl flex flex-col px-4 overflow-hidden">
              <div className="flex items-center w-full py-2">
                <textarea
                  ref={textareaRef}
                  onChange={handleChange}
                  onKeyDown={captureEnterOrUndo}
                  onPaste={(e) => {
                    saveCurrentState();
                    handlePasteEvent(e);
                  }}
                  required={true}
                  disabled={loading}
                  onFocus={() => setFocused(true)}
                  onBlur={(e) => {
                    setFocused(false);
                    adjustTextArea(e);
                  }}
                  value={promptInput}
                  className={`border-none cursor-text max-h-[50vh] md:max-h-[350px] md:min-h-[40px] mx-2 md:mx-0 pt-[12px] w-full leading-5 md:text-md text-black bg-transparent light:placeholder:text-[#ffffff] resize-none active:outline-none focus:outline-none flex-grow text-[14px]`}
                  placeholder={"Send a message"}
                />
                <button
                  ref={formRef}
                  type="submit"
                  className="border-none inline-flex justify-center rounded-2xl cursor-pointer opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 ml-4"
                  data-tooltip-id="send-prompt"
                  data-tooltip-content="Send prompt message"
                  aria-label="Send prompt message"
                  disabled={loading}
                >
                  <PaperPlaneRight
                    color="#6e6f6f"
                    className="w-[22px] h-[22px] pointer-events-none text-[#ffffff]"
                    weight="fill"
                  />
                  <span className="sr-only">Send message</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
