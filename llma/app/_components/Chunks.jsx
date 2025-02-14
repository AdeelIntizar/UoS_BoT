import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import React from "react";

export default function Chunks({ data }) {
  const [selecedChunk, setSelectedChunk] = React.useState(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleChunkClick = (index) => {
    setSelectedChunk(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChunk(null);
  };

  return (
    <>
      <div className="flex flex-col gap-5 h-full overflow-hidden overflow-y-auto scrollbar pe-2">
        {data?.chunks[0]?.map((chunk, index) => {
          return (
            <div
              className="flex space-x-2 h-[165px] cursor-pointer"
              key={index}
              onClick={() => handleChunkClick(index)}
            >
              <p className="font-semibold pt-4 text-[22px] text-[#27282a]/40">
                {index + 1}.
              </p>
              <div className="h-full bg-[#27282a]/5 rounded-2xl px-2 pt-5 pb-1">
                <i className="block text-gray-700 text-[14px] leading-[18px] overflow-hidden">
                  {chunk.slice(0, 150)}
                  <span className="ps-1 tracking-[2px]">...</span>
                </i>

                <i className="block font-normal text-gray-500 text-right pt-2 pr-1 text-[14px]">
                  Distance: {data.similarity[0][index].toFixed(2)}
                </i>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        className="relative z-10 focus:outline-none"
        as="div"
      >
        <div className="fixed inset-0 z-10 w-screen h-screen backdrop-blur-2xl overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 overflow-hidden">
            <DialogPanel
              transition
              className="w-[80vw] h-[80vh] rounded-xl bg-[#27282a]/5 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 overflow-hidden overflow-y-auto scrollbar"
            >
              {selecedChunk !== null && (
                <>
                  <DialogTitle as="h3" className="font-semibold">
                    Distance: {data?.similarity[0][selecedChunk]?.toFixed(2)}%
                  </DialogTitle>
                  <p className="mt-2 mb-6 text-sm/6">
                    {data?.chunks[0][selecedChunk]}
                  </p>
                  <p className="font-semibold">Metadata</p>
                  <div className="text-sm/6 flex flex-wrap items-center">
                    {data?.metadata[0][selecedChunk]["UoS Info"]
                      .split(",")
                      .map((e, i) => {
                        return (
                          <div
                            key={e + i}
                            className="mr-2 mb-2 bg-[#1b1b1e]/5 px-2 rounded-md"
                          >
                            {e}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
