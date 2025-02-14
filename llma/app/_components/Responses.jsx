import React from "react";

export default function Responses({ data }) {
  return (
    <div className="flex flex-col gap-5 h-full pt-7">
      <div>
        <p className="font-semibold mb-1 uppercase text-xl">
          Altroverse Response
        </p>
        <div className="text-[14px] h-[165px] overflow-hidden overflow-y-auto scrollbar bg-[#27282a]/5 rounded-2xl p-5">
          {data?.nueralhive_llama_response}
        </div>
      </div>
      <div>
        <p className="font-semibold mb-1 uppercase text-xl">OpenAi Response</p>
        <div className="text-[14px] h-[165px] overflow-hidden overflow-y-auto scrollbar bg-[#27282a]/5 rounded-2xl p-5">
          {data?.Openai_response}
        </div>
      </div>
    </div>
  );
}
